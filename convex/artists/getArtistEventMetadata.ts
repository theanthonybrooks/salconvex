import { ApplicationStatus } from "@/types/applications";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "~/convex/_generated/dataModel";
import { query } from "~/convex/_generated/server";

export type ArtistEventMetadata = {
  bookmarked: Id<"events">[];
  hidden: Id<"events">[];
  applied: Id<"events">[];
  artistNationality: string[];
  artistCountries: string[];
  applicationData: Record<
    Id<"openCalls">,
    {
      status: ApplicationStatus | null;
      manualApplied: boolean;
    }
  >;
};

export const getArtistEventMetadata = query({
  args: {},
  handler: async (ctx): Promise<ArtistEventMetadata | null> => {
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
    const artistCountries = [
      ...(artist?.artistNationality ?? []),
      ...(artist?.artistResidency?.country
        ? [artist.artistResidency.country]
        : []),
    ];

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

    const bookmarked: Id<"events">[] = listActions
      .filter((a) => a.bookmarked)
      .map((a) => a.eventId);

    const hidden: Id<"events">[] = listActions
      .filter((a) => a.hidden)
      .map((a) => a.eventId);

    const applications = await ctx.db
      .query("applications")
      .withIndex("by_artistId", (q) => q.eq("artistId", user._id))
      .collect();

    const applied: Id<"events">[] = [];
    const applicationData: Record<
      Id<"openCalls">,
      { status: string | null; manualApplied: boolean }
    > = {};

    for (const app of applications) {
      const oc = await ctx.db.get(app.openCallId);
      if (oc?.eventId) {
        applied.push(oc.eventId);
        applicationData[oc._id] = {
          status: app.applicationStatus ?? null,
          manualApplied: app.manualApplied ?? false,
        };
      }
    }

    return {
      bookmarked,
      hidden,
      applied,
      artistNationality: artistCountries,
      artistCountries,
      applicationData,
    };
  },
});
