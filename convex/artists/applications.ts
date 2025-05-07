import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { query } from "~/convex/_generated/server";

export const getArtistApplication = query({
  args: {
    eventId: v.optional(v.id("events")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const artist = await ctx.db
      .query("artists")
      .withIndex("by_artistId", (q) => q.eq("artistId", userId))
      .unique();
    if (!artist) return null;

    const applications = await ctx.db
      .query("applications")
      .withIndex("by_artistId", (q) => q.eq("artistId", userId))
      .collect();

    return applications;
  },
});

export const getArtistApplications = query({
  // args: {
  //   artistId: v.optional(v.id("artists")),
  // },
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const artist = await ctx.db
      .query("artists")
      .withIndex("by_artistId", (q) => q.eq("artistId", userId))
      .unique();
    if (!artist) return null;

    const applications = await ctx.db
      .query("applications")
      .withIndex("by_artistId", (q) => q.eq("artistId", userId))
      .collect();

    const listActions = await ctx.db
      .query("listActions")
      .withIndex("by_artistId", (q) => q.eq("artistId", userId))
      .collect();

    return { applications, listActions, artist };
  },
});
