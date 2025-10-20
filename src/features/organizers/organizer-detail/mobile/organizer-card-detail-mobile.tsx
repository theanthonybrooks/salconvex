"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/helpers/utilsFns";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Link } from "@/components/ui/custom-link";
import { EventOrgLogo } from "@/components/ui/event-org-logo";
import { validOCVals } from "@/constants/openCallConsts";
import { OrganizerCard } from "@/features/organizers/components/organizer-card";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { formatEventDates } from "@/helpers/dateFns";
import { getFormattedLocationString } from "@/helpers/locations";
import { getUserFontSizePref } from "@/helpers/stylingFns";
import { OrganizerCardProps } from "@/types/organizer";
import { usePreloadedQuery } from "convex/react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export const OrganizerCardDetailMobile = (props: OrganizerCardProps) => {
  const { preloadedUserData } = useConvexPreload();
  const userData = usePreloadedQuery(preloadedUserData);
  const userPref = userData?.userPref ?? null;
  const fontSizePref = getUserFontSizePref(userPref?.fontSize);
  const fontSize = fontSizePref?.body;

  const {
    data,
    // artist,
    className,
    // openCall,
    // organizer,
  } = props;
  const { events, organizer } = data;
  const {
    logo: orgLogo,
    location,
    // links
  } = organizer;

  const groupedEvents = events?.reduce(
    (acc, event) => {
      const edition = event.dates.edition;
      if (!acc[edition]) acc[edition] = [];
      acc[edition].push(event);
      return acc;
    },
    {} as Record<string, typeof events>,
  );
  // const {
  //   logo: eventLogo,
  //   category: eventCategory,
  //   type: eventType,

  //   location,

  //   // hasActiveOpenCall: hasOpenCall,
  //   // adminNote,
  //   dates,
  // } = event;

  // const { bookmarked, hidden } = artist?.listActions?.find(
  //   (la) => la.eventId === event._id,
  // ) ?? {
  //   bookmarked: false,
  //   hidden: false,
  // };
  // const { toggleListAction } = useToggleListAction(event._id);
  // const { bookmarked, hidden } = artist?.listActions?.find(
  //   (la) => la.eventId === event._id,
  // ) ?? { bookmarked: false, hidden: false };

  const [activeTab, setActiveTab] = useState("events");
  const [hasMounted, setHasMounted] = useState(false);

  const locationString = getFormattedLocationString(location);

  useEffect(() => {
    const timeout = setTimeout(() => setHasMounted(true), 50);
    return () => clearTimeout(timeout);
  }, []);

  // const onBookmark = () => {
  //   if (!artist) {
  //     router.push("/pricing");
  //   } else {
  //     toggleListAction({ bookmarked: !bookmarked });
  //   }
  // };

  // const onHide = () => {
  //   if (!artist) {
  //     router.push("/pricing");
  //   } else {
  //     toggleListAction({ hidden: !hidden });
  //   }
  // };

  return (
    <Card
      className={cn(
        "mb-10 grid w-full min-w-[340px] max-w-[400px] grid-cols-[75px_auto] gap-x-3 rounded-3xl border-foreground/20 bg-white/50 p-3 first:mt-6",
        className,
      )}
    >
      <div className="col-span-full mb-4 grid w-full grid-cols-[75px_auto] gap-x-3">
        <div className="col-span-1 flex flex-col items-center justify-between space-y-6 pb-3 pt-3">
          <EventOrgLogo imgSrc={orgLogo} type="organizer" />

          <div className="flex flex-col items-center space-y-4">
            {/* {bookmarked ? (
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
            )} */}
          </div>
        </div>

        <div className="flex flex-col justify-between gap-y-3 pb-3 pr-3 pt-3">
          <div className="flex flex-col gap-y-1">
            <p className="mb-1 text-base font-semibold">{organizer?.name}</p>

            <p className={cn("inline-flex items-end gap-x-1", fontSize)}>
              {locationString}
              {/* <MapPin
                onClick={() => setActiveTab("event")}
                className="cursor-pointer transition-transform duration-150 hover:scale-105"
              /> */}
            </p>
          </div>
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
            {["events", "organizer"].map((tab) => (
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
                    className="absolute inset-0 z-0 rounded-md border-1.5 border-foreground bg-background shadow-sm"
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }}
                  />
                )}

                <span className="relative z-10">
               
                  {tab === "events" && "Events/Projects"}
                  {tab === "organizer" && "Organizer"}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="events">
            <div id="events" className={cn("px-4", fontSize)}>
              {groupedEvents &&
                Object.entries(groupedEvents)
                  .sort((a, b) => b[0].localeCompare(a[0])) // Optional: sort editions descending
                  .map(([edition, editionEvents]) => (
                    <div key={edition} className="mb-4">
                      <h3 className="mb-2 font-semibold underline underline-offset-2">
                        {edition}
                      </h3>
                      <ul className="list-outside list-none px-2">
                        {editionEvents.map((event) => (
                          <li key={event._id} className={cn(fontSize, "mb-2")}>
                            <div className="flex items-center gap-x-2">
                              <Link
                                href={`/thelist/event/${event.slug}/${event.dates.edition}${validOCVals.includes(event.hasOpenCall) ? "/call" : ""}`}
                                className={cn(fontSize)}
                              >
                                <span>
                                  <p className="font-bold capitalize">
                                    {event.name}
                                  </p>

                                  <span className="text-sm font-light italic">
                                    {event.dates.eventFormat !== "noEvent"
                                      ? formatEventDates(
                                          event.dates.eventDates[0].start,
                                          event.dates.eventDates[
                                            event.dates.eventDates.length - 1
                                          ].end,
                                          event.dates.eventFormat ?? null,
                                          "mobile",
                                        )
                                      : event.dates.prodDates
                                        ? formatEventDates(
                                            event.dates.prodDates[0].start,
                                            event.dates.prodDates[
                                              event.dates.prodDates.length - 1
                                            ].end,
                                            event.dates.eventFormat ?? null,
                                            "mobile",
                                          )
                                        : event.dates.edition}
                                  </span>
                                </span>
                              </Link>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
            </div>
          </TabsContent>
          <TabsContent value="organizer">
            <OrganizerCard
              organizer={organizer}
              format="mobile"
              srcPage="organizer"
              fontSize={fontSize}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
};
