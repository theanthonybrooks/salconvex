import {
  endOfDay,
  endOfYear,
  startOfDay,
  startOfYear,
  subDays,
  subYears,
} from "date-fns";

import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "~/convex/_generated/server";
import { analyticsActionSchema, analyticsSrcSchema } from "~/convex/schema";
import { v } from "convex/values";

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

const timeRangeValidator = v.union(
  v.literal("lastYear"),
  v.literal("365"),
  v.literal("180"),
  v.literal("120"),
  v.literal("90"),
  v.literal("30"),
  v.literal("7"),
);

export const getEventAnalytics = query({
  args: {
    eventId: v.optional(v.id("events")),
    timeRange: timeRangeValidator,
  },
  handler: async (ctx, args) => {
    const { eventId, timeRange } = args;
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const today = new Date();
    const startOfToday = startOfDay(today);

    const endOfToday = endOfDay(today);
    const timeRangeDays = parseInt(timeRange, 10);
    const lastYear = timeRange === "lastYear";
    const startOfLastYear = startOfYear(subYears(new Date(), 1));
    const endOfLastYear = endOfYear(subYears(new Date(), 1));

    const adjustedStartDate = lastYear
      ? startOfLastYear.getTime()
      : subDays(startOfToday, timeRangeDays).getTime();
    const adjustedEndDate = lastYear
      ? endOfLastYear.getTime()
      : endOfToday.getTime();

    const interactions = eventId
      ? await ctx.db
          .query("eventAnalytics")
          .withIndex("by_eventId", (q) =>
            q
              .eq("eventId", eventId)
              .gte("_creationTime", adjustedStartDate)
              .lte("_creationTime", adjustedEndDate),
          )
          .collect()
      : await ctx.db
          .query("eventAnalytics")
          .withIndex("by_creation_time", (q) =>
            q
              .gte("_creationTime", adjustedStartDate)
              .lte("_creationTime", adjustedEndDate),
          )
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

export const getEventUserAnalytics1 = query({
  args: {
    eventId: v.optional(v.id("events")),
    timeRange: timeRangeValidator,
  },
  handler: async (ctx, args) => {
    console.log(args);
    const { eventId, timeRange } = args;
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const today = new Date();
    const startOfToday = startOfDay(today);

    const endOfToday = endOfDay(today);
    const timeRangeDays = parseInt(timeRange, 10);
    const lastYear = timeRange === "lastYear";
    const startOfLastYear = startOfYear(subYears(new Date(), 1));
    const endOfLastYear = endOfYear(subYears(new Date(), 1));

    const adjustedStartDate = lastYear
      ? startOfLastYear.getTime()
      : subDays(startOfToday, timeRangeDays).getTime();
    const adjustedEndDate = lastYear
      ? endOfLastYear.getTime()
      : endOfToday.getTime();
    const interactions = eventId
      ? await ctx.db
          .query("eventAnalytics")
          .withIndex("by_eventId", (q) =>
            q
              .eq("eventId", eventId)
              .gte("_creationTime", adjustedStartDate)
              .lte("_creationTime", adjustedEndDate),
          )
          .collect()
      : await ctx.db
          .query("eventAnalytics")
          .withIndex("by_creation_time", (q) =>
            q
              .gte("_creationTime", adjustedStartDate)
              .lte("_creationTime", adjustedEndDate),
          )
          .collect();

    // keep only one record per userId per day
    const uniqueInteractions = [
      ...new Map(
        interactions.map((i) => {
          const day = new Date(i._creationTime).toDateString();
          const key = i.userId
            ? `${i.userId}-${day}`
            : `${Math.random()}-${day}`;
          return [key, i];
        }),
      ).values(),
    ];

    const totalsByDateUsers = new Map<
      string,
      { guest: number; user: number; artist: number; withSub: number }
    >();

    for (const app of uniqueInteractions) {
      const date = new Date(app._creationTime);
      const dateKey = date.toISOString().split("T")[0];

      const current = totalsByDateUsers.get(dateKey) ?? {
        guest: 0,
        user: 0,
        artist: 0,
        withSub: 0,
      };

      if (!app.userId) current.guest += 1;
      else current.user += 1;

      if (
        app.userType === "artist-only" ||
        app.userType === "artist-and-organizer"
      )
        current.artist += 1;

      if (app.hasSub === true) current.withSub += 1;

      totalsByDateUsers.set(dateKey, current);
    }

    const appChartData = Array.from(totalsByDateUsers.entries())
      .map(([date, counts]) => ({
        date,
        ...counts,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return appChartData;
  },
});

export const getEventUserAnalytics = query({
  args: {
    eventId: v.optional(v.id("events")),
    timeRange: timeRangeValidator,
  },
  handler: async (ctx, args) => {
    const { eventId, timeRange } = args;
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const today = new Date();
    const timeRangeDays = parseInt(timeRange, 10);
    const adjustedStartDate = subDays(today, timeRangeDays).getTime();

    const interactions = eventId
      ? await ctx.db
          .query("eventAnalytics")
          .withIndex("by_eventId", (q) =>
            q.eq("eventId", eventId).gte("_creationTime", adjustedStartDate),
          )
          .collect()
      : await ctx.db
          .query("eventAnalytics")
          .withIndex("by_creation_time", (q) =>
            q.gte("_creationTime", adjustedStartDate),
          )
          .collect();

    // one record per userId per day
    const uniqueInteractions = [
      ...new Map(
        interactions.map((i) => {
          const day = new Date(i._creationTime).toDateString();
          const key = i.userId
            ? `${i.userId}-${day}`
            : `${Math.random()}-${day}`;
          return [key, i];
        }),
      ).values(),
    ];

    // per-day totals
    const totalsByDateUsers = new Map<
      string,
      { guest: number; user: number; artist: number; withSub: number }
    >();

    for (const app of uniqueInteractions) {
      const dateKey = new Date(app._creationTime).toISOString().split("T")[0];

      const current = totalsByDateUsers.get(dateKey) ?? {
        guest: 0,
        user: 0,
        artist: 0,
        withSub: 0,
      };

      if (!app.userId) current.guest += 1;
      else current.user += 1;

      if (
        app.userType === "artist-only" ||
        app.userType === "artist-and-organizer"
      ) {
        current.artist += 1;
      }

      if (app.hasSub === true) current.withSub += 1;

      totalsByDateUsers.set(dateKey, current);
    }

    const appChartData = Array.from(totalsByDateUsers.entries())
      .map(([date, counts]) => ({
        date,
        ...counts,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
    const seenUserIds = new Set<string>();
    const overallTotals = { guest: 0, user: 0, artist: 0, withSub: 0 };

    for (const app of uniqueInteractions) {
      if (!app.userId) {
        overallTotals.guest += 1;
        if (
          app.userType === "artist-only" ||
          app.userType === "artist-and-organizer"
        ) {
          overallTotals.artist += 1;
        }
        if (app.hasSub === true) overallTotals.withSub += 1;
        continue;
      }

      const key = String(app.userId);
      if (seenUserIds.has(key)) continue;
      seenUserIds.add(key);

      overallTotals.user += 1;

      if (
        app.userType === "artist-only" ||
        app.userType === "artist-and-organizer"
      ) {
        overallTotals.artist += 1;
      }
      if (app.hasSub === true) overallTotals.withSub += 1;
    }

    return {
      perDay: appChartData,
      totals: overallTotals,
    };
  },
});
