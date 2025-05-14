import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation } from "~/convex/_generated/server";

export const subscribeToNewsletter = mutation({
  args: {
    email: v.string(),
    newsletter: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const user = userId ? await ctx.db.get(userId) : null;
    const newsletterSubscription = user?._id
      ? await ctx.db
          .query("newsletter")
          .withIndex("by_userId", (q) => q.eq("userId", user._id))
          .unique()
      : null;
    if (newsletterSubscription) {
      await ctx.db.patch(newsletterSubscription._id, {
        email: args.email,
        newsletter: args.newsletter,
      });
    } else {
      await ctx.db.insert("newsletter", {
        userId: user?._id ?? null,
        email: args.email,
        newsletter: args.newsletter,
      });
    }
  },
});
