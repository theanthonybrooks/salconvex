import {
  NewsletterFrequency,
  NewsletterType,
} from "@/constants/newsletterConsts";

import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";
import {
  mutation,
  MutationCtx,
  query,
  QueryCtx,
} from "~/convex/_generated/server";
import {
  newsletterFrequencyValidator,
  newsletterTypeValidator,
} from "~/convex/schema";
import { ConvexError, v } from "convex/values";

export async function updateUserNewsletter(
  ctx: MutationCtx,

  args: {
    userId: Id<"users">;
    email?: string;
    userPlan?: number;
  },
): Promise<void> {
  const { userId, userPlan, email } = args;

  const sub = await ctx.db
    .query("newsletter")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .first();
  const emailSub =
    !sub && email
      ? await ctx.db
          .query("newsletter")
          .withIndex("by_email", (q) => q.eq("email", email))
          .first()
      : null;

  const basePlan = Boolean(typeof userPlan === "number" && userPlan <= 1);

  console.log("frequency", basePlan ? "monthly" : "weekly/monthly");

  if (sub) {
    await ctx.db.patch(sub._id, {
      userId,
      ...(typeof userPlan === "number" && { userPlan }),
      ...(basePlan && { frequency: "monthly" }),
      ...(basePlan && { type: ["general"] }),
    });
    console.log("patching newsletter sub by userId");
  } else if (emailSub) {
    console.log("patching newsletter sub by email");
    await ctx.db.patch(emailSub._id, {
      userId,
      ...(typeof userPlan === "number" && { userPlan }),
      ...(basePlan && { frequency: "monthly" }),
      ...(basePlan && { type: ["general"] }),
    });
  }
}

export async function checkNewsletterUser(
  ctx: QueryCtx,
  email: string,
): Promise<{ newsletter: boolean; subscriptionId: Id<"newsletter"> | null }> {
  const newsletterSubscription = await ctx.db
    .query("newsletter")
    .withIndex("by_email", (q) => q.eq("email", email))
    .unique();
  console.log("email: ", email, newsletterSubscription);
  if (!newsletterSubscription) {
    return {
      newsletter: false,
      subscriptionId: null,
    };
  }

  return {
    newsletter: true,
    subscriptionId: newsletterSubscription?._id,
  };
}

export async function updateNewsletterUser(
  ctx: MutationCtx,
  userId: Id<"users">,
  newsletterId: Id<"newsletter">,
) {
  await ctx.db.patch(newsletterId, {
    userId,
    userPlan: 0,
  });
}

export const verifyNewsletterSubscription = mutation({
  args: {
    subId: v.string(),
  },
  handler: async (ctx, { subId }) => {
    const newsletterSub = await ctx.db
      .query("newsletter")
      .withIndex("by_id", (q) => q.eq("_id", subId as Id<"newsletter">))
      .first();
    if (!newsletterSub) return { success: false, message: "no_subscription" };
    const { firstName, email } = newsletterSub;
    if (newsletterSub?.verified) {
      return { success: false, message: "already_verified" };
    } else {
      await ctx.db.patch(newsletterSub._id, {
        verified: true,
      });
      await ctx.scheduler.runAfter(
        0,
        internal.actions.newsletter.sendNewsletterConfirmationEmail,
        { email, firstName, subId: newsletterSub._id },
      );
      return {
        success: true,
        message: "successfully_verified",
        data: { email, firstName },
      };
    }
  },
});

export const deleteSubscription = mutation({
  args: {
    subscriberId: v.id("newsletter"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new ConvexError("Not authenticated");
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", currentUserId))
      .unique();
    if (!user) throw new ConvexError("User not found");

    const subscriber = await ctx.db
      .query("newsletter")
      .withIndex("by_id", (q) => q.eq("_id", args.subscriberId))
      .unique();

    if (!subscriber) throw new ConvexError("Subscriber not found");

    const userId = subscriber.userId;

    const userPreferences = userId
      ? await ctx.db
          .query("userPreferences")
          .withIndex("by_userId", (q) => q.eq("userId", userId))
          .unique()
      : null;

    if (userPreferences?.notifications?.newsletter) {
      await ctx.db.patch(userPreferences._id, {
        notifications: {
          ...userPreferences.notifications,
          newsletter: false,
        },
      });
    }

    await ctx.db.delete(subscriber._id);
  },
});

export const requestVerificationEmail = mutation({
  args: {
    subId: v.id("newsletter"),
  },
  handler: async (ctx, args) => {
    const { subId } = args;
    const newsletterSub = await ctx.db.get(subId);
    if (!newsletterSub)
      return { success: false, message: "No newsletter found" };

    await ctx.db.patch(subId, {
      timesAttempted: newsletterSub.timesAttempted + 1,
      lastAttempt: Date.now(),
    });
    await ctx.scheduler.runAfter(
      0,
      internal.actions.newsletter.sendNewsletterVerificationLink,
      { firstName: newsletterSub.firstName, email: newsletterSub.email, subId },
    );
    return { success: true, message: "Verification email sent!" };
  },
});

export const subscribeToNewsletter = mutation({
  args: {
    email: v.string(),
    firstName: v.string(),
  },
  handler: async (ctx, args) => {
    const { firstName, email } = args;
    let userPlan = 0;
    const userId = await getAuthUserId(ctx);
    const user = userId ? await ctx.db.get(userId) : null;
    if (user) userPlan = user.plan ?? 0;

    const newsletterSubscription = userId
      ? await ctx.db
          .query("newsletter")
          .withIndex("by_userId", (q) => q.eq("userId", userId))
          .unique()
      : await ctx.db
          .query("newsletter")
          .withIndex("by_email", (q) => q.eq("email", email))
          .unique();
    const userPrefs = userId
      ? await ctx.db
          .query("userPreferences")
          .withIndex("by_userId", (q) => q.eq("userId", userId))
          .unique()
      : null;

    if (newsletterSubscription) {
      console.log(newsletterSubscription, email);
      const verified = newsletterSubscription.verified;
      const wasCanceled = newsletterSubscription.newsletter === false;
      if (newsletterSubscription.timesAttempted > 3) {
        return {
          status: `too_many_attempts ${verified ? "is_verified" : "unverified"}`,
          emailMismatch: email === newsletterSubscription.email,
        };
      }

      await ctx.db.patch(newsletterSubscription._id, {
        timesAttempted:
          wasCanceled && !verified
            ? 0
            : newsletterSubscription.timesAttempted + 1,
        lastAttempt: Date.now(),
        userPlan,
        firstName,
        frequency: newsletterSubscription.frequency ?? "monthly",
        newsletter: true,
        verified: false,
        ...(wasCanceled && { email }),
      });
      if (userPrefs?.notifications) {
        await ctx.db.patch(userPrefs._id, {
          notifications: {
            ...userPrefs.notifications,
            newsletter: true,
          },
        });
      }

      if (wasCanceled || !verified) {
        await ctx.scheduler.runAfter(
          0,
          internal.actions.newsletter.sendNewsletterVerificationLink,
          { firstName, email, subId: newsletterSubscription._id },
        );

        return {
          subscriptionId: newsletterSubscription._id,
          status: "success",
        };
      } else if (email !== newsletterSubscription.email) {
        console.log(
          email,
          newsletterSubscription.email,
          email === newsletterSubscription.email,
        );
        return {
          status: "already_subscribed diff email",
          emailMismatch: email !== newsletterSubscription.email,
        };
      } else {
        return {
          status: "already_subscribed",
          emailMismatch: email === newsletterSubscription.email,
        };
      }
    }

    const subscriptionId = await ctx.db.insert("newsletter", {
      userId: user?._id ?? null,
      firstName,
      email,
      newsletter: true,
      type: ["general"],
      frequency: "monthly",
      timesAttempted: 1,
      lastAttempt: Date.now(),
      userPlan,
      verified: false,
    });
    if (userPrefs?.notifications) {
      await ctx.db.patch(userPrefs._id, {
        notifications: {
          ...userPrefs.notifications,
          newsletter: true,
        },
      });
    }
    await ctx.scheduler.runAfter(
      0,
      internal.actions.newsletter.sendNewsletterVerificationLink,
      { firstName, email, subId: subscriptionId },
    );
    return {
      subscriptionId,
      status: "success",
    };
  },
});

export const getNewsletterSubscribers = query({
  args: {},
  handler: async (ctx) => {
    let totalSubscribers = 0;
    const subscribers = await ctx.db.query("newsletter").collect();
    const results = await Promise.all(
      subscribers.map(async (subscriber) => {
        if (subscriber.newsletter) {
          totalSubscribers += 1;
        }
        return {
          _id: subscriber._id,
          name: subscriber.firstName,
          email: subscriber.email,
          userPlan: subscriber.userPlan,
          userType: subscriber.userId ? "user" : "guest",
          active: subscriber.newsletter,
          verified: subscriber.verified,
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
    updateEmail: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { email, newsletter, frequency, type, userPlan, updateEmail } = args;

    const wasCanceled = newsletter === false;

    const userId = await getAuthUserId(ctx);

    const newsletterSubscription = userId
      ? await ctx.db
          .query("newsletter")
          .withIndex("by_userId", (q) => q.eq("userId", userId))
          .unique()
      : await ctx.db
          .query("newsletter")
          .withIndex("by_email", (q) => q.eq("email", email))
          .unique();

    if (!newsletterSubscription) {
      throw new ConvexError("No newsletter subscription found" + email);
    }

    if (newsletterSubscription) {
      await ctx.db.patch(newsletterSubscription._id, {
        newsletter,
        timesAttempted: 0,
        lastAttempt: Date.now(),
        ...(email && updateEmail && { email }),
        ...(frequency && { frequency }),
        ...(type && { type }),
        ...(userPlan &&
          userPlan !== newsletterSubscription.userPlan && { userPlan }),
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
      : userId
        ? await ctx.db
            .query("newsletter")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .unique()
        : email
          ? await ctx.db
              .query("newsletter")
              .withIndex("by_email", (q) => q.eq("email", email))
              .unique()
          : null;

    console.log("newsletterSubscription", newsletterSubscription);
    if (!newsletterSubscription?.newsletter) {
      return {
        newsletter: false,
        status: "no_subscription_found",
        ...defaultValues,
      };
    }

    if (newsletterSubscription) {
      return {
        subId: newsletterSubscription._id,
        verified: newsletterSubscription.verified,
        newsletter: newsletterSubscription.newsletter,
        userPlan: newsletterSubscription.userPlan ?? 0,
        frequency: newsletterSubscription.frequency ?? "monthly",
        type: newsletterSubscription.type ?? [],
        email: newsletterSubscription.email ?? "",
      };
    }

    throw new ConvexError("No newsletter subscription found: " + email);
  },
});

export const getAudience = query({
  args: {
    type: newsletterTypeValidator,
    frequency: newsletterFrequencyValidator,
    plan: v.union(v.literal(0), v.literal(1), v.literal(2), v.literal(3)),
  },
  handler: async (ctx, args) => {
    const { type, frequency, plan } = args;

    const subscribers = await ctx.db
      .query("newsletter")
      .withIndex("by_active_frequency_plan", (q) =>
        q
          .eq("newsletter", true)
          .eq("frequency", frequency)
          .gte("userPlan", plan),
      )
      .collect();

    const filteredSubscribers = subscribers.filter((subscriber) => {
      if (type.includes("openCall")) {
        return subscriber.type.includes("openCall");
      } else if (type.includes("general")) {
        return subscriber.type.includes("general");
      }
      return false;
    });

    return filteredSubscribers;
  },
});
