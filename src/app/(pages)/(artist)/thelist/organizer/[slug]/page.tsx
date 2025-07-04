"use client";

import { Link } from "@/components/ui/custom-link";
import { Skeleton } from "@/components/ui/skeleton";
import { supportEmail } from "@/constants/siteInfo";
import { SalBackNavigation } from "@/features/events/components/sal-back-navigation";
import { OrganizerCardDetailDesktop } from "@/features/organizers/organizer-detail/desktop/organizer-card-detail-desktop";
import { OrganizerCardDetailMobile } from "@/features/organizers/organizer-detail/mobile/organizer-card-detail-mobile";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { makeUseQueryWithStatus } from "convex-helpers/react";
import { useQueries, useQuery } from "convex-helpers/react/cache";
import { usePreloadedQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { useParams, useRouter } from "next/navigation";
import { api } from "~/convex/_generated/api";

const Event = () => {
  const { preloadedSubStatus, preloadedUserData } = useConvexPreload();

  const subData = usePreloadedQuery(preloadedSubStatus);
  const userData = usePreloadedQuery(preloadedUserData);
  const user = userData?.user ?? null;
  const isAdmin = user?.role?.includes("admin") || false;
  const hasActiveSubscription =
    (subData?.hasActiveSubscription || isAdmin) ?? false;
  const router = useRouter();
  const { slug } = useParams();
  const slugValue = Array.isArray(slug) ? slug[0] : slug;
  const useQueryWithStatus = makeUseQueryWithStatus(useQueries);
  const { data, isError, error } = useQueryWithStatus(
    api.organizer.organizations.getOrganizerBySlug,
    slugValue ? { slug: slugValue } : "skip",
  );

  const artistData = useQuery(api.artists.artistActions.getArtistFull);

  const artist = artistData?.artist;
  const isOwner = user?._id === data?.organizer?.ownerId;

  // const allEvents = useEventDetailCards();
  // const event = allEvents.find((e) => e.id === id);

  if (isError) {
    if (error instanceof ConvexError) {
      if (error.data === "No organizer found") {
        return (
          <div className="flex flex-col items-center gap-2">
            <p className="text-lg font-bold">Organizer not found</p>
            <p>
              If you think this is an error, please{" "}
              <Link
                href={`mailto:${supportEmail}?Subject=Missing Organization`}
              >
                contact support
              </Link>
              .
            </p>
          </div>
        );
      } else if (error.data === "Organizer is not complete") {
        return (
          <div className="flex flex-col items-center gap-2">
            <p className="text-lg font-bold">
              You haven&apos;t added any events or open calls yet.
            </p>
            <p className="text-sm">
              Please{" "}
              <Link href="/pricing?submit" className="font-bold">
                do so
              </Link>{" "}
              to make your organization&apos;s profile public.
            </p>
            <p className="text-sm">
              If you think this is an error, please{" "}
              <Link
                href={`mailto:${supportEmail}?Subject=Missing Organization`}
              >
                contact support
              </Link>
              .
            </p>
          </div>
        );
      }
    } else {
      router.push("/thelist");
    }
  }

  return (
    <>
      <SalBackNavigation
        format="mobile"
        user={user}
        activeSub={hasActiveSubscription}
        isOwner={isOwner}
      />
      {!data ? (
        // <p>Event: {data?.event.name}</p>
        <div className="flex min-h-screen w-full max-w-[min(90vw,1400px)] flex-col gap-6 pb-10 xl:grid xl:grid-cols-[300px_auto] xl:grid-rows-[60px_auto] xl:gap-y-0">
          <Skeleton className="col-start-1 row-span-1 mx-auto hidden h-10 w-full rounded-xl bg-black/20 md:block md:w-1/2 xl:w-full" />
          <Skeleton className="relative col-start-1 h-dvh w-full rounded-xl bg-black/20 font-black text-background xl:h-full">
            <p className="absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2 text-center text-[3rem] font-black text-background md:text-[6rem] xl:hidden">
              Loading...
            </p>
          </Skeleton>
          <Skeleton className="relative col-start-2 h-full w-full rounded-xl bg-black/20">
            <p className="absolute left-1/2 top-1/4 hidden -translate-x-1/2 -translate-y-1/2 text-center text-[6rem] font-black text-background md:block">
              Loading...
            </p>
          </Skeleton>
          {/* Loading <LoaderCircle className="animate-spin" /> */}
        </div>
      ) : (
        <>
          <OrganizerCardDetailMobile
            data={data}
            artist={artist}
            className="lg:hidden"
          />
          <OrganizerCardDetailDesktop
            data={data}
            artist={artist}
            className="hidden lg:block"
          />
        </>
      )}
    </>
  );
};

export default Event;
