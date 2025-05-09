import {
  EventCategory,
  EventFormat,
  EventType,
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

// export async function generateUniqueNameAndSlug(
//   ctx: MutationCtx,
//   baseName: string,
//   baseEdition: number,
// ): Promise<{ name: string; slug: string; baseEdition: number }> {
//   let name = baseName;
//   let edition = baseEdition;
//   let suffix = 1;

//   // Check if the exact name is available
//   const existing = await ctx.db
//     .query("events")
//     .withIndex("by_name_and_edition", (q) =>
//       q.eq("name", name).eq("dates.edition", edition),
//     )
//     .unique();

//   if (!existing) {
//     return { name, slug: slugify(name), baseEdition };
//   }

//   // Try incrementing numeric suffixes
//   const base = baseName.replace(/(?:[-\s])(\d+)$/, "");
//   while (true) {
//     name = `${base}-${suffix}`;
//     const exists = await ctx.db
//       .query("events")
//       .withIndex("by_name", (q) => q.eq("name", name))
//       .first();
//     if (!exists) break;
//     suffix++;
//   }

//   return { name, slug: slugify(name), baseEdition };
// }

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
    return { name: baseName, slug: slugify(baseName) };
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
      return { name: tryName, slug: slugify(tryName) };
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
        openCallStatus: openCall?.state ?? null,
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
        openCallStatus: openCall?.state ?? null,
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
        openCallStatus: openCall?.state ?? null,
        openCallId: openCall?._id ?? null,
      };
    });

    return enrichedEvents;
  },
});

// export const checkEventNameExists = query({
//   args: {
//     name: v.string(),
//     organizationId: v.optional(v.id("organizations")),
//     eventId: v.optional(v.id("events")),
//   },
//   handler: async (ctx, args) => {
//     const inputName = args.name.trim().toLowerCase();
//     const edition = new Date().getFullYear();

//     console.log("inputName", inputName);

//     const existingEvent = await filter(
//       ctx.db.query("events"),
//       (event) => event.name.toLowerCase() === inputName,
//     ).unique();

//     console.log("existingEvent", existingEvent);
//     console.log("inputName", inputName);

//     const sameEvent = args.eventId && args.eventId === existingEvent?._id

//     if (sameEvent) return true;

//     // const existing = await ctx.db
//     //   .query("events")
//     //   .filter((q) => q.eq(q.field("name"), args.name.toLowerCase()))
//     //   .first();

//     if (existingEvent)
//       throw new ConvexError("An event with that name already exists.");
//     return true;
//   },
// });

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
    const slug = slugify(args.name, { lower: true });
    const event = await ctx.db.get(args.eventId);
    if (!event) return null;
    await ctx.db.patch(event._id, {
      name: args.name,
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
    const eventSlug = slugify(args.name, { lower: true });
    const existingEvents = await ctx.db
      .query("events")
      .withIndex("by_slug", (q) => q.eq("slug", eventSlug))
      .collect();

    for (const event of existingEvents) {
      const sameEvent = !!(args.eventId && args.eventId === event._id);

      const sameOrg =
        args.organizationId && args.organizationId === event.mainOrgId;
      const sameEdition = args.edition && args.edition === event.dates.edition;
      // console.log(
      //   "Same Event: ",
      //   sameEvent,
      //   "Same Org: ",
      //   sameOrg,
      //   "Same Edition: ",
      //   sameEdition,
      // );
      // console.log(
      //   "Event Edition: ",
      //   event.dates.edition,
      //   "vs Args Edition: ",
      //   args.edition,
      // );
      // console.log(
      //   "Event Org: ",
      //   event.mainOrgId,
      //   "vs Args Org: ",
      //   args.organizationId,
      // );

      if (sameEvent || (!sameEdition && !!sameOrg)) continue;

      throw new ConvexError(
        `An event with the name ${args.name} already exists.`,
      );
      // throw new ConvexError(
      //   `An event with this name and edition (${args.name} - ${args.edition}) already exists.`,
      // );
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

    console.log(event);

    if (!event) throw new ConvexError("No event found");

    const [organizer] = await Promise.all([
      // const [openCalls, organizer] = await Promise.all([
      // ctx.db
      //   .query("openCalls")
      //   .withIndex("by_eventId", (q) => q.eq("eventId", event._id))
      //   .collect(),
      ctx.db.get(event.mainOrgId),
    ]);
    console.log(organizer);

    // const openCall = openCalls.find(
    //   (e) => e.basicInfo.dates.edition === args.edition,
    // );

    return {
      event: {
        ...event,
        state: event.state as SubmissionFormState,
        category: event.category as EventCategory,
        type:
          Array.isArray(event.type) && event.type.length <= 2
            ? (event.type as [EventType] | [EventType, EventType])
            : undefined,
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
    const events = await ctx.db
      .query("events")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .collect();

    const event = events.find((e) => e.dates.edition === args.edition);
    if (!event) throw new ConvexError("No event found");

    const [openCalls, organizer] = await Promise.all([
      ctx.db
        .query("openCalls")
        .withIndex("by_eventId", (q) => q.eq("eventId", event._id))
        .collect(),
      ctx.db.get(event.mainOrgId),
    ]);

    const openCall = openCalls.find(
      (e) => e.basicInfo.dates.edition === args.edition,
    );

    return {
      event: {
        ...event,
        state: event.state as SubmissionFormState,
        category: event.category as EventCategory,
        type:
          Array.isArray(event.type) && event.type.length <= 2
            ? (event.type as [EventType] | [EventType, EventType])
            : undefined,
      },
      openCall: openCall as OpenCall,
      organizer: organizer as Organizer,
    };
  },
});

export const getEventWithAppDetails = query({
  args: {
    slug: v.string(),
    edition: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
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
      .first();

    const organizer = await ctx.db.get(event.mainOrgId);

    if (userId && openCall) {
      application = await ctx.db
        .query("applications")
        .withIndex("by_openCallId", (q) => q.eq("openCallId", openCall._id))
        .filter((q) => q.eq(q.field("artistId"), userId))
        .first();
    }

    //todo: may need to add safety in case there are multiple open calls for the same event and edition. How to handle this going forward?

    if (!openCall) return null;

    return {
      event: {
        ...event,
        state: event.state as SubmissionFormState,
        category: event.category as EventCategory,
        type:
          Array.isArray(event.type) && event.type.length <= 2
            ? (event.type as [EventType] | [EventType, EventType])
            : undefined,
      },
      openCall: openCall as OpenCall,
      organizer: organizer as Organizer,
      application: (application as OpenCallApplication) ?? null,
    };
  },
});

export const createOrUpdateEvent = mutation({
  args: {
    orgId: v.id("organizations"),
    _id: v.union(v.id("events"), v.string()),
    logoStorageId: v.optional(v.id("_storage")),
    name: v.string(),
    slug: v.string(),
    logo: v.string(),
    type: typeValidator,
    category: categoryValidator,

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
        phone: v.optional(v.string()),
        linkAggregate: v.optional(v.string()),
        other: v.optional(v.string()),
      }),
    ),
    otherInfo: v.optional(v.string()),
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
    const links = !args.links
      ? { sameAsOrganizer: false }
      : linksSameAsOrg
        ? { ...organization?.links, sameAsOrganizer: true }
        : { ...args.links, sameAsOrganizer: false };

    function isValidEventId(id: string): id is Id<"events"> {
      return typeof id === "string" && id.trim() !== "";
    }

    const event = isValidEventId(args._id) ? await ctx.db.get(args._id) : null;

    const eventState = args.finalStep
      ? isAdmin
        ? "published"
        : "submitted"
      : "draft";

    console.log("eventState", eventState);

    if (event) {
      const isOwner = event.mainOrgId === args.orgId || isAdmin;
      // console.log("isOwner", isOwner);
      if (!isOwner)
        throw new ConvexError("You don't have permission to update this event");
      console.log("patching");

      await ctx.db.patch(event._id, {
        name: args.name,
        logo: fileUrl || args.logo,
        logoStorageId: args.logoStorageId,
        type: args.type || [],
        category: args.category || "",
        dates: {
          ...args.dates,
          edition: args.dates.edition || new Date().getFullYear(),
          eventDates: args.dates.eventDates || [{ start: "", end: "" }],
          eventFormat: (args.dates.eventFormat as EventFormat) || undefined,
          prodFormat: (args.dates.prodFormat as ProdFormat) || undefined,

          noProdStart: args.dates.noProdStart || false,
        },
        location: {
          ...args.location,
        },
        about: args.about,
        links,
        otherInfo: args.otherInfo,
        active: args.active || true,
        lastEditedAt: Date.now(),
        state: eventState,
      });

      const updatedEvent = await ctx.db.get(event._id);
      console.log("updatedEvent", updatedEvent);
      return { event: updatedEvent };
    }

    console.log("inserting");
    const eventId = await ctx.db.insert("events", {
      name: args.name,
      slug: args.slug,
      logo: fileUrl as string,
      logoStorageId: args.logoStorageId,
      type: args.type || [],
      category: args.category || "",
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
      links,
      otherInfo: args.otherInfo,
      active: args.active || true,
      mainOrgId: args.orgId,
      organizerId: [args.orgId],
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

    const eventState = event.state === "archived" && isAdmin && "published";

    await ctx.db.patch(event._id, {
      state: eventState || "submitted",
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
      name: eventName,
      slug: eventSlug,
      logo: event.logo,
      logoStorageId: event.logoStorageId,
      type: event.type,
      category: event.category,
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
