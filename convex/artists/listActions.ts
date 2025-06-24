import {
  ApplicationStatus,
  positiveApplicationStatuses,
} from "@/types/applications";
import { getAuthUserId } from "@convex-dev/auth/server";
import { getAll } from "convex-helpers/server/relationships";
import { v } from "convex/values";
import { mutation, query } from "~/convex/_generated/server";

export const getHiddenEvents = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!user) return null;

    const isAdmin = user.role.includes("admin");

    const artist = await ctx.db
      .query("artists")
      .withIndex("by_artistId", (q) => q.eq("artistId", user._id))
      .unique();
    if (!artist) return null;

    const subscription = await ctx.db
      .query("userSubscriptions")
      .withIndex("userId", (q) => q.eq("userId", user._id))
      .first();

    const hasActiveSubscription =
      subscription?.status === "active" || subscription?.status === "trialing";
    //TODO: Unsure if I want to show the user their bookmarked/hidden events if they don't have a subscription. I think I'll leave it out for now.
    if (!hasActiveSubscription && !isAdmin) return null;

    const listActions = await ctx.db
      .query("listActions")
      .withIndex("by_artistId", (q) => q.eq("artistId", user._id))
      .collect();

    const hiddenIds = listActions.filter((a) => a.hidden).map((a) => a.eventId);

    if (hiddenIds.length === 0) return [];

    const events = await getAll(ctx.db, hiddenIds);
    return events
      .filter((e) => e !== null)
      .map((e) => ({
        ...e,
        edition: e.dates.edition,
        category: e.category,
        type: e.type,
        hiddenStatus: true,
        slug: e.slug,
      }));
  },
});

export const getBookmarkedEvents = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!user) return null;

    const isAdmin = user.role.includes("admin");

    const artist = await ctx.db
      .query("artists")
      .withIndex("by_artistId", (q) => q.eq("artistId", user._id))
      .unique();
    if (!artist) return null;

    const subscription = await ctx.db
      .query("userSubscriptions")
      .withIndex("userId", (q) => q.eq("userId", user._id))
      .first();

    const hasActiveSubscription =
      subscription?.status === "active" || subscription?.status === "trialing";
    //TODO: Unsure if I want to show the user their bookmarked/hidden events if they don't have a subscription. I think I'll leave it out for now.
    if (!hasActiveSubscription && !isAdmin) return null;

    const listActions = await ctx.db
      .query("listActions")
      .withIndex("by_artistId", (q) => q.eq("artistId", user._id))
      .collect();

    const bookmarkedEvents = listActions
      .filter((a) => a.bookmarked)
      .map((a) => a.eventId);

    return bookmarkedEvents;
  },
});

export const getBookmarkedEventsWithDetails = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!user) return null;
    const userPreferences = await ctx.db
      .query("userPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    const userTimeZone = userPreferences?.timezone;

    const isAdmin = user.role.includes("admin");

    const artist = await ctx.db
      .query("artists")
      .withIndex("by_artistId", (q) => q.eq("artistId", user._id))
      .unique();
    if (!artist) return null;

    const subscription = await ctx.db
      .query("userSubscriptions")
      .withIndex("userId", (q) => q.eq("userId", user._id))
      .first();

    const hasActiveSubscription =
      subscription?.status === "active" || subscription?.status === "trialing";

    if (!hasActiveSubscription && !isAdmin) return null;

    const listActions = await ctx.db
      .query("listActions")
      .withIndex("by_artistId", (q) => q.eq("artistId", user._id))
      .collect();

    const bookmarkedMap = new Map(
      listActions
        .filter((a) => a.bookmarked)
        .map((a) => [
          a.eventId,
          {
            eventIntent: a.eventIntent,
            bookmarkNote: a.bookmarkNote,
          },
        ]),
    );

    const bookmarkedIds = Array.from(bookmarkedMap.keys());
    if (bookmarkedIds.length === 0) return [];

    const events = await getAll(ctx.db, bookmarkedIds);
    const nonNullEvents = events.filter(
      (e): e is NonNullable<typeof e> => e !== null,
    );

    const result = [];
    for (const event of nonNullEvents) {
      const metadata = bookmarkedMap.get(event._id);
      let applicationStatus: string | null = null;
      let eventIntent: string = "";
      let deadline: string = "-";
      let isPast: boolean = false;

      if (metadata?.eventIntent) eventIntent = metadata.eventIntent;

      const openCall = await ctx.db
        .query("openCalls")
        .withIndex("by_eventId", (q) => q.eq("eventId", event._id))
        .first();

      if (openCall) {
        deadline = openCall.basicInfo.dates.ocEnd ?? "-";
        const now = new Date();
        const deadlineDate = new Date(deadline);
        isPast = now > deadlineDate;

        const application = await ctx.db
          .query("applications")
          .withIndex("by_openCallId", (q) => q.eq("openCallId", openCall._id))
          .filter((q) => q.eq(q.field("artistId"), user._id))
          .unique();

        if (application) {
          applicationStatus =
            application.applicationStatus as ApplicationStatus;
          if (
            application.applicationStatus &&
            positiveApplicationStatuses.includes(application.applicationStatus)
          ) {
            eventIntent = application.applicationStatus;
          } else if (application.applicationStatus === "rejected") {
            eventIntent = "rejected";
          }
        } else if (!application && isPast && eventIntent === "planned") {
          eventIntent = "missed";
        }
      }

      result.push({
        ...event,
        edition: event.dates.edition,
        eventStart: event.dates.eventDates[0].start ?? "-",
        eventEnd: event.dates.eventDates?.at(-1)?.end ?? "-",
        prodStart: event.dates.prodDates?.[0]?.start ?? "-",
        prodEnd: event.dates.prodDates?.at(-1)?.end ?? "-",
        deadline,
        isPast,
        timeZone: userTimeZone || openCall?.basicInfo.dates.timezone || "UTC",
        bookmarkStatus: true,
        slug: event.slug,
        eventIntent,
        bookmarkNote: metadata?.bookmarkNote ?? "",
        applicationStatus,
      });
    }
    return result;
  },
});

export const updateBookmark = mutation({
  args: {
    eventId: v.id("events"),
    notes: v.optional(v.string()),
    intent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // console.log(args);
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!user) return null;

    const bookmark = await ctx.db
      .query("listActions")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .filter((q) => q.eq(q.field("artistId"), user._id))
      .unique();
    if (!bookmark) return null;
    await ctx.db.patch(bookmark._id, {
      ...(args.notes !== undefined && { bookmarkNote: args.notes }),
      ...(args.intent !== undefined && {
        eventIntent: args.intent !== "-" ? args.intent : undefined,
      }),
    });
  },
});
