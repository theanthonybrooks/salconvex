import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "~/convex/_generated/dataModel";
import { query } from "~/convex/_generated/server";
import schema from "~/convex/schema";
import { mergedStream, stream } from "convex-helpers/server/stream";

export const getActiveArtists = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    if (!user?.role?.includes("admin")) return null;
    const activeSubs = [];
    activeSubs.push(
      stream(ctx.db, schema)
        .query("userSubscriptions")
        .withIndex("by_status", (q) => q.eq("status", "active"))
        .order("desc"),
    );
    activeSubs.push(
      stream(ctx.db, schema)
        .query("userSubscriptions")
        .withIndex("by_status", (q) => q.eq("status", "trialing"))
        .order("desc"),
    );
    const mergedSubs = mergedStream(activeSubs, ["status"]);
    const subs = await mergedSubs.collect();
    const filteredSubs = subs.filter((sub) => sub.cancelAt === undefined);
    const artists = (
      await Promise.all(
        filteredSubs.map(async (sub) => {
          const artist = await ctx.db
            .query("artists")
            .withIndex("by_artistId", (q) =>
              q.eq("artistId", sub.userId as Id<"users">),
            )
            .first();
          if (!artist) return null;
          return {
            artistId: artist._id,
            name: artist.artistName ?? "",
            nationality: artist.artistNationality ?? [],
            instagram: artist.contact?.instagram ?? "",
            website: artist.contact?.website ?? "",
            canFeature: artist.canFeature ?? false,
            feature: artist.feature ?? "none",
            notes: artist.notes ?? "",
            createdAt: artist._creationTime,
          };
        }),
      )
    ).filter((a) => a !== null);

    return artists;
  },
});
