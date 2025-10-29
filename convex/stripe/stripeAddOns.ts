import Stripe from "stripe";

import type { Id } from "~/convex/_generated/dataModel";

import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { api } from "../_generated/api";
import { action, mutation } from "../_generated/server";

// Initialize the Stripe client
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const saveStripeCustomerId = mutation({
  args: {
    stripeCustomerId: v.string(),
    userType: v.union(v.literal("artist"), v.literal("organizer")),
  },
  handler: async (ctx, args) => {
    const isArtist = args.userType === "artist";
    const isOrganizer = args.userType === "organizer";
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const artistSubscription = await ctx.db
      .query("userSubscriptions")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .first();

    const orgSubscription = await ctx.db
      .query("organizationSubscriptions")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .first();

    if (!artistSubscription && isArtist) {
      await ctx.db.insert("userSubscriptions", {
        customerId: args.stripeCustomerId,
        userId,
        lastEditedAt: Date.now(),
      });
    } else if (!orgSubscription && isOrganizer) {
      await ctx.db.insert("organizationSubscriptions", {
        customerId: args.stripeCustomerId,
        userId,
        lastEditedAt: Date.now(),
      });
    }
  },
});

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
      const event = await ctx.runQuery(
        api.userAddOns.onlineEvents.getOnlineEvent,
        { eventId: args.eventId },
      );

      if (!event) {
        throw new ConvexError("Event not found");
      }

      const { artistSubscription, orgSubscription } = userId
        ? await ctx.runQuery(
            api.stripe.stripeSubscriptions.getUserSubscription,
            {
              userId,
            },
          )
        : {};

      let stripeCustomerId =
        artistSubscription?.customerId || orgSubscription?.customerId;

      const eventPrice = args.price * 100;

      // console.log("priceId which: ", priceId);

      if (!eventPrice) throw new Error("Stripe price not provided");

      const metadata: Record<string, string> = {
        transactionType: "add_on",
        userId: userId ?? "guest",
        email: args.email,
        eventId: event._id,
        date: new Date(event.startDate).toISOString(),
      };

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
          success_url: `${process.env.FRONTEND_URL}/add-ons/${event.slug}`,
          cancel_url: `${process.env.FRONTEND_URL}/pricing`,
          metadata: metadata,
          client_reference_id: metadata.userId,
          discounts: args.isEligibleForFree
            ? [{ coupon: process.env.STRIPE_FREE_COUPON }]
            : undefined,
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
        const paymentStatus = baseObject.payment_status === "paid";
        const eventId = baseObject.metadata.eventId as Id<"onlineEvents">;
        const registeredUserId = baseObject.metadata.userId as Id<"users">;
        // {
        //   accountType: 'artist',
        //   interval: 'month',
        //   openCallId: '',
        //   plan: 'original',
        //   userEmail: 'newacc@thestreetartlist.com',
        //   userId: 'mh7c2z6vq780jv39ac74ewkn6h7sm7fv'
        // }
        // Also, in the base object is a key called "client_reference_id" that has the user's _id value.

        // email = baseObject.customer_details.email
        // userId = baseObject.client_reference_id;
        console.log(
          "metadata.userId: ",
          userId,
          "metadata.email: ",
          metadata.email,
          "client_reference_id (userId): ",
          baseObject.client_reference_id,
        );
        console.log("checkout session completed:", args.body.data);

        console.log(
          "payment status: ",
          baseObject.payment_status,
          paymentStatus,
        );
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
                  q.eq("email", metadata.email).eq("eventId", eventId),
                )
                .first();

        if (registration && paymentStatus) {
          await ctx.db.patch(registration._id, {
            paid: paymentStatus,
          });
          await ctx.db.patch(event._id, {
            capacity: {
              ...event.capacity,
              current: event.capacity.current + 1,
            },
          });
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
      //!! SECTION: --------------------------------------------------------------------

      case "checkout.session.expired":
        console.log("checkout.session.expired");
        break;

      //!! SECTION: --------------------------------------------------------------------

      case "invoice.created":
        console.log("invoice.created:", args.body);
        break;
      //!! SECTION: --------------------------------------------------------------------

      //!! SECTION: --------------------------------------------------------------------
      case "customer.discount.created":
        console.log("customer.discount.created");
        break;

      //!! SECTION: --------------------------------------------------------------------
      case "customer.discount.deleted":
        console.log("customer.discount.deleted");
        break;

      //!! SECTION: --------------------------------------------------------------------
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
