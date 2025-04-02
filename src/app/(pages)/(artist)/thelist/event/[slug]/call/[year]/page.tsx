"use client";

import OpenCallCardDetail from "@/features/events/open-calls/opencall-card-detail";
import { useQuery } from "convex-helpers/react/cache";
import { LoaderPinwheel } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { IoIosArrowRoundBack } from "react-icons/io";
import { api } from "~/convex/_generated/api";

const OpenCallDetail = () => {
  const router = useRouter();
  const { slug, year } = useParams();
  const slugValue = Array.isArray(slug) ? slug[0] : slug;

  const data = useQuery(
    api.events.event.getEventWithDetails,
    slugValue ? { slug: slugValue, edition: Number(year) } : "skip",
  );

  const artistData = useQuery(api.artists.artistActions.getArtistFull);
  const onBackClick = () => {
    if (window.history.length > 1) {
      router.back();
      router.refresh();
    } else {
      router.push("/thelist");
    }
  };

  console.log("call data", data);

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
        <OpenCallCardDetail data={data} artist={artistData?.artist} />
      )}
    </div>
  );
};

export default OpenCallDetail;
