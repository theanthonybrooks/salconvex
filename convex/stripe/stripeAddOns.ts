import Stripe from "stripe";

import type { Id } from "~/convex/_generated/dataModel";

import { getAuthUserId } from "@convex-dev/auth/server";
import { sendEventRegistrationEmailHelper } from "~/convex/userAddOns/onlineEvents";
import { ConvexError, v } from "convex/values";
import { api } from "../_generated/api";
import { action, mutation } from "../_generated/server";

// Initialize the Stripe client
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// ACTION: Create a Stripe Checkout Session.
export const createStripeAddOnCheckoutSession = action({
  args: {
    name: v.string(),
    email: v.string(),
    eventId: v.id("onlineEvents"),
    price: v.number(),
    isEligibleForFree: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<{ url: string }> => {
    try {
      console.log(args);

      const userId = await getAuthUserId(ctx);
      const result = userId
        ? await ctx.runQuery(api.users.getCurrentUser, {})
        : null;
      const { user } = result ?? {};

      if (!user && !args.email) {
        throw new ConvexError("Email required for checkout");
      }
      //note-to-self: may make this event optional later for non-event add-ons like the spreadsheet or the newsletter if someone just wants the newsletter without signing up (though I think it wouldn't make much sense as it wouldn't be cheaper than just paying $5 per month)
      const eventResult = await ctx.runQuery(
        api.userAddOns.onlineEvents.getOnlineEvent,
        { eventId: args.eventId },
      );

      if (!eventResult.data) {
        throw new ConvexError("Event not found");
      }

      const event = eventResult.data;

      const userVoucher = userId
        ? await ctx.runQuery(api.userAddOns.onlineEvents.getUserVoucher, {
            userId,
          })
        : null;

      const voucherTotal = userVoucher?.amount ?? 0;

      const { artistSubscription, orgSubscription } = userId
        ? await ctx.runQuery(api.stripe.stripeBase.getUserSubscriptions, {
            userId,
          })
        : {};

      let stripeCustomerId =
        artistSubscription?.customerId || orgSubscription?.customerId;

      const eventPrice = args.price * 100;
      const discountAmount = Math.min(eventPrice, (voucherTotal ?? 0) * 100);

      const coupon =
        discountAmount > 0
          ? await stripe.coupons.create({
              amount_off: discountAmount,
              currency: "usd",
              name: "Previous Event Voucher(s)",
              duration: "once",
            })
          : null;

      const discounts = args.isEligibleForFree
        ? [{ coupon: process.env.STRIPE_FREE_COUPON }]
        : coupon
          ? [{ coupon: coupon.id }]
          : undefined;

      console.log({
        eventPrice,
        discountAmount,
      });

      // console.log("priceId which: ", priceId);

      if (!eventPrice) throw new Error("Stripe price not provided");

      const metadata: Record<string, string> = {
        transactionType: "add_on",
        userId: userId ?? "guest",
        email: args.email,
        eventId: event._id,
        date: new Date(event.startDate).toISOString(),
      };

      if (voucherTotal && userVoucher) {
        metadata.voucherId = userVoucher._id;
        metadata.voucherTotal = (voucherTotal ?? 0).toString();
      }

      // console.log("hadTrial: ", args.hadTrial);
      // console.log("Meta Data: ", metadata);

      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          name: user?.name ?? args.name ?? "guest",
          email: user?.email ?? args.email ?? "",
          metadata: { userId },
        });
        stripeCustomerId = customer.id;
        // console.log("stripeCustomerId: ", stripeCustomerId);

        // await ctx.db.insert("userSubscriptions")
      }

      // Create a Stripe Checkout Session.
      const session: Stripe.Checkout.Session =
        await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          customer: stripeCustomerId,
          line_items: [
            {
              price_data: {
                currency: "usd",
                unit_amount: eventPrice,
                product_data: {
                  name: `${event.name} - Registration`,
                },
              },
              quantity: 1,
            },
          ],

          mode: "payment",
          subscription_data: {},
          //TODO: set this to the event page or some sort of confirmation page
          success_url: `${process.env.FRONTEND_URL}/extras/${event.slug}`,
          cancel_url: `${process.env.FRONTEND_URL}/pricing`,
          metadata: metadata,
          client_reference_id: metadata.userId,
          discounts,
        });

      // console.log("checkout session created: ", session);

      // Ensure session.url is not null.
      if (!session.url) throw new Error("Stripe session URL is null");
      return { url: session.url };
    } catch (err) {
      console.error("Error creating Stripe Checkout Session:", err);
      throw new Error("Error creating Stripe Checkout Session", { cause: err });
    }
  },
});

/**
 * Action: Create a account portal session for the user to manage subscriptions.
 */

export const addOnStoreWebhook = mutation({
  args: {
    body: v.any(),
  },
  handler: async (ctx, args) => {
    let eventType = args.body.type;
    let createdTimestamp: number | undefined =
      args.body.data.created ?? args.body.data.object.created;
    const createdAt = new Date(
      (createdTimestamp ?? Date.now()) * 1000,
    ).toISOString();
    let modifiedTimestamp: number | undefined =
      args.body.data.modified_at ??
      args.body.data.object.created ??
      args.body.created;
    const modifiedAt = new Date(
      (modifiedTimestamp ?? Date.now()) * 1000,
    ).toISOString();

    await ctx.db.insert("stripeWebhookEvents", {
      type: eventType,
      stripeEventId: args.body.data.object.id,
      createdAt,
      modifiedAt,
      data: args.body.data,
    });

    console.log("event type:", eventType);
    const base = args.body.data;
    const baseObject = base.object;
    const customerId = baseObject.customer ?? null;
    const metadata = baseObject.metadata;
    let userId = metadata?.userId ?? null;

    console.log("customer id: ", customerId);

    switch (eventType) {
      case "checkout.session.completed":
        //note-to-self: in this, the metadata loads something that looks like this:
        console.log("checkout session completed:", args.body.data);
        const paymentStatus = baseObject.payment_status === "paid";
        const eventId = baseObject.metadata.eventId as Id<"onlineEvents">;
        const registeredUserId = baseObject.metadata.userId as Id<"users">;
        const voucherId = baseObject.metadata
          .voucherId as Id<"onlineEventVouchers">;
        const voucherAmount = baseObject.metadata.voucherTotal as number;
        const formattedEmail = metadata.email?.toLowerCase();
        const event = await ctx.db.get(eventId);
        if (!event) throw new Error("Event not found for : " + eventId);

        const registration =
          userId && userId !== "guest"
            ? await ctx.db
                .query("userAddOns")
                .withIndex("by_userId_eventId", (q) =>
                  q.eq("userId", registeredUserId).eq("eventId", eventId),
                )
                .first()
            : await ctx.db
                .query("userAddOns")
                .withIndex("by_email_eventId", (q) =>
                  q.eq("email", formattedEmail).eq("eventId", eventId),
                )
                .first();
        const voucher = voucherId ? await ctx.db.get(voucherId) : null;

        if (registration && paymentStatus) {
          await ctx.db.patch(registration._id, {
            paid: paymentStatus,
            canceled: false,
          });
          await ctx.db.patch(event._id, {
            capacity: {
              ...event.capacity,
              current: event.capacity.current + 1,
            },
          });
          await sendEventRegistrationEmailHelper(
            ctx,
            event._id,
            userId,
            formattedEmail,
            "register",
          );
          if (voucher) {
            const newVoucherAmount = Math.max(
              0,
              voucher.amount - voucherAmount,
            );

            console.log(
              newVoucherAmount,
              voucher.amount,
              voucherAmount,
              newVoucherAmount === 0,
            );
            await ctx.db.patch(voucher._id, {
              amount: newVoucherAmount,
              redeemed: newVoucherAmount === 0,
            });
          }
        } else {
          throw new ConvexError(
            "Registration not found for: " +
              eventId +
              " and " +
              registeredUserId +
              "(payment status: " +
              paymentStatus +
              ")",
          );
        }

        break;

      // ...

      case "checkout.session.expired":
        console.log("checkout.session.expired");
        break;

      case "invoice.created":
        console.log("invoice.created:", args.body);
        break;

      case "customer.discount.created":
        console.log("customer.discount.created");
        break;

      case "customer.discount.deleted":
        console.log("customer.discount.deleted");
        break;

      case "invoice.payment_succeeded":
        console.log("invoice.payment_succeeded");

        break;

      case "order.created":
        console.log("order.created:", args.body);
        // Orders are handled through the subscription events
        break;

      default:
        console.log(`Unhandled event type: ${eventType}`);
        break;
    }
  },
});
