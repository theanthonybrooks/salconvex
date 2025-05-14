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

    let events = await ctx.db
      .query("events")
      .withIndex("by_state", (q) => q.eq("state", "published"))
      .collect();

    // Apply filters
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

    // Enrich with open call data
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
    };
  },
});
