"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { SalBackNavigation } from "@/features/events/components/sal-back-navigation";
import { OpenCallCardDetailDesktop } from "@/features/events/open-calls/desktop/opencall-card-detail-desktop";
import { OpenCallCardDetailMobile } from "@/features/events/open-calls/mobile/opencall-card-detail-mobile";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { makeUseQueryWithStatus } from "convex-helpers/react";
import { useQuery } from "convex-helpers/react/cache";
import { useQueries } from "convex-helpers/react/cache/hooks";
import { usePreloadedQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { api } from "~/convex/_generated/api";

const OpenCallDetail = () => {
  const { preloadedUserData } = useConvexPreload();
  const userData = usePreloadedQuery(preloadedUserData);
  const userPref = userData?.userPref ?? null;

  const useQueryWithStatus = makeUseQueryWithStatus(useQueries);

  const router = useRouter();
  const { slug, year } = useParams();
  const slugValue = Array.isArray(slug) ? slug[0] : slug;

  const { data, isError } = useQueryWithStatus(
    api.events.event.getEventWithAppDetails,
    slugValue ? { slug: slugValue, edition: Number(year) } : "skip",
  );

  const artistData = useQuery(api.artists.artistActions.getArtistFull);

  //todo: add userPref check to get timezone if it exists. If not, use the timezone from the open call.

  // window.addEventListener("beforeunload", () => {
  //   sessionStorage.removeItem("previousSalPage");
  // });

  // window.addEventListener("pagehide", () => {
  //   sessionStorage.removeItem("previousSalPage");
  // });

  // console.log("call data", data);

  // const allEvents = useEventDetailCards();
  // const event = allEvents.find((e) => e.id === id);
  useEffect(() => {
    if (isError) {
      router.push("/404");
    }
  }, [isError, router]);
  return (
    <>
      <SalBackNavigation format="mobile" />

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
          {/* Loading <LoaderPinwheel className="animate-spin" /> */}
        </div>
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
            // application={applicationData?.application}
          />
        </>
      )}
    </>
  );
};

export default OpenCallDetail;
