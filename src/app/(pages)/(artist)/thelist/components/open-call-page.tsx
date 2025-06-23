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
import { ConvexError } from "convex/values";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { api } from "~/convex/_generated/api";

const OpenCallDetail = () => {
  const hasRedirected = useRef(false);

  const { preloadedUserData } = useConvexPreload();
  const userData = usePreloadedQuery(preloadedUserData);
  const userPref = userData?.userPref ?? null;

  const useQueryWithStatus = makeUseQueryWithStatus(useQueries);

  const router = useRouter();
  const { slug, year } = useParams();
  const slugValue = Array.isArray(slug) ? slug[0] : slug;

  const { data, isError, error } = useQueryWithStatus(
    api.events.event.getEventWithOCDetails,
    slugValue
      ? { slug: slugValue, edition: Number(year), source: "ocpage" }
      : "skip",
  );

  const artistData = useQuery(api.artists.artistActions.getArtistFull);

  useEffect(() => {
    if (isError && !hasRedirected.current) {
      hasRedirected.current = true;

      if (error instanceof ConvexError) {
        if (error.data === "Open Call not found") {
          const currentPath = window.location.pathname;
          const newPath = currentPath.slice(0, -"/call".length);
          router.push(newPath);
        } else {
          router.push("/404");
        }
      } else {
        router.push("/404");
      }
    }
  }, [isError, router, error]);

  // useEffect(() => {
  //   if (data?.event?.name) {
  //     document.title = `${capitalize(data.event.name)} | Open Call - ${document.title}`;
  //   } else {
  //     document.title = `Open Call | ${document.title}`;
  //   }
  // }, [data?.event?.name]);

  return (
    // <OpenCallDetailWrapper>
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
          {/* Loading <LoaderCircle className="animate-spin" /> */}
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
    // </OpenCallDetailWrapper>
  );
};

export default OpenCallDetail;
