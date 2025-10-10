//todo: currently, the active open call count doesn't include coming-soon calls. But the counter on the main page does. How to handle this?

//TODO: Split the list actions, user sub, user orgs, and other queries into their own files.

import { compareEnrichedEvents } from "@/lib/sort/compareEnrichedEvents";
import { OpenCallStatus, validOCVals } from "@/types/openCall";
import { getAuthUserId } from "@convex-dev/auth/server";
import { doc } from "convex-helpers/validators";
import { Infer, v } from "convex/values";
import { addDays, addWeeks, endOfWeek, startOfWeek } from "date-fns";
import { query } from "~/convex/_generated/server";

import { mergedStream, stream } from "convex-helpers/server/stream";
import type { Id } from "~/convex/_generated/dataModel";
import type { QueryCtx } from "~/convex/_generated/server";
import schema from "~/convex/schema";

export const filtersSchema = v.object({
  eventCategories: v.optional(v.array(v.string())),
  eventTypes: v.optional(v.array(v.string())),
  continent: v.optional(v.array(v.string())),
  eligibility: v.optional(v.array(v.string())),
  callType: v.optional(v.array(v.string())),
  callFormat: v.optional(v.string()),
  limit: v.optional(v.number()),
  showHidden: v.optional(v.boolean()),
  bookmarkedOnly: v.optional(v.boolean()),
  postStatus: v.optional(
    v.union(v.literal("posted"), v.literal("toPost"), v.literal("all")),
  ),
});

export const viewTypeSchema = v.union(
  v.literal("event"),
  v.literal("openCall"),
  v.literal("organizer"),
  v.literal("archive"),
  v.literal("orgView"),
);

export type ViewTypeOptions = Infer<typeof viewTypeSchema>;

export type Filters = Infer<typeof filtersSchema>;

export async function buildEventQuery(
  ctx: QueryCtx,
  options: {
    table: "events";
    // table: "events" | "openCalls";
    // state?: SubmissionFormState;
    filters: Filters;
    bookmarkedIds: Id<"events">[];
    hiddenIds: Id<"events">[];
    isAdmin: boolean;
    onlyWithOpenCall?: boolean;
    hideArchived?: boolean;
    viewType?: ViewTypeOptions;
  },
) {
  const {
    table,
    // state,
    filters,
    bookmarkedIds,
    hiddenIds,
    isAdmin,
    onlyWithOpenCall,
    hideArchived,
    viewType,
  } = options;

  const streams = [];
  if (
    viewType === "openCall" ||
    viewType === "archive" ||
    viewType === "organizer"
  ) {
    if (!hideArchived) {
      streams.push(
        stream(ctx.db, schema)
          .query(table)
          .withIndex("by_state_approvedAt", (q) =>
            q.eq("state", "archived").gt("approvedAt", undefined),
          ),
      );
    }
    streams.push(
      stream(ctx.db, schema)
        .query(table)
        .withIndex("by_state_approvedAt", (q) =>
          q.eq("state", "published").gt("approvedAt", undefined),
        ),
    );
  } else if (viewType === "event") {
    streams.push(
      stream(ctx.db, schema)
        .query(table)
        .withIndex("by_state_category", (q) =>
          q.eq("state", "published").eq("category", "event"),
        ),
    );
  }

  let mergeOrder: string[];
  if (viewType === "event") {
    mergeOrder = ["state", "category", "_creationTime"];
  } else {
    mergeOrder = ["state", "approvedAt", "_creationTime"];
  }
  let merged = mergedStream(streams, mergeOrder);

  if (filters.bookmarkedOnly && bookmarkedIds.length > 0) {
    merged = merged.filterWith(async (event) =>
      bookmarkedIds.includes(event._id),
    );
  }

  if (!filters.showHidden && hiddenIds.length > 0) {
    merged = merged.filterWith(async (event) => !hiddenIds.includes(event._id));
  }

  if (filters.eventCategories && filters.eventCategories?.length > 0) {
    merged = merged.filterWith(async (event) =>
      filters.eventCategories!.includes(event.category),
    );
  }

  if (filters.postStatus && filters.postStatus !== "all" && isAdmin) {
    merged = merged.filterWith(
      async (event) => event.posted === filters.postStatus,
    );
  }

  if (onlyWithOpenCall) {
    merged = merged.filterWith(async (event) =>
      validOCVals.includes(event.hasOpenCall),
    );
  }

  if (filters.eventTypes?.length) {
    merged = merged.filterWith(async (event) =>
      Array.isArray(event.type)
        ? event.type.some((t) => filters.eventTypes!.includes(t))
        : filters.eventTypes!.includes(event.type),
    );
  }

  if (filters.continent?.length) {
    merged = merged.filterWith(async (event) =>
      event.location?.continent
        ? filters.continent!.includes(event.location.continent)
        : false,
    );
  }
  return merged.collect();
}

export const getFilteredEventsPublic = query({
  args: {
    filters: filtersSchema,
    sortOptions: v.object({
      sortBy: v.union(
        v.literal("recent"),
        v.literal("eventStart"),
        v.literal("openCall"),
        v.literal("name"),
        v.literal("country"),
        v.literal("organizer"),
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
    viewType: v.optional(viewTypeSchema),
    // artistData: v.optional(
    //   v.object({
    //     bookmarked: v.array(v.id("events")),
    //     hidden: v.array(v.id("events")),
    //   }),
    // ),
    userAccountData: v.optional(
      v.object({
        subscription: v.optional(doc(schema, "userSubscriptions")),
        userOrgs: v.array(v.id("organizations")),
      }),
    ),
  },
  handler: async (
    ctx,
    {
      filters,
      sortOptions,
      page,
      source,
      viewType,
      // artistData,
      userAccountData,
    },
  ) => {
    const thisWeekPg = source === "thisweek";
    const nextWeekPg = source === "nextweek";
    const theListPg = source === "thelist";
    // const bookmarkedIds = artistData?.bookmarked ?? [];
    // const hiddenIds = artistData?.hidden ?? [];
    const subscription = userAccountData?.subscription ?? null;
    const userOrgIds = userAccountData?.userOrgs ?? [];

    const view = viewType ?? "openCall";

    let refDate = new Date();
    const userId = await getAuthUserId(ctx);
    const user = userId ? await ctx.db.get(userId) : null;
    const isAdmin = user?.role?.includes("admin");
    if (isAdmin) {
      console.log(
        "view: ",
        view,
        "sort by: ",
        sortOptions.sortBy,
        "source: ",
        source,
        "filters: ",
        filters,
      );
    }

    const hasActiveSubscription =
      subscription?.status === "active" ||
      subscription?.status === "trialing" ||
      isAdmin;

    if (thisWeekPg && refDate.getDay() === 0) {
      refDate = addDays(refDate, 1);
    }

    const targetWeekOffset = source === "nextweek" ? 1 : 0;
    //TODO: Decide if it should start on Sunday or Monday.
    const startDay = startOfWeek(refDate, { weekStartsOn: 0 });
    const shiftedWeekStart = addWeeks(startDay, targetWeekOffset);
    const endDay = endOfWeek(refDate, { weekStartsOn: 1 });
    const shiftedWeekEnd = addWeeks(endDay, targetWeekOffset);
    const weekStartISO = shiftedWeekStart.toISOString();
    const weekEndISO = shiftedWeekEnd.toISOString();

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

    let events = [];

    if (view === "orgView") {
      const eventArrays = await Promise.all(
        Array.from(userOrgIds).map((orgId) =>
          ctx.db
            .query("events")
            .withIndex("by_mainOrgId", (q) => q.eq("mainOrgId", orgId))
            .collect(),
        ),
      );
      events = eventArrays.flat();
      if (filters.eventCategories?.length) {
        events = events.filter((e) =>
          filters.eventCategories!.includes(e.category),
        );
      }
      //note-to-self: maybe add this back later
      // if (filters.postStatus && filters.postStatus !== "all" && isAdmin) {
      //   events = events.filter((e) => e.posted === filters.postStatus);
      // }
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
    } else {
      const shouldFilterByOpenCall =
        thisWeekPg || nextWeekPg || view === "openCall";
      events = await buildEventQuery(ctx, {
        table: "events",
        // state: "published",
        filters,
        bookmarkedIds,
        hiddenIds,
        isAdmin: !!isAdmin,
        onlyWithOpenCall: shouldFilterByOpenCall,
        hideArchived: view === "openCall" && !(thisWeekPg || nextWeekPg),
        viewType,
      });
    }

    let totalResults = 0;
    const publishedOpenCalls = await ctx.db
      .query("openCalls")
      // .withIndex("by_state", (q) => q.eq("state", "published"))
      .withIndex("by_state_ocEnd", (q) =>
        thisWeekPg || nextWeekPg
          ? q
              .eq("state", "published")
              .gt("basicInfo.dates.ocEnd", weekStartISO)
              .lt("basicInfo.dates.ocEnd", weekEndISO)
          : q.eq("state", "published").gt("basicInfo.dates.ocEnd", null),
      )
      .collect();
    const archivedOpenCalls =
      view === "openCall" && !(thisWeekPg || nextWeekPg)
        ? []
        : await ctx.db
            .query("openCalls")
            // .withIndex("by_state", (q) => q.eq("state", "archived"))
            .withIndex("by_state_ocEnd", (q) =>
              thisWeekPg || nextWeekPg
                ? q
                    .eq("state", "archived")
                    .gt("basicInfo.dates.ocEnd", weekStartISO)
                    .lt("basicInfo.dates.ocEnd", weekEndISO)
                : q.eq("state", "archived").gt("basicInfo.dates.ocEnd", null),
            )
            .collect();
    const allOpenCalls = [...publishedOpenCalls, ...archivedOpenCalls];

    const openCallsByEventId = new Map(
      allOpenCalls.map((oc) => [oc.eventId, oc]),
    );

    const orgIds = [...new Set(events.map((e) => e.mainOrgId).filter(Boolean))];
    const allOrgs = await Promise.all(orgIds.map((id) => ctx.db.get(id)));
    const orgNameMap = new Map(
      allOrgs.filter(Boolean).map((org) => [org?._id, org?.name]),
    );

    const enriched = await Promise.all(
      events.map(async (event) => {
        const isUserOrg =
          event.mainOrgId && userOrgIds.includes(event.mainOrgId);
        const eventHasOpenCall = validOCVals.includes(event.hasOpenCall);
        let openCall = null;
        openCall = eventHasOpenCall ? openCallsByEventId.get(event._id) : null;

        let openCallStatus: OpenCallStatus | null = null;
        let hasActiveOpenCall = false;
        let orgName: string | null = null;
        //TODO: Split this out into a separate fn. it's currently querying the entire organizatoin just for the org name.

        if (event.mainOrgId) {
          orgName = orgNameMap.get(event.mainOrgId) ?? null;
        }

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
          // if (hasActiveOpenCall) {
          //   totalOpenCalls++;
          // }
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
                // totalOpenCalls++;
              }
            }
          }
        }
        if (!hasActiveSubscription && !isAdmin && view === "event") {
          hasActiveOpenCall = false;
          openCall = null;
          openCallStatus = null;
        }

        return {
          ...event,
          orgName,
          _creationTime: event._creationTime,
          isUserOrg,
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

    const openCallFilterActive =
      (filters.eligibility?.length ?? 0) > 0 ||
      (filters.callType?.length ?? 0) > 0 ||
      !!filters.callFormat;

    const filtered =
      thisWeekPg || nextWeekPg
        ? enriched.filter(
            (e) =>
              e.openCall &&
              (e.hasActiveOpenCall || e.openCallStatus === "ended"),
          )
        : enriched.filter((e) => {
            const oc = e.openCall;
            // if (!oc) return false;
            if (!oc) return !openCallFilterActive;

            const passesEligibility =
              !filters.eligibility?.length ||
              filters.eligibility.includes(oc.eligibility?.type ?? "");

            const passesCallType =
              !filters.callType?.length ||
              filters.callType.includes(oc.basicInfo?.callType ?? "");

            const passesCallFormat =
              !filters.callFormat ||
              filters.callFormat.includes(oc.basicInfo?.callFormat ?? "");

            return passesEligibility && passesCallType && passesCallFormat;
          });

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

    const filteredTotalOpenCalls = filtered.reduce(
      (acc, e) => acc + (e.hasActiveOpenCall ? 1 : 0),
      0,
    );

    let viewFiltered = sorted;
    if (view === "event") {
      // viewFiltered = sorted.filter((e) => !e.openCall);
    } else if (view === "openCall") {
      viewFiltered = sorted.filter((e) => e.openCall);
    }

    if (view === "organizer") {
      viewFiltered = sorted.filter((e) => e.organizerId);
      const uniqueOrganizerIds = new Set(
        viewFiltered.map((e) => e.mainOrgId).filter(Boolean),
      );
      totalResults = uniqueOrganizerIds.size;
    } else {
      totalResults = viewFiltered.length;
    }

    let totalActive = 0;
    let totalArchived = 0;

    if (view === "archive") {
      for (const e of viewFiltered) {
        if (!e.openCall) continue;
        if (e.openCallStatus === "active") {
          totalActive++;
        } else if (e.openCallStatus === "ended") {
          totalArchived++;
        }
      }
    }

    const pg = page ?? 1;
    const limit = filters.limit ?? 10;
    const start = (pg - 1) * limit;
    const paginated = viewFiltered.slice(start, start + limit);

    return {
      results: paginated,
      total: totalResults,
      totalOpenCalls: filteredTotalOpenCalls,
      weekStartISO,
      weekEndISO,
      ...(view === "archive" ? { totalActive, totalArchived } : {}),
    };
  },
});
