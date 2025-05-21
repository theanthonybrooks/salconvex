import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { Doc, Id } from "~/convex/_generated/dataModel";
import { mutation, query } from "~/convex/_generated/server";

export const getHiddenEvents = query({
  args: {
    artistId: v.id("artists"),
  },
  handler: async (ctx, args) => {
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

    const hiddenEvents = listActions.filter((a) => a.hidden).map((a) => a.eventId);

    return hiddenEvents;
  },
});

export const getBookmarkedEvents = query({
  args: {
    artistId: v.id("artists"),
  },
  handler: async (ctx, args) => {
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