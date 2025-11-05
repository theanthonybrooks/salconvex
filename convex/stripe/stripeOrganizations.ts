import Stripe from "stripe";

import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "~/convex/_generated/dataModel";
import { ConvexError, v } from "convex/values";
import { api, internal } from "../_generated/api";
import { action, mutation, query } from "../_generated/server";

// Initialize the Stripe client
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const getOrgHadFreeCall = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;
    const orgs = await ctx.db
      .query("organizations")
      .withIndex("by_ownerId", (q) => q.eq("ownerId", userId))
      .collect();
    return orgs.some((org) => org.hadFreeCall === true);

    // return org?.hadFreeCall === true;
  },
});

// ACTION: Create a Stripe Checkout Session.
export const createStripeOrgCheckoutSession = action({
  args: {
    orgId: v.id("organizations"),
    eventId: v.id("events"),
    openCallId: v.optional(v.union(v.id("openCalls"), v.null())),
    slidingPrice: v.number(),
    isEligibleForFree: v.boolean(),
  },
  handler: async (ctx, args): Promise<{ url: string }> => {
    try {
      console.log(args);

      const identity = await getAuthUserId(ctx);
      if (!identity) throw new Error("Not authenticated");
      const result = await ctx.runQuery(api.users.getCurrentUser, {});
      if (!result) throw new Error("User not found");
      const { user } = result;
      if (!user || !user.email)
        throw new Error("User not found or missing email");

      const { orgSubscription } = await ctx.runQuery(
        api.stripe.stripeBase.getUserSubscriptions,
        {
          userId: user._id,
        },
      );
      const orgData = await ctx.runQuery(
        api.organizer.organizations.getOrgById,
        { orgId: args.orgId },
      );

      if (!orgData) {
        throw new ConvexError({ message: "Org not found", data: args.orgId });
      }

      const event = await ctx.runQuery(api.events.event.getEventById, {
        eventId: args.eventId,
      });

      const eventSlug = event?.slug;
      const eventEdition = event?.dates?.edition;

      let stripeCustomerId = orgSubscription?.customerId;

      const priceId = args.slidingPrice;

      const eventUrl = `/event/${eventSlug}/${eventEdition}${args.openCallId ? "/call" : ""}`;

      // console.log("priceId which: ", priceId);

      if (!priceId)
        throw new Error("Stripe price ID not found in plan pricing");
      console.log("userId: ", user._id, user.email);
      const metadata: Record<string, string> = {
        userId: user._id,
        userEmail: user.email,
        orgId: args.orgId,
        orgName: orgData?.name,
        eventId: args.eventId,
        openCallId: args.openCallId ?? "",
        transactionType: "organizer",
      };

      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          // name: user.name,
          name: orgData?.name ?? user.name,
          metadata: { userId: user._id, orgId: args.orgId },
        });
        stripeCustomerId = customer.id;
      }

      if (orgSubscription) {
        await ctx.runMutation(api.stripe.stripeBase.saveStripeCustomerId, {
          stripeCustomerId,
          userType: "organizer",
        });
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
                unit_amount: args.slidingPrice ? args.slidingPrice * 100 : 5000,
                product_data: {
                  name: "Open Call Listing - One-Time",
                },
              },
              quantity: 1,
            },
          ],
          mode: "payment",

          subscription_data: {},
          success_url: `${process.env.FRONTEND_URL}/thelist${eventUrl}`,
          cancel_url: `${process.env.FRONTEND_URL}/pricing`,
          //TODO: CANCEL PAGES
          metadata: metadata,
          client_reference_id: metadata.userId,
          discounts: args.isEligibleForFree
            ? [{ coupon: process.env.STRIPE_FREE_COUPON }]
            : undefined,
        });

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

export const orgStoreWebhook = mutation({
  args: {
    body: v.any(),
  },
  handler: async (ctx, args) => {
    // Extract event type from webhook payload
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
    // console.log("Event type store webhook:", eventType)
    // Store webhook event
    await ctx.db.insert("stripeWebhookEvents", {
      type: eventType,
      transactionType:
        args.body.data.object.metadata?.transactionType ?? "base",
      stripeEventId: args.body.data.object.id,
      createdAt,
      modifiedAt,
      data: args.body.data,
    });

    // console.log("args.body.data store webhook:", args.body.data);
    // if (eventType === "checkout.session.completed") {
    //   eventType = "customer.subscription.created"
    // }
    console.log("event type:", eventType);
    const base = args.body.data;
    const baseObject = args.body.data.object;
    const customerId = baseObject.customer ?? null;
    const metadata = baseObject.metadata;
    let userId = metadata?.userId ?? null;
    const metaInterval = metadata?.interval;
    const customerSubData = await ctx.db
      .query("organizationSubscriptions")
      .withIndex("customerId", (q) => q.eq("customerId", customerId))
      .first();
    const userData = customerSubData?.userId
      ? await ctx.db.get(customerSubData.userId as Id<"users">)
      : null;

    console.log("subscription in base callback: ", customerSubData);
    // console.log("customer id: ", customerId);
    // console.log("userId: ", userId);
    // console.log("metaPlan: ", metaPlan);
    // console.log("metaNumber: ", metaNumber);

    switch (eventType) {
      case "checkout.session.completed":
        //note-to-self: in this, the metadata loads something that looks like this:

        console.log(
          "metadata.userId: ",
          userId,
          "client_reference_id (userId): ",
          baseObject.client_reference_id,
        );
        console.log("checkout session completed:", args.body.data);

        const freeCall =
          baseObject.discounts[0]?.coupon === process.env.STRIPE_FREE_COUPON;
        const createdAt = new Date(baseObject.created * 1000).getTime();
        console.log("createdAt: ", createdAt);

        const paymentStatus = baseObject.payment_status ?? "unpaid";
        console.log("paymentStatus: ", paymentStatus);

        const checkoutOrg = await ctx.db
          .query("organizations")
          .withIndex("by_ownerId", (q) =>
            q.eq("ownerId", args.body.data.object.metadata.userId),
          )
          .first();
        console.log("checkoutOrg: ", checkoutOrg);

        if (checkoutOrg) {
          const checkoutOrgSub = await ctx.db
            .query("organizationSubscriptions")
            .withIndex("organizationId", (q) =>
              q.eq("organizationId", checkoutOrg._id),
            )
            .first();

          console.log("one-time checkoutOrgSub: ", checkoutOrgSub);

          await ctx.db.patch(checkoutOrg._id, {
            updatedAt: Date.now(),
            lastUpdatedBy: metadata?.userId,
          });

          if (freeCall) {
            await ctx.db.patch(checkoutOrg._id, {
              hadFreeCall: true,
            });
          }
          await ctx.db.insert("organizationSubscriptions", {
            organizationId: checkoutOrg._id,
            userId,
            openCallId: args.body.data.object.metadata?.openCallId,
            stripeId: args.body.data.object.id,
            currency: args.body.data.object.currency,
            status: args.body.data.object.status,
            amountSubtotal: args.body.data.object.amount_subtotal,
            amountTotal: args.body.data.object.amount_total,
            amountDiscount: args.body.data.object.total_details.amount_discount,
            metadata,
            customerId,
            paidStatus: paymentStatus,
          });
        }

        // console.log("should be able to do logic for one-time here");

        const existingUser = await ctx.db
          .query("users")
          .withIndex("by_id", (q) =>
            q.eq("_id", metadata.userId as Id<"users">),
          )
          .first();
        console.log("existingUser checkout: ", existingUser);
        if (existingUser) {
          console.log("oc id: ", metadata?.openCallId);

          if (paymentStatus === "paid") {
            const existingOpenCall = await ctx.db.get(
              metadata.openCallId as Id<"openCalls">,
            );
            if (existingOpenCall) {
              await ctx.db.patch(existingOpenCall._id, {
                lastUpdatedAt: createdAt,
                paid: paymentStatus === "paid" ? true : false,
                paidAt: createdAt,
                state: paymentStatus === "paid" ? "submitted" : "pending",
              });
            } else {
              console.error("No existing open call found — refunding payment.");
              const paymentIntentId = baseObject.payment_intent;
              await ctx.scheduler.runAfter(
                0,
                internal.stripe.stripeBase.processRefund,
                {
                  userId: existingUser._id,
                  paymentIntentId,
                  reason: "No open call found. Refuned to organizer.",
                },
              );
            }
          }
        }

        break;

      default:
        console.log(`Unhandled event type: ${eventType}`);
        break;
    }
  },
});
