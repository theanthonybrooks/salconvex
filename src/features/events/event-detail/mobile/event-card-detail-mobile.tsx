"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CalendarClockIcon, EyeOff, MapPin } from "lucide-react";

import { FaBookmark, FaRegBookmark } from "react-icons/fa6";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useToggleListAction } from "@/features/artists/helpers/listActions";
import EventDates from "@/features/events/components/event-dates";
import { EventCard } from "@/features/events/components/events-card";
import { OrganizerCard } from "@/features/organizers/components/organizer-card";
import { generateICSFile } from "@/lib/addToCalendar";
import { isValidIsoDate } from "@/lib/dateFns";
import { getEventCategoryLabel, getEventTypeLabel } from "@/lib/eventFns";
import { EventCardProps } from "@/types/event";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export const EventCardDetailMobile = (props: EventCardProps) => {
  const router = useRouter();
  const {
    data,
    artist,
    className,
    // openCall,
    // organizer,
  } = props;
  const { event, organizer } = data;

  const {
    logo: eventLogo,
    category: eventCategory,
    type: eventType,

    location,

    // hasActiveOpenCall: hasOpenCall,
    // adminNote,
    dates,
  } = event;

  // const { bookmarked, hidden } = artist?.listActions?.find(
  //   (la) => la.eventId === event._id,
  // ) ?? {
  //   bookmarked: false,
  //   hidden: false,
  // };
  const { toggleListAction } = useToggleListAction(event._id);
  const { bookmarked, hidden } = artist?.listActions?.find(
    (la) => la.eventId === event._id,
  ) ?? { bookmarked: false, hidden: false };
  const { locale, city, stateAbbr, country, countryAbbr } = location;

  const { eventDates } = dates;
  const eventStart = eventDates[0].start;
  const eventEnd = eventDates[0].end;

  const [activeTab, setActiveTab] = useState("event");
  const [hasMounted, setHasMounted] = useState(false);

  const locationString = `${locale ? `${locale}, ` : ""}${city}, ${
    stateAbbr ? stateAbbr + ", " : ""
  }${countryAbbr === "UK" || countryAbbr === "USA" ? countryAbbr : country}`;

  const hasEventDates = eventStart && eventEnd;
  const eventAbout = event?.about ?? "";
  const eventId = event?._id ?? "";

  const icsLink =
    hasEventDates && isValidIsoDate(eventStart) && isValidIsoDate(eventEnd)
      ? generateICSFile(
          event.name,
          eventStart,
          eventEnd,
          locationString,
          eventAbout,
          eventCategory,
          false,
          isValidIsoDate(eventStart) ? eventStart! : "",
          isValidIsoDate(eventEnd) ? eventEnd! : "",
          `${eventId}`,
        )
      : null;

  useEffect(() => {
    const timeout = setTimeout(() => setHasMounted(true), 50);
    return () => clearTimeout(timeout);
  }, []);

  const onBookmark = () => {
    if (!artist) {
      router.push("/pricing");
    } else {
      toggleListAction({ bookmarked: !bookmarked });
    }
  };

  const onHide = () => {
    if (!artist) {
      router.push("/pricing");
    } else {
      toggleListAction({ hidden: !hidden });
    }
  };

  return (
    <Card
      className={cn(
        "mb-10 grid w-full min-w-[340px] max-w-[400px] grid-cols-[75px_auto] gap-x-3 rounded-3xl border-foreground/20 bg-white/50 p-3 first:mt-6",
        className,
      )}
    >
      <div className="col-span-full mb-4 grid w-full grid-cols-[75px_auto] gap-x-3">
        <div className="col-span-1 flex flex-col items-center justify-between space-y-6 pb-3 pt-3">
          <Image
            src={eventLogo}
            alt="Event Logo"
            width={60}
            height={60}
            className={cn("size-[60px] rounded-full border-2")}
          />

          <div className="flex flex-col items-center space-y-4">
            {bookmarked ? (
              <FaBookmark
                className="mt-3 size-8 cursor-pointer text-red-500"
                onClick={onBookmark}
              />
            ) : (
              <FaRegBookmark
                className="mt-3 size-8 cursor-pointer"
                onClick={onBookmark}
              />
            )}
            {hidden && (
              <EyeOff className="h-6 w-6 cursor-pointer" onClick={onHide} />
            )}
          </div>
        </div>

        <div className="flex flex-col justify-between gap-y-3 pb-3 pr-3 pt-3">
          <div className="flex flex-col gap-y-1">
            <p className="mb-1 text-base font-semibold">{event?.name}</p>

            <p className="inline-flex items-end gap-x-1 text-sm">
              {locationString}
              <MapPin
                onClick={() => setActiveTab("event")}
                className="cursor-pointer transition-transform duration-150 hover:scale-105"
              />
            </p>
          </div>
          <div className="flex flex-col justify-between gap-y-1">
            <div className="flex items-start gap-x-1 text-sm">
              <span className="font-semibold">Dates:</span>
              <span className="inline-grid auto-cols-max grid-flow-col gap-x-2 align-top text-sm">
                {/* <span className="max-w-prose text-balance break-words">
                  {formatEventDates(
                    dates?.eventStart || "",
                    dates?.eventEnd || "",
                    isOngoing,
                    "mobile",
                  )}
                </span> */}
                <EventDates event={event} format="mobile" type="event" />
                {icsLink && (
                  <a
                    href={icsLink}
                    download={`${event.name.replace(/\s+/g, "_")}.ics`}
                  >
                    <CalendarClockIcon className="size-5 md:size-4" />
                  </a>
                )}
              </span>
            </div>
            <p className="flex items-center gap-x-1 text-sm">
              <span className="font-semibold">Category:</span>
              {getEventCategoryLabel(eventCategory)}
            </p>
            {eventType && eventCategory === "event" && (
              <p className="flex items-center gap-x-1 text-sm">
                <span className="font-semibold">Type:</span>{" "}
                {eventType.map((type) => getEventTypeLabel(type)).join(" | ")}
              </p>
            )}
          </div>
          {/* NOTE: Make these dynamic and perhaps make a dropdown menu or popover or something for them. Not sure if they're really necessary right here.  */}
          {/* <div className='flex gap-x-4 mt-3 items-center justify-start'>
                <MailIcon size={24} />
                <Globe size={24} />
                <FaInstagram size={24} />
                <FiFacebook size={24} />
                <FaVk size={24} />
              </div> */}
        </div>
      </div>
      <div className="col-span-full flex w-full flex-col items-start justify-start gap-y-3 overflow-hidden">
        <Tabs
          onValueChange={(value) => setActiveTab(value)}
          value={activeTab}
          defaultValue={activeTab}
          className="flex w-full flex-col justify-center"
        >
          <TabsList className="relative flex h-12 w-full justify-around rounded-xl bg-white/60">
            {["event", "organizer"].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className={cn(
                  "relative z-10 flex h-10 w-full items-center justify-center px-4 text-sm font-medium",
                  activeTab === tab ? "text-black" : "text-muted-foreground",
                )}
              >
                {hasMounted && activeTab === tab && (
                  <motion.div
                    exit={{ opacity: 0 }}
                    layoutId="tab-bg"
                    className="absolute inset-0 z-0 rounded-md bg-background shadow-sm"
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }}
                  />
                )}

                <span className="relative z-10">
                  {tab === "opencall" && "Open Call"}
                  {tab === "event" && getEventCategoryLabel(eventCategory)}
                  {tab === "organizer" && "Organizer"}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="event">
            <EventCard event={event} organizer={organizer} format="mobile" />
          </TabsContent>
          <TabsContent value="organizer">
            <OrganizerCard organizer={organizer} format="mobile" />
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
};
