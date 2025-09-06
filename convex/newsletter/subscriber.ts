import {
  NewsletterFrequency,
  NewsletterType,
} from "@/constants/newsletterConsts";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { mutation, query } from "~/convex/_generated/server";

export const subscribeToNewsletter = mutation({
  args: {
    email: v.string(),
    firstName: v.string(),
  },
  handler: async (ctx, args) => {
    const { firstName } = args;
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
      const wasCanceled = newsletterSubscription.newsletter === false;

      await ctx.db.patch(newsletterSubscription._id, {
        timesAttempted: wasCanceled
          ? 0
          : newsletterSubscription.timesAttempted + 1,
        lastAttempt: Date.now(),
        userPlan,
        firstName,
        newsletter: true,
        ...(wasCanceled && { email: args.email }),
      });
      if (wasCanceled) {
        return {
          subscriptionId: newsletterSubscription._id,
          status: "success",
        };
      } else if (args.email !== newsletterSubscription.email) {
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
      const wasCanceled = emailSubscription.newsletter === false;
      await ctx.db.patch(emailSubscription._id, {
        timesAttempted: wasCanceled ? 0 : emailSubscription.timesAttempted + 1,
        lastAttempt: Date.now(),
        userPlan,
        firstName,
        newsletter: true,
      });
      if (wasCanceled) {
        return {
          subscriptionId: emailSubscription._id,
          status: "success",
        };
      } else if (user && user.email !== args.email) {
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
      const subscriptionId = await ctx.db.insert("newsletter", {
        userId: user?._id ?? null,
        firstName,
        email: args.email,
        newsletter: true,
        type: ["general"],
        timesAttempted: 1,
        lastAttempt: Date.now(),
        userPlan,
      });
      return {
        subscriptionId,
        status: "success",
      };
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
          active: subscriber.newsletter,
          type: subscriber.type,
          frequency: subscriber.frequency,
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

export const updateNewsletterStatus = mutation({
  args: {
    email: v.string(),
    newsletter: v.boolean(),
    frequency: v.optional(v.union(v.literal("monthly"), v.literal("weekly"))),
    type: v.optional(
      v.array(v.union(v.literal("openCall"), v.literal("general"))),
    ),
    userPlan: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { email, newsletter, frequency, type, userPlan } = args;

    console.log(args);
    const wasCanceled = newsletter === false;

    const userId = await getAuthUserId(ctx);

    const newsletterSubscription = userId
      ? await ctx.db
          .query("newsletter")
          .withIndex("by_userId", (q) => q.eq("userId", userId))
          .unique()
      : null;

    const emailSubscription = await ctx.db
      .query("newsletter")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (!newsletterSubscription && !emailSubscription) {
      throw new ConvexError("No newsletter subscription found" + email);
    }

    if (emailSubscription && emailSubscription.userId && !userId) {
      throw new ConvexError("Log in to update your newsletter preferences");
    }

    if (newsletterSubscription) {
      await ctx.db.patch(newsletterSubscription._id, {
        newsletter,
        timesAttempted: 0,
        lastAttempt: Date.now(),
        ...(frequency && { frequency }),
        ...(type && { type }),
        ...(userPlan &&
          userPlan !== newsletterSubscription.userPlan && { userPlan }),
      });
    } else if (emailSubscription) {
      await ctx.db.patch(emailSubscription._id, {
        newsletter,
        timesAttempted: 0,
        lastAttempt: Date.now(),
        ...(frequency && { frequency }),
        ...(type && { type }),
        ...(userPlan &&
          userPlan !== emailSubscription.userPlan && { userPlan }),
      });
    }

    return { success: true, canceled: wasCanceled, frequency, type };
  },
});

export const getNewsletterStatus = query({
  args: {
    email: v.optional(v.string()),
    userId: v.optional(v.id("users")),
    subscriberId: v.optional(v.id("newsletter")),
  },
  handler: async (ctx, args) => {
    const { email, userId, subscriberId } = args;
    const defaultValues = {
      frequency: "monthly" as NewsletterFrequency,
      type: ["general"] as NewsletterType[],
    };

    const newsletterSubscription = subscriberId
      ? await ctx.db
          .query("newsletter")
          .withIndex("by_id", (q) => q.eq("_id", subscriberId))
          .unique()
      : null;

    const userSubscription = userId
      ? await ctx.db
          .query("newsletter")
          .withIndex("by_userId", (q) => q.eq("userId", userId))
          .unique()
      : null;

    const emailSubscription = email
      ? await ctx.db
          .query("newsletter")
          .withIndex("by_email", (q) => q.eq("email", email))
          .unique()
      : null;

    // if (!userSubscription && !emailSubscription && !subscriberId) {
    //   // console.error("No newsletter subscription found: " + email);
    //   return {
    //     newsletter: false,
    //     status: "no_subscription_found",
    //     ...defaultValues,
    //   };
    // }

    if (
      newsletterSubscription?.newsletter === false ||
      userSubscription?.newsletter === false ||
      emailSubscription?.newsletter === false
    ) {
      // console.error(
      //   "No newsletter subscription found: " + email + " / " + subscriberId,
      // );
      // throw new ConvexError(
      //   "No newsletter subscription found: " + email + " / " + subscriberId,
      // );
      return {
        newsletter: false,
        status: "no_subscription_found",
        ...defaultValues,
      };
    }
    // if (subscriberId && !newsletterSubscription) {
    //   // throw new ConvexError(
    //   //   "No newsletter subscription found: " + subscriberId,
    //   // );
    //   return {
    //     newsletter: false,
    //     status: "no_subscription_found",
    //     ...defaultValues,
    //   };
    // }
    if (newsletterSubscription) {
      if (newsletterSubscription.userId && !userId) {
        throw new ConvexError("Log in to update your newsletter preferences");
      }
      return {
        newsletter: newsletterSubscription.newsletter,
        userPlan: newsletterSubscription.userPlan ?? 0,
        frequency: newsletterSubscription.frequency ?? "monthly",
        type: newsletterSubscription.type ?? [],
        email: newsletterSubscription.email ?? "",
      };
    } else if (userSubscription) {
      return {
        newsletter: userSubscription.newsletter,
        userPlan: userSubscription.userPlan ?? 0,
        frequency: userSubscription.frequency ?? "monthly",
        type: userSubscription.type ?? [],
        email: userSubscription.email ?? "",
      };
    } else if (emailSubscription) {
      if (emailSubscription.userId && !userId) {
        throw new ConvexError("Log in to update your newsletter preferences");
      }
      return {
        newsletter: emailSubscription.newsletter,
        userPlan: 0,
        frequency: emailSubscription.frequency ?? "monthly",
        type: emailSubscription.type ?? [],
        email: emailSubscription.email ?? "",
      };
    } else if (!userSubscription) {
      return {
        newsletter: false,
        status: "no_subscription_found",
        ...defaultValues,
      };
    }

    throw new ConvexError("No newsletter subscription found: " + email);
  },
});
