import { COUNTRIES_REQUIRING_STATE, sortByLocation } from "@/lib/locations";
import { sortByOcStatus } from "@/lib/openCallFns";
import {
  EventCategory,
  EventFormat,
  ProdFormat,
  SubmissionFormState,
} from "@/types/event";
import { OpenCall, OpenCallApplication } from "@/types/openCall";
import { Organizer } from "@/types/organizer";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import slugify from "slugify";
import { Id } from "~/convex/_generated/dataModel";
import { mutation, MutationCtx, query } from "~/convex/_generated/server";
import { categoryValidator, typeValidator } from "~/convex/schema";

export const globalSearch = query({
  args: {
    searchTerm: v.string(),
    searchType: v.union(
      v.literal("events"),
      v.literal("orgs"),
      v.literal("loc"),
      v.literal("all"),
    ),
  },
  handler: async (ctx, { searchTerm, searchType }) => {
    const term = searchTerm.trim();
    if (!term) return { results: [], label: null };
    const searchTerms = term.toLowerCase().split(/\s+/);

    const today = new Date().toISOString();
    const now = Date.parse(today);

    const allOpenCalls = await ctx.db.query("openCalls").collect();

    //note-to-self: Flagging logic: 0 = none ever, 1 = expired, 2 = active, 3 = future (optional) for now
    const attachOpenCallStatusFlag = <T extends { _id: Id<"events"> }>(
      events: T[],
    ) => {
      const callMap = new Map<
        Id<"events">,
        { ocStart?: string; ocEnd?: string; callType?: string }[]
      >();

      for (const oc of allOpenCalls) {
        const { eventId, basicInfo } = oc;
        const dates = basicInfo?.dates;
        const rollingCall = basicInfo?.callType === "Rolling";
        if (!dates && !rollingCall) continue;
        if (!callMap.has(eventId)) callMap.set(eventId, []);
        callMap.get(eventId)!.push({
          ocStart: dates.ocStart ?? undefined,
          ocEnd: dates.ocEnd ?? undefined,
          callType: basicInfo?.callType,
        });
      }

      return events.map((e) => {
        const calls = callMap.get(e._id);
        if (!calls || calls.length === 0) return { ...e, ocStatus: 0 };

        let status = 1;
        for (const { ocStart, ocEnd, callType } of calls) {
          const start = ocStart ? Date.parse(ocStart) : NaN;
          const end = ocEnd ? Date.parse(ocEnd) : NaN;
          const rollingCall = callType === "Rolling";

          if (!isNaN(start) && start > now) {
            status = Math.max(status, 3); // future
          } else if (
            (!isNaN(start) && !isNaN(end) && start <= now && end >= now) ||
            rollingCall
          ) {
            status = 2; // active overrides
            break;
          }
        }

        return { ...e, ocStatus: status };
      });
    };

    if (searchType === "events") {
      const events = await ctx.db
        .query("events")
        .withSearchIndex("search_by_name", (q) =>
          q.search("name", term).eq("state", "published"),
        )
        .take(20);

      const filteredEvents = events.filter((event) =>
        searchTerms.every((t) => event.name.toLowerCase().includes(t)),
      );

      return {
        results: sortByOcStatus(attachOpenCallStatusFlag(filteredEvents)),
        label: "Events",
      };
    }

    if (searchType === "orgs") {
      const results = await ctx.db
        .query("organizations")
        .withSearchIndex("search_by_name", (q) =>
          q.search("name", term).eq("isComplete", true),
        )
        .take(20);

      const filteredOrgs = results.filter((org) =>
        searchTerms.every((t) => org.name.toLowerCase().includes(t)),
      );

      return { results: filteredOrgs, label: "Organizers" };
    }

    if (searchType === "loc") {
      const [eventLocResults, orgLocResults] = await Promise.all([
        ctx.db
          .query("events")
          .withSearchIndex("search_by_location", (q) =>
            q.search("location.full", term).eq("state", "published"),
          )
          .take(20),
        ctx.db
          .query("organizations")
          .withSearchIndex("search_by_location", (q) =>
            q.search("location.full", term).eq("isComplete", true),
          )
          .take(20),
      ]);

      const sortedOrgLocResults = sortByLocation(
        orgLocResults,
        COUNTRIES_REQUIRING_STATE,
        (item) => item.location,
      );
      const sortedEventLocResults = sortByLocation(
        eventLocResults,
        COUNTRIES_REQUIRING_STATE,
        (item) => item.location,
      );

      return {
        results: {
          events: attachOpenCallStatusFlag(sortedEventLocResults),
          organizers: sortedOrgLocResults,
        },
        label: "Location",
      };
    }

    if (searchType === "all") {
      const [eventName, orgName, eventLoc, orgLoc] = await Promise.all([
        ctx.db
          .query("events")
          .withSearchIndex("search_by_name", (q) =>
            q.search("name", term).eq("state", "published"),
          )
          .take(20),
        ctx.db
          .query("organizations")
          .withSearchIndex("search_by_name", (q) =>
            q.search("name", term).eq("isComplete", true),
          )
          .take(20),
        ctx.db
          .query("events")
          .withSearchIndex("search_by_location", (q) =>
            q.search("location.full", term).eq("state", "published"),
          )
          .take(20),
        ctx.db
          .query("organizations")
          .withSearchIndex("search_by_location", (q) =>
            q.search("location.full", term).eq("isComplete", true),
          )
          .take(20),
      ]);

      const filteredEventName = eventName.filter((event) =>
        searchTerms.every((t) => event.name.toLowerCase().includes(t)),
      );
      const filteredOrgName = orgName.filter((org) =>
        searchTerms.every((t) => org.name.toLowerCase().includes(t)),
      );

      // const sortedOrgLoc = orgLoc.sort((a, b) => {
      //   const isStateRequiredA = COUNTRIES_REQUIRING_STATE.includes(
      //     a.location?.countryAbbr ?? "",
      //   );
      //   const isStateRequiredB = COUNTRIES_REQUIRING_STATE.includes(
      //     b.location?.countryAbbr ?? "",
      //   );

      //   let aPrimary = "";
      //   let bPrimary = "";
      //   let aSecondary = "";
      //   let bSecondary = "";

      //   if (isStateRequiredA) {
      //     aPrimary = a.location?.stateAbbr ?? "";
      //     aSecondary = a.location?.city ?? "";
      //   } else {
      //     aPrimary = a.location?.city ?? "";
      //     aSecondary = "";
      //   }

      //   if (isStateRequiredB) {
      //     bPrimary = b.location?.stateAbbr ?? "";
      //     bSecondary = b.location?.city ?? "";
      //   } else {
      //     bPrimary = b.location?.city ?? "";
      //     bSecondary = "";
      //   }

      //   const primaryCompare = aPrimary.localeCompare(bPrimary);
      //   if (primaryCompare !== 0) return primaryCompare;

      //   return aSecondary.localeCompare(bSecondary);
      // });

      const sortedOrgLoc = sortByLocation(
        orgLoc,
        COUNTRIES_REQUIRING_STATE,
        (item) => item.location,
      );
      const sortedEventLoc = sortByLocation(
        eventLoc,
        COUNTRIES_REQUIRING_STATE,
        (item) => item.location,
      );

      return {
        results: {
          eventName: sortByOcStatus(
            attachOpenCallStatusFlag(filteredEventName),
          ),
          orgName: filteredOrgName,
          eventLoc: attachOpenCallStatusFlag(sortedEventLoc),
          orgLoc: sortedOrgLoc,
        },
        label: "All",
      };
    }

    return { results: [], label: null };
  },
});

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

  if (!existingExact) {
    return { name: baseName, slug: slugify(baseName, { lower: true }) };
  }

  while (true) {
    const tryName = match ? `${base} ${suffix}` : `${base}-${suffix}`;
    const exists = await ctx.db
      .query("events")
      .withIndex("by_name_and_edition", (q) =>
        q.eq("name", tryName).eq("dates.edition", baseEdition),
      )
      .unique();

    if (!exists) {
      return { name: tryName, slug: slugify(tryName, { lower: true }) };
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

    return { event, lastEditedAt };
  },
});

export const getTotalNumberOfEvents = query({
  handler: async (ctx) => {
    const events = await ctx.db.query("events").collect();

    let active = 0,
      archived = 0,
      draft = 0,
      pending = 0;

    for (const event of events) {
      switch (event.state) {
        case "published":
          active++;
          break;
        case "archived":
          archived++;
          break;
        case "draft":
          draft++;
          break;
        case "submitted":
          pending++;
          break;
      }
    }

    return {
      totalEvents: events.length,
      activeEvents: active,
      archivedEvents: archived,
      draftEvents: draft,
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

    const isAdmin = user.role.includes("admin");
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
      };
    });

    return enrichedEvents;
  },
});

// export const getAllEvents = query({
//   handler: async (ctx) => {
//     const allEvents = await ctx.db.query("events").collect();
//     return allEvents;
//   },
// });

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
      .order("desc")
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

    const enrichedEvents = events.map((event) => {
      const openCall = openCallMap.get(event._id.toString());
      return {
        ...event,
        openCallState: openCall?.state ?? null,
        openCallId: openCall?._id ?? null,
      };
    });

    return enrichedEvents;
  },
});

export const getUserEvents = query({
  handler: async (ctx) => {
    let organizations = [];
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!user) throw new ConvexError("User not found");

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
        openCallState: openCall?.state ?? null,
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
      .withIndex("by_state_approvedAt", (q) => q.eq("state", "published"))
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
    const event = await ctx.db.get(args.eventId);
    if (!event) return null;
    console.log(event?.dates?.edition, args.edition);

    // Skip if edition hasn't changed
    if (event.dates.edition === args.edition) return null;

    // Check for duplicate (same name + same edition, different _id)
    const duplicate = await ctx.db
      .query("events")
      .withIndex("by_name_and_edition", (q) =>
        q.eq("name", event.name).eq("dates.edition", args.edition),
      )
      .collect();

    console.log("duplicate", duplicate);

    const conflict = duplicate.find((e) => e._id !== event._id);
    if (conflict) {
      throw new ConvexError(
        `An event named "${event.name}" already exists for ${args.edition}.`,
      );
    }

    console.log("conflict", conflict);

    // Update edition
    await ctx.db.patch(event._id, {
      lastEditedAt: Date.now(),
      dates: {
        ...event.dates,
        edition: args.edition,
      },
    });
  },
});

export const updateEventName = mutation({
  args: {
    eventId: v.id("events"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const slug = slugify(args.name.trim(), { lower: true });
    const event = await ctx.db.get(args.eventId);
    if (!event) return null;
    await ctx.db.patch(event._id, {
      name: args.name.trim(),
      slug,
      lastEditedAt: Date.now(),
    });
  },
});

export const checkEventNameExists = query({
  args: {
    name: v.string(),
    organizationId: v.optional(v.id("organizations")),
    eventId: v.optional(v.id("events")),
    edition: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    console.log(args);
    const eventSlug = slugify(args.name.trim(), { lower: true });
    const existingEvents = await ctx.db
      .query("events")
      .withIndex("by_slug", (q) => q.eq("slug", eventSlug))
      .collect();

    for (const event of existingEvents) {
      const sameEvent = args.eventId && args.eventId === event._id;
      console.log(args.eventId, event._id);
      const sameOrg =
        args.organizationId && args.organizationId === event.mainOrgId;
      const sameEdition = args.edition && args.edition === event.dates.edition;
      const now = Date.now();
      const eventCreatedAt = event._creationTime;

      if (eventCreatedAt && now - eventCreatedAt < 1000) continue;

      console.log(
        "sameEvent: ",
        sameEvent,
        "sameOrg: ",
        sameOrg,
        "sameEdition: ",
        sameEdition,
      );

      if (sameEvent === true || (sameEdition === false && sameOrg === true))
        continue;

      if (!sameEvent && sameEdition === true && sameOrg === true) {
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

export const getPublishedEvents = query({
  handler: async (ctx) => {
    const events = await ctx.db
      .query("events")
      .withIndex("by_state", (q) => q.eq("state", "published"))
      .collect();

    return events;
  },
});

export const getEventsForCalendar = query({
  handler: async (ctx) => {
    let hasOpenCall = false;
    const events = await ctx.db

      .query("events")
      .withIndex("by_state", (q) => q.eq("state", "published"))
      .collect();

    const results = await Promise.all(
      events.map(async (event) => {
        const openCallStatus = await ctx.db
          .query("openCalls")
          .withIndex("by_eventId", (q) => q.eq("eventId", event._id))
          .unique();

        if (openCallStatus?.state === "published") {
          hasOpenCall = true;
        }
        return {
          title: event.name,
          date: event.dates.eventDates[0].start,
          // start: event.dates.eventDates[0].start,
          // end: event.dates.eventDates[0].end,
          extendedProps: {
            logo: event.logo,
            description: event.about,
            slug: event.slug,
            hasOpenCall,
            edition: event.dates.edition,
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
    console.log(args.slug);
    const event = await ctx.db
      .query("events")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    // console.log(event);

    if (!event) throw new ConvexError("No event found");

    const [organizer] = await Promise.all([
      // const [openCalls, organizer] = await Promise.all([
      // ctx.db
      //   .query("openCalls")
      //   .withIndex("by_eventId", (q) => q.eq("eventId", event._id))
      //   .collect(),
      ctx.db.get(event.mainOrgId),
    ]);
    // console.log(organizer);

    // const openCall = openCalls.find(
    //   (e) => e.basicInfo.dates.edition === args.edition,
    // );

    return {
      event: {
        ...event,
        state: event.state as SubmissionFormState,
        category: event.category as EventCategory,
        type: event.type?.slice(0, 2) ?? [],
      },
      // openCall: openCall as OpenCall,
      organizer: organizer as Organizer,
    };
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

    const events = await ctx.db
      .query("events")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .collect();

    const event = events.find((e) => e.dates.edition === args.edition);
    const eventState = event?.state as SubmissionFormState;
    const eventPublished = eventState === "published";

    if (!event || !userId || !eventPublished)
      throw new ConvexError("No event found");

    const [openCalls, organizer] = await Promise.all([
      ctx.db
        .query("openCalls")
        .withIndex("by_eventId", (q) => q.eq("eventId", event._id))
        .collect(),
      ctx.db.get(event.mainOrgId),
    ]);

    if (organizer?.ownerId !== userId && !eventPublished)
      throw new ConvexError("You don't have permission to view this event");

    const openCall = openCalls.find(
      (e) => e.basicInfo.dates.edition === args.edition,
    );

    return {
      event: {
        ...event,
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
    const source = args.source ?? "eventpage";
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");
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
    let application = null;

    const event = await ctx.db
      .query("events")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .filter((q) => q.eq(q.field("dates.edition"), args.edition))
      .first();

    if (!event) return null;

    const openCall = await ctx.db
      .query("openCalls")
      .withIndex("by_eventId", (q) => q.eq("eventId", event._id))
      .filter((q) => q.eq(q.field("basicInfo.dates.edition"), args.edition))
      // .filter((q) => q.eq(q.field("state"), "published"))
      .filter((q) =>
        q.or(
          q.eq(q.field("state"), "published"),
          q.eq(q.field("state"), "archived"),
        ),
      )

      .first();

    const organizer = await ctx.db.get(event.mainOrgId);

    if (userId && openCall) {
      application = await ctx.db
        .query("applications")
        .withIndex("by_openCallId", (q) => q.eq("openCallId", openCall._id))
        .filter((q) => q.eq(q.field("artistId"), userId))
        .first();
    }

    const userIsOrganizer =
      user?.accountType?.includes("organizer") && userId === organizer?.ownerId;

    //todo: may need to add safety in case there are multiple open calls for the same event and edition. How to handle this going forward?
    if (source === "ocpage" && !openCall && !userIsOrganizer)
      throw new ConvexError("Open Call not found");
    if (!openCall) return null;

    return {
      event: {
        ...event,
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
    formType: v.optional(v.number()),
    orgId: v.id("organizations"),
    _id: v.union(v.id("events"), v.string()),
    logoStorageId: v.optional(v.id("_storage")),
    name: v.string(),
    slug: v.string(),
    logo: v.string(),
    type: typeValidator,
    category: categoryValidator,
    hasOpenCall: v.union(
      v.literal("Fixed"),
      v.literal("Rolling"),
      v.literal("Email"),
      v.literal("Invite"),
      v.literal("Unknown"),
      v.literal("False"),
    ),

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

      eventFormat: v.optional(v.string()),
      prodFormat: v.optional(v.string()),
      noProdStart: v.boolean(),
    }),
    location: v.object({
      sameAsOrganizer: v.boolean(),
      full: v.optional(v.string()),
      locale: v.optional(v.string()),
      city: v.optional(v.string()),
      state: v.optional(v.string()),
      stateAbbr: v.optional(v.string()),
      region: v.optional(v.string()),
      country: v.string(),
      countryAbbr: v.string(),
      continent: v.optional(v.string()),
      coordinates: v.optional(
        v.object({
          latitude: v.number(),
          longitude: v.number(),
        }),
      ),
      currency: v.optional(
        v.object({
          code: v.string(),
          name: v.string(),
          symbol: v.string(),
        }),
      ),
      demonym: v.optional(v.string()),
      timezone: v.optional(v.string()),
      timezoneOffset: v.optional(v.number()),
    }),
    about: v.optional(v.string()),
    links: v.optional(
      v.object({
        sameAsOrganizer: v.optional(v.boolean()),
        website: v.optional(v.string()),
        instagram: v.optional(v.string()),
        facebook: v.optional(v.string()),
        threads: v.optional(v.string()),
        email: v.optional(v.string()),
        vk: v.optional(v.string()),
        youTube: v.optional(v.string()),
        phone: v.optional(v.string()),
        linkAggregate: v.optional(v.string()),
        other: v.optional(v.string()),
      }),
    ),
    otherInfo: v.optional(v.string()),
    timeLine: v.optional(v.string()),
    active: v.optional(v.boolean()),
    state: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("submitted"),
        v.literal("published"),
        v.literal("archived"),
      ),
    ),
    finalStep: v.optional(v.boolean()),
    publish: v.optional(v.boolean()),
    adminNote: v.optional(v.string()),
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

    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (!user) {
      throw new ConvexError("User not found");
    }
    const isAdmin = user?.role.includes("admin");
    // console.log("isAdmin", isAdmin);
    const organization = await ctx.db.get(args.orgId);
    // console.log("organization", organization);
    // console.log(organization?.links);
    const linksLength = Object.keys(args.links ?? {}).length;
    // const links = !args.links
    //   ? { sameAsOrganizer: false }
    //   : linksSameAsOrg || linksLength === 1
    //     ? { ...organization?.links, sameAsOrganizer: true }
    //     : { ...args.links, sameAsOrganizer: false };

    const links = !args.links
      ? { sameAsOrganizer: false }
      : linksSameAsOrg || (args.finalStep && linksLength === 1)
        ? { ...organization?.links, sameAsOrganizer: true }
        : { ...args.links, sameAsOrganizer: false };

    const sanitizedLinks = {
      ...links,
      email:
        links?.email?.trim() === "none@mail.com" ? undefined : links?.email,
    };

    function isValidEventId(id: string): id is Id<"events"> {
      return typeof id === "string" && id.trim() !== "";
    }

    const event = isValidEventId(args._id) ? await ctx.db.get(args._id) : null;

    const eventState = args.finalStep
      ? isAdmin
        ? args.publish
          ? "published"
          : "submitted"
        : "submitted"
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
      const isOwner = event.mainOrgId === args.orgId || isAdmin;
      // console.log("isOwner", isOwner);
      if (!isOwner)
        throw new ConvexError("You don't have permission to update this event");
      console.log("patching");

      const existingFormType =
        typeof event.formType === "number" && event.formType > 0
          ? event.formType
          : 0;

      const updatedFormType =
        args.formType && args.formType >= existingFormType
          ? args.formType
          : existingFormType;

      // console.log(existingFormType, updatedFormType);

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
        about: args.about,
        links: sanitizedLinks,
        otherInfo: args.otherInfo,
        timeLine: args.timeLine,
        active: args.active || true,
        lastEditedAt: Date.now(),
        state: eventState,
        adminNote: args.adminNote,
        ...(args.publish ? { approvedBy: userId, approvedAt: Date.now() } : {}),
      });

      const updatedEvent = await ctx.db.get(event._id);
      // console.log("updatedEvent", updatedEvent);
      return { event: updatedEvent };
    }

    // console.log("inserting");
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
      about: args.about,
      timeLine: args.timeLine,
      links: sanitizedLinks,
      otherInfo: args.otherInfo,
      active: args.active || true,
      mainOrgId: args.orgId,
      organizerId: [args.orgId],
      adminNote: args.adminNote,
      // mainOrgName: "",

      state: eventState,
      lastEditedAt: Date.now(),
    });
    const newEvent = await ctx.db.get(eventId);
    return { event: newEvent };
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

    await ctx.db.patch(event._id, {
      state: eventState,
      lastEditedAt: Date.now(),
      approvedBy: userId,
      approvedAt: Date.now(),
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

    await ctx.db.patch(event._id, {
      state: eventState,
      lastEditedAt: Date.now(),
      approvedBy: undefined,
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

    const eventState = event.state === "submitted" ? "archived" : "archived";

    await ctx.db.patch(event._id, {
      state: eventState,
      lastEditedAt: Date.now(),
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
    const existingEventEdition = event.dates.edition;
    let eventEdition = existingEventEdition;
    let eventName = event.name;
    let eventSlug = event.slug;

    if (eventEdition !== new Date().getFullYear()) {
      eventEdition = new Date().getFullYear();
    }
    const { name, slug } = await generateUniqueNameAndSlug(
      ctx,
      event.name,
      eventEdition,
    );
    eventName = name;
    eventSlug = slug;

    const eventState = "draft";
    const newEvent = await ctx.db.insert("events", {
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
        edition: eventEdition,
      },
      location: {
        ...event.location,
      },
      about: event.about,
      links: event.links,
      otherInfo: event.otherInfo,
      timeLine: event.timeLine,
      active: event.active,
      mainOrgId: event.mainOrgId,
      organizerId: event.organizerId,
      // mainOrgName: "",

      state: eventState,
      lastEditedAt: Date.now(),
    });

    return { event: newEvent };
  },
});

export const deleteEvent = mutation({
  args: {
    eventId: v.id("events"),
    isAdmin: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (!user) {
      throw new ConvexError("User not found");
    }

    const event = await ctx.db.get(args.eventId);
    if (!event) return null;
    if (event.state !== "draft" && !args.isAdmin)
      throw new ConvexError("Active events cannot be deleted, only archived");
    const organization = await ctx.db.get(event.mainOrgId);
    if (!organization) throw new ConvexError("Organization not found");
    const orgLogoStorageId = organization.logoStorageId;
    const openCalls = await ctx.db
      .query("openCalls")
      .withIndex("by_eventId", (q) => q.eq("eventId", event._id))
      .collect();

    for (const openCall of openCalls) {
      await ctx.db.delete(openCall._id);
    }

    if (event.logoStorageId && event.logoStorageId !== orgLogoStorageId) {
      await ctx.storage.delete(event.logoStorageId);
    }

    await ctx.db.delete(event._id);

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
        await ctx.db.delete(openCall._id);
      }

      if (event.logoStorageId && event.logoStorageId !== orgLogoStorageId) {
        await ctx.storage.delete(event.logoStorageId);
      }

      await ctx.db.delete(event._id);
      deletedEventIds.push(event._id);
    }

    return {
      deletedEventIds,
      skippedEventIds: args.items
        .map((item) => item.eventId)
        .filter((id) => !deletedEventIds.includes(id)),
    };
  },
});
