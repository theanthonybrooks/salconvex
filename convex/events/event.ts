import { EventCategory, EventType, SubmissionFormState } from "@/types/event";
import { OpenCall, OpenCallApplication } from "@/types/openCall";
import { Organizer } from "@/types/organizer";
import { getAuthUserId } from "@convex-dev/auth/server";
import { filter } from "convex-helpers/server/filter";
import { ConvexError, v } from "convex/values";
import { query } from "~/convex/_generated/server";

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
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const inputName = args.name.trim().toLowerCase();
    console.log("args", inputName);

    const existingEvent = await filter(
      ctx.db.query("events"),
      (event) => event.name.toLowerCase() === inputName,
    ).first();
    // const existing = await ctx.db
    //   .query("events")
    //   .filter((q) => q.eq(q.field("name"), args.name.toLowerCase()))
    //   .first();

    if (existingEvent)
      throw new ConvexError("An event with that name already exists.");
    console.log("existing", existingEvent);
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

export const getEventsBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("events")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .collect();

    return events;
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
    if (!event) return null;

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

    console.log("application", application);

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
