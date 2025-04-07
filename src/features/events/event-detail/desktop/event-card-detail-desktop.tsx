"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Globe, MapIcon, MapPin, Phone } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/state-accordion-test";

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
import { TiArrowRight } from "react-icons/ti";

import NavTabs from "@/components/ui/nav-tabs";
// import { useToggleListAction } from "@/features/artists/helpers/listActions";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToggleListAction } from "@/features/artists/helpers/listActions";
import { LazyMap } from "@/features/wrapper-elements/map/lazy-map";
import { formatEventDates } from "@/lib/dateFns";
import { getEventCategoryLabel, getEventTypeLabel } from "@/lib/eventFns";
import { EventCardProps } from "@/types/event";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import slugify from "slugify";

export const EventCardDetailDesktop = (props: EventCardProps) => {
  const router = useRouter();
  const { data, artist, className } = props; //note: removed artist from props. Add back when needed
  const { event, organizer } = data;
  const {
    logo: eventLogo,
    eventCategory,
    eventType,
    location,
    dates,
    // slug,
  } = event;

  const orgHasOtherEvents = organizer?.events?.length > 1;

  const { bookmarked, hidden } = artist?.listActions?.find(
    (la) => la.eventId === event._id,
  ) ?? {
    bookmarked: false,
    hidden: false,
  };

  const { locale, city, stateAbbr, country, countryAbbr } = location;
  const { eventStart, eventEnd, ongoing, artistStart, artistEnd } = dates;

  const [activeTab, setActiveTab] = useState("event");

  const { toggleListAction } = useToggleListAction(event._id);

  const orgSlug = slugify(organizer.name);
  const latitude = location.coordinates?.latitude ?? 0;
  const longitude = location.coordinates?.longitude ?? 0;

  // const hasEventDates =
  //   eventStart &&
  //   isValidIsoDate(eventStart) &&
  //   eventEnd &&
  //   isValidIsoDate(eventEnd);

  const locationString = `${locale ? `${locale}, ` : ""}${city}, ${
    stateAbbr ? stateAbbr + ", " : ""
  }${countryAbbr === "UK" || countryAbbr === "USA" ? countryAbbr : country}`;

  const orgLocationString = `${organizer.location.city}, ${
    organizer.location.stateAbbr ? organizer.location.stateAbbr + ", " : ""
  }${
    organizer.location.countryAbbr === "UK" ||
    organizer.location.countryAbbr === "USA" ||
    organizer.location.country === "United States"
      ? organizer.location.countryAbbr
      : organizer.location.country
  }`;

  // const icsLink =
  //   callType === "Fixed" && isValidIsoDate(ocStart) && isValidIsoDate(ocEnd)
  //     ? generateICSFile(
  //         event.name,
  //         ocStart,
  //         ocEnd,
  //         locationString,
  //         event.about ?? "",
  //         eventCategory,
  //         true,
  //         hasEventDates ? dates.eventStart! : "",
  //         hasEventDates ? dates.eventEnd! : "",
  //         `${openCallId}`,
  //       )
  //     : null;

  const onBookmark = () => {
    toggleListAction({ bookmarked: !bookmarked });
  };

  const onHide = () => {
    toggleListAction({ hidden: !hidden });
  };

  const tabList = [
    // { id: "application", label: "My Application" },
    { id: "event", label: getEventCategoryLabel(eventCategory) },
    { id: "organizer", label: "Organizer" },
  ];

  const onBackClick = () => {
    const previous = sessionStorage.getItem("previousSalPage");
    //  console.log(previous); //note-to-self: annoying as it doesn't actually save the full pagth. I'm using it as a flag, for now.
    if (previous && previous.startsWith("/")) {
      router.back();
    } else {
      router.push("/thelist");
    }
  };

  return (
    <div
      className={cn(
        "flex w-full max-w-[min(90vw,1400px)] flex-col gap-x-6 pb-10 xl:grid xl:grid-cols-[300px_auto]",
        className,
      )}
    >
      <div
        onClick={onBackClick}
        className="col-start-1 row-span-1 mx-auto flex w-max cursor-pointer items-center justify-start gap-x-2 py-6 underline-offset-2 hover:underline"
      >
        <IoIosArrowRoundBack className="size-6" /> back to The List
      </div>

      <Card
        className={cn(
          "row-start-2 hidden w-full max-w-[350px] grid-cols-[75px_auto] gap-x-3 self-start rounded-3xl border-foreground/20 bg-white/50 p-3 first:mt-6 xl:sticky xl:top-24 xl:grid",
        )}
      >
        <div className="col-span-full mb-4 grid w-full grid-cols-[75px_auto] gap-x-3 pt-2">
          <div className="col-span-1 flex items-center justify-center">
            <Image
              src={eventLogo}
              alt="Event Logo"
              width={60}
              height={60}
              className={cn("size-[60px] rounded-full border-2")}
            />
          </div>

          <div className="col-start-2 row-start-1 flex items-center">
            <p className="mb-1 text-balance pr-1 text-base font-semibold">
              {event?.name}
            </p>
          </div>
          <div className="col-span-full row-start-2 flex flex-col justify-between gap-y-3 px-4 pt-4">
            <p className="flex flex-col items-start gap-1 text-sm">
              <span className="space-x-1 font-semibold">Location:</span>
              <span className="inline-flex items-end gap-x-1 text-sm leading-[0.95rem]">
                {locationString}

                <MapPin
                  onClick={() => setActiveTab("event")}
                  className="size-5 cursor-pointer transition-transform duration-150 hover:scale-105"
                />
              </span>
            </p>
            <p className="flex flex-col items-start gap-1 text-sm">
              <span className="space-x-1 font-semibold">
                {getEventCategoryLabel(eventCategory)} Dates:
              </span>
              {formatEventDates(eventStart || "", eventEnd || "", ongoing)}
            </p>
            {/*//todo: add this part */}
            {eventCategory === "project" ||
              (eventCategory === "event" && artistStart && artistEnd && (
                <p className="flex flex-col items-start gap-1 text-sm">
                  <span className="space-x-1 font-semibold">
                    Painting/Production Dates:
                  </span>
                  {formatEventDates(
                    artistStart || "",
                    artistEnd || "",
                    ongoing,
                  )}
                </p>
              ))}
            <p className="flex flex-col items-start gap-1 text-sm">
              <span className="font-semibold">Category:</span>
              {getEventCategoryLabel(eventCategory)}
            </p>
            {eventType && eventCategory === "event" && (
              <p className="flex flex-col items-start gap-1 text-sm">
                <span className="font-semibold">Type:</span>{" "}
                {eventType.map((type) => getEventTypeLabel(type)).join(" | ")}
              </p>
            )}

            {/* //todo: ensure that this is required in the submission form */}
            {event.about && (
              <Accordion type="multiple" defaultValue={["about"]}>
                <AccordionItem value="about">
                  <AccordionTrigger title="About:" className="pb-2" />
                  <AccordionContent className="text-sm">
                    {event.about}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
            <div className="flex flex-col items-start gap-1 text-sm">
              <span className="font-semibold">Organized by:</span>
              <Card
                className="grid w-full grid-cols-[50px_minmax(0,1fr)] items-center rounded-xl border-1.5 border-foreground/30 bg-white/50 p-2 hover:cursor-pointer"
                onClick={() => {
                  window.scrollTo({
                    top: document.body.scrollHeight * 0.1,
                    behavior: "smooth",
                  });
                  setActiveTab("organizer");
                }}
              >
                <Image
                  src={organizer.logo}
                  alt="Event Logo"
                  width={50}
                  height={50}
                  className={cn("size-[40px] rounded-full border-2")}
                />
                <div className="col-span-1">
                  <p className="max-w-[18ch] truncate text-sm font-bold">
                    {organizer.name}
                  </p>
                  <p className="max-w-[18ch] truncate text-xs">
                    {orgLocationString}
                  </p>
                </div>
              </Card>
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
      </Card>

      <Card className="col-start-2 row-start-2 flex w-full flex-col gap-y-2 rounded-3xl border-foreground/20 bg-white/50 p-4">
        <div className="flex h-20 w-full items-center gap-x-4 rounded-2xl border border-dotted border-foreground/50 bg-[#fef9dd] p-4">
          <div className="flex w-full items-center justify-between pr-2">
            <div className="flex items-center gap-x-4 px-4">
              <Image
                src={eventLogo}
                alt="Event Logo"
                width={60}
                height={60}
                className={cn("size-[60px] rounded-full border-2 xl:hidden")}
              />
              <div className="flex flex-col">
                <span className="text-xl font-bold">{event?.name}</span>
                <span className="inline-flex items-end gap-x-1 text-sm leading-[0.95rem]">
                  {locationString}

                  <MapPin
                    onClick={() => setActiveTab("event")}
                    className="size-4 cursor-pointer transition-transform duration-150 hover:scale-105"
                  />
                </span>
              </div>
            </div>
            <div className="flex items-center gap-x-4">
              {hidden ? (
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger>
                      <EyeOff
                        className="size-7 cursor-pointer text-muted-foreground"
                        onClick={onHide}
                      />
                    </TooltipTrigger>
                    <TooltipContent align="end">
                      <p>Unhide {getEventCategoryLabel(event.eventCategory)}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger>
                      <Eye className="size-7 cursor-pointer" onClick={onHide} />
                    </TooltipTrigger>
                    <TooltipContent align="end">
                      <p>Hide {getEventCategoryLabel(event.eventCategory)}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {bookmarked ? (
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger>
                      <FaBookmark
                        className="size-7 cursor-pointer text-red-500"
                        onClick={onBookmark}
                      />
                    </TooltipTrigger>
                    <TooltipContent align="end">
                      <p>Remove Bookmark</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger>
                      <FaRegBookmark
                        className="size-7 cursor-pointer"
                        onClick={onBookmark}
                      />{" "}
                    </TooltipTrigger>
                    <TooltipContent align="end">
                      <p>
                        Bookmark {getEventCategoryLabel(event.eventCategory)}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        </div>
        <NavTabs
          tabs={tabList}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        >
          <div id="event">
            <Accordion
              type="multiple"
              defaultValue={["item-1", "item-2", "item-3"]}
            >
              {location.coordinates && (
                <AccordionItem value="item-1">
                  <AccordionTrigger title="Location:" />

                  <AccordionContent>
                    <LazyMap
                      latitude={latitude}
                      longitude={longitude}
                      label={event.name}
                      className="z-0 mb-4 h-[400px] w-full overflow-hidden rounded-xl"
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
          </div>
          <div id="organizer">
            <Card className="grid w-full max-w-full grid-cols-2 space-y-6 divide-x-2 divide-dotted divide-foreground/20 overflow-hidden rounded-xl border-2 border-dotted border-foreground/20 bg-white/30 p-5">
              <div className="w-full space-y-5 divide-y-2 divide-dotted divide-foreground/20">
                <div className="grid w-full grid-cols-[60px_minmax(0,1fr)] items-center">
                  <Image
                    src={organizer.logo}
                    alt="Event Logo"
                    width={50}
                    height={50}
                    className={cn("size-[50px] rounded-full border-2")}
                  />
                  <div className="col-span-1">
                    <p className="line-clamp-2 text-sm font-bold">
                      {organizer.name}
                    </p>
                    <p className="text-sm">{orgLocationString}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-y-2 pt-4">
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
                          className="size-6 hover:scale-110"
                        >
                          <Globe className="size-6" />
                        </a>
                      )}
                      {organizer.links.email && (
                        <a
                          href={`mailto:${organizer.links.email}`}
                          className="size-6 hover:scale-110"
                        >
                          <FaEnvelope className="size-6" />
                        </a>
                      )}
                      {organizer.links.phone && (
                        <a
                          href={`tel:${organizer.links.phone}`}
                          className="size-6 hover:scale-110"
                        >
                          <Phone className="size-6" />
                        </a>
                      )}
                      {organizer.links.instagram && (
                        <a
                          href={organizer.links.instagram}
                          className="size-6 hover:scale-110"
                        >
                          <FaInstagram className="size-6" />
                        </a>
                      )}
                      {organizer.links.facebook && (
                        <a
                          href={organizer.links.facebook}
                          className="size-6 hover:scale-110"
                        >
                          <FaFacebook className="size-6" />
                        </a>
                      )}
                      {organizer.links.threads && (
                        <a
                          href={organizer.links.threads}
                          className="size-6 hover:scale-110"
                        >
                          <FaThreads className="size-6" />
                        </a>
                      )}
                      {organizer.links.vk && (
                        <a
                          href={organizer.links.vk}
                          className="size-6 hover:scale-110"
                        >
                          <FaVk className="size-6" />
                        </a>
                      )}
                    </div>
                  </section>
                </div>
              </div>
              <section className="flex flex-col justify-between pl-10">
                <span>
                  <p className="text-sm font-semibold">
                    About the Organization:
                  </p>
                  <p className="line-clamp-4 text-sm">{organizer.about}</p>
                </span>
                {orgHasOtherEvents && (
                  <a
                    className="mt-6 line-clamp-4 flex items-center justify-center gap-1 text-sm underline-offset-2 hover:underline"
                    href={`/organizer/${orgSlug}`}
                  >
                    Check out other events by this organizer
                    <TiArrowRight className="inline-block size-6" />
                    {/* Check out {organizer.name}&apos;s other events */}
                  </a>
                )}
              </section>
            </Card>
          </div>
          <div id="application">
            <p>Application content</p>
          </div>
        </NavTabs>
      </Card>
    </div>
  );
};
