import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "~/convex/_generated/server";

export const getArtistInfo = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const artist = await ctx.db
      .query("artists")
      .withIndex("by_artistId", (q) => q.eq("artistId", userId))
      .first();
    if (!artist) return null;

    return {
      artist: {
        ...artist,
      },
    };
  },
});
