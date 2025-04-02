import { Artist } from "@/types/artist";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { Doc } from "~/convex/_generated/dataModel";
import { mutation, query } from "~/convex/_generated/server";

export const getArtist = query({
  args: {
    artistId: v.optional(v.id("artists")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const artist = await ctx.db
      .query("artists")
      .withIndex("by_artistId", (q) => q.eq("artistId", userId))
      .unique();
    if (!artist) return null;
    return artist;
  },
});

export const getArtistFull = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const artist = await ctx.db
      .query("artists")
      .withIndex("by_artistId", (q) => q.eq("artistId", userId))
      .unique();
    if (!artist) return null;

    return {
      artist: artist as Artist,
    };
  },
});

export const updateOrCreateArtist = mutation({
  args: {
    artistName: v.optional(v.string()),
    artistNationality: v.optional(v.array(v.string())),
    artistResidency: v.object({
      full: v.optional(v.string()),
      city: v.optional(v.string()),
      state: v.optional(v.string()),
      stateAbbr: v.optional(v.string()),
      country: v.string(),
      countryAbbr: v.string(),
      location: v.array(v.number()),
      timezone: v.string(),
      timezoneOffset: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (!user) {
      throw new ConvexError("User not found");
    }
    const artist = await ctx.db
      .query("artists")
      .withIndex("by_artistId", (q) => q.eq("artistId", userId))
      .unique();

    if (!artist) {
      // If they don't exist, create a new "artist"
      const artistId = await ctx.db.insert("artists", {
        artistId: user._id,
        artistName: args.artistName,
        artistNationality: args.artistNationality,
        artistResidency: args.artistResidency,
        updatedAt: Date.now(),
        lastUpdatedBy: userId,
        completedProfile: false,
        applications: [],
        listActions: [],
      });
      return { artistId };
    }

    // Create a patch object with only the fields that are defined
    const patch: Partial<Doc<"artists">> = {
      updatedAt: Date.now(),
      lastUpdatedBy: userId,
    };

    if ("artistName" in args) patch.artistName = args.artistName;
    if ("artistNationality" in args)
      patch.artistNationality = args.artistNationality;
    if ("artistResidency" in args) patch.artistResidency = args.artistResidency;

    await ctx.db.patch(artist._id, patch);
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

    const applications = artist.applications ?? [];
    const listActions = artist.listActions ?? [];

    return { applications, listActions, artist };
  },
});
