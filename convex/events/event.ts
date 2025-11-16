import {
  EventCategory,
  EventFormat,
  ProdFormat,
  SubmissionFormState,
} from "@/types/eventTypes";
import { OpenCall, OpenCallApplication } from "@/types/openCallTypes";
import { Organizer } from "@/types/organizer";

import slugify from "slugify";

import { sanitizeStringMap } from "@/helpers/utilsFns";

import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";
import { mutation, MutationCtx, query } from "~/convex/_generated/server";
import {
  eventsAggregate,
  openCallsAggregate,
} from "~/convex/aggregates/eventAggregates";
import {
  eventFormatValidator,
  eventSchema,
  eventStateValidator,
  linksFields,
  prodFormatValidator,
} from "~/convex/schema";
import { ConvexError, v } from "convex/values";

// export const globalSearch = query({
//   args: {
//     searchTerm: v.string(),
//     searchType: v.union(
//       v.literal("events"),
//       v.literal("orgs"),
//       v.literal("loc"),
//       v.literal("all"),
//     ),
//     activeSub: v.optional(v.boolean()),
//   },

//   handler: async (ctx, { searchTerm, searchType, activeSub }) => {
//     const userId = await getAuthUserId(ctx);
//     const sub = userId
//       ? await ctx.db
//           .query("userSubscriptions")
//           .withIndex("userId", (q) => q.eq("userId", userId))
//           .first()
//       : null;

//     const hasActiveSubscription =
//       sub?.status === "active" || sub?.status === "trialing";

//     const term = searchTerm.trim();
//     if (!term) return { results: [], label: null };

//     const searchTerms = term.toLowerCase().split(/\s+/);
//     const now = Date.now();

//     /**
//      * Enrich events with their open call status, querying only related open calls.
//      */
//     const attachOpenCallStatusFlag = async <T extends { _id: Id<"events"> }>(
//       events: T[],
//     ): Promise<(T & { ocStatus: number })[]> => {
//       if (!hasActiveSubscription || events.length === 0) {
//         return events.map((e) => ({ ...e, ocStatus: 0 }));
//       }

//       // Fetch open calls only for these events, in parallel
//       const openCallGroups = await Promise.all(
//         events.map(async (event) => {
//           const openCalls = await ctx.db
//             .query("openCalls")
//             .withIndex("by_eventId", (q) => q.eq("eventId", event._id))
//             .collect();
//           return [event._id, openCalls] as const;
//         }),
//       );

//       const callMap = new Map<
//         Id<"events">,
//         { ocStart?: string; ocEnd?: string; callType?: string }[]
//       >();

//       for (const [eventId, openCalls] of openCallGroups) {
//         for (const oc of openCalls) {
//           const { basicInfo } = oc;
//           const dates = basicInfo?.dates;
//           const rollingCall = basicInfo?.callType === "Rolling";
//           if (!dates && !rollingCall) continue;

//           if (!callMap.has(eventId)) callMap.set(eventId, []);
//           callMap.get(eventId)!.push({
//             ocStart: dates?.ocStart ?? undefined,
//             ocEnd: dates?.ocEnd ?? undefined,
//             callType: basicInfo?.callType,
//           });
//         }
//       }

//       return events.map((e) => {
//         const calls = callMap.get(e._id);
//         if (!calls || calls.length === 0) return { ...e, ocStatus: 0 };

//         let status = 1;
//         for (const { ocStart, ocEnd, callType } of calls) {
//           const start = ocStart ? Date.parse(ocStart) : NaN;
//           const end = ocEnd ? Date.parse(ocEnd) : NaN;
//           const rollingCall = callType === "Rolling";

//           if (!isNaN(start) && start > now) {
//             status = Math.max(status, 3); // future
//           } else if (
//             (!isNaN(start) && !isNaN(end) && start <= now && end >= now) ||
//             rollingCall
//           ) {
//             status = 2; // active overrides
//             break;
//           }
//         }

//         return { ...e, ocStatus: status };
//       });
//     };

//     // -----------------------
//     // SEARCH LOGIC
//     // -----------------------

//     if (searchType === "events") {
//       const events = await ctx.db
//         .query("events")
//         .withSearchIndex("search_by_name", (q) =>
//           q.search("name", term).eq("state", "published"),
//         )
//         .take(20);

//       const filtered = events.filter((e) =>
//         searchTerms.every((t) => e.name.toLowerCase().includes(t)),
//       );

//       const enriched = await attachOpenCallStatusFlag(filtered);

//       return {
//         results: sortByOcStatus(enriched),
//         label: "Events",
//       };
//     }

//     if (searchType === "orgs") {
//       const orgs = await ctx.db
//         .query("organizations")
//         .withSearchIndex("search_by_name", (q) =>
//           q.search("name", term).eq("isComplete", true),
//         )
//         .take(20);

//       const filtered = orgs.filter((o) =>
//         searchTerms.every((t) => o.name.toLowerCase().includes(t)),
//       );

//       return { results: filtered, label: "Organizers" };
//     }

//     if (searchType === "loc") {
//       const [eventLocResults, orgLocResults] = await Promise.all([
//         ctx.db
//           .query("events")
//           .withSearchIndex("search_by_location", (q) =>
//             q.search("location.full", term).eq("state", "published"),
//           )
//           .take(20),
//         ctx.db
//           .query("organizations")
//           .withSearchIndex("search_by_location", (q) =>
//             q.search("location.full", term).eq("isComplete", true),
//           )
//           .take(20),
//       ]);

//       const sortedOrgLocResults = sortByLocation(
//         orgLocResults,
//         COUNTRIES_REQUIRING_STATE,
//         (item) => item.location,
//       );
//       const sortedEventLocResults = sortByLocation(
//         eventLocResults,
//         COUNTRIES_REQUIRING_STATE,
//         (item) => item.location,
//       );

//       const enrichedEvents = await attachOpenCallStatusFlag(
//         sortedEventLocResults,
//       );

//       return {
//         results: {
//           events: enrichedEvents,
//           organizers: sortedOrgLocResults,
//         },
//         label: "Location",
//       };
//     }

//     if (searchType === "all") {
//       const [eventName, orgName, eventLoc, orgLoc] = await Promise.all([
//         ctx.db
//           .query("events")
//           .withSearchIndex("search_by_name", (q) =>
//             q.search("name", term).eq("state", "published"),
//           )
//           .take(20),
//         ctx.db
//           .query("organizations")
//           .withSearchIndex("search_by_name", (q) =>
//             q.search("name", term).eq("isComplete", true),
//           )
//           .take(20),
//         ctx.db
//           .query("events")
//           .withSearchIndex("search_by_location", (q) =>
//             q.search("location.full", term).eq("state", "published"),
//           )
//           .take(20),
//         ctx.db
//           .query("organizations")
//           .withSearchIndex("search_by_location", (q) =>
//             q.search("location.full", term).eq("isComplete", true),
//           )
//           .take(20),
//       ]);

//       const filteredEventName = eventName.filter((e) =>
//         searchTerms.every((t) => e.name.toLowerCase().includes(t)),
//       );
//       const filteredOrgName = orgName.filter((o) =>
//         searchTerms.every((t) => o.name.toLowerCase().includes(t)),
//       );

//       const sortedOrgLoc = sortByLocation(
//         orgLoc,
//         COUNTRIES_REQUIRING_STATE,
//         (item) => item.location,
//       );
//       const sortedEventLoc = sortByLocation(
//         eventLoc,
//         COUNTRIES_REQUIRING_STATE,
//         (item) => item.location,
//       );

//       const [enrichedEventName, enrichedEventLoc] = await Promise.all([
//         attachOpenCallStatusFlag(filteredEventName),
//         attachOpenCallStatusFlag(sortedEventLoc),
//       ]);

//       return {
//         results: {
//           eventName: sortByOcStatus(enrichedEventName),
//           orgName: filteredOrgName,
//           eventLoc: enrichedEventLoc,
//           orgLoc: sortedOrgLoc,
//         },
//         label: "All",
//       };
//     }

//     return { results: [], label: null };
//   },
// });

export async function generateUniqueNameAndSlug(
  ctx: MutationCtx,
  baseName: string,
  baseEdition: number,
): Promise<{ name: string; slug: string }> {
  let base = baseName;
  let suffix = 1;

  // Regex to check for trailing number with space or hyphen
  const match = baseName.match(/^(.*?)(?:[-\s])(\d+)$/);

  if (match) {
    base = match[1];
    suffix = parseInt(match[2], 10) + 1;
  }

  const existingExact = await ctx.db
    .query("events")
    .withIndex("by_name_and_edition", (q) =>
      q.eq("name", baseName).eq("dates.edition", baseEdition),
    )
    .unique();

  const existingSlug = await ctx.db
    .query("events")
    .withIndex("by_slug", (q) => q.eq("slug", `${baseName}-${suffix}`))
    .unique();

  if (!existingExact && !existingSlug) {
    return {
      name: baseName,
      slug: slugify(baseName, { lower: true, strict: true }),
    };
  }

  while (true) {
    const tryName = match ? `${base} ${suffix}` : `${base}-${suffix}`;
    const exists = await ctx.db
      .query("events")
      .withIndex("by_name_and_edition", (q) =>
        q.eq("name", tryName).eq("dates.edition", baseEdition),
      )
      .unique();

    const slugExists = await ctx.db
      .query("events")
      .withIndex("by_slug", (q) => q.eq("slug", tryName))
      .unique();

    if (!exists && !slugExists) {
      return {
        name: tryName,
        slug: slugify(tryName, { lower: true, strict: true }),
      };
    }

    suffix++;
  }
}

export const updateEventLastEditedAt = mutation({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const lastEditedAt = Date.now();

    const event = await ctx.db.get(args.eventId);
    if (!event) return null;
    await ctx.db.patch(event._id, {
      lastEditedAt,
    });
    const eventLookup = await ctx.db
      .query("eventLookup")
      .withIndex("by_eventId", (q) => q.eq("eventId", event._id))
      .first();
    if (!eventLookup) return null;
    await ctx.db.patch(eventLookup._id, {
      lastEditedAt,
    });

    return { event, lastEditedAt };
  },
});

//TODO: Make some of these 0 when non-admin.
export const getTotalNumberOfEvents = query({
  handler: async (ctx) => {
    const publishedBounds = {
      lower: { key: "published", inclusive: true },
      upper: { key: "published", inclusive: true },
    };
    const archivedBounds = {
      lower: { key: "archived", inclusive: true },
      upper: { key: "archived", inclusive: true },
    };
    const draftBounds = {
      lower: { key: "draft", inclusive: true },
      upper: { key: "draft", inclusive: true },
    };
    const submittedBounds = {
      lower: { key: "submitted", inclusive: true },
      upper: { key: "submitted", inclusive: true },
    };
    const pendingBounds = {
      lower: { key: "pending", inclusive: true },
      upper: { key: "pending", inclusive: true },
    };

    const [active, archived, draft, submitted, pending] =
      await eventsAggregate.countBatch(ctx, [
        { bounds: publishedBounds },
        { bounds: archivedBounds },
        { bounds: draftBounds },
        { bounds: submittedBounds },
        { bounds: pendingBounds },
      ]);

    const totalEvents = await eventsAggregate.count(ctx);

    return {
      totalEvents,
      activeEvents: active,
      archivedEvents: archived,
      draftEvents: draft,
      submittedEvents: submitted,
      pendingEvents: pending,
    };
  },
});
export const getEventByOrgId = query({
  args: {
    orgId: v.id("organizations"),
    formType: v.optional(v.number()), //todo: add this later to show/hide relevant events depending on the form type when submitting something new.
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!user) return null;

    const org = await ctx.db.get(args.orgId);
    if (!org) return null;

    const events = await ctx.db
      .query("events")
      .withIndex("by_mainOrgId_lastEditedAt", (q) => q.eq("mainOrgId", org._id))
      .order("desc")
      .collect();

    const openCalls = await ctx.db
      .query("openCalls")
      .withIndex("by_mainOrgId", (q) => q.eq("mainOrgId", org._id))
      .collect();

    const openCallMap = new Map(
      openCalls.map((oc) => [oc.eventId.toString(), oc]),
    );

    const enrichedEvents = events.map((event) => {
      const openCall = openCallMap.get(event._id.toString());

      return {
        ...event,
        openCallState: openCall?.state ?? null,
        openCallId: openCall?._id ?? null,
        openCallApproved: openCall?.approvedAt ? true : false,
      };
    });

    return enrichedEvents;
  },
});

//TODO: Make this more efficient
export const getSubmittedEvents = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!user) throw new ConvexError("User not found");

    const isAdmin = user.role.includes("admin");
    if (!isAdmin)
      throw new ConvexError("You don't have permission to view this");

    // Fetch events where state === "submitted" or "published"
    const [submittedEvents, publishedEvents, submittedOCs] = await Promise.all([
      ctx.db
        .query("events")
        .withIndex("by_state", (q) => q.eq("state", "submitted"))
        .collect(),
      ctx.db
        .query("events")
        .withIndex("by_state", (q) => q.eq("state", "published"))
        .collect(),
      ctx.db
        .query("openCalls")
        .withIndex("by_state", (q) => q.eq("state", "submitted"))
        .collect(),
    ]);

    const submittedOCEventIds = new Set(
      submittedOCs.map((oc) => oc.eventId.toString()),
    );

    // Combining
    // - all submitted events
    // - published events that have a submitted open call
    const eligibleEvents = [
      ...submittedEvents,
      ...publishedEvents.filter((event) =>
        submittedOCEventIds.has(event._id.toString()),
      ),
    ];

    // And... building a map of submitted open calls for enrichment
    const ocMap = new Map(
      submittedOCs.map((oc) => [oc.eventId.toString(), oc]),
    );

    const enrichedEvents = eligibleEvents.map((event) => {
      const openCall = ocMap.get(event._id.toString());
      return {
        ...event,
        openCallState: openCall?.state ?? null,
        openCallId: openCall?._id ?? null,
      };
    });

    return enrichedEvents;
  },
});

export const getSubmittedEventCount = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    if (!user) throw new ConvexError("User not found");
    const isAdmin = user?.role?.includes("admin");
    if (!isAdmin)
      throw new ConvexError("You don't have permission to view this");
    const events = await ctx.db
      .query("events")
      .withIndex("by_state", (q) => q.eq("state", "submitted"))
      .collect();

    return events.length;
  },
});

//TODO: Make this more efficient
export const getAllEvents = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!user) throw new ConvexError("User not found");

    const isAdmin = user.role.includes("admin");

    let events = await ctx.db
      .query("events")
      .withIndex("by_lastEditedAt")
      // .order("desc")
      .collect();

    if (!isAdmin) {
      const organizations = await ctx.db
        .query("organizations")
        .withIndex("by_ownerId", (q) => q.eq("ownerId", userId))
        .collect();
      if (!organizations.length)
        throw new ConvexError("Must be organizer to view event submissions");
      const orgIds = new Set(organizations.map((org) => org._id));
      events = events.filter((event) => orgIds.has(event.mainOrgId));
    }
    const openCalls = await ctx.db.query("openCalls").collect();

    const openCallMap = new Map(
      openCalls.map((oc) => [oc.eventId.toString(), oc]),
    );

    const enrichedEvents = await Promise.all(
      events.map(async (event) => {
        const openCall = openCallMap.get(event._id.toString());
        const eApprovedBy = event.approvedBy;
        const ocApprovedBy = openCall?.approvedBy;
        let eApprovedByUserName: string | null = null;
        let ocApprovedByUserName: string | null = null;

        if (eApprovedBy) {
          const eApprovedByUser = await ctx.db
            .query("users")
            .withIndex("by_userId", (q) => q.eq("userId", eApprovedBy))
            .first();

          eApprovedByUserName = eApprovedByUser?.firstName ?? "";

          if (eApprovedBy === ocApprovedBy) {
            ocApprovedByUserName = eApprovedByUserName;
          } else if (ocApprovedBy) {
            const ocApprovedByUser = await ctx.db
              .query("users")
              .withIndex("by_userId", (q) => q.eq("userId", ocApprovedBy))
              .first();
            ocApprovedByUserName = ocApprovedByUser?.firstName ?? "";
          }
        }

        return {
          ...event,
          openCallState: openCall?.state ?? null,
          openCallId: openCall?._id ?? null,
          eApprovedByUserName,
          ocApprovedByUserName,
        };
      }),
    );

    return enrichedEvents;
  },
});

export const getUserEvents = query({
  handler: async (ctx) => {
    let organizations = [];
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!user) return null;

    // const isAdmin = user.role.includes("admin");

    organizations = await ctx.db
      .query("organizations")
      .withIndex("by_ownerId", (q) => q.eq("ownerId", userId))
      .collect();
    if (organizations?.length === 0) return [];
    // console.log(organizations);

    const orgIds = organizations.map((org) => org._id);
    const orgNameMap = new Map(
      organizations.map((org) => [org._id.toString(), org.name]),
    );

    // console.log(orgIds);
    const events = (
      await Promise.all(
        orgIds.map((orgId) =>
          ctx.db
            .query("events")
            .withIndex("by_mainOrgId_lastEditedAt", (q) =>
              q.eq("mainOrgId", orgId),
            )
            .collect(),
        ),
      )
    ).flat();

    // console.log(events);

    // Query openCalls for all orgs
    const openCalls = (
      await Promise.all(
        orgIds.map((orgId) =>
          ctx.db
            .query("openCalls")
            .withIndex("by_mainOrgId", (q) => q.eq("mainOrgId", orgId))
            .collect(),
        ),
      )
    ).flat();

    // console.log(openCalls);

    const openCallMap = new Map(
      openCalls.map((oc) => [oc.eventId.toString(), oc]),
    );

    const enrichedEvents = events.map((event) => {
      const openCall = openCallMap.get(event._id.toString());

      return {
        ...event,
        isUserOrg: true,
        openCallState: openCall?.state ?? null,
        openCallApproved: openCall?.approvedAt ? true : false,
        openCallId: openCall?._id ?? null,
        organizationName: orgNameMap.get(event.mainOrgId.toString()) ?? "",
        mainOrgId: event.mainOrgId,
      };
    });

    return enrichedEvents;
  },
});

export const get5latestPublishedEvents = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = userId ? await ctx.db.get(userId) : null;
    const userSub = await ctx.db
      .query("userSubscriptions")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .first();
    const hasActiveSubscription =
      userSub?.status === "active" || userSub?.status === "trialing";
    const isAdmin = user?.role?.includes("admin");
    if (!hasActiveSubscription && !isAdmin) return null;

    const publishedEvents = await ctx.db
      .query("events")
      .withIndex("by_state_approvedAt", (q) =>
        q.eq("state", "published").gt("approvedAt", undefined),
      )
      // .withIndex("by_state_hasOpenCall_approvedAt", (q) =>
      //   q.eq("state", "published").eq("hasOpenCall", "Fixed"),
      // )
      .filter((q) =>
        q.or(
          q.eq(q.field("hasOpenCall"), "Fixed"),
          q.eq(q.field("hasOpenCall"), "Rolling"),
          q.eq(q.field("hasOpenCall"), "Email"),
        ),
      )
      .order("desc")
      .take(10);

    const eventsWithActiveOpenCalls = [];
    for (const event of publishedEvents) {
      const openCall = await ctx.db
        .query("openCalls")
        .withIndex("by_eventId", (q) => q.eq("eventId", event._id))
        .filter((q) => q.eq(q.field("state"), "published"))
        .first();
      if (openCall) {
        eventsWithActiveOpenCalls.push(event);
        if (eventsWithActiveOpenCalls.length === 5) break;
      }
    }

    return eventsWithActiveOpenCalls;
  },
});

export const updateEdition = mutation({
  args: {
    eventId: v.id("events"),
    edition: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const event = await ctx.db.get(args.eventId);
    if (!event) return null;
    const openCall = await ctx.db
      .query("openCalls")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .first();
    // Skip if edition hasn't changed
    if (event.dates.edition === args.edition) return null;

    // Check for duplicate (same name + same edition, different _id)
    const duplicate = await ctx.db
      .query("events")
      .withIndex("by_name_and_edition", (q) =>
        q.eq("name", event.name).eq("dates.edition", args.edition),
      )
      .collect();

    const conflict = duplicate.find((e) => e._id !== event._id);
    if (conflict) {
      throw new ConvexError(
        `An event named "${event.name}" already exists for ${args.edition}.`,
      );
    }

    // Update edition
    await ctx.db.patch(event._id, {
      lastEditedAt: Date.now(),
      dates: {
        ...event.dates,
        edition: args.edition,
      },
    });
    if (openCall) {
      await ctx.db.patch(openCall._id, {
        lastUpdatedAt: Date.now(),
        lastUpdatedBy: userId,
        basicInfo: {
          ...openCall.basicInfo,
          dates: {
            ...openCall.basicInfo.dates,
            edition: args.edition,
          },
        },
      });
    }
  },
});

export const updateEventName = mutation({
  args: {
    eventId: v.id("events"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const slug = slugify(args.name.trim(), { lower: true, strict: true });
    const event = await ctx.db.get(args.eventId);
    if (!event) return null;
    await ctx.db.patch(event._id, {
      name: args.name.trim(),
      slug,
      lastEditedAt: Date.now(),
    });
    const eventLookup = await ctx.db
      .query("eventLookup")
      .withIndex("by_eventId", (q) => q.eq("eventId", event._id))
      .first();
    if (!eventLookup) return null;
    await ctx.db.patch(eventLookup._id, {
      eventName: args.name.trim(),
      eventSlug: slug,
      lastEditedAt: Date.now(),
    });
  },
});

export const checkEventNameExists = query({
  args: {
    name: v.string(),
    organizationId: v.optional(v.id("organizations")),
    eventId: v.optional(v.id("events")),
    edition: v.number(),
  },
  handler: async (ctx, args) => {
    // console.log(args);
    const eventSlug = slugify(args.name.trim(), { lower: true, strict: true });
    const existingEvents = await ctx.db
      .query("events")
      .withIndex("by_slug", (q) => q.eq("slug", eventSlug))
      .collect();

    for (const event of existingEvents) {
      const sameEvent = args.eventId && args.eventId === event._id;
      // console.log(args.eventId, event._id);
      const sameOrg =
        args.organizationId && args.organizationId === event.mainOrgId;
      const sameEdition = args.edition && args.edition === event.dates.edition;
      const now = Date.now();
      const eventCreatedAt = event._creationTime;

      if (eventCreatedAt && now - eventCreatedAt < 1000) continue;

      // console.log(
      //   "sameEvent: ",
      //   sameEvent,
      //   "sameOrg: ",
      //   sameOrg,
      //   "sameEdition: ",
      //   sameEdition,
      // );

      if (sameEvent === true || (sameEdition === false && sameOrg === true))
        continue;

      if (sameEvent === false && sameEdition === true && sameOrg === true) {
        console.log({ sameEvent, sameEdition, sameOrg });
        console.log(args.eventId, event._id);
        throw new ConvexError(
          `An event with that name and edition already exists. Please choose a different name or edition`,
        );
      }
      if (sameOrg === false) {
        throw new ConvexError(
          `An event with that name already exists. Please choose a different name`,
        );
      }
    }

    return true;
  },
});

export const getEventsForCalendar = query({
  handler: async (ctx) => {
    let hasOpenCall = false;
    const events = await ctx.db

      .query("events")
      .withIndex("by_state_category", (q) =>
        q.eq("state", "published").eq("category", "event"),
      )
      .collect();

    const results = await Promise.all(
      events.map(async (event) => {
        const openCall = await ctx.db
          .query("openCalls")
          .withIndex("by_eventId", (q) => q.eq("eventId", event._id))
          .first();
        //todo: update this later to accommodate multiple open calls per event

        if (openCall?.state === "published") {
          hasOpenCall = true;
        }
        return {
          title: event.name,
          date: event.dates.eventDates[0].start,
          // start: event.dates.eventDates[0].start,
          // end: event.dates.eventDates[0].end,
          extendedProps: {
            eventId: event._id,
            logo: event.logo,
            description: event.blurb ?? event.about,
            slug: event.slug,
            hasOpenCall,
            ocEnd: openCall?.basicInfo?.dates?.ocEnd,
            edition: event.dates.edition,
            location: event.location,
          },
        };
      }),
    );
    return {
      events: results,
    };
  },
});

export const getEventBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const user = userId
      ? await ctx.db
          .query("users")
          .withIndex("by_userId", (q) => q.eq("userId", userId))
          .unique()
      : null;
    if (!user) return null;
    // console.log(args.slug);
    const event = await ctx.db
      .query("events")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    // console.log(event);

    if (!event) throw new ConvexError("No event found");

    const [organizer] = await Promise.all([ctx.db.get(event.mainOrgId)]);
    const userIsOrganizer = user?._id === organizer?.ownerId;

    return {
      event: {
        ...event,
        isUserOrg: userIsOrganizer,
        state: event.state as SubmissionFormState,
        category: event.category as EventCategory,
        type: event.type?.slice(0, 2) ?? [],
      },
      // openCall: openCall as OpenCall,
      organizer: organizer as Organizer,
    };
  },
});

export const getEventById = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) return null;
    return event;
  },
});

export const getEventBySlugAndEdition = query({
  args: {
    slug: v.string(),
    edition: v.number(),
  },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("events")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .collect();

    return events.find((e) => e.dates.edition === args.edition);
  },
});

export const getEventWithDetails = query({
  args: {
    slug: v.string(),
    edition: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const user = userId ? await ctx.db.get(userId) : null;
    const isAdmin = user?.role?.includes("admin");

    const events = await ctx.db
      .query("events")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .collect();

    const event = events.find((e) => e.dates.edition === args.edition);
    const eventState = event?.state as SubmissionFormState;
    const eventPublished = eventState === "published" || isAdmin;
    const eventArchived = eventState === "archived";

    if (!event) throw new ConvexError("No event found");

    const [openCalls, organizer] = await Promise.all([
      ctx.db
        .query("openCalls")
        .withIndex("by_eventId", (q) => q.eq("eventId", event._id))
        .collect(),
      ctx.db.get(event.mainOrgId),
    ]);

    const allowedEditor = user && organizer?.allowedEditors.includes(user._id);

    if (
      organizer?.ownerId !== userId &&
      !eventPublished &&
      !eventArchived &&
      !allowedEditor
    )
      throw new ConvexError("You don't have permission to view this event");

    const openCall = openCalls.find(
      (e) => e.basicInfo.dates.edition === args.edition,
    );

    const userIsOrganizer = user?._id === organizer?.ownerId;

    return {
      event: {
        ...event,
        isUserOrg: userIsOrganizer,
        state: event.state as SubmissionFormState,
        category: event.category as EventCategory,
        type: event.type?.slice(0, 2) ?? [],
      },
      openCall: openCall as OpenCall,
      organizer: organizer as Organizer,
    };
  },
});

export const preloadEventAndOrgById = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = userId ? await ctx.db.get(userId) : null;
    const isAdmin = user?.role?.includes("admin");
    const event = await ctx.db.get(args.eventId);
    if (!event) return null;

    const organization = await ctx.db.get(event.mainOrgId);

    const orgOwner = organization?.ownerId;
    if (orgOwner && orgOwner !== userId && !isAdmin) {
      return null;
    }

    return {
      event,
      organization,
    };
  },
});

export const getEventWithOCDetails = query({
  args: {
    slug: v.string(),
    edition: v.number(),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    console.log(args);
    const { slug, edition } = args;
    const source = args.source ?? "eventpage";
    const userId = await getAuthUserId(ctx);

    const user = userId ? await ctx.db.get(userId) : null;
    const isAdmin = user?.role?.includes("admin");
    const subscription = user
      ? await ctx.db
          .query("userSubscriptions")
          .withIndex("userId", (q) => q.eq("userId", user._id))
          .first()
      : null;
    const activeSub =
      subscription?.status === "active" ||
      subscription?.status === "trialing" ||
      isAdmin;
    let application = null;

    const event = await ctx.db
      .query("events")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .filter((q) => q.eq(q.field("dates.edition"), args.edition))
      .first();

    if (!event)
      throw new ConvexError(
        "Event not found: " + `${slug}/${edition}` + `- Source:${source}`,
      );

    const organizer = await ctx.db.get(event.mainOrgId);

    const userIsOrganizer =
      user?._id === organizer?.ownerId ||
      Boolean(user && organizer?.allowedEditors.includes(user._id));

    const openCall = await ctx.db
      .query("openCalls")
      .withIndex("by_eventId", (q) => q.eq("eventId", event._id))
      .filter((q) => q.eq(q.field("basicInfo.dates.edition"), edition))
      // .filter((q) => q.eq(q.field("state"), "published"))
      .filter((q) =>
        isAdmin || userIsOrganizer
          ? q.or(
              q.eq(q.field("state"), "draft"),
              q.eq(q.field("state"), "editing"),
              q.eq(q.field("state"), "published"),
              q.eq(q.field("state"), "archived"),
              q.eq(q.field("state"), "submitted"),
              q.eq(q.field("state"), "pending"),
            )
          : q.or(
              q.eq(q.field("state"), "published"),
              q.eq(q.field("state"), "archived"),
            ),
      )

      .first();

    if (userId && openCall && activeSub) {
      application = await ctx.db
        .query("applications")
        .withIndex("by_openCallId", (q) => q.eq("openCallId", openCall._id))
        .filter((q) => q.eq(q.field("artistId"), userId))
        .first();
    }

    // const userIsOrganizer =
    //   user?.accountType?.includes("organizer") && userId === organizer?.ownerId;

    //todo: may need to add safety in case there are multiple open calls for the same event and edition. How to handle this going forward?
    // if (!userIsOrganizer && !hasActiveSubscription)
    // throw new ConvexError("You don't have permission to view this event");
    // console.log("user doesn't have permission to view this event");
    // console.log(source, openCall);
    if (source === "ocpage" && !openCall)
      throw new ConvexError("Open Call not found");
    if (!openCall) return null;

    return {
      event: {
        ...event,
        isUserOrg: userIsOrganizer,
        state: event.state as SubmissionFormState,
        category: event.category as EventCategory,
        type: event.type?.slice(0, 2) ?? [],
      },
      openCall: openCall as OpenCall,
      organizer: organizer as Organizer,
      application: (application as OpenCallApplication) ?? null,
    };
  },
});

export const createOrUpdateEvent = mutation({
  args: {
    eventId: v.union(v.id("events"), v.string()),
    ...eventSchema,
    dates: v.object({
      edition: v.number(),
      eventDates: v.optional(
        v.array(
          v.object({
            start: v.string(),
            end: v.string(),
          }),
        ),
      ),
      prodDates: v.optional(
        v.array(
          v.object({
            start: v.string(),
            end: v.string(),
          }),
        ),
      ),
      eventFormat: v.optional(v.union(eventFormatValidator, v.literal(""))),
      prodFormat: v.optional(v.union(prodFormatValidator, v.literal(""))),
      noProdStart: v.boolean(),
    }),
    links: v.optional(
      v.object({
        sameAsOrganizer: v.optional(v.boolean()),
        ...linksFields,
      }),
    ),
    state: v.optional(eventStateValidator),
    finalStep: v.optional(v.boolean()),
    publish: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // console.log(args.logoStorageId, args.logo);
    const linksSameAsOrg = args.links?.sameAsOrganizer;
    // console.log("linksSameAsOrg", linksSameAsOrg);
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");
    let fileUrl = "/1.jpg" as string | null;
    if (args.logoStorageId) {
      fileUrl = await ctx.storage.getUrl(args.logoStorageId);
    }
    if (args.logo && !args.logoStorageId) {
      fileUrl = args.logo;
    }
    if (args.name === "") {
      throw new ConvexError("Event name is required");
    }

    const user = await ctx.db.get(userId);

    if (!user) {
      throw new ConvexError("User not found");
    }
    const isAdmin = user?.role.includes("admin");
    const organization = await ctx.db.get(args.mainOrgId);
    const linksLength = Object.keys(args.links ?? {}).length;
    const { sameAsOrganizer, linkedIn, ...stringLinks } = args.links ?? {};
    const sanitizedStringLinks = sanitizeStringMap(stringLinks);
    const sanitizedLinks = !args.links
      ? { sameAsOrganizer: false }
      : linksSameAsOrg || (args.finalStep && linksLength === 1)
        ? { ...organization?.links, sameAsOrganizer: true }
        : { ...sanitizedStringLinks, sameAsOrganizer: false };

    function isValidEventId(id: string): id is Id<"events"> {
      return typeof id === "string" && id.trim() !== "";
    }

    const event = isValidEventId(args.eventId)
      ? await ctx.db.get(args.eventId)
      : null;

    const eventApproved = event?.approvedAt ? true : false;

    const eventState = args.finalStep
      ? isAdmin
        ? args.publish
          ? "published"
          : "submitted"
        : "submitted"
      : eventApproved
        ? "editing"
        : "draft";
    const eventCategory = args.category || "";
    const isEvent = eventCategory === "event";
    const eventType = isEvent ? args.type || [] : [];

    const eventFormatOutput =
      (args.dates.eventFormat as EventFormat) ??
      (args.finalStep ? "noEvent" : undefined);
    const prodFormatOutput =
      (args.dates.prodFormat as ProdFormat) ??
      (args.finalStep ? "sameAsEvent" : undefined);

    if (event) {
      const isOwner = event.mainOrgId === args.mainOrgId || isAdmin;
      if (!isOwner)
        throw new ConvexError("You don't have permission to update this event");

      const existingFormType =
        typeof event.formType === "number" && event.formType > 0
          ? event.formType
          : 0;

      const updatedFormType =
        args.formType && args.formType >= existingFormType
          ? args.formType
          : existingFormType;

      const oldEvent = event;
      await ctx.db.patch(event._id, {
        formType: updatedFormType,
        name: args.name.trim(),
        slug: args.slug,
        logo: fileUrl || args.logo,
        logoStorageId: args.logoStorageId,
        type: eventType,
        category: eventCategory,
        hasOpenCall: args.hasOpenCall,
        dates: {
          ...args.dates,
          edition: args.dates.edition || new Date().getFullYear(),
          eventDates: args.dates.eventDates || [{ start: "", end: "" }],
          eventFormat: eventFormatOutput,
          prodFormat: prodFormatOutput,

          noProdStart: args.dates.noProdStart || false,
        },
        location: {
          ...args.location,
        },
        blurb: args.blurb,
        about: args.about,
        links: sanitizedLinks,
        otherInfo: args.otherInfo,
        timeLine: args.timeLine,
        active: args.active || true,
        lastEditedAt: Date.now(),
        lastEditedBy: userId,
        state: eventState,
        adminNote: args.adminNote,
        ...(args.publish ? { approvedBy: userId, approvedAt: Date.now() } : {}),
      });

      const updatedEvent = await ctx.db.get(event._id);
      if (updatedEvent)
        await eventsAggregate.replaceOrInsert(ctx, oldEvent, updatedEvent);
      if (updatedEvent?.approvedAt) {
        await ctx.runMutation(
          internal.events.eventLookup.addUpdateEventLookup,
          {
            eventId: updatedEvent._id,
          },
        );
      }
      return { event: updatedEvent };
    }

    const eventId = await ctx.db.insert("events", {
      formType: args.formType,
      name: args.name.trim(),
      slug: args.slug,
      logo: fileUrl as string,
      logoStorageId: args.logoStorageId,
      type: eventType,
      category: eventCategory,
      hasOpenCall: args.hasOpenCall,
      dates: {
        ...args.dates,
        edition: args.dates.edition || new Date().getFullYear(),
        eventDates: args.dates.eventDates || [{ start: "", end: "" }],
        eventFormat: (args.dates.eventFormat as EventFormat) || undefined,
        prodFormat: (args.dates.prodFormat as ProdFormat) || undefined,
        prodDates: args.dates.prodDates || undefined,
        noProdStart: args.dates.noProdStart || false,
      },
      location: {
        ...args.location,
      },
      blurb: args.blurb,
      about: args.about,
      timeLine: args.timeLine,
      links: sanitizedLinks,
      otherInfo: args.otherInfo,
      active: args.active || true,
      mainOrgId: args.mainOrgId,
      organizerId: args.organizerId,
      adminNote: args.adminNote,
      // mainOrgName: "",

      state: eventState,
      lastEditedAt: Date.now(),
    });
    const newEvent = await ctx.db.get(eventId);
    if (newEvent) await eventsAggregate.insertIfDoesNotExist(ctx, newEvent);
    return { event: newEvent };
  },
});

export const updateEventStatus = mutation({
  args: {
    eventId: v.id("events"),
    status: eventSchema.state,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");
    const isAdmin = user.role.includes("admin");
    if (!isAdmin)
      throw new Error("You don't have permission to approve events");
    const event = await ctx.db.get(args.eventId);
    if (!event) return null;

    const oldDoc = event;
    await ctx.db.patch(event._id, {
      state: args.status,
      lastEditedAt: Date.now(),
      lastEditedBy: userId,
      approvedBy: userId,
      approvedAt: Date.now(),
    });
    const newDoc = await ctx.db.get(event._id);
    if (newDoc) await eventsAggregate.replaceOrInsert(ctx, oldDoc, newDoc);
    await ctx.runMutation(internal.events.eventLookup.addUpdateEventLookup, {
      eventId: args.eventId,
    });

    return { event };
  },
});
export const approveEvent = mutation({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!user) throw new Error("User not found");
    const isAdmin = user.role.includes("admin");
    if (!isAdmin)
      throw new Error("You don't have permission to approve events");
    const event = await ctx.db.get(args.eventId);
    if (!event) return null;

    const eventState = event.state === "submitted" ? "published" : "published";
    const oldDoc = event;
    await ctx.db.patch(event._id, {
      state: eventState,
      lastEditedAt: Date.now(),
      lastEditedBy: userId,
      approvedBy: userId,
      approvedAt: Date.now(),
    });
    const newDoc = await ctx.db.get(event._id);
    if (newDoc) await eventsAggregate.replace(ctx, oldDoc, newDoc);
    // await ctx.runMutation(internal.events.eventLookup.addUpdateEventLookup, {
    //   eventId: event._id,
    // });
    await ctx.runMutation(internal.events.eventLookup.addUpdateEventLookup, {
      eventId: args.eventId,
    });

    return { event };
  },
});

export const reactivateEvent = mutation({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!user) throw new Error("User not found");
    const isAdmin = user.role.includes("admin");

    const event = await ctx.db.get(args.eventId);
    if (!event) return null;

    const eventState =
      event.state === "archived" && isAdmin ? "published" : "submitted";
    const oldDoc = event;

    await ctx.db.patch(event._id, {
      state: eventState,
      lastEditedAt: Date.now(),
      lastEditedBy: userId,
      approvedBy: undefined,
    });

    const oc = await ctx.db
      .query("openCalls")
      .withIndex("by_eventId", (q) => q.eq("eventId", event._id))
      .first();
    if (oc) {
      await ctx.db.patch(oc._id, {
        state: eventState,
        lastUpdatedAt: Date.now(),
        lastUpdatedBy: userId,
      });
      const newOC = await ctx.db.get(oc._id);
      if (newOC) await openCallsAggregate.replaceOrInsert(ctx, oc, newOC);
    }
    const newDoc = await ctx.db.get(event._id);
    if (newDoc) await eventsAggregate.replaceOrInsert(ctx, oldDoc, newDoc);

    await ctx.runMutation(internal.events.eventLookup.addUpdateEventLookup, {
      eventId: args.eventId,
    });

    return { event };
  },
});

export const archiveEvent = mutation({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const event = await ctx.db.get(args.eventId);
    if (!event) return null;
    const openCalls = await ctx.db
      .query("openCalls")
      .withIndex("by_eventId", (q) => q.eq("eventId", event._id))
      .collect();

    for (const openCall of openCalls) {
      const oldOpenCall = openCall;
      await ctx.db.patch(openCall._id, {
        state: "archived",
        lastUpdatedAt: Date.now(),
      });
      const newOpenCall = await ctx.db.get(openCall._id);
      if (newOpenCall)
        await openCallsAggregate.replaceOrInsert(ctx, oldOpenCall, newOpenCall);
    }

    const oldDoc = event;
    await ctx.db.patch(event._id, {
      state: "archived",
      lastEditedAt: Date.now(),
      lastEditedBy: userId,
    });
    const newDoc = await ctx.db.get(event._id);
    if (newDoc) await eventsAggregate.replaceOrInsert(ctx, oldDoc, newDoc);
    await ctx.runMutation(internal.events.eventLookup.addUpdateEventLookup, {
      eventId: args.eventId,
    });

    return { event };
  },
});
export const duplicateEvent = mutation({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!user) throw new Error("User not found");
    const event = await ctx.db.get(args.eventId);
    if (!event) return null;
    const latestEvent = await ctx.db
      .query("events")
      .withIndex("by_slug_edition", (q) => q.eq("slug", event.slug))
      .order("desc")
      .first();
    const latestEdition = latestEvent?.dates.edition ?? null;
    let eventName = event.name;
    let eventSlug = event.slug;

    const edition =
      latestEdition && latestEdition >= new Date().getFullYear()
        ? latestEdition + 1
        : new Date().getFullYear();
    const { name, slug } = await generateUniqueNameAndSlug(
      ctx,
      event.name,
      edition,
    );
    eventName = name;
    eventSlug = slug;

    const newEventId = await ctx.db.insert("events", {
      formType: event.formType,
      name: eventName,
      slug: eventSlug,
      logo: event.logo,
      logoStorageId: event.logoStorageId,
      type: event.type,
      category: event.category,
      hasOpenCall: "False",
      dates: {
        ...event.dates,
        eventDates: [{ start: "", end: "" }],
        prodDates: [],
        edition,
      },
      location: {
        ...event.location,
      },
      blurb: event.blurb,
      about: event.about,
      links: event.links,
      otherInfo: event.otherInfo,
      timeLine: event.timeLine,
      active: event.active,
      mainOrgId: event.mainOrgId,
      organizerId: event.organizerId,
      // mainOrgName: "",

      state: "draft",
      lastEditedAt: Date.now(),
    });
    const newEvent = await ctx.db.get(newEventId);
    if (newEvent) await eventsAggregate.insertIfDoesNotExist(ctx, newEvent);

    return { event: newEventId };
  },
});

export const deleteEvent = mutation({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);

    if (!user) throw new ConvexError("User not found");
    const isAdmin = user.role.includes("admin");

    const event = await ctx.db.get(args.eventId);
    if (!event) return null;
    if (event.state !== "draft" && !isAdmin) {
      throw new ConvexError("Active events cannot be deleted, only archived");
    }
    console.log("attempting to delete event");
    const organization = await ctx.db.get(event.mainOrgId);
    if (!organization) throw new ConvexError("Organization not found");
    const orgLogoStorageId = organization.logoStorageId;
    const openCalls = await ctx.db
      .query("openCalls")
      .withIndex("by_eventId", (q) => q.eq("eventId", event._id))
      .collect();
    for (const openCall of openCalls) {
      //TODO: Delete open call docs and any associated rows/files

      await ctx.db.delete(openCall._id);
      await openCallsAggregate.deleteIfExists(ctx, openCall);
    }

    if (event.logoStorageId && event.logoStorageId !== orgLogoStorageId) {
      console.log("deleting logo storage id", event.logoStorageId);
      await ctx.storage.delete(event.logoStorageId);
    }
    const oldEvent = event;
    await ctx.db.delete(event._id);
    if (oldEvent) await eventsAggregate.deleteIfExists(ctx, oldEvent);

    console.log("deleting event lookup");
    await ctx.runMutation(internal.events.eventLookup.deleteEventLookup, {
      eventId: event._id,
    });

    return { event };
  },
});

export const deleteMultipleEvents = mutation({
  args: {
    items: v.array(
      v.object({
        eventId: v.id("events"),
        state: v.string(),
      }),
    ),
    isAdmin: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (!user) throw new ConvexError("User not found");

    const deletedEventIds: string[] = [];

    for (const { eventId, state } of args.items) {
      const event = await ctx.db.get(eventId);
      if (!event) continue;

      if (event.state !== "draft" && !args.isAdmin) {
        continue;
      }

      const organization = await ctx.db.get(event.mainOrgId);
      if (!organization) continue;

      const orgLogoStorageId = organization.logoStorageId;

      const openCalls = await ctx.db
        .query("openCalls")
        .withIndex("by_eventId", (q) => q.eq("eventId", event._id))
        .collect();

      for (const openCall of openCalls) {
        //TODO: Delete open call docs and any associated rows/files
        await ctx.db.delete(openCall._id);
      }

      if (event.logoStorageId && event.logoStorageId !== orgLogoStorageId) {
        await ctx.storage.delete(event.logoStorageId);
      }

      await ctx.db.delete(event._id);
      await eventsAggregate.delete(ctx, event);
      deletedEventIds.push(event._id);
      await ctx.runMutation(internal.events.eventLookup.deleteEventLookup, {
        eventId: event._id,
      });
    }

    return {
      deletedEventIds,
      skippedEventIds: args.items
        .map((item) => item.eventId)
        .filter((id) => !deletedEventIds.includes(id)),
    };
  },
});

export const updateEventPostStatus = mutation({
  args: {
    eventId: v.id("events"),
    posted: v.optional(
      v.union(v.literal("posted"), v.literal("toPost"), v.null()),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const event = await ctx.db.get(args.eventId);
    if (!event) return null;

    const posted = args.posted ?? undefined;

    await ctx.db.patch(event._id, {
      posted,
      ...(args.posted === "posted"
        ? { postedAt: Date.now() }
        : { postedAt: undefined }),
      ...(args.posted === "posted"
        ? { postedBy: userId }
        : { postedBy: undefined }),
    });

    await ctx.runMutation(internal.events.eventLookup.updateLookupPostStatus, {
      eventId: args.eventId,
      posted: args.posted ?? undefined,
    });
  },
});
