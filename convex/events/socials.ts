import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "~/convex/_generated/api";
import { mutation, query } from "~/convex/_generated/server";
import { upsertNotification } from "~/convex/general/notifications";
import { v } from "convex/values";

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
        ? { postedAt: Date.now(), postedBy: userId }
        : {
            postedAt: undefined,
            postedBy: undefined,
            postPlannedDate: undefined,
          }),
    });

    await ctx.runMutation(internal.events.eventLookup.updateLookupPostStatus, {
      eventId: args.eventId,
      posted: args.posted ?? undefined,
    });
    if (args.posted === "toPost" && !event.postPlannedDate) {
      await upsertNotification(ctx, {
        type: "newSocial",
        userId: null,
        targetRole: "admin",
        importance: "medium",
        redirectUrl: `/dashboard/admin/socials?id=${event._id}`,
        displayText: "New Unscheduled Social Post",
        dedupeKey: `social-${event._id}`,
      });
    }
  },
});

export const updateSocialPostPlannedDate = mutation({
  args: {
    eventId: v.id("events"),
    plannedDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    console.log(args);
    const userId = await getAuthUserId(ctx);

    const user = userId ? await ctx.db.get(userId) : null;
    if (!user) return null;
    const event = await ctx.db.get(args.eventId);
    if (!event) return null;
    const isAdmin = user.role.includes("admin");
    if (!isAdmin) return null;

    console.log(args.plannedDate, args.eventId);

    await ctx.db.patch(event._id, {
      postPlannedDate: args.plannedDate,
    });

    await upsertNotification(ctx, {
      type: "socialUpdated",
      userId: null,
      targetRole: "admin",
      importance: "medium",
      redirectUrl: `/dashboard/admin/socials?id=${event._id}`,
      displayText: "New Social Event Planned",
      dedupeKey: `social-${event._id}`,
    });
  },
});

export const updateEventNotes = mutation({
  args: {
    eventId: v.id("events"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const user = userId ? await ctx.db.get(userId) : null;
    if (!user) return { success: false, error: "User not found" };
    const isAdmin = user.role.includes("admin");
    if (!isAdmin)
      return {
        success: false,
        error: "You don't have permission to update this event",
      };
    const event = await ctx.db.get(args.eventId);
    if (!event) return null;

    await ctx.db.patch(event._id, {
      adminNote: args.notes,
      lastEditedAt: Date.now(),
    });
  },
});

export const getEventsForSocials = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { success: false, error: "Not authenticated" };
    const user = await ctx.db.get(userId);
    if (!user) return { success: false, error: "User not found" };
    const isAdmin = user.role.includes("admin");
    if (!isAdmin)
      return {
        success: false,
        error: "You don't have permission to view this",
      };
    const socialsEvents = await ctx.db
      .query("events")
      .withIndex("by_posted", (q) => q.gt("posted", undefined))
      .order("asc")
      .collect();

    const enrichedSocialsEvents = await Promise.all(
      socialsEvents.map(async (event) => {
        const openCalls = await ctx.db
          .query("openCalls")
          .withIndex("by_eventId", (q) => q.eq("eventId", event._id))
          .collect();

        return {
          id: event._id,
          name: event.name,
          slug: event.slug,
          edition: event.dates.edition,
          deadline: openCalls[0]?.basicInfo?.dates?.ocEnd,
          postDate: event.postedAt,
          plannedDate: event.postPlannedDate,
          posted: event.posted,
          notes: event.adminNote,
          createdAt: event._creationTime,
        };
      }),
    );

    return { success: true, data: enrichedSocialsEvents, error: null };
  },
});

export const getNumberOfQueuedEvents = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { success: false, error: "Not authenticated" };
    const user = await ctx.db.get(userId);
    if (!user) return { success: false, error: "User not found" };
    const isAdmin = user.role.includes("admin");
    if (!isAdmin)
      return {
        success: false,
        error: "You don't have permission to view this",
      };
    const socialsEvents = await ctx.db
      .query("events")
      .withIndex("by_posted_postPlannedDate", (q) =>
        q.eq("posted", "toPost").gt("postPlannedDate", undefined),
      )
      .order("asc")
      .collect();

    const numberOfQueuedEvents = socialsEvents.length ?? 0;

    return { success: true, data: numberOfQueuedEvents, error: null };
  },
});
