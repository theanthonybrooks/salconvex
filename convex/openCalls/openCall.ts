import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { internalMutation, mutation, query } from "~/convex/_generated/server";

export const getTotalNumberOfOpenCalls = query({
  handler: async (ctx) => {
    const openCalls = await ctx.db.query("openCalls").collect();

    let active = 0,
      archived = 0,
      draft = 0,
      pending = 0;

    for (const openCall of openCalls) {
      switch (openCall.state) {
        case "submitted":
          pending++;
          break;
        case "published":
          active++;
          break;
        case "archived":
          archived++;
          break;
        case "draft":
          draft++;
          break;
        case "pending":
          pending++;
          break;
      }
    }

    return {
      totalOpenCalls: openCalls.length,
      activeOpenCalls: active,
      archivedOpenCalls: archived,
      draftOpenCalls: draft,
      pendingOpenCalls: pending,
    };
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
        if (event.category !== "event") {
          await ctx.db.patch(event._id, {
            state: "archived",
            lastEditedAt: Date.now(),
          });
        }
      }
    }
  },
});

export const createOrUpdateOpenCall = mutation({
  args: {
    orgId: v.id("organizations"),
    eventId: v.id("events"),
    openCallId: v.optional(v.id("openCalls")),
    basicInfo: v.object({
      appFee: v.number(),
      callFormat: v.union(v.literal("RFQ"), v.literal("RFP"), v.literal("RFA")),
      callType: v.union(
        v.literal("Fixed"),
        v.literal("Rolling"),
        v.literal("Email"),
        v.literal("Invite"),
        v.literal("Unknown"),
        v.literal("False"),
      ),
      dates: v.object({
        ocStart: v.union(v.string(), v.null()),
        ocEnd: v.union(v.string(), v.null()),
        timezone: v.string(),
        edition: v.number(),
        // edition: v.number(), //note-to-self: this is used for the event's edition. Not sure if it's needed here. Could also just take from the event if it is necessary for some reason.
      }),
    }),
    eligibility: v.object({
      type: v.union(
        v.literal("International"),
        v.literal("National"),
        v.literal("Regional/Local"),
        v.literal("Other"),
      ),
      whom: v.array(v.string()),
      details: v.optional(v.string()),
    }),
    compensation: v.object({
      budget: v.object({
        hasBudget: v.boolean(),
        min: v.number(),
        max: v.optional(v.number()),
        rate: v.number(),
        unit: v.union(v.literal("ft²"), v.literal("m²"), v.literal("")),
        currency: v.string(),
        allInclusive: v.boolean(),
        moreInfo: v.optional(v.string()),
      }),

      categories: v.object({
        artistStipend: v.optional(v.union(v.number(), v.boolean())),
        designFee: v.optional(v.union(v.number(), v.boolean())),
        accommodation: v.optional(v.union(v.number(), v.boolean())),
        food: v.optional(v.union(v.number(), v.boolean())),
        travelCosts: v.optional(v.union(v.number(), v.boolean())),
        materials: v.optional(v.union(v.number(), v.boolean())),
        equipment: v.optional(v.union(v.number(), v.boolean())),
      }),
    }),
    requirements: v.object({
      requirements: v.string(),
      more: v.optional(v.string()),
      destination: v.optional(v.string()),
      links: v.array(
        v.object({
          title: v.string(), //same here. I feel like it's valid to ask for what exactly the link is rather than relying on the title. Not sure, though.
          href: v.string(),
        }),
      ),
      applicationLink: v.string(),
      applicationLinkFormat: v.union(
        v.literal("https://"),
        v.literal("mailto:"),
      ),
      applicationLinkSubject: v.optional(v.string()),
      otherInfo: v.optional(v.array(v.string())),
    }),
    documents: v.optional(
      v.array(
        v.object({
          id: v.id("openCallFiles"),
          title: v.string(),
          href: v.string(),
          archived: v.optional(v.boolean()),
        }),
      ),
    ),
    state: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("pending"),
        v.literal("submitted"),
        v.literal("published"),
        v.literal("archived"),
      ),
    ),
    finalStep: v.optional(v.boolean()),
    approved: v.optional(v.boolean()),
    paid: v.optional(v.boolean()),
  },

  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!user) throw new ConvexError("User not found");
    let existingOpenCall = null;
    if (args.openCallId) {
      existingOpenCall = await ctx.db.get(args.openCallId);
    }

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

    const isAdmin = user?.role?.includes("admin");
    // console.log(args.approved, args.finalStep, args.state);
    const ocState = isAdmin
      ? args.finalStep && args.approved
        ? "published"
        : !args.finalStep
          ? "draft"
          : "submitted"
      : args.finalStep && !args.paid
        ? "pending"
        : args.state;

    const openCallData = {
      adminNoteOC: "",
      eventId: args.eventId,
      organizerId: [args.orgId],
      mainOrgId: args.orgId,
      basicInfo: args.basicInfo,
      eligibility: args.eligibility,
      compensation: args.compensation,
      requirements: {
        ...args.requirements,
        links: args.requirements.links ?? [],
      },
      documents: ocDocs,
      state: ocState,
      lastUpdatedBy: userId,
      lastUpdatedAt: Date.now(),
      paid: args.paid ?? false,
      ...(args.approved ? { approvedBy: userId, approvedAt: Date.now() } : {}),
    };

    // Step 1: Lookup already exists — update both openCall and lookup
    const lookup = await ctx.db
      .query("eventOpenCalls")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .unique();
    // console.log("ocId", args.openCallId);
    // console.log("lookup", lookup);

    if (lookup) {
      await ctx.db.patch(lookup.openCallId, openCallData);
      await ctx.db.patch(lookup._id, {
        edition: args.basicInfo.dates.edition,
        state: ocState,
        lastEdited: Date.now(),
      });
      // console.log("lookup updated", lookup, openCallData);
      return openCallData;
    }

    // Step 2: If user provided openCallId, validate and use it
    if (args.openCallId) {
      // console.log("args.openCallId", args.openCallId);
      const existing = await ctx.db.get(args.openCallId);
      // console.log("existing", existing);
      if (existing) {
        await ctx.db.patch(args.openCallId, openCallData);

        await ctx.db.insert("eventOpenCalls", {
          eventId: args.eventId,
          openCallId: args.openCallId,
          edition: args.basicInfo.dates.edition,
          state: ocState,
        });
        // console.log("existing updated", existing, openCallData);
        return openCallData;
      }

      throw new ConvexError("Provided openCallId does not exist.");
    }

    // Step 3: Create new openCall and lookup
    const newId = await ctx.db.insert("openCalls", openCallData);

    await ctx.db.insert("eventOpenCalls", {
      eventId: args.eventId,
      openCallId: newId,
      edition: args.basicInfo.dates.edition,
      state: ocState,
    });

    console.log(openCallData);
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

    //TODO: Is this the best way to handle this? Should there be only one open call per edition/event? Or should there be multiple open calls per edition/event?
    const edition = openCall.basicInfo.dates.edition;
    if (edition === new Date().getFullYear())
      throw new ConvexError(
        "You can't duplicate an open call for the current year",
      );

    const newOpenCall = await ctx.db.insert("openCalls", {
      adminNoteOC: openCall.adminNoteOC,
      eventId: openCall.eventId,
      organizerId: openCall.organizerId,
      mainOrgId: openCall.mainOrgId,
      basicInfo: {
        ...openCall.basicInfo,
        dates: {
          ...openCall.basicInfo.dates,
          edition: new Date().getFullYear(),
        },
      },
      eligibility: {
        ...openCall.eligibility,
        type: openCall.eligibility.type,
        whom: openCall.eligibility.whom,
      },
      compensation: {
        ...openCall.compensation,
      },
      requirements: {
        ...openCall.requirements,
      },
      state: "draft",
      lastUpdatedAt: Date.now(),
      lastUpdatedBy: userId,
    });

    return { openCall: newOpenCall };
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
    const openCall = await ctx.db.get(args.openCallId);
    if (!openCall) return null;
    if (openCall.state !== "draft" && !args.isAdmin)
      throw new ConvexError("Active open calls cannot be deleted");
    const organization = await ctx.db.get(openCall.mainOrgId);
    if (!organization) throw new ConvexError("Organization not found");

    await ctx.db.delete(openCall._id);

    return { openCall };
  },
});

export const changeOCStatus = mutation({
  args: {
    openCallId: v.id("openCalls"),
    newStatus: v.union(
      v.literal("published"),
      v.literal("draft"),
      v.literal("submitted"),
      v.literal("archived"),
    ),
    target: v.optional(
      v.union(v.literal("event"), v.literal("oc"), v.literal("both")),
    ),
  },
  handler: async (ctx, args) => {
    const targetBoth = args.target === "both";
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!user) throw new ConvexError("User not found");
    const isAdmin = user.role.includes("admin");
    if (args.newStatus === "published" && !isAdmin)
      throw new ConvexError("You don't have permission to approve events");
    // if (!isAdmin)
    //   throw new Error("You don't have permission to approve events");
    const oc = await ctx.db.get(args.openCallId);
    if (!oc) throw new ConvexError("Open call not found");
    const eventId = oc.eventId;
    const ocState = args.newStatus || "submitted";
    const approvedBy = isAdmin ? userId : undefined;

    if (targetBoth) {
      await ctx.db.patch(eventId, {
        state: ocState,
        lastEditedAt: Date.now(),
        approvedBy: approvedBy,
        approvedAt: Date.now(),
      });
    } else {
      await ctx.db.patch(eventId, {
        lastEditedAt: Date.now(),
      });
    }
    await ctx.db.patch(oc._id, {
      state: ocState,
      lastUpdatedAt: Date.now(),
      approvedBy: approvedBy,
      approvedAt: Date.now(),
    });

    return { oc };
  },
});
