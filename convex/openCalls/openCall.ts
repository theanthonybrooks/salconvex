import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { mutation, query } from "~/convex/_generated/server";

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
    });

    return { oc };
  },
});
