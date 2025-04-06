"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { OpenCallCardDetailDesktop } from "@/features/events/open-calls/desktop/opencall-card-detail-desktop";
import { OpenCallCardDetailMobile } from "@/features/events/open-calls/mobile/opencall-card-detail-mobile";
import { useQuery } from "convex-helpers/react/cache";
import { useParams, useRouter } from "next/navigation";
import { IoIosArrowRoundBack } from "react-icons/io";
import { api } from "~/convex/_generated/api";

const OpenCallDetail = () => {
  const router = useRouter();
  const { slug, year } = useParams();
  const slugValue = Array.isArray(slug) ? slug[0] : slug;

  const data = useQuery(
    api.events.event.getEventWithAppDetails,
    slugValue ? { slug: slugValue, edition: Number(year) } : "skip",
  );

  const artistData = useQuery(api.artists.artistActions.getArtistFull);

  const onBackClick = () => {
    const previous = sessionStorage.getItem("previousSalPage");
    //  console.log(previous); //note-to-self: annoying as it doesn't actually save the full pagth. I'm using it as a flag, for now.
    if (previous && previous.startsWith("/")) {
      router.back();
    } else {
      router.push("/thelist");
    }
  };
  //todo: add userPref check to get timezone if it exists. If not, use the timezone from the open call.

  // console.log("call data", data);

  // const allEvents = useEventDetailCards();
  // const event = allEvents.find((e) => e.id === id);
  return (
    <div className="flex flex-col items-center px-4">
      <div
        onClick={onBackClick}
        className="flex cursor-pointer items-center justify-start gap-x-2 py-6 underline-offset-2 hover:underline md:hidden"
      >
        <IoIosArrowRoundBack className="size-6" /> back to The List
      </div>
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
          />
          <OpenCallCardDetailDesktop
            data={data}
            artist={artistData?.artist}
            className="hidden lg:block"
            // application={applicationData?.application}
          />
        </>
      )}
    </div>
  );
};

export default OpenCallDetail;
