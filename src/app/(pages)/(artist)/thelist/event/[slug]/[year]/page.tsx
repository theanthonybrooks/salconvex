"use client";

import EventCardDetail from "@/features/events/event-card-detail";
import { useQuery } from "convex-helpers/react/cache";
import { LoaderPinwheel } from "lucide-react";
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

  console.log("Referrer:", document.referrer);
  console.log("History length:", window.history.length);

  const onBackClick = () => {
    const prevUrl = window.location.href;
    router.back();
    router.refresh();

    setTimeout(() => {
      if (window.location.href === prevUrl) {
        router.push("/thelist");
      }
    }, 100);
  };

  // setTimeout(() => {
  //   window.scrollTo({ top: 0, behavior: "smooth" });
  // }, 50); // small delay gives time for back nav

  // try to ensure that the page has a sec to load

  // const allEvents = useEventDetailCards();
  // const event = allEvents.find((e) => e.id === id);

  return (
    <div className="flex flex-col items-center px-4">
      <div
        onClick={onBackClick}
        className="flex cursor-pointer items-center justify-start gap-x-2 py-6 underline-offset-2 hover:underline"
      >
        <IoIosArrowRoundBack className="h-6 w-6" /> back to The List
      </div>
      {!data ? (
        // <p>Event: {data?.event.name}</p>
        <span className="flex items-center gap-4 text-lg font-semibold">
          Loading <LoaderPinwheel className="animate-spin" />
        </span>
      ) : (
        <EventCardDetail data={data} artist={artistData?.artist} />
      )}
    </div>
  );
};

export default Event;
