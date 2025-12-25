"use client";

import type { Preloaded } from "convex/react";

import { EventSkeleton } from "@/components/ui/skeleton";
import { SalBackNavigation } from "@/features/events/components/sal-back-navigation";
import { OrganizerCardDetailDesktop } from "@/features/organizers/organizer-detail/desktop/organizer-card-detail-desktop";
import { OrganizerCardDetailMobile } from "@/features/organizers/organizer-detail/mobile/organizer-card-detail-mobile";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";

import { api } from "~/convex/_generated/api";
import { usePreloadedQuery } from "convex/react";

type OrganizerDetailProps = {
  preloaded: Preloaded<typeof api.organizer.organizations.getOrganizerBySlug>;
};

const OrganizerDetail = ({ preloaded }: OrganizerDetailProps) => {
  const data = usePreloadedQuery(preloaded);
  const { preloadedSubStatus, preloadedUserData } = useConvexPreload();
  const subData = usePreloadedQuery(preloadedSubStatus);
  const userData = usePreloadedQuery(preloadedUserData);
  const user = userData?.user ?? null;
  const isAdmin = user?.role?.includes("admin") || false;
  const hasActiveSubscription =
    (subData?.hasActiveSubscription || isAdmin) ?? false;

  // const artistData = useQuery(api.artists.artistActions.getArtistFull);
  const isOwner = user?._id === data?.organizer?.ownerId;

  return (
    <>
      <SalBackNavigation
        format="mobile"
        user={user}
        activeSub={hasActiveSubscription}
        isOwner={isOwner}
      />

      {!data ? (
        <EventSkeleton />
      ) : (
        <>
          <OrganizerCardDetailMobile data={data} className="lg:hidden" />
          <OrganizerCardDetailDesktop data={data} className="hidden lg:block" />
        </>
      )}
    </>
  );
};

export default OrganizerDetail;
