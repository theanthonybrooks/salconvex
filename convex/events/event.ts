import { EventCategory, EventType, SubmissionFormState } from "@/types/event";
import { OpenCall } from "@/types/openCall";
import { Organizer } from "@/types/organizer";
import { v } from "convex/values";
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
      .withIndex("by_mainOrgId", (q) => q.eq("mainOrgId", org._id))
      .collect();

    return events;
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
    //todo: may need to add safety in case there are multiple open calls for the same event and edition

    const openCall = openCalls.find(
      (e) => e.basicInfo.dates.edition === args.edition,
    );

    if (!openCall) return null;

    const applications = await ctx.db
      .query("applications")
      .withIndex("by_openCallId", (q) => q.eq("openCallId", openCall._id))
      .collect();

    return {
      event,
      openCall,
      organizer,
      applications,
    };
  },
});
