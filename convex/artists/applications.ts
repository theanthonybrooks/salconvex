import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { query } from "~/convex/_generated/server";

export const getArtistApplication = query({
  args: {
    eventId: v.optional(v.id("events")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const artist = await ctx.db
      .query("artists")
      .withIndex("by_artistId", (q) => q.eq("artistId", userId))
      .unique();
    if (!artist) return null;

    const applications = await ctx.db
      .query("applications")
      .withIndex("by_artistId", (q) => q.eq("artistId", userId))
      .collect();

    return applications;
  },
});

export const getArtistApplications = query({
  // args: {
  //   artistId: v.optional(v.id("artists")),
  // },
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const artist = await ctx.db
      .query("artists")
      .withIndex("by_artistId", (q) => q.eq("artistId", userId))
      .unique();
    if (!artist) return null;

    const applications = await ctx.db
      .query("applications")
      .withIndex("by_artistId", (q) => q.eq("artistId", userId))
      .collect();

    const listActions = await ctx.db
      .query("listActions")
      .withIndex("by_artistId", (q) => q.eq("artistId", userId))
      .collect();

    return { applications, listActions, artist };
  },
});

export const getArtistApplications2 = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (!user) throw new Error("User not found");

    const applications = await ctx.db
      .query("applications")
      .withIndex("by_artistId", (q) => q.eq("artistId", user._id))
      .collect();

    const openCallIds = [...new Set(applications.map((app) => app.openCallId))];

    const openCalls = await ctx.db
      .query("openCalls")
      .filter((q) => q.or(...openCallIds.map((id) => q.eq(q.field("_id"), id))))
      .collect();

    const eventsMap = new Map(
      (
        await ctx.db
          .query("events")
          .filter((q) =>
            q.or(...openCalls.map((oc) => q.eq(q.field("_id"), oc.eventId))),
          )
          .collect()
      ).map((event) => [event._id, event]),
    );

    return applications.map((app) => {
      const openCall = openCalls.find((oc) => oc._id === app.openCallId);
      const event = openCall ? eventsMap.get(openCall.eventId) : null;

      return {
        _id: app._id,
        name: event?.name ?? "Unknown Event",
        slug: event?.slug ?? "unknown",
        dates_edition: event?.dates.edition ?? 0,
        eventStart: event?.dates.eventStart ?? "-",
        eventEnd: event?.dates.eventEnd ?? "-",
        productionStart:
          event?.dates.prodDates?.[0]?.start ?? event?.dates.eventStart ?? "-",
        productionEnd:
          event?.dates.prodDates?.[0]?.end ?? event?.dates.eventEnd ?? "-",
        applicationTime: app.applicationTime ?? 0,
        applicationStatus: app.applicationStatus ?? "-",
        manualApplied: app.manualApplied ?? false,
        responseTime: app.responseTime ?? 0,
        response: app.response ?? "-",
      };
    });
  },
});
