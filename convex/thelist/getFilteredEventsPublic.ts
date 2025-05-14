import { compareEnrichedEvents } from "@/lib/sort/compareEnrichedEvents";
import { PublicEventPreviewData } from "@/types/event";
import { OpenCallStatus } from "@/types/openCall";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { query } from "~/convex/_generated/server";

export const getFilteredEventsPublic = query({
  args: {
    filters: v.object({
      eventCategories: v.optional(v.array(v.string())),
      eventTypes: v.optional(v.array(v.string())),
      continent: v.optional(v.array(v.string())),
      limit: v.optional(v.number()),
      showHidden: v.optional(v.boolean()),
      bookmarkedOnly: v.optional(v.boolean()),
    }),
    sortOptions: v.object({
      sortBy: v.union(
        v.literal("eventStart"),
        v.literal("openCall"),
        v.literal("name"),
      ),
      sortDirection: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
    }),
    page: v.optional(v.number()),
  },
  handler: async (ctx, { filters, sortOptions, page }) => {
    const userId = await getAuthUserId(ctx);
    const user = userId ? await ctx.db.get(userId) : null;
    const listActions = user?._id
      ? await ctx.db
          .query("listActions")
          .withIndex("by_artistId", (q) => q.eq("artistId", user._id))
          .collect()
      : [];
    const applicationData = user?._id
      ? await ctx.db
          .query("artists")
          .withIndex("by_artistId", (q) => q.eq("artistId", user._id))
          .collect()
      : [];
    // console.log(listActions);
    // console.log(applicationData);
    const bookmarkedIds = listActions
      .filter((a) => a.bookmarked)
      .map((a) => a.eventId);

    const hiddenIds = listActions.filter((a) => a.hidden).map((a) => a.eventId);

    // After enriching events and before sorting

    // Continue with the rest of your function logic
    // You can use user and artistData safely now, knowing they might be null/empty
    // const artistData = await ctx.db
    //   .query("artists")
    //   .withIndex("by_artistId", (q) => q.eq("artistId", user._id))

    let events = await ctx.db
      .query("events")
      .withIndex("by_state", (q) => q.eq("state", "published"))
      .collect();

    // Apply filters
    // User/Artist filters

    if (filters.bookmarkedOnly) {
      events = events.filter((e) => bookmarkedIds.includes(e._id));
    }

    if (!filters.showHidden) {
      events = events.filter((e) => !hiddenIds.includes(e._id));
    }

    // Public filters
    if (filters.eventCategories?.length) {
      events = events.filter((e) =>
        filters.eventCategories!.includes(e.category),
      );
    }

    if (filters.eventTypes?.length) {
      events = events.filter((e) =>
        Array.isArray(e.type)
          ? e.type.some((t) => filters.eventTypes!.includes(t))
          : filters.eventTypes!.includes(e.type),
      );
    }

    if (filters.continent?.length) {
      events = events.filter(
        (e) =>
          e.location?.continent &&
          filters.continent!.includes(e.location.continent),
      );
    }
    let totalOpenCalls = 0;

    const enriched = await Promise.all(
      events.map(async (event) => {
        const openCall = await ctx.db
          .query("openCalls")
          .withIndex("by_eventId", (q) => q.eq("eventId", event._id))
          .unique();

        let openCallStatus: OpenCallStatus | null = null;
        let hasActiveOpenCall = false;

        const now = Date.now();
        const ocType = openCall?.basicInfo?.callType;
        const ocStart = openCall?.basicInfo?.dates?.ocStart
          ? new Date(openCall.basicInfo.dates.ocStart).getTime()
          : null;
        const ocEnd = openCall?.basicInfo?.dates?.ocEnd
          ? new Date(openCall.basicInfo.dates.ocEnd).getTime()
          : null;

        if (openCall && openCall.state === "published") {
          if (ocType === "Fixed") {
            if (ocStart && now < ocStart) openCallStatus = "coming-soon";
            else if (ocEnd && now > ocEnd) openCallStatus = "ended";
            else openCallStatus = "active";
          } else if (ocType === "Rolling" || ocType === "Email") {
            openCallStatus = ocEnd && now > ocEnd ? "ended" : "active";
          }

          hasActiveOpenCall = openCallStatus === "active";
        }
        if (hasActiveOpenCall) {
          totalOpenCalls++;
        }

        return {
          ...event,
          _creationTime: event._creationTime,
          openCall: openCall ?? null,
          openCallStatus,
          hasActiveOpenCall,
          eventId: event._id,
          slug: event.slug,
          dates: event.dates,
          name: event.name,
          tabs: { opencall: openCall ?? null },
        };
      }),
    );

    const sorted = enriched.sort((a, b) =>
      compareEnrichedEvents(a, b, {
        sortBy: sortOptions.sortBy ?? "openCall",
        sortDirection: sortOptions.sortDirection ?? "desc",
      }),
    );

    const pg = page ?? 1;
    const limit = filters.limit ?? 10;
    const start = (pg - 1) * limit;
    const paginated = sorted.slice(start, start + limit);

    return {
      results: paginated as PublicEventPreviewData[],
      total: sorted.length,
      totalOpenCalls,
    };
  },
});
