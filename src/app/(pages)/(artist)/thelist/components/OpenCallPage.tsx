"use client";

import type { Preloaded } from "convex/react";

import { EventSkeleton } from "@/components/ui/skeleton";
import { SalBackNavigation } from "@/features/events/components/sal-back-navigation";
import { OpenCallCardDetailDesktop } from "@/features/events/open-calls/desktop/opencall-card-detail-desktop";
import { OpenCallCardDetailMobile } from "@/features/events/open-calls/mobile/opencall-card-detail-mobile";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";

import { api } from "~/convex/_generated/api";
import { useQuery } from "convex-helpers/react/cache";
import { usePreloadedQuery } from "convex/react";

type OpenCallDetailProps = {
  preloaded: Preloaded<typeof api.events.event.getEventWithOCDetails>;
};

const OpenCallDetail = ({ preloaded }: OpenCallDetailProps) => {
  const data = usePreloadedQuery(preloaded);
  const { preloadedUserData } = useConvexPreload();
  const userData = usePreloadedQuery(preloadedUserData);

  const user = userData?.user ?? null;

  const userPref = userData?.userPref ?? null;

  const artistData = useQuery(api.artists.artistActions.getArtistFull);
  const isOwner =
    user?._id === data?.organizer?.ownerId ||
    Boolean(user && data?.organizer?.allowedEditors.includes(user._id));

  return (
    <>
      <SalBackNavigation
        format="mobile"
        user={user}
        isOwner={isOwner}
        orgId={data?.organizer?._id}
        // activeSub={hasActiveSubscription}
      />
      {!data ? (
        <EventSkeleton />
      ) : (
        <>
          <OpenCallCardDetailMobile
            data={data}
            artist={artistData?.artist}
            className="lg:hidden"
            userPref={userPref}
          />
          <OpenCallCardDetailDesktop
            data={data}
            artist={artistData?.artist}
            className="hidden lg:block"
            userPref={userPref}
          />
        </>
      )}
    </>
    // </OpenCallDetailWrapper>
  );
};

export default OpenCallDetail;
