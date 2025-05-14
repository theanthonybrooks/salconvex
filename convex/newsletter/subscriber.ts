import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation } from "~/convex/_generated/server";

export const subscribeToNewsletter = mutation({
  args: {
    email: v.string(),
    firstName: v.string(),
    newsletter: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    console.log("meow", !!userId);
    const user = userId ? await ctx.db.get(userId) : null;
    console.log("meow2", !!user);
    const newsletterSubscription = user?._id
      ? await ctx.db
          .query("newsletter")
          .withIndex("by_userId", (q) => q.eq("userId", user._id))
          .unique()
      : null;
    console.log("meow3", !!newsletterSubscription);
    const emailSubscription = await ctx.db
      .query("newsletter")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
    console.log("meow4", !!emailSubscription);
    if (newsletterSubscription && emailSubscription) {
      if (newsletterSubscription.timesAttempted > 5) {
        return {
          status: "too_many_attempts",
          emailMismatch: args.email === newsletterSubscription.email,
        };
      }
    }

    if (newsletterSubscription) {
      console.log("times attempted", newsletterSubscription.timesAttempted);
      await ctx.db.patch(newsletterSubscription._id, {
        timesAttempted: newsletterSubscription.timesAttempted + 1,
        lastAttempt: Date.now(),
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
      console.log("times attempted", emailSubscription.timesAttempted);
      await ctx.db.patch(emailSubscription._id, {
        timesAttempted: emailSubscription.timesAttempted + 1,
        lastAttempt: Date.now(),
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
      });
    }
  },
});
