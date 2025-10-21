import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "~/convex/_generated/server";
import { analyticsActionSchema, analyticsSrcSchema } from "~/convex/schema";

export const markEventAnalytics = mutation({
  args: {
    eventId: v.id("events"),
    plan: v.number(),
    action: analyticsActionSchema,
    src: v.optional(analyticsSrcSchema),
    userType: v.optional(v.array(v.string())),
    hasSub: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { eventId, plan, action, src, userType, hasSub } = args;
    const userId = await getAuthUserId(ctx);
    const outputType =
      userType?.includes("artist") && userType?.includes("organizer")
        ? "artist-and-organizer"
        : userType?.includes("artist")
          ? "artist-only"
          : userType?.includes("organizer")
            ? "organizer-only"
            : null;

    const singleCountCategories = ["bookmark", "hide", "apply"];
    const singleCount = singleCountCategories.includes(action);
    if (singleCount) {
      const existingAction = await ctx.db
        .query("eventAnalytics")
        .withIndex("by_userId_action", (q) =>
          q.eq("userId", userId).eq("action", action),
        )
        .first();
      if (existingAction) {
        await ctx.db.delete(existingAction._id);
      }
    }

    await ctx.db.insert("eventAnalytics", {
      userId,
      eventId,
      plan,
      action,
      src,
      userType: outputType,
      hasSub,
    });
  },
});

export const getEventAnalytics = query({
  args: {
    eventId: v.optional(v.id("events")),
  },
  handler: async (ctx, args) => {
    const { eventId } = args;
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const interactions = eventId
      ? await ctx.db
          .query("eventAnalytics")
          .withIndex("by_eventId_action", (q) => q.eq("eventId", eventId))
          .collect()
      : await ctx.db.query("eventAnalytics").collect();

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

export const getEventUserAnalytics = query({
  args: {
    eventId: v.optional(v.id("events")),
  },
  handler: async (ctx, args) => {
    const { eventId } = args;
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const interactions = eventId
      ? await ctx.db
          .query("eventAnalytics")
          .withIndex("by_eventId_action", (q) => q.eq("eventId", eventId))
          .collect()
      : await ctx.db.query("eventAnalytics").collect();

    const totalsByDateUsers = new Map<
      string,
      { guest: number; user: number; artist: number; withSub: number }
    >();

    for (const app of interactions) {
      const date = new Date(app._creationTime);
      // Format: YYYY-MM-DD
      const dateKey = date.toISOString().split("T")[0];

      const current = totalsByDateUsers.get(dateKey) ?? {
        guest: 0,
        user: 0,
        artist: 0,
        withSub: 0,
      };

      if (!app.userId) current.guest += 1;
      if (app.userId) current.user += 1;
      if (
        app.userType === "artist-only" ||
        app.userType === "artist-and-organizer"
      )
        current.artist += 1;
      if (app.hasSub === true) current.withSub += 1;

      totalsByDateUsers.set(dateKey, current);
    }

    // Convert map to array
    const appChartData = Array.from(totalsByDateUsers.entries()).map(
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
