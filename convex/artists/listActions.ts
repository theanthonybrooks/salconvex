import { getAuthUserId } from "@convex-dev/auth/server";
import { getAll } from "convex-helpers/server/relationships";
import { query } from "~/convex/_generated/server";

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

    const bookmarkedIds = listActions
      .filter((a) => a.bookmarked)
      .map((a) => a.eventId);

    if (bookmarkedIds.length === 0) return [];

    const events = await getAll(ctx.db, bookmarkedIds);
    return events
      .filter((e) => e !== null)
      .map((e) => ({
        ...e,
        edition: e.dates.edition,
        eventStart: e.dates.eventDates[0].start ?? "",
        eventEnd: e.dates.eventDates?.at(-1)?.end ?? "",
        prodStart: e.dates.prodDates?.[0]?.start ?? "",
        prodEnd: e.dates.prodDates?.at(-1)?.end ?? "",
        bookmarkStatus: true,
        slug: e.slug,
      }));
  },
});
