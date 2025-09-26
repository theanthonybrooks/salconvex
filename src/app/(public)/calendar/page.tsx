"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LazyCalendar } from "@/features/calendar/lazy-calendar";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { RichTextDisplay } from "@/lib/richTextFns";
import { cn } from "@/lib/utils";
import type { EventApi, EventClickArg, MoreLinkArg } from "@fullcalendar/core";

import { useQuery } from "convex-helpers/react/cache";
import { usePreloadedQuery } from "convex/react";
import { ExternalLink } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "~/convex/_generated/api";

const Calendar = () => {
  // const {isMobile} = useDevice()
  const router = useRouter();
  const { preloadedUserData, preloadedSubStatus } = useConvexPreload();
  const userData = usePreloadedQuery(preloadedUserData);
  const subStatus = usePreloadedQuery(preloadedSubStatus);
  const hasActiveSubscription = subStatus?.hasActiveSubscription;
  // const userData = useQuery(api.users.getCurrentUser, {});
  const user = userData?.user;
  const activeArtist =
    user?.accountType?.includes("artist") && hasActiveSubscription;

  // const handleDateClick = (arg: { eventStr: string }) => {
  //   console.log("Clicked date:", arg.eventStr);
  // };

  // const [calendarLoaded, setCalendarLoaded] = useState(false);
  const [visibleEvents, setVisibleEvents] = useState<EventApi[]>([]);
  const [showModal, setShowModal] = useState(false);

  // console.log(calendarLoaded);

  const handleEventClick = (info: EventClickArg) => {
    setVisibleEvents([info.event]);
    setShowModal(true);
  };

  const handleMoreClick = (arg: MoreLinkArg) => {
    arg.jsEvent.preventDefault();

    const events = arg.allSegs.map((seg) => seg.event);
    setVisibleEvents(events);
    setShowModal(true);

    return "no-modal";
  };

  const eventsData = useQuery(api.events.event.getEventsForCalendar);
  const events = eventsData?.events ?? [];

  useEffect(() => {
    sessionStorage.setItem("previousSalPage", "/calendar");
  }, []);

  return (
    <div className="mt-8 flex h-full w-full flex-1 flex-col items-center justify-center gap-4 px-4">
      <h1 className="font-tanker text-3xl lowercase tracking-wide xl:text-[5rem]">
        Event & Open Call Calendar
      </h1>

      <div
        className={cn(
          "w-full max-w-[90dvw] gap-x-10 xl:grid",
          //  "grid-cols-[15%_minmax(0,1fr)]"
        )}
      >
        {/* <div className="col-span-1 hidden h-max w-full self-start rounded-xl border-1.5 border-foreground/20 bg-white/50 py-3 lg:block xl:mt-[85px]">
          <p className="px-3 pb-2 text-xl font-bold">Filters</p>
          <Separator className="mb-4" thickness={2} />
          <div className="flex flex-col gap-y-2 px-4 opacity-30">
            <section className="flex items-center justify-between">
              <p className="text-sm">Category</p> <Plus className="size-4" />
            </section>

            <section className="flex items-center justify-between">
              <p className="text-sm">Event Type</p> <Plus className="size-4" />
            </section>
            <section className="flex items-center justify-between">
              <p className="text-sm">Continent</p> <Plus className="size-4" />
            </section>
            <section className="flex items-center justify-between">
              <p className="text-sm">Active</p> <Plus className="size-4" />
            </section>
          </div>
          <p className="my-2 text-center text-lg font-bold text-foreground">
            Filters coming soon!
          </p>
        </div> */}
        <LazyCalendar
          events={events}
          onEventClick={handleEventClick}
          onMoreLinkClick={handleMoreClick}
        />

        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Events on{" "}
                {visibleEvents[0] &&
                  new Intl.DateTimeFormat("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }).format(new Date(visibleEvents[0]?.startStr))}
              </DialogTitle>
            </DialogHeader>
            <div className="mt-2 space-y-2">
              {visibleEvents.map((event) => (
                <div
                  className="flex cursor-pointer flex-row items-center gap-4 rounded-md border-1.5 border-foreground/30 bg-white/50 p-3 hover:bg-white/70 hover:shadow-sm"
                  key={event.id || event.title + event.startStr}
                >
                  <Image
                    src={event.extendedProps.logo ?? "/1.jpg"}
                    // src="/1.jpg"
                    alt={event.title}
                    width={50}
                    height={50}
                    className="rounded-full"
                  />
                  <div
                    key={event.id || event.title + event.startStr}
                    className="event-card-link w-full"
                    onClick={() => {
                      // setShowModal(false);

                      if (event.extendedProps.hasOpenCall && activeArtist) {
                        router.push(
                          `/thelist/event/${event.extendedProps.slug}/${event.extendedProps.edition}/call/`,
                        );
                      } else {
                        router.push(
                          `/thelist/event/${event.extendedProps.slug}/${event.extendedProps.edition}`,
                        );
                      }
                    }}
                  >
                    <span className="flex items-center justify-between">
                      <p className="text-base font-semibold capitalize">
                        {event.title}
                      </p>
                      <ExternalLink size={16} />
                    </span>

                    <RichTextDisplay
                      html={event.extendedProps.description ?? "No description"}
                      className="line-clamp-2 text-sm text-foreground"
                      maxChars={150}
                    />
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Calendar;
