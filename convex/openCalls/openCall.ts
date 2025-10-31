import {
  CallFormat,
  CallType,
  EligibilityType,
  OpenCallLinkFormat,
  OpenCallState,
  RateUnit,
} from "@/types/openCallTypes";

import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "~/convex/_generated/api";
import { internalMutation, mutation, query } from "~/convex/_generated/server";
import {
  eventsAggregate,
  openCallsAggregate,
} from "~/convex/aggregates/eventAggregates";
import { generateUniqueNameAndSlug } from "~/convex/events/event";
import {
  eventStateValidator,
  ocStateValidator,
  openCallSchema,
} from "~/convex/schema";
import { ConvexError, v } from "convex/values";

export const getTotalNumberOfOpenCalls = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    const user = userId ? await ctx.db.get(userId) : null;
    const isAdmin = user?.role?.includes("admin");

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
    const editingBounds = {
      lower: { key: "editing", inclusive: true },
      upper: { key: "editing", inclusive: true },
    };
    // const [active, archived, draft, submitted, pending, editing] =
    //   await openCallsAggregate.countBatch(ctx, [
    //     { bounds: publishedBounds },
    //     { bounds: archivedBounds },
    //     { bounds: draftBounds },
    //     { bounds: submittedBounds },
    //     { bounds: pendingBounds },
    //     { bounds: editingBounds },
    //   ]);

    if (!isAdmin) {
      // Only fetch total and active for non-admins, set others to zero
      const [active] = await openCallsAggregate.countBatch(ctx, [
        { bounds: publishedBounds },
      ]);

      return {
        totalOpenCalls: 0,
        activeOpenCalls: active,
        archivedOpenCalls: 0,
        draftOpenCalls: 0,
        pendingOpenCalls: 0,
        editingOpenCalls: 0,
      };
    } else {
      // const [active, archived, draft, submitted, pending, editing] =
      //   await openCallsAggregate.countBatch(ctx, [
      //     { bounds: publishedBounds },
      //     { bounds: archivedBounds },
      //     { bounds: draftBounds },
      //     { bounds: submittedBounds },
      //     { bounds: pendingBounds },
      //     { bounds: editingBounds },
      //   ]);
      const [active, archived, draft, pending, editing] =
        await openCallsAggregate.countBatch(ctx, [
          { bounds: publishedBounds },
          { bounds: archivedBounds },
          { bounds: draftBounds },
          { bounds: pendingBounds },
          { bounds: editingBounds },
        ]);

      const totalOpenCalls = await openCallsAggregate.count(ctx);

      return {
        totalOpenCalls,
        activeOpenCalls: active,
        archivedOpenCalls: archived,
        draftOpenCalls: draft,
        pendingOpenCalls: pending,
        editingOpenCalls: editing,
      };
    }
  },
});

export const getSubmittedOpenCallCount = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!user) throw new ConvexError("User not found");
    const isAdmin = user?.role?.includes("admin");
    if (!isAdmin)
      throw new ConvexError("You don't have permission to view this");
    const openCalls = await ctx.db
      .query("openCalls")
      .withIndex("by_state", (q) => q.eq("state", "submitted"))
      .collect();

    return openCalls.length;
  },
});

export const archiveExpiredOpenCalls = internalMutation({
  args: {},
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    const openCalls = await ctx.db
      .query("openCalls")
      .withIndex("by_state", (q) => q.eq("state", "published"))
      .collect();

    // console.log(now);

    for (const oc of openCalls) {
      const ocEnd = oc.basicInfo?.dates?.ocEnd;

      if (ocEnd && ocEnd < now) {
        const event = await ctx.db.get(oc.eventId);
        if (!event) continue;
        await ctx.db.patch(oc._id, {
          state: "archived",
          lastUpdatedAt: Date.now(),
        });
        const eventLookup = await ctx.db
          .query("eventLookup")
          .withIndex("by_openCallId", (q) => q.eq("openCallId", oc._id))
          .first();
        if (eventLookup) {
          await ctx.db.patch(eventLookup._id, {
            ocState: "archived",
            lastEditedAt: Date.now(),
            ...(event.category !== "event" ? { eventState: "archived" } : {}),
          });
        }

        const newOC = await ctx.db.get(oc._id);
        if (newOC) await openCallsAggregate.replaceOrInsert(ctx, oc, newOC);
        if (event.category !== "event") {
          await ctx.db.patch(event._id, {
            state: "archived",
            lastEditedAt: Date.now(),
          });
          const newEvent = await ctx.db.get(event._id);
          if (newEvent)
            await eventsAggregate.replaceOrInsert(ctx, event, newEvent);
        }
      }
    }
  },
});

export const createNewOpenCall = mutation({
  args: {
    orgId: v.id("organizations"),
    eventId: v.id("events"),
    edition: v.number(),
  },

  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!user) throw new ConvexError("User not found");

    const openCallData = {
      eventId: args.eventId,
      organizerId: [args.orgId],
      mainOrgId: args.orgId,
      basicInfo: {
        appFee: 0,
        callFormat: "RFQ" as CallFormat,
        callType: "Unknown" as CallType,
        dates: {
          ocStart: "",
          ocEnd: "",
          timezone: "",
          edition: args.edition,
        },
      },
      eligibility: {
        type: "International" as EligibilityType,
        whom: [],
      },
      compensation: {
        budget: {
          min: 0,
          rate: 0,
          unit: "" as RateUnit,
          currency: "",
          allInclusive: false,
        },
        categories: {},
      },
      requirements: {
        requirements: "",
        links: [],
        applicationLink: "",
        applicationLinkFormat: "https://" as OpenCallLinkFormat,
      },
      state: "initial" as OpenCallState,
      lastUpdatedBy: userId,
    };

    //TODO: update this later to account for multiple open calls per event. For now, just one is allowed/used.

    const existingOpenCall = await ctx.db
      .query("openCalls")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .unique();

    if (existingOpenCall) {
      //TODO: determine whether I should throw an error here or just update and return the existing call. Probably just update/return?
      await ctx.db.patch(existingOpenCall._id, openCallData);
      // await ctx.db.patch(existingOpenCall._id, {
      //   edition: args.edition,
      //   state: openCallData.state,
      //   lastEdited: Date.now(),
      // });
      return existingOpenCall._id;
    }

    const newId = await ctx.db.insert("openCalls", openCallData);
    const newOC = await ctx.db.get(newId);
    if (newOC) await openCallsAggregate.insertIfDoesNotExist(ctx, newOC);

    // await ctx.db.insert("eventOpenCalls", {
    //   eventId: args.eventId,
    //   openCallId: newId,
    //   edition: args.edition,
    //   state: openCallData.state,
    // });

    return newId;
  },
});

export const updateOpenCall = mutation({
  args: {
    // orgId: v.id("organizations"),
    ...openCallSchema,
    openCallId: v.optional(v.union(v.id("openCalls"), v.null())),
    finalStep: v.optional(v.boolean()),
    approved: v.optional(v.boolean()),
    state: v.optional(ocStateValidator),
  },

  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!user) throw new ConvexError("User not found");

    const existingOpenCall = args.openCallId
      ? await ctx.db.get(args.openCallId)
      : args.eventId
        ? await ctx.db
            .query("openCalls")
            .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
            .first()
        : null;
    if (!existingOpenCall) throw new ConvexError("Open call not found");

    const allDocs = [
      ...(existingOpenCall?.documents ?? []),
      ...(args.documents ?? []),
    ];

    const seen = new Set();
    const ocDocs = allDocs.filter((doc) => {
      if (seen.has(doc.id)) return false;
      seen.add(doc.id);
      return true;
    });

    const ocApproved = existingOpenCall?.approvedBy || args.approved;
    // const ocState = existingOpenCall?.state || args.state;
    const ocPaid = existingOpenCall?.paid || args.paid;

    const isAdmin = user?.role?.includes("admin");

    //TODO: think about this logic and if it needs to be here or if it's better decided in the form per step (with the approved flag)
    const openCallState = isAdmin
      ? args.finalStep
        ? args.approved
          ? "published"
          : "submitted"
        : ocApproved
          ? "editing"
          : "draft"
      : ocApproved
        ? args.finalStep
          ? "submitted"
          : "editing"
        : args.finalStep
          ? ocPaid
            ? "submitted"
            : "pending"
          : "draft";

    //todo: utilize the patch in stripe subscriptions to update the state from pending to submitted when it's paid

    const openCallData = {
      adminNoteOC: "",
      eventId: args.eventId,
      organizerId: args.organizerId,
      mainOrgId: args.mainOrgId,
      basicInfo: args.basicInfo,
      selectionCriteria: args.selectionCriteria,
      eligibility: args.eligibility,
      compensation: args.compensation,
      requirements: {
        ...args.requirements,
        links: args.requirements.links ?? [],
      },
      documents: ocDocs,
      state: openCallState as OpenCallState,
      lastUpdatedBy: userId,
      lastUpdatedAt: Date.now(),
      paid: args.paid ?? false,
      ...(args.approved ? { approvedBy: userId, approvedAt: Date.now() } : {}),
    };

    // // Step 1: Lookup already exists — update both openCall and lookup
    // const lookup = await ctx.db
    //   .query("eventOpenCalls")
    //   .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
    //   .unique();

    // // console.log("ocId", args.openCallId);
    // // console.log("lookup", lookup);

    // if (lookup) {
    //   const prevOC = await ctx.db.get(lookup.openCallId);
    //   await ctx.db.patch(lookup.openCallId, openCallData);
    //   const newOC = await ctx.db.get(lookup.openCallId);
    //   await ctx.db.patch(lookup._id, {
    //     edition: args.basicInfo.dates.edition,
    //     state: openCallState,
    //     lastEdited: Date.now(),
    //     ...(args.openCallId && { openCallId: args.openCallId }),
    //   });
    //   // console.log("prev lookup: ", prevOc?._id, "new lookup: ", newOC?._id);
    //   console.log("is it me");
    //!! TODO:  if (prevOC && newOC)
    //     await openCallsAggregate.replaceOrInsert(ctx, prevOC, newOC);
    //   if (newOC?.approvedAt) {
    //     await ctx.runMutation(
    //       internal.events.eventLookup.addUpdateEventLookup,
    //       {
    //         eventId: newOC.eventId,
    //         openCallId: newOC._id,
    //       },
    //     );
    //   }
    //   // console.log("lookup updated", lookup, openCallData);
    //   return openCallData;
    // }

    // Step 2: If user provided openCallId, validate and use it

    await ctx.db.patch(existingOpenCall._id, openCallData);

    const newOC = await ctx.db.get(existingOpenCall._id);

    if (newOC) {
      await openCallsAggregate.replaceOrInsert(ctx, existingOpenCall, newOC);
      if (newOC?.approvedAt) {
        await ctx.runMutation(
          internal.events.eventLookup.addUpdateEventLookup,
          {
            eventId: newOC.eventId,
            openCallId: newOC._id,
          },
        );
      }
    }

    return openCallData;
  },
});

export const getOpenCallByOrgId = query({
  args: {
    orgId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const org = await ctx.db.get(args.orgId);
    if (!org) return null;

    const openCalls = await ctx.db
      .query("openCalls")
      .withIndex("by_mainOrgId", (q) => q.eq("mainOrgId", org._id))
      .collect();

    return openCalls;
  },
});

// export const getOpenCallLookupByOCId = query({
//   args: {
//     openCallId: v.id("openCalls"),
//   },
//   handler: async (ctx, args) => {
//     const ocLookup = await ctx.db
//       .query("eventOpenCalls")
//       .withIndex("by_openCallId", (q) => q.eq("openCallId", args.openCallId))
//       .first();
//     return ocLookup;
//   },
// });

export const getPublishedOpenCalls = query({
  handler: async (ctx) => {
    const openCalls = await ctx.db
      .query("openCalls")
      .withIndex("by_state", (q) => q.eq("state", "published"))
      .collect();

    return openCalls;
  },
});

export const getOpenCallByEventId = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) return null;
    if (event.hasOpenCall === "Invite") return null;

    const openCall = await ctx.db
      .query("openCalls")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .first();

    if (openCall?.state === "initial") return null;

    return openCall;
  },
});

//note-to-self: At the moment, the events aren't grouped by id as the id is specific to each edition. Rather, they are grouped by slug, since that's also unique and then I can gather the id's/editions for that specific slug.

// export const getOpenCallByEventIdAndEdition = query({
//   args: {
//     eventId: v.id("events"),
//     edition: v.number(),
//   },
//   handler: async (ctx, args) => {
//     const event = await ctx.db.get(args.eventId);
//     if (!event) return null;

//     const openCall = await ctx.db
//       .query("openCalls")
//       .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
//       .filter((q) => q.eq(q.field("basicInfo.dates.edition"), args.edition))
//       .first();

//     return openCall;
//   },
// });

export const duplicateOC = mutation({
  args: {
    openCallId: v.id("openCalls"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const openCall = await ctx.db.get(args.openCallId);
    if (!openCall) return null;
    const eventId = openCall.eventId;
    const event = await ctx.db.get(eventId);
    if (!event) return null;
    const existingOcEdition = openCall.basicInfo.dates.edition;
    let eventName = event.name;
    let eventSlug = event.slug;
    // let edition = existingOcEdition;
    let edition = event.dates.edition;

    if (event.dates.edition !== new Date().getFullYear()) {
      edition = new Date().getFullYear();
    }

    console.log(edition);

    //  else {
    //   edition = existingOcEdition + 1;
    // }

    const { name, slug } = await generateUniqueNameAndSlug(
      ctx,
      event.name,
      edition,
    );
    eventName = name;
    eventSlug = slug;

    //TODO: Is this the best way to handle this? Should there be only one open call per edition/event? Or should there be multiple open calls per edition/event?

    const newEvent = await ctx.db.insert("events", {
      formType: event.formType,
      name: eventName,
      slug: eventSlug,
      logo: event.logo,
      logoStorageId: event.logoStorageId,
      type: event.type,
      category: event.category,
      hasOpenCall: event.hasOpenCall,
      dates: {
        ...event.dates,
        eventDates: [{ start: "", end: "" }],
        prodDates: [{ start: "", end: "" }],
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
    const newEventDoc = await ctx.db.get(newEvent);
    if (newEventDoc)
      await eventsAggregate.insertIfDoesNotExist(ctx, newEventDoc);

    const newOpenCall = await ctx.db.insert("openCalls", {
      adminNoteOC: openCall.adminNoteOC,
      eventId: newEvent,
      organizerId: openCall.organizerId,
      mainOrgId: openCall.mainOrgId,
      basicInfo: {
        ...openCall.basicInfo,
        dates: {
          ...openCall.basicInfo.dates,
          ocEnd: "",
          edition,
        },
      },
      ...(openCall.selectionCriteria && {
        selectionCriteria: openCall.selectionCriteria,
      }),
      eligibility: {
        ...openCall.eligibility,
        type: openCall.eligibility.type,
        whom: openCall.eligibility.whom,
      },
      compensation: {
        ...openCall.compensation,
      },
      requirements: {
        requirements: openCall.requirements.requirements,
        applicationLink: "",
        applicationLinkFormat: "https://",
        links: [],
      },
      state: "draft",
      paid: false,
      lastUpdatedAt: Date.now(),
      lastUpdatedBy: userId,
    });
    const newOCDoc = await ctx.db.get(newOpenCall);
    if (newOCDoc) await openCallsAggregate.insertIfDoesNotExist(ctx, newOCDoc);

    return { openCall: newOpenCall, event: newEvent };
  },
});

export const deleteOC = mutation({
  args: {
    openCallId: v.id("openCalls"),
    isAdmin: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");
    const isAdmin = user?.role?.includes("admin");
    const openCall = await ctx.db.get(args.openCallId);
    if (!openCall) return null;
    if ((openCall.state !== "draft" || openCall.approvedAt) && !isAdmin)
      throw new ConvexError("Active open calls cannot be deleted");
    const organization = await ctx.db.get(openCall.mainOrgId);
    if (!organization) throw new ConvexError("Organization not found");
    if (openCall.approvedAt && isAdmin) {
      await ctx.runMutation(internal.events.eventLookup.deleteEventLookup, {
        eventId: openCall.eventId,
        openCallOnly: true,
      });
    }

    if ((openCall.approvedAt && isAdmin) || !openCall.approvedAt) {
      await ctx.db.delete(openCall._id);
      await openCallsAggregate.delete(ctx, openCall);
    }

    return { openCall };
  },
});

export const changeOCStatus = mutation({
  args: {
    openCallId: v.id("openCalls"),
    newStatus: eventStateValidator,
    target: v.optional(
      v.union(v.literal("event"), v.literal("oc"), v.literal("both")),
    ),
  },
  handler: async (ctx, args) => {
    const targetBoth = args.target === "both";
    const userId = await getAuthUserId(ctx);
    const user = userId ? await ctx.db.get(userId) : null;
    if (!user || !userId) throw new ConvexError("Not authenticated");
    const isAdmin = user.role.includes("admin");
    if (args.newStatus === "published" && !isAdmin)
      throw new ConvexError("You don't have permission to approve events");
    // if (!isAdmin)
    //   throw new Error("You don't have permission to approve events");
    const oc = await ctx.db.get(args.openCallId);
    if (!oc) throw new ConvexError("Open call not found");
    const eventId = oc.eventId;
    const prevState = oc.state;
    const outputState =
      isAdmin && args.newStatus === "submitted" && prevState !== "published"
        ? "published"
        : args.newStatus || "submitted";
    const approvedBy = isAdmin ? userId : undefined;
    const prevEvent = await ctx.db.get(eventId);
    if (!prevEvent) {
      await ctx.runMutation(internal.events.eventLookup.deleteEventLookup, {
        eventId,
        openCallOnly: false,
      });
      await ctx.db.delete(oc._id);
      await openCallsAggregate.deleteIfExists(ctx, oc);
      return null;
    }

    if (targetBoth || outputState === "published") {
      await ctx.db.patch(eventId, {
        state: outputState,
        lastEditedAt: Date.now(),
        approvedBy: approvedBy,
        approvedAt: Date.now(),
      });
    } else {
      await ctx.db.patch(eventId, {
        lastEditedAt: Date.now(),
      });
    }

    const newEvent = await ctx.db.get(eventId);
    if (newEvent && prevEvent)
      await eventsAggregate.replaceOrInsert(ctx, prevEvent, newEvent);
    await ctx.db.patch(oc._id, {
      state: outputState,
      lastUpdatedAt: Date.now(),
      approvedBy: approvedBy,
      approvedAt: Date.now(),
    });
    const newOC = await ctx.db.get(oc._id);
    if (newOC) await openCallsAggregate.replaceOrInsert(ctx, oc, newOC);
    if (newOC?.approvedAt) {
      await ctx.runMutation(internal.events.eventLookup.addUpdateEventLookup, {
        eventId: eventId,
        openCallId: newOC._id,
      });
    }

    return { oc };
  },
});

export const getOpenCallDocuments = query({
  args: {
    openCallId: v.id("openCalls"),
  },
  handler: async (ctx, args) => {
    const openCallFiles = await ctx.db
      .query("openCallFiles")
      .withIndex("by_openCallId", (q) => q.eq("openCallId", args.openCallId))
      .collect();

    const openCall = await ctx.db.get(args.openCallId);
    if (!openCall) return null;
    if (openCall.documents?.length === 0) return null;

    return { files: openCallFiles, documents: openCall.documents };
  },
});
