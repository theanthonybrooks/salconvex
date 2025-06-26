import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "~/convex/_generated/server";

export const subscribeToNewsletter = mutation({
  args: {
    email: v.string(),
    firstName: v.string(),
    newsletter: v.boolean(),
  },
  handler: async (ctx, args) => {
    let userPlan = 0;
    const userId = await getAuthUserId(ctx);
    const user = userId ? await ctx.db.get(userId) : null;
    if (user) {
      const userSub = (user.subscription ?? "none").toLowerCase();
      if (userSub?.includes("original")) {
        userPlan = 1;
      } else if (userSub?.includes("banana")) {
        userPlan = 2;
      } else if (userSub?.includes("fatcap")) {
        userPlan = 3;
      }
    }
    const newsletterSubscription = user?._id
      ? await ctx.db
          .query("newsletter")
          .withIndex("by_userId", (q) => q.eq("userId", user._id))
          .unique()
      : null;
    const emailSubscription = await ctx.db
      .query("newsletter")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
    if (newsletterSubscription && emailSubscription) {
      if (newsletterSubscription.timesAttempted > 3) {
        return {
          status: "too_many_attempts",
          emailMismatch: args.email === newsletterSubscription.email,
        };
      }
    }

    if (newsletterSubscription) {
      await ctx.db.patch(newsletterSubscription._id, {
        timesAttempted: newsletterSubscription.timesAttempted + 1,
        lastAttempt: Date.now(),
        userPlan,
      });
      if (args.email !== newsletterSubscription.email) {
        return {
          status: "already_subscribed diff email",
          emailMismatch: args.email !== newsletterSubscription.email,
        };
      } else {
        return {
          status: "already_subscribed",
          emailMismatch: args.email === newsletterSubscription.email,
        };
      }
    }
    if (emailSubscription) {
      await ctx.db.patch(emailSubscription._id, {
        timesAttempted: emailSubscription.timesAttempted + 1,
        lastAttempt: Date.now(),
        userPlan,
      });
      if (user && user.email !== args.email) {
        return {
          status: "diff user has email",
          emailMismatch: args.email !== user.email,
        };
      } else {
        return {
          status: "already_subscribed",
          emailMismatch: args.email === emailSubscription.email,
        };
      }
    } else {
      await ctx.db.insert("newsletter", {
        userId: user?._id ?? null,
        firstName: args.firstName,
        email: args.email,
        newsletter: args.newsletter,
        timesAttempted: 1,
        lastAttempt: Date.now(),
        userPlan,
      });
    }
  },
});

export const getNewsletterSubscribers = query({
  args: {},
  handler: async (ctx) => {
    let totalSubscribers = 0;
    const subscribers = await ctx.db.query("newsletter").collect();
    const results = await Promise.all(
      subscribers.map(async (subscriber) => {
        totalSubscribers += 1;
        return {
          _id: subscriber._id,
          name: subscriber.firstName,
          email: subscriber.email,
          userPlan: subscriber.userPlan,
          timesAttempted: subscriber.timesAttempted,
          lastAttempt: subscriber.lastAttempt,
          createdAt: subscriber._creationTime,
        };
      }),
    );
    return {
      subscribers: results,
      totalSubscribers,
    };
  },
});
