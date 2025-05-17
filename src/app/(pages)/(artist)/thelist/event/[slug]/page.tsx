"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { SalBackNavigation } from "@/features/events/components/sal-back-navigation";
import { EventCardDetailDesktop } from "@/features/events/event-detail/desktop/event-card-detail-desktop";
import { EventCardDetailMobile } from "@/features/events/event-detail/mobile/event-card-detail-mobile";
import { useQuery } from "convex-helpers/react/cache";
import { useParams } from "next/navigation";
import { api } from "~/convex/_generated/api";

const Event = () => {
  const { slug } = useParams();
  const slugValue = Array.isArray(slug) ? slug[0] : slug;

  const data = useQuery(
    api.events.event.getEventBySlug,
    slugValue ? { slug: slugValue } : "skip",
  );

  console.log(data);

  const artistData = useQuery(api.artists.artistActions.getArtistFull);

  const artist = artistData?.artist;

  //TODO: Make a new component for this that displays all past events and acts as an event directory for each event (with years and related docs/open calls). Proper archive stuff.

  // const data = useQuery(api.events.getEventWithDetails, {
  //   slug: "mural-fest",
  //   edition: 2025,
  // });

  // console.log("event data", data);

  // const allEvents = useEventDetailCards();
  // const event = allEvents.find((e) => e.id === id);

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
          {/* Loading <LoaderCircle className="animate-spin" /> */}
        </div>
      ) : (
        <>
          <EventCardDetailMobile
            data={data}
            artist={artist}
            className="lg:hidden"
          />
          <EventCardDetailDesktop
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
