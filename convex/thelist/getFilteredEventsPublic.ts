import { compareEnrichedEvents } from "@/lib/sort/compareEnrichedEvents";
import { PublicEventPreviewData } from "@/types/event";
import { OpenCallStatus } from "@/types/openCall";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { addHours, addWeeks, endOfWeek, startOfWeek, subHours } from "date-fns";
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
    source: v.union(
      v.literal("thelist"),
      v.literal("archive"),
      v.literal("thisweek"),
      v.literal("nextweek"),
    ),
  },
  handler: async (ctx, { filters, sortOptions, page, source }) => {
    const thisWeekPg = source === "thisweek";
    const nextWeekPg = source === "nextweek";
    const theListPg = source === "thelist";

    // const now = new Date();

    const targetWeekOffset = source === "nextweek" ? 1 : 0;
    const startDay = subHours(startOfWeek(new Date(), { weekStartsOn: 1 }), 14);
    const shiftedWeekStart = addWeeks(startDay, targetWeekOffset);

    const endDay = addHours(endOfWeek(new Date(), { weekStartsOn: 1 }), 12);

    console.log(endDay);
    const shiftedWeekEnd = addWeeks(endDay, targetWeekOffset);

    const weekStartISO = shiftedWeekStart.toISOString();
    const weekEndISO = shiftedWeekEnd.toISOString();

    const userId = await getAuthUserId(ctx);
    const user = userId ? await ctx.db.get(userId) : null;
    const isAdmin = user?.role?.includes("admin");
    const subscription = user
      ? await ctx.db
          .query("userSubscriptions")
          .withIndex("userId", (q) => q.eq("userId", user._id))
          .first()
      : null;
    const hasActiveSubscription =
      subscription?.status === "active" ||
      subscription?.status === "trialing" ||
      isAdmin;
    const listActions =
      user?._id && hasActiveSubscription
        ? await ctx.db
            .query("listActions")
            .withIndex("by_artistId", (q) => q.eq("artistId", user._id))
            .collect()
        : [];
    const bookmarkedIds = listActions
      .filter((a) => a.bookmarked)
      .map((a) => a.eventId);

    const hiddenIds = listActions.filter((a) => a.hidden).map((a) => a.eventId);
    let events = await ctx.db
      .query("events")
      .withIndex("by_state", (q) => q.eq("state", "published"))
      .collect();

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
        if (theListPg) {
          if (openCall && openCall.state === "published") {
            if (ocType === "Fixed") {
              if (ocStart && now < ocStart) openCallStatus = "coming-soon";
              else if (ocEnd && now > ocEnd) openCallStatus = "ended";
              else openCallStatus = "active";
            } else if (ocType === "Rolling" || ocType === "Email") {
              openCallStatus = ocEnd && now > ocEnd ? "ended" : "active";
            }

            hasActiveOpenCall = openCallStatus === "active";
          } else if (openCall && openCall.state === "archived") {
            openCallStatus = "ended";
          }
          if (hasActiveOpenCall) {
            totalOpenCalls++;
          }
        } else if (thisWeekPg || nextWeekPg) {
          // if (!openCall || openCall.state !== "published") return null;

          const ocEndISO = openCall?.basicInfo?.dates?.ocEnd ?? null;

          if (openCall) {
            const isFixed = ocType === "Fixed";
            const isInWeek =
              ocEndISO && ocEndISO > weekStartISO && ocEndISO < weekEndISO;
            const isEnded = ocEnd && now > ocEnd;
            if (isFixed && isInWeek) {
              if (openCall.state === "published" && !isEnded) {
                openCallStatus = "active";
              } else if (openCall.state === "archived" || isEnded) {
                openCallStatus = "ended";
              }

              if (openCallStatus === "active" || openCallStatus === "ended") {
                hasActiveOpenCall = true;
                totalOpenCalls++;
              }
            }
          }
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
    const filtered =
      thisWeekPg || nextWeekPg
        ? enriched.filter((e) => e.openCall && e.hasActiveOpenCall)
        : enriched;

    const sorted = filtered.sort((a, b) =>
      compareEnrichedEvents(
        a,
        b,
        {
          sortBy: sortOptions.sortBy ?? "openCall",
          sortDirection: sortOptions.sortDirection ?? "desc",
        },
        source,
      ),
    );

    const pg = page ?? 1;
    const limit = filters.limit ?? 10;
    const start = (pg - 1) * limit;
    const paginated = sorted.slice(start, start + limit);

    return {
      results: paginated as PublicEventPreviewData[],
      total: sorted.length,
      totalOpenCalls,
      weekStartISO,
      weekEndISO,
    };
  },
});
