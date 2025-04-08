"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { EventCardDetailDesktop } from "@/features/events/event-detail/desktop/event-card-detail-desktop";
import { EventCardDetailMobile } from "@/features/events/event-detail/mobile/event-card-detail-mobile";
import { useQuery } from "convex-helpers/react/cache";
import { useParams, useRouter } from "next/navigation";
import { IoIosArrowRoundBack } from "react-icons/io";
import { api } from "~/convex/_generated/api";

const Event = () => {
  const router = useRouter();
  const { slug, year } = useParams();

  const slugValue = Array.isArray(slug) ? slug[0] : slug;

  const data = useQuery(
    api.events.event.getEventWithDetails,
    slugValue ? { slug: slugValue, edition: Number(year) } : "skip",
  );

  const artistData = useQuery(api.artists.artistActions.getArtistFull);

  // const data = useQuery(api.events.getEventWithDetails, {
  //   slug: "mural-fest",
  //   edition: 2025,
  // });

  const onBackClick = () => {
    const previous = sessionStorage.getItem("previousSalPage");
    if (previous && previous.includes("/thelist")) {
      router.push(previous);
    } else {
      router.push("/thelist");
    }
  };

  // setTimeout(() => {
  //   window.scrollTo({ top: 0, behavior: "smooth" });
  // }, 50); // small delay gives time for back nav

  // try to ensure that the page has a sec to load

  // const allEvents = useEventDetailCards();
  // const event = allEvents.find((e) => e.id === id);

  return (
    <>
      <div
        onClick={onBackClick}
        className="flex cursor-pointer items-center justify-start gap-x-2 py-6 underline-offset-2 hover:underline lg:hidden"
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
          <EventCardDetailMobile
            data={data}
            artist={artistData?.artist}
            className="lg:hidden"
          />
          <EventCardDetailDesktop
            data={data}
            artist={artistData?.artist}
            className="hidden lg:block"
          />
        </>
      )}
    </>
  );
};

export default Event;
