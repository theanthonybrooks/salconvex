import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "~/convex/_generated/server";
import { analyticsActionSchema } from "~/convex/schema";

export const markEventAnalytics = mutation({
  args: {
    eventId: v.id("events"),
    plan: v.number(),
    action: analyticsActionSchema,
  },
  handler: async (ctx, args) => {
    const { eventId, plan, action } = args;
    const userId = await getAuthUserId(ctx);

    await ctx.db.insert("eventAnalytics", {
      userId,
      eventId,
      plan,
      action,
    });
  },
});

export const getEventAnalytics = query({
  args: {
    eventId: v.id("events"),
    action: v.optional(analyticsActionSchema),
  },
  handler: async (ctx, args) => {
    const { eventId, action } = args;
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("eventAnalytics")
      .withIndex("by_eventId_action", (q) =>
        q.eq("eventId", eventId).eq("action", action ?? "view"),
      )
      .collect();
  },
});
