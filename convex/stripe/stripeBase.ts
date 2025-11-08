import Stripe from "stripe";

import { getAuthUserId } from "@convex-dev/auth/server";
import { api, internal } from "~/convex/_generated/api";
import { v } from "convex/values";
import {
  httpAction,
  internalAction,
  internalMutation,
  mutation,
  query,
} from "../_generated/server";

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

export const paymentWebhook = httpAction(async (ctx, request) => {
  // console.log("Webhook received!", {
  //   method: request.method,
  //   url: request.url,
  //   headers: request.headers,
  // });

  try {
    const body = await request.json();

    // console.log("Webhook body:", body);
    console.log("Webhook data: ", {
      type: body.type,
      metadata: body.data.object.metadata,
    });

    const transactionType = body.data.object.metadata?.transactionType;
    if (transactionType === "add_on") {
      console.log("I'm an additional purchase");
      await ctx.runMutation(api.stripe.stripeAddOns.addOnStoreWebhook, {
        body,
      });
    } else if (transactionType === "organizer") {
      console.log("I'm an org purchase");
      await ctx.runMutation(api.stripe.stripeOrganizations.orgStoreWebhook, {
        body,
      });
    } else {
      // track events and based on events store data
      await ctx.runMutation(
        api.stripe.stripeSubscriptions.subscriptionStoreWebhook,
        {
          body,
        },
      );
    }

    // console.log("Webhook body:", body);
    return new Response(JSON.stringify({ message: "Webhook received!" }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    console.error("JSON parsing failed:", error.message, error.stack);
    return new Response(
      JSON.stringify({ error: "Invalid request body", details: error.message }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
});

export const processRefund = internalAction({
  args: {
    userId: v.id("users"),
    paymentIntentId: v.string(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: args.paymentIntentId,
        reason: "requested_by_customer",
      });

      console.log("Refunded successfully: ", refund);

      if (refund.id) {
        await ctx.runMutation(internal.stripe.stripeBase.recordRefund, {
          userId: args.userId,
          paymentIntentId: args.paymentIntentId,
          refundId: refund.id,
          reason: args.reason,
        });
      }
    } catch (error) {
      console.error("Error refunding payment: ", error);
    }
  },
});

export const recordRefund = internalMutation({
  args: {
    userId: v.id("users"),
    paymentIntentId: v.string(),
    refundId: v.string(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("stripeRefunds", {
      userId: args.userId,
      paymentIntentId: args.paymentIntentId,
      refundId: args.refundId,
      reason: args.reason,
    });
  },
});

export const getUserSubscriptions = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId } = args;

    if (!userId) throw new Error("Not authenticated");

    const artistSubscription = await ctx.db
      .query("userSubscriptions")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .first();

    const orgSubscription = await ctx.db
      .query("organizationSubscriptions")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .first();

    return { artistSubscription, orgSubscription };
  },
});

export const getCharge = query({
  args: {
    chargeId: v.string(),
  },
  handler: async (ctx, args) => {
    const charge = await ctx.db
      .query("userSubscriptions")
      .withIndex("by_chargeId", (q) => q.eq("chargeId", args.chargeId))
      .first();

    if (!charge) throw new Error("Charge not found");

    return charge;
  },
});

export const cancelSubscription = internalAction({
  args: {
    chargeId: v.string(),
  },
  handler: async (ctx, args) => {
    const subData = await ctx.runQuery(api.stripe.stripeBase.getCharge, {
      chargeId: args.chargeId,
    });

    if (!subData) throw new Error("Charge not found");

    const stripeId = subData?.stripeId;
    if (!stripeId) throw new Error("No stripeId found");

    await stripe.subscriptions.cancel(stripeId, {
      cancellation_details: {
        comment: `User disputed charge: ${args.chargeId}`,
      },
    });

    return { success: true };
  },
});
