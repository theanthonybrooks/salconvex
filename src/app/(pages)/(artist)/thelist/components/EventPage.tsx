"use client";

import type { Preloaded } from "convex/react";

import { EventSkeleton } from "@/components/ui/skeleton";
import { SalBackNavigation } from "@/features/events/components/sal-back-navigation";
import { EventCardDetailDesktop } from "@/features/events/event-detail/desktop/event-card-detail-desktop";
import { EventCardDetailMobile } from "@/features/events/event-detail/mobile/event-card-detail-mobile";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";

import { api } from "~/convex/_generated/api";
import { useQuery } from "convex-helpers/react/cache";
import { usePreloadedQuery } from "convex/react";

type EventDetailProps = {
  preloaded: Preloaded<typeof api.events.event.getEventBySlug>;
};

const EventDetail = ({ preloaded }: EventDetailProps) => {
  const data = usePreloadedQuery(preloaded);
  const { preloadedUserData } = useConvexPreload();
  // const subData = usePreloadedQuery(preloadedSubStatus);
  const userData = usePreloadedQuery(preloadedUserData);
  const { user, userPref } = userData ?? {};
  // const isAdmin = user?.role?.includes("admin") || false;

  // const hasActiveSubscription =
  //   (subData?.hasActiveSubscription || isAdmin) ?? false;

  const artistData = useQuery(api.artists.artistActions.getArtistFull);
  const artist = artistData?.artist;
  const isOwner = user?._id === data.organizer.ownerId;

  return (
    <>
      <SalBackNavigation
        format="mobile"
        user={user ?? null}
        // activeSub={hasActiveSubscription}
        orgId={data.organizer._id}
        isOwner={isOwner}
      />

      {!data ? (
        <EventSkeleton />
      ) : (
        <>
          <EventCardDetailMobile
            data={data}
            userPref={userPref ?? null}
            artist={artist}
            className="lg:hidden"
          />
          <EventCardDetailDesktop
            data={data}
            userPref={userPref ?? null}
            artist={artist}
            className="hidden lg:block"
          />
        </>
      )}
    </>
  );
};

export default EventDetail;
