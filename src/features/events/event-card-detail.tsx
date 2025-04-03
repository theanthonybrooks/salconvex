"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  CalendarClockIcon,
  EyeOff,
  Globe,
  MapIcon,
  MapPin,
  Phone,
} from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/state-accordion";

import {
  FaBookmark,
  FaEnvelope,
  FaFacebook,
  FaGlobe,
  FaInstagram,
  FaRegBookmark,
  FaThreads,
  FaVk,
} from "react-icons/fa6";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useToggleListAction } from "@/features/artists/helpers/listActions";
import { LazyMap } from "@/features/wrapper-elements/map/lazy-map";
import { generateICSFile } from "@/lib/addToCalendar";
import { formatEventDates, isValidIsoDate } from "@/lib/dateFns";
import { getEventCategoryLabel, getEventTypeLabel } from "@/lib/eventFns";
import { EventCardDetailProps } from "@/types/event";
import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import slugify from "slugify";

const EventCardDetail = (props: EventCardDetailProps) => {
  const {
    data,
    artist,
    // openCall,
    // organizer,
  } = props;
  const { event, organizer } = data;

  const {
    logo: eventLogo,
    eventCategory,
    eventType,
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

  const latitude = location.coordinates?.latitude ?? 0;
  const longitude = location.coordinates?.longitude ?? 0;

  const { eventStart, eventEnd, ongoing } = dates;

  const [isBookmarked, setIsBookmarked] = useState(bookmarked);
  const [isHidden, setIsHidden] = useState(hidden);
  const [activeTab, setActiveTab] = useState("event");
  const [hasMounted, setHasMounted] = useState(false);

  const orgSlug = slugify(organizer.name);

  const locationString = `${locale ? `${locale}, ` : ""}${city}, ${
    stateAbbr ? stateAbbr + ", " : ""
  }${countryAbbr === "UK" || countryAbbr === "USA" ? countryAbbr : country}`;

  const orgLocationString = `${
    organizer.location.locale ? `${organizer.location.locale}, ` : ""
  }${organizer.location.city}, ${
    organizer.location.stateAbbr ? organizer.location.stateAbbr + ", " : ""
  }${
    organizer.location.countryAbbr === "UK" ||
    organizer.location.countryAbbr === "USA" ||
    organizer.location.country === "United States"
      ? organizer.location.countryAbbr
      : organizer.location.country
  }`;

  const isOngoing = ongoing;
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
    toggleListAction({ bookmarked: !isBookmarked });
  };

  const onHide = () => {
    toggleListAction({ hidden: !isHidden });
  };

  useEffect(() => {
    setIsHidden(hidden);
    setIsBookmarked(bookmarked);
  }, [hidden, bookmarked]);

  return (
    <Card className="mb-10 grid w-full min-w-[340px] max-w-[400px] grid-cols-[75px_auto] gap-x-3 rounded-3xl border-foreground/20 bg-white/50 p-3 first:mt-6">
      <div className="col-span-full mb-4 grid w-full grid-cols-[75px_auto] gap-x-3">
        <div className="col-span-1 flex flex-col items-center justify-around space-y-6 pb-3 pt-3">
          <Image
            src={eventLogo}
            alt="Event Logo"
            width={60}
            height={60}
            className={cn("size-[60px] rounded-full border-2")}
          />

          <div className="flex flex-col items-center space-y-4">
            {isBookmarked ? (
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
            {isHidden && (
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
            <div className="flex items-center gap-x-1 text-sm">
              <span className="font-semibold">Dates:</span>
              <span className="inline-grid auto-cols-max grid-flow-col gap-x-2 align-top text-sm">
                <span className="max-w-prose text-balance break-words">
                  {formatEventDates(
                    dates?.eventStart || "",
                    dates?.eventEnd || "",
                    isOngoing,
                    "mobile",
                  )}
                </span>
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
            <Card className="w-full max-w-[95vw] rounded-xl border-foreground/20 bg-white/60 p-5">
              <Accordion defaultValue="item-1">
                {location.coordinates && (
                  <AccordionItem value="item-1">
                    <AccordionTrigger title="Location:" />

                    <AccordionContent>
                      <LazyMap
                        latitude={latitude}
                        longitude={longitude}
                        label={event.name}
                        className="z-0 mb-4 h-[200px] w-full overflow-hidden rounded-xl"
                      />
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`}
                        className="flex items-center justify-center gap-x-1 text-sm font-medium underline-offset-2 hover:underline"
                      >
                        Get directions
                        <MapIcon className="size-5 md:size-4" />
                      </a>
                    </AccordionContent>
                  </AccordionItem>
                )}

                <AccordionItem value="item-2">
                  <AccordionTrigger title="About:" />

                  <AccordionContent>
                    <div className="mb-4 flex flex-col space-y-3 pb-3">
                      <p>{event.about}</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                {event.links && (
                  <AccordionItem value="item-3">
                    <AccordionTrigger title="Links:" />

                    <AccordionContent>
                      <ul className="flex flex-col gap-y-2">
                        {event.links.map((link, index) => (
                          <li key={index}>
                            <a
                              href={
                                link.type === "email"
                                  ? `mailto:${link.href}?subject=${event.name}`
                                  : link.href
                              }
                              target="_blank"
                              className="flex items-center gap-x-2 underline-offset-2 hover:underline"
                            >
                              {link.type === "website" && (
                                <FaGlobe className="size-4" />
                              )}
                              {link.type === "instagram" && (
                                <FaInstagram className="size-4" />
                              )}
                              {link.type === "facebook" && (
                                <FaFacebook className="size-4" />
                              )}
                              {link.type === "threads" && (
                                <FaThreads className="size-4" />
                              )}
                              {link.type === "email" && (
                                <FaEnvelope className="size-4" />
                              )}
                              {link.type === "email" || link.type === "website"
                                ? link.href
                                : link.handle}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {event.otherInfo && (
                  <AccordionItem value="item-4">
                    <AccordionTrigger title="Other info:" />
                    <AccordionContent>
                      {event.otherInfo.map((info, index) => (
                        <p key={index}>{info}</p>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </Card>
          </TabsContent>
          <TabsContent value="organizer">
            <Card className="w-full max-w-full space-y-6 overflow-hidden rounded-xl border-foreground/20 bg-white/60 p-5">
              <div className="grid w-full grid-cols-[75px_minmax(0,1fr)] items-center">
                <Image
                  src={organizer.logo}
                  alt="Event Logo"
                  width={60}
                  height={60}
                  className={cn("size-[60px] rounded-full border-2")}
                />
                <div className="col-span-1">
                  <p className="line-clamp-2 text-sm font-bold">
                    {organizer.name}
                  </p>
                  <p className="text-sm font-medium">{orgLocationString}</p>
                </div>
              </div>
              <div className="w-full space-y-5">
                <section>
                  <p className="text-sm font-semibold">
                    About the Organization:
                  </p>
                  <p className="line-clamp-4 text-sm">{organizer.about}</p>
                </section>
                <section className="flex flex-col gap-y-2">
                  <span>
                    <p className="text-sm font-semibold">Organizer:</p>
                    <p className="line-clamp-4 text-sm">
                      {organizer.contact.organizer}
                    </p>
                  </span>
                  <span>
                    <p className="text-sm font-semibold">Main Contact:</p>
                    <div className="flex items-center gap-x-2">
                      {organizer.contact.primaryContact.email ? (
                        <FaEnvelope />
                      ) : organizer.contact.primaryContact.phone ? (
                        <Phone />
                      ) : (
                        <Globe />
                      )}

                      <a
                        href={
                          organizer.contact.primaryContact.email
                            ? `mailto:${organizer.contact.primaryContact.email}`
                            : organizer.contact.primaryContact.href
                              ? organizer.contact.primaryContact.href
                              : `tel:${organizer.contact.primaryContact.phone}`
                        }
                        className="line-clamp-4 text-sm underline-offset-2 hover:underline"
                      >
                        {organizer.contact.primaryContact.phone
                          ? organizer.contact.primaryContact.phone
                          : organizer.contact.primaryContact.href
                            ? organizer.contact.primaryContact.href
                            : organizer.contact.primaryContact.email}
                      </a>
                    </div>
                  </span>
                </section>
                <section>
                  <p className="text-sm font-semibold">Links:</p>
                  <div className="flex items-center justify-start gap-x-6 pt-3">
                    {organizer.links.website && (
                      <a
                        href={organizer.links.website}
                        className="h-6 w-6 hover:scale-110"
                      >
                        <Globe className="h-6 w-6" />
                      </a>
                    )}
                    {organizer.links.email && (
                      <a
                        href={`mailto:${organizer.links.email}`}
                        className="h-6 w-6 hover:scale-110"
                      >
                        <FaEnvelope className="h-6 w-6" />
                      </a>
                    )}
                    {organizer.links.phone && (
                      <a
                        href={`tel:${organizer.links.phone}`}
                        className="h-6 w-6 hover:scale-110"
                      >
                        <Phone className="h-6 w-6" />
                      </a>
                    )}
                    {organizer.links.instagram && (
                      <a
                        href={organizer.links.instagram}
                        className="h-6 w-6 hover:scale-110"
                      >
                        <FaInstagram className="h-6 w-6" />
                      </a>
                    )}
                    {organizer.links.facebook && (
                      <a
                        href={organizer.links.facebook}
                        className="h-6 w-6 hover:scale-110"
                      >
                        <FaFacebook className="h-6 w-6" />
                      </a>
                    )}
                    {organizer.links.threads && (
                      <a
                        href={organizer.links.threads}
                        className="h-6 w-6 hover:scale-110"
                      >
                        <FaThreads className="h-6 w-6" />
                      </a>
                    )}
                    {organizer.links.vk && (
                      <a
                        href={organizer.links.vk}
                        className="h-6 w-6 hover:scale-110"
                      >
                        <FaVk className="h-6 w-6" />
                      </a>
                    )}
                  </div>
                  <a
                    className="mt-6 line-clamp-4 text-center text-sm underline-offset-2 hover:underline"
                    href={`/organizer/${orgSlug}`}
                  >
                    Check out {organizer.name}&apos;s other events
                  </a>
                </section>
              </div>

              {/* <div className='col-span-full'>
                  <h3>Other Events/Projects by this organizer:</h3>
                  <ul>
                    <li>
                      Event Name <Link href='#'>(link)</Link>
                    </li>
                    <li>
                      Event Name <Link href='#'>(link)</Link>
                    </li>
                  </ul>
                </div> */}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
};

export default EventCardDetail;
