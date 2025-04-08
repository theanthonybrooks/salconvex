"use client";

import { useRouter } from "next/navigation";
import { IoIosArrowRoundBack } from "react-icons/io";

const Event = () => {
  const router = useRouter();

  // const data = useQuery(api.events.getEventWithDetails, {
  //   slug: "mural-fest",
  //   edition: 2025,
  // });

  // console.log("event data", data);

  const onBackClick = () => {
    const previous = sessionStorage.getItem("previousSalPage");

    if (previous && previous.includes("/thelist")) {
      router.push(previous);
    } else {
      router.push("/thelist");
    }
  };

  // const allEvents = useEventDetailCards();
  // const event = allEvents.find((e) => e.id === id);

  return (
    <>
      <div
        onClick={onBackClick}
        className="flex cursor-pointer items-center justify-start gap-x-2 py-6 underline-offset-2 hover:underline"
      >
        <IoIosArrowRoundBack className="size-6" /> back to The List
      </div>
      <p className="text-[4rem] font-semibold">Organizer Page</p>
    </>
  );
};

export default Event;
