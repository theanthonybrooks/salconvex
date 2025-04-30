"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Link } from "@/components/ui/custom-link";
import { OrganizerCard } from "@/features/organizers/components/organizer-card";
import { OrganizerCardProps } from "@/types/organizer";
import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

export const OrganizerCardDetailMobile = (props: OrganizerCardProps) => {
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
  const { locale, city, stateAbbr, country, countryAbbr } = location;

  const [activeTab, setActiveTab] = useState("events");
  const [hasMounted, setHasMounted] = useState(false);

  const locationString = `${locale ? `${locale}, ` : ""}${city}, ${
    stateAbbr ? stateAbbr + ", " : ""
  }${countryAbbr === "UK" || countryAbbr === "USA" ? countryAbbr : country}`;

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
          <Image
            src={orgLogo}
            alt="Organizer Logo"
            width={60}
            height={60}
            className={cn("size-[60px] rounded-full border-2")}
          />

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

            <p className="inline-flex items-end gap-x-1 text-sm">
              {locationString}
              <MapPin
                onClick={() => setActiveTab("event")}
                className="cursor-pointer transition-transform duration-150 hover:scale-105"
              />
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
                  {tab === "events" && "Events/Projects"}
                  {tab === "organizer" && "Organizer"}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="events">
            <ol className="list-outside list-decimal px-2 pl-6">
              {events?.map((event) => (
                <li key={event._id} className="text-sm">
                  <div className="flex items-center gap-x-2">
                    <Link
                      href={`/thelist/event/${event.slug}/${event.dates.edition}`}
                      target="_blank"
                    >
                      <p className="text-sm">
                        <span className="font-bold">{event.name}</span>
                        {" - "}
                        <span className="font-light italic">
                          {event.dates.edition}
                        </span>
                      </p>
                    </Link>
                  </div>
                </li>
              ))}
            </ol>
            {/* <EventCard event={event} organizer={organizer} format="mobile" /> */}
          </TabsContent>
          <TabsContent value="organizer">
            <OrganizerCard
              organizer={organizer}
              format="mobile"
              srcPage="organizer"
            />
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
};
