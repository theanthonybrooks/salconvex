"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { LazyCalendar } from "@/features/calendar/lazy-calendar";
import type { EventApi, EventClickArg, MoreLinkArg } from "@fullcalendar/core";

import { useQuery } from "convex-helpers/react/cache";
import { ExternalLink, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "~/convex/_generated/api";

const Calendar = () => {
  const userData = useQuery(api.users.getCurrentUser, {});
  const user = userData?.user;

  // const handleDateClick = (arg: { eventStr: string }) => {
  //   console.log("Clicked date:", arg.eventStr);
  // };
  const router = useRouter();

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

  const events = [
    {
      title: "Client Meeting",
      date: "2025-04-10",
      extendedProps: {
        description: "Zoom call with client about mural project.",
        slug: "Urban-Walls-Residency-1",
        hasOpenCall: true,
        edition: 2025,
      },
    },
    {
      title: "Client Meeting 1",
      date: "2025-04-10",
      extendedProps: {
        description: "Zoom call with client about mural project.",
        slug: "Urban-Walls-Residency-1",
        hasOpenCall: true,
        edition: 2025,
      },
    },
    {
      title: "Client Meeting 2",
      date: "2025-04-10",
      extendedProps: {
        description: "Zoom call with client about mural project.",
        slug: "Urban-Walls-Residency-1",
        hasOpenCall: false,
        edition: 2025,
      },
    },
    {
      title: "Client Meeting 3",
      date: "2025-04-10",
      extendedProps: {
        description: "Zoom call with client about mural project.",
        slug: "Urban-Walls-Residency-1",
        hasOpenCall: true,
        edition: 2025,
      },
    },
    {
      title: "Client Meeting 4",
      date: "2025-04-10",
      extendedProps: {
        description: "Zoom call with client about mural project.",
        slug: "Urban-Walls-Residency-1",
        hasOpenCall: false,
        edition: 2025,
      },
    },
    {
      title: "Urban Walls Residency",
      date: "2025-04-10",
      extendedProps: {
        description: "Zoom call with client about mural project.",
        slug: "Urban-Walls-Residency-1",
        hasOpenCall: true,
        edition: 2026,
      },
    },
    {
      title: "Studio Day",
      date: "2025-04-12",
      extendedProps: {
        description: "Painting all day — no meetings.",
        slug: "mural-fest",
        hasOpenCall: false,
        edition: 2025,
      },
    },
  ];

  useEffect(() => {
    sessionStorage.setItem("previousSalPage", "/calendar");
  }, []);

  return (
    <div className="mt-8 flex h-full w-full flex-1 flex-col items-center justify-center gap-4 px-4">
      <h1 className="font-tanker text-3xl lowercase tracking-wide xl:text-[5rem]">
        Event & Open Call Calendar
      </h1>

      <div className="w-full max-w-[90dvw] grid-cols-[15%_minmax(0,1fr)] gap-x-10 xl:grid">
        <div className="col-span-1 h-max w-full self-start rounded-xl border-1.5 border-foreground/20 bg-white/50 py-3 xl:mt-[85px]">
          <p className="px-3 pb-2 text-xl font-bold">Filters</p>
          <Separator className="mb-4" thickness={2} />
          <div className="flex flex-col gap-y-2 px-4">
            <section className="flex items-center justify-between">
              <p className="text-sm">Category</p> <Plus className="size-4" />
            </section>
            <div className="flex flex-col gap-y-2">
              <section className="flex items-center justify-between">
                <p className="text-sm">Event Type</p>{" "}
                <Plus className="size-4" />
              </section>
              <section className="flex items-center justify-between">
                <p className="text-sm">Category</p> <Plus className="size-4" />
              </section>
              <section className="flex items-center justify-between">
                <p className="text-sm">Active</p> <Plus className="size-4" />
              </section>
            </div>
          </div>
          <p className="my-2 text-center text-lg font-bold text-foreground">
            Coming soon!
          </p>
        </div>
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
                  key={event.id || event.title + event.startStr}
                  className="event-card-link cursor-pointer rounded-md border-1.5 border-foreground/30 bg-white/50 p-3 hover:bg-white/70 hover:shadow-sm"
                  onClick={() => {
                    // setShowModal(false);

                    if (event.extendedProps.hasOpenCall) {
                      if (user?.accountType?.includes("artist")) {
                        router.push(
                          `/thelist/event/${event.extendedProps.slug}/call/${event.extendedProps.edition}`,
                        );
                      } else {
                        router.push("/pricing");
                        return;
                      }
                    } else {
                      router.push(
                        `/thelist/event/${event.extendedProps.slug}/${event.extendedProps.edition}`,
                      );
                    }
                  }}
                >
                  <span className="flex items-center justify-between">
                    <p className="text-base font-semibold">{event.title}</p>
                    <ExternalLink size={16} />
                  </span>
                  <p className="text-sm text-foreground">
                    {event.extendedProps.description || "No description"}
                  </p>
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
