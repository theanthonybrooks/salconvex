import { approvedStates } from "@/constants/eventConsts";
import { validOCVals } from "@/constants/openCallConsts";
import { ConvexError, v } from "convex/values";
import { internal } from "~/convex/_generated/api";
import { internalMutation, mutation } from "~/convex/_generated/server";

export const eventLookupUpdateHelper = mutation({
  args: {
    eventId: v.id("events"),
    openCallId: v.optional(v.id("openCalls")),
  },
  handler: async (ctx, args) => {
    const { eventId, openCallId } = args;

    await ctx.runMutation(internal.events.eventLookup.addUpdateEventLookup, {
      eventId: eventId,
      openCallId: openCallId,
    });
  },
});
export const addUpdateEventLookup = internalMutation({
  args: {
    eventId: v.id("events"),
    openCallId: v.optional(v.id("openCalls")),
  },
  handler: async (ctx, args) => {
    const { eventId, openCallId } = args;
    const lookup = await ctx.db
      .query("eventLookup")
      .withIndex("by_eventId", (q) => q.eq("eventId", eventId))
      .first();
    const event = eventId ? await ctx.db.get(eventId) : null;
    if (!event || !event.approvedAt) return null;
    const org = event.mainOrgId ? await ctx.db.get(event.mainOrgId) : null;
    if (!org) return null;
    const openCall = openCallId
      ? await ctx.db.get(openCallId)
      : await ctx.db
          .query("openCalls")
          .withIndex("by_eventId", (q) => q.eq("eventId", eventId))
          .first();
    const validEvent = approvedStates.includes(event.state);
    const validOpenCall = approvedStates.includes(openCall?.state ?? "");
    console.log("valid event: ", validEvent, event.state, event._id);
    if (!validEvent && lookup) {
      await ctx.db.delete(lookup._id);
      return null;
    }
    if (!validEvent) return null;

    const eventData = {
      eventId: eventId,
      mainOrgId: event.mainOrgId,
      orgName: org?.name,
      ownerId: org?.ownerId,
      eventName: event.name,
      eventSlug: event.slug,
      eventState: event.state,
      eventCategory: event.category,
      eventType: event.type,
      country: event.location?.country,
      continent: event.location?.continent ?? "",
      eventStart: event.dates.eventDates?.[0]?.start,
      hasOpenCall: validOpenCall
        ? validOCVals.includes(event.hasOpenCall)
        : false,
      postStatus: event.posted,
      eventApprovedAt: event.approvedAt,
      lastEditedAt: event.lastEditedAt ?? event.approvedAt,
    };

    const openCallData = {
      openCallId: validOpenCall ? openCall?._id : undefined,
      ocState: validOpenCall ? openCall?.state : undefined,
      callType: validOpenCall ? openCall?.basicInfo?.callType : undefined,
      callFormat: validOpenCall ? openCall?.basicInfo?.callFormat : undefined,
      eligibilityType: validOpenCall ? openCall?.eligibility?.type : undefined,
      ocStart: validOpenCall
        ? (openCall?.basicInfo?.dates?.ocStart ?? undefined)
        : undefined,
      ocEnd: validOpenCall
        ? (openCall?.basicInfo?.dates?.ocEnd ?? undefined)
        : undefined,
      ocApprovedAt: validOpenCall ? openCall?.approvedAt : undefined,
    };

    const lookupData = {
      ...eventData,
      ...openCallData,
    };
    try {
      if (lookup) {
        await ctx.db.patch(lookup._id, lookupData);
      } else {
        await ctx.db.insert("eventLookup", lookupData);
      }
    } catch (error) {
      throw new ConvexError("Failed to update event lookup" + error);
    }
  },
});

export const deleteEventLookup = internalMutation({
  args: {
    eventId: v.id("events"),
    openCallOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { eventId, openCallOnly } = args;
    const lookup = await ctx.db
      .query("eventLookup")
      .withIndex("by_eventId", (q) => q.eq("eventId", eventId))
      .first();
    if (!lookup) return null;
    const event = eventId ? await ctx.db.get(eventId) : null;

    if (openCallOnly && event) {
      const org = event.mainOrgId ? await ctx.db.get(event.mainOrgId) : null;
      if (!org) return null;

      const ocData = {
        ...lookup,
        openCallId: undefined,
        ocState: undefined,
        callType: undefined,
        callFormat: undefined,
        eligibilityType: undefined,
        ocStart: undefined,
        ocEnd: undefined,
        ocApprovedAt: undefined,
        lastEditedAt: Date.now(),
      };

      await ctx.db.patch(lookup._id, ocData);
    } else {
      await ctx.db.delete(lookup._id);
    }
  },
});

export const updateLookupPostStatus = internalMutation({
  args: {
    eventId: v.id("events"),
    posted: v.optional(v.union(v.literal("posted"), v.literal("toPost"))),
  },
  handler: async (ctx, args) => {
    const { eventId, posted } = args;
    const lookup = await ctx.db
      .query("eventLookup")
      .withIndex("by_eventId", (q) => q.eq("eventId", eventId))
      .first();
    if (!lookup) return null;
    await ctx.db.patch(lookup._id, {
      postStatus: posted,
    });
  },
});
