import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation } from "~/convex/_generated/server";
import { linktreeLinkTypeValidator } from "~/convex/schema";
import { v } from "convex/values";

export const updateLinktreeAnalytics = mutation({
  args: {
    link: linktreeLinkTypeValidator,
    hasSub: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const user = userId ? await ctx.db.get(userId) : null;
    const isAdmin = user?.role?.includes("admin") ?? false;
    const userPlan = user?.plan ?? 0;
    const { link, hasSub } = args;
    if (isAdmin) return;
    await ctx.db.insert("linktreeAnalytics", {
      userId,
      link,
      plan: userPlan,
      hasSub,
    });
  },
});
