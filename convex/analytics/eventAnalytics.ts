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
  },
  handler: async (ctx, args) => {
    const { eventId } = args;
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const interactions = await ctx.db
      .query("eventAnalytics")
      .withIndex("by_eventId_action", (q) => q.eq("eventId", eventId))
      .collect();

    const totalsByDate = new Map<
      string,
      { viewed: number; applied: number; bookmarked: number; hidden: number }
    >();

    for (const app of interactions) {
      const date = new Date(app._creationTime);
      // Format: YYYY-MM-DD
      const dateKey = date.toISOString().split("T")[0];

      const current = totalsByDate.get(dateKey) ?? {
        viewed: 0,
        applied: 0,
        bookmarked: 0,
        hidden: 0,
      };

      if (app.action === "view") current.viewed += 1;
      if (app.action === "apply") current.applied += 1;
      if (app.action === "bookmark") current.bookmarked += 1;
      if (app.action === "hide") current.hidden += 1;

      totalsByDate.set(dateKey, current);
    }

    // Convert map to array
    const appChartData = Array.from(totalsByDate.entries()).map(
      ([date, counts]) => ({
        date,
        ...counts,
      }),
    );

    // Optional: sort by date
    appChartData.sort((a, b) => a.date.localeCompare(b.date));

    return appChartData;
  },
});
