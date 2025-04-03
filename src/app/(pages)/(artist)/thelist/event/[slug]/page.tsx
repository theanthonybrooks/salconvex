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

  const artist = artistData?.artist;

  //TODO: Make a new component for this that displays all past events and acts as an event directory for each event (with years and related docs/open calls). Proper archive stuff.

  // const data = useQuery(api.events.getEventWithDetails, {
  //   slug: "mural-fest",
  //   edition: 2025,
  // });

  console.log("event data", data);

  const onBackClick = () => {
    router.back();

    // setTimeout(() => {
    //   window.scrollTo({ top: 0, behavior: "smooth" });
    // }, 50); // small delay gives time for back nav

    // router.refresh(); // try to ensure that the page has a sec to load
  };

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
          Loading the Event Page (as in, the overall event page){" "}
          <LoaderPinwheel className="animate-spin" />
        </span>
      ) : (
        <EventCardDetail data={data} artist={artist} />
      )}
    </div>
  );
};

export default Event;
