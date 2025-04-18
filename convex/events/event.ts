import { EventCategory, EventType, SubmissionFormState } from "@/types/event";
import { OpenCall, OpenCallApplication } from "@/types/openCall";
import { Organizer } from "@/types/organizer";
import { getAuthUserId } from "@convex-dev/auth/server";
import { filter } from "convex-helpers/server/filter";
import { ConvexError, v } from "convex/values";
import { Id } from "~/convex/_generated/dataModel";
import { mutation, query } from "~/convex/_generated/server";

export const getEventByOrgId = query({
  args: {
    orgId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const org = await ctx.db.get(args.orgId);
    if (!org) return null;

    const events = await ctx.db
      .query("events")
      .withIndex("by_mainOrgId_lastEditedAt", (q) => q.eq("mainOrgId", org._id))
      .order("desc")
      .collect();

    return events;
  },
});

export const getAllEvents = query({
  handler: async (ctx) => {
    const allEvents = await ctx.db.query("events").collect();
    return allEvents;
  },
});

export const checkEventNameExists = query({
  args: {
    name: v.string(),
    organizationId: v.optional(v.id("organizations")),
  },
  handler: async (ctx, args) => {
    const inputName = args.name.trim().toLowerCase();

    const existingEvent = await filter(
      ctx.db.query("events"),
      (event) => event.name.toLowerCase() === inputName,
    ).first();

    const orgIsOwner =
      args.organizationId && args.organizationId === existingEvent?.mainOrgId;

    if (orgIsOwner) return true;

    // const existing = await ctx.db
    //   .query("events")
    //   .filter((q) => q.eq(q.field("name"), args.name.toLowerCase()))
    //   .first();

    if (existingEvent)
      throw new ConvexError("An event with that name already exists.");
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
        eventCategory: event.eventCategory as EventCategory,
        eventType:
          Array.isArray(event.eventType) && event.eventType.length <= 2
            ? (event.eventType as [EventType] | [EventType, EventType])
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
        eventCategory: event.eventCategory as EventCategory,
        eventType:
          Array.isArray(event.eventType) && event.eventType.length <= 2
            ? (event.eventType as [EventType] | [EventType, EventType])
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
        eventCategory: event.eventCategory as EventCategory,
        eventType:
          Array.isArray(event.eventType) && event.eventType.length <= 2
            ? (event.eventType as [EventType] | [EventType, EventType])
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
    logoId: v.optional(v.id("_storage")),
    name: v.string(),
    slug: v.string(),
    logo: v.string(),
    eventType: v.array(v.string()),
    eventCategory: v.string(),
    dates: v.object({
      edition: v.number(),
      eventDates: v.array(
        v.object({
          start: v.string(),
          end: v.string(),
        }),
      ),
      artistStart: v.optional(v.string()),
      artistEnd: v.optional(v.string()),
      ongoing: v.boolean(),
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
        address: v.optional(v.string()),
        linkAggregate: v.optional(v.string()),
      }),
    ),
    otherInfo: v.array(v.string()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");
    let fileUrl = "/1.jpg" as string | null;
    if (args.logoId) {
      fileUrl = await ctx.storage.getUrl(args.logoId);
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (!user) {
      throw new ConvexError("User not found");
    }
    const organization = await ctx.db.get(args.orgId);
    console.log("organization", organization);

    const event = await ctx.db.get(args._id as Id<"events">);

    if (event) {
      const isOwner = event.mainOrgId === args.orgId;
      console.log("isOwner", isOwner);
      if (!isOwner)
        throw new ConvexError("You don't have permission to update this event");
      console.log("patching");

      await ctx.db.patch(event._id, {
        name: args.name,
        logo: fileUrl || args.logo,
        eventType: args.eventType || [],
        eventCategory: args.eventCategory || "",
        dates: {
          ...args.dates,
          edition: args.dates.edition || new Date().getFullYear(),
          eventDates: args.dates.eventDates || [{ start: "", end: "" }],
          ongoing: args.dates.ongoing || false,
        },
        location: {
          ...args.location,
        },
        about: args.about || "",
        links: args.links || {},
        otherInfo: args.otherInfo || [],
        active: args.active || true,
        lastEditedAt: Date.now(),
      });

      const updatedEvent = await ctx.db.get(event._id);
      return { event: updatedEvent };
    }

    console.log("inserting");
    const eventId = await ctx.db.insert("events", {
      name: args.name,
      slug: args.slug,
      logo: fileUrl as string,
      eventType: args.eventType || [],
      eventCategory: args.eventCategory || "",
      dates: {
        ...args.dates,
        edition: args.dates.edition || new Date().getFullYear(),
        eventDates: args.dates.eventDates || [{ start: "", end: "" }],
        ongoing: args.dates.ongoing || false,
      },
      location: {
        ...args.location,
      },
      about: args.about || "",
      links: args.links || {},
      otherInfo: args.otherInfo || [],
      active: args.active || true,
      mainOrgId: args.orgId,
      organizerId: [args.orgId],
      mainOrgName: "",
      openCallId: [],
      state: "draft",
      lastEditedAt: Date.now(),
    });
    const newEvent = await ctx.db.get(eventId);
    return { event: newEvent };
  },
});
