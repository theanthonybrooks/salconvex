import { ApplicationStatus } from "@/types/applications";
import { ArtistFull } from "@/types/artist";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { Doc, Id } from "~/convex/_generated/dataModel";
import { mutation, query } from "~/convex/_generated/server";

export const updateOrCreateArtist = mutation({
  args: {
    artistName: v.optional(v.string()),
    // artistLogo: v.optional(v.string()),
    artistLogoStorageId: v.optional(v.id("_storage")),
    artistNationality: v.optional(v.array(v.string())),
    artistResidency: v.object({
      full: v.optional(v.string()),
      locale: v.optional(v.string()),
      city: v.optional(v.string()),
      region: v.optional(v.string()),
      state: v.optional(v.string()),
      stateAbbr: v.optional(v.string()),
      country: v.string(),
      countryAbbr: v.string(),
      continent: v.optional(v.string()),
      location: v.array(v.number()),
      timezone: v.string(),
      timezoneOffset: v.optional(v.number()),
      currency: v.optional(
        v.object({
          code: v.string(),
          name: v.string(),
          symbol: v.string(),
          format: v.optional(v.string()),
        }),
      ),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    let fileUrl = null;
    if (!userId) throw new ConvexError("Not authenticated");
    if (args.artistLogoStorageId) {
      fileUrl = await ctx.storage.getUrl(args.artistLogoStorageId);
    }
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
    if (fileUrl) {
      await ctx.db.patch(user._id, {
        image: fileUrl,
        imageStorageId: args.artistLogoStorageId,
      });
    }

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

    const applications = await ctx.db
      .query("applications")
      .withIndex("by_artistId", (q) => q.eq("artistId", userId))
      .collect();

    const listActions = await ctx.db
      .query("listActions")
      .withIndex("by_artistId", (q) => q.eq("artistId", userId))
      .collect();

    const joinedArtist = {
      ...artist,
      applications,
      listActions,
    };

    return {
      artist: joinedArtist as ArtistFull,
    };
  },
});

export const artistApplicationActions = mutation({
  args: {
    openCallId: v.id("openCalls"),
    manualApplied: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const openCallId = args.openCallId;
    const hasApplied = args.manualApplied;

    if (!userId) throw new ConvexError("Not authenticated");

    const application = await ctx.db
      .query("applications")
      .withIndex("by_openCallId", (q) => q.eq("openCallId", openCallId))
      .filter((q) => q.eq(q.field("artistId"), userId))
      .unique();

    if (hasApplied) {
      if (!application) {
        await ctx.db.insert("applications", {
          openCallId,
          applicationTime: hasApplied ? Date.now() : undefined,
          artistId: userId,
          manualApplied: hasApplied ?? false,
          ...(hasApplied ? { applicationStatus: "applied" } : {}),
        });
      } else {
        await ctx.db.patch(application._id, {
          manualApplied: hasApplied ?? false,
          applicationTime: hasApplied ? Date.now() : undefined,
          applicationStatus: hasApplied ? "applied" : undefined,
        });
      }
    } else {
      if (application) {
        await ctx.db.delete(application._id);
      }
    }
  },
});

export const artistListActions = mutation({
  args: {
    eventId: v.id("events"),
    hidden: v.optional(v.boolean()),
    bookmarked: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const artist = await ctx.db
      .query("artists")
      .withIndex("by_artistId", (q) => q.eq("artistId", userId))
      .unique();

    if (!artist) {
      throw new ConvexError("User not found");
    }

    await ctx.db.patch(artist._id, {
      updatedAt: Date.now(),
      lastUpdatedBy: userId,
    });

    const listEvent = await ctx.db
      .query("listActions")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .filter((q) => q.eq(q.field("artistId"), userId))
      .unique();

    if (listEvent) {
      await ctx.db.patch(listEvent._id, {
        ...(args.hidden !== undefined && { hidden: args.hidden }),
        ...(args.bookmarked !== undefined && { bookmarked: args.bookmarked }),
      });
    } else {
      await ctx.db.insert("listActions", {
        eventId: args.eventId,
        artistId: userId,
        hidden: args.hidden ?? false,
        bookmarked: args.bookmarked ?? false,
      });
    }
  },
});

export type ArtistEventMetadata = {
  bookmarked: Id<"events">[];
  hidden: Id<"events">[];
  applied: Id<"events">[];
  artistNationality: string[];
  applicationData: Record<
    Id<"openCalls">,
    {
      status: ApplicationStatus | null;
      manualApplied: boolean;
    }
  >;
};
