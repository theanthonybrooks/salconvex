"use client";

import { OpenCallCardProps } from "@/types/openCall";

import { Card } from "@/components/ui/card";
import NavTabs from "@/components/ui/nav-tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/state-accordion-test";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { CircleCheck, EyeOff, Info, MapPin } from "lucide-react";
import { FaBookmark, FaRegBookmark } from "react-icons/fa6";
import { IoIosArrowRoundBack } from "react-icons/io";

import { useToggleListAction } from "@/features/artists/helpers/listActions";
import { EventCard } from "@/features/events/components/events-card";
import { ApplyButton } from "@/features/events/event-apply-btn";
import OpenCallCard from "@/features/events/open-calls/components/open-call-card";
import { getOpenCallStatus } from "@/features/events/open-calls/helpers/openCallStatus";
import { OrganizerCard } from "@/features/organizers/components/organizer-card";

import EventDates from "@/features/events/components/event-dates";
import {
  formatEventDates,
  formatOpenCallDeadline,
  formatSingleDate,
} from "@/lib/dateFns";
import { getEventCategoryLabel, getEventTypeLabel } from "@/lib/eventFns";
import { cn } from "@/lib/utils";

export const OpenCallCardDetailDesktop = (props: OpenCallCardProps) => {
  const router = useRouter();
  const { data, artist, className } = props;
  const { event, organizer, openCall, application } = data;
  const {
    logo: eventLogo,
    eventCategory,
    eventType,
    location,
    dates,
    slug,
  } = event;

  const manualApplied = application?.manualApplied ?? false;
  const appStatus = application?.applicationStatus ?? null;
  const hasApplied = appStatus !== null;

  console.log(application?.applicationStatus, application?.manualApplied);

  const { bookmarked, hidden } = artist?.listActions?.find(
    (la) => la.eventId === event._id,
  ) ?? {
    bookmarked: false,
    hidden: false,
  };

  const { locale, city, stateAbbr, country, countryAbbr } = location;
  const { ongoing, artistStart, artistEnd } = dates;
  const { basicInfo, requirements, _id: openCallId } = openCall;

  const appUrl = requirements?.applicationLink ?? "/thelist"; //todo: figure out fallback url for something without an application link. Maybe just use the event url? Will obviously need to vary or be missing later when I implement the application system, but for now.

  const [activeTab, setActiveTab] = useState("openCall");

  const { toggleListAction } = useToggleListAction(event._id);
  const { callType, dates: callDates } = basicInfo;
  const { ocStart, ocEnd, timezone } = callDates;

  const openCallStatus = getOpenCallStatus(
    ocStart ? new Date(ocStart) : null,
    ocEnd ? new Date(ocEnd) : null,
    basicInfo.callType,
  );

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

  const onBookmark = () => {
    toggleListAction({ bookmarked: !bookmarked });
  };

  const onHide = () => {
    toggleListAction({ hidden: !hidden });
  };

  const tabList = [
    { id: "openCall", label: "Open Call" },
    // { id: "application", label: "My Application" },
    { id: "event", label: getEventCategoryLabel(eventCategory) },
    { id: "organizer", label: "Organizer" },
  ];

  const onBackClick = () => {
    const previous = sessionStorage.getItem("previousSalPage");
    if (previous && previous.startsWith("/")) {
      router.push(previous);
    } else {
      router.push("/thelist");
    }
  };

  const isHtml = (str: string) => /<\/?[a-z][\s\S]*>/i.test(str);

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
        {appStatus !== null && !manualApplied && (
          <span
            className={cn(
              "col-start-2 w-fit rounded-full border-2 border-foreground/30 bg-white/70 px-2 py-1 text-xs",
              appStatus === "accepted"
                ? "border-emerald-500/50 text-emerald-600"
                : appStatus === "rejected"
                  ? "border-red-500/30 text-red-500"
                  : appStatus === "pending"
                    ? "italic text-foreground/50"
                    : "",
            )}
          >
            Application status:{" "}
            <span className="font-bold">
              {appStatus === "accepted"
                ? "Accepted"
                : appStatus === "rejected"
                  ? "Rejected"
                  : "Pending"}
            </span>
          </span>
        )}
        <div className="col-span-full mb-4 grid w-full grid-cols-[75px_auto] gap-x-3 pt-2">
          <div className="col-span-1 flex items-center justify-center">
            <Image
              src={eventLogo}
              alt="Event Logo"
              width={60}
              height={60}
              className={cn(
                "size-[60px] rounded-full border-2",

                appStatus === "accepted"
                  ? "ring-4 ring-emerald-500 ring-offset-1"
                  : appStatus === "rejected"
                    ? "ring-4 ring-red-500 ring-offset-1"
                    : appStatus === "pending"
                      ? "ring-4 ring-foreground/20 ring-offset-1"
                      : "",
              )}
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
            <div className="flex flex-col items-start gap-1 text-sm">
              <span className="space-x-1 font-semibold">
                {getEventCategoryLabel(eventCategory)} Dates:
              </span>
              <EventDates event={event} format="desktop" limit={0} />
            </div>
            {/*//todo: add this part */}
            {eventCategory === "project" ||
              (eventCategory === "event" && artistStart && artistEnd && (
                <div className="flex flex-col items-start gap-1 text-sm">
                  <span className="space-x-1 font-semibold">
                    Painting/Production Dates:
                  </span>
                  {/* TODO: Add this functionality after there are some artist/painting dates entered */}
                  {formatEventDates(
                    artistStart || "",
                    artistEnd || "",
                    ongoing,
                  )}
                </div>
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
                    {isHtml(event.about) ? (
                      <div dangerouslySetInnerHTML={{ __html: event.about }} />
                    ) : (
                      <p>{event.about}</p>
                    )}
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
            <p className="flex items-center gap-1 text-xs">
              Open call posted: {formatSingleDate(openCall._creationTime)}
            </p>
          </div>
        </div>

        <div className="col-span-full flex w-full flex-col items-start justify-start gap-y-3 overflow-hidden">
          <Card className="flex w-full flex-col gap-y-2 rounded-xl border-foreground/20 bg-white/60 p-5">
            {!appUrl && (
              <p
                className={cn(
                  "flex items-center justify-center gap-x-2 text-center text-sm text-muted-foreground",
                  basicInfo?.appFee === 0 && "text-red-600",
                )}
                onClick={onHide}
              >
                <Info className="size-4" /> External Application
              </p>
            )}
            {basicInfo?.appFee !== 0 && (
              <p className="flex w-full items-center justify-center gap-x-1 text-center text-sm text-red-600">
                <span className="font-semibold">Application Fee:</span>
                {`$${basicInfo?.appFee}`}
              </p>
            )}
            <ApplyButton
              id={event._id}
              openCallId={openCallId}
              slug={slug}
              appUrl={appUrl}
              edition={event.dates.edition}
              openCall={openCallStatus}
              manualApplied={appStatus}
              isBookmarked={bookmarked}
              isHidden={hidden}
              eventCategory={eventCategory}
              appFee={basicInfo?.appFee ?? 0}
              className="w-full"
              detailCard
              finalButton
            />
            <p
              className={cn(
                "mt-2 flex w-full items-center justify-center gap-x-1 text-center text-sm italic text-muted-foreground hover:cursor-pointer",
                hidden && "text-red-600 underline underline-offset-2",
              )}
              onClick={onHide}
            >
              {hidden ? "Marked" : "Mark"} as not interested
              {!hidden ? "?" : "."}
            </p>
          </Card>
        </div>
      </Card>

      <Card className="col-start-2 row-start-2 flex w-full flex-col gap-y-2 rounded-3xl border-foreground/20 bg-white/50 p-4">
        <div className="flex h-20 w-full items-center gap-x-4 divide-x-2 rounded-2xl border border-dotted border-foreground/50 bg-[#fef9dd] p-4">
          <div
            className={cn(
              "flex h-14 w-20 flex-col items-center justify-center rounded-lg border-1.5 border-dotted py-[5px]",
            )}
          >
            <span className="text-xs leading-[0.95rem]">Call Type</span>
            <span className="font-foreground text-2xl font-bold leading-[1.4rem]">
              {basicInfo && basicInfo.callFormat}
            </span>
            {/* // todo: make this dynamic to show project, event, etc for the type */}
            {/* <span className="text-xs leading-[0.95rem]">
                {getEventCategoryLabel(eventCategory)}
              </span> */}
          </div>
          <div className="flex w-full items-center justify-between pr-2">
            <div className="flex items-center gap-x-4 px-4">
              <Image
                src={eventLogo}
                alt="Event Logo"
                width={60}
                height={60}
                className={cn(
                  "size-[60px] rounded-full border-2 xl:hidden",

                  appStatus === "accepted"
                    ? "ring-4 ring-emerald-500 ring-offset-1"
                    : appStatus === "rejected"
                      ? "ring-4 ring-red-500 ring-offset-1"
                      : appStatus === "pending"
                        ? "ring-4 ring-foreground/20 ring-offset-1"
                        : "",
                )}
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
              <div className="flex flex-col items-end gap-1">
                <span className="items-center gap-x-2 text-xs xl:flex xl:text-sm">
                  Deadline: &nbsp;
                  {formatOpenCallDeadline(ocEnd || "", timezone, callType)}
                </span>
                {application?.applicationTime && hasApplied && (
                  <span className="flex items-center gap-x-1 text-xs italic text-muted-foreground xl:text-sm">
                    Applied: {formatSingleDate(application.applicationTime)}
                  </span>
                )}
                {!hasApplied && hidden && (
                  <span className="flex items-center gap-x-1 text-xs italic text-muted-foreground xl:text-sm">
                    Event is currently hidden from your feed.{" "}
                    <p
                      className="cursor-pointer underline-offset-1 hover:underline"
                      onClick={onHide}
                    >
                      Unhide?
                    </p>
                  </span>
                )}
              </div>
              {appStatus ? (
                <CircleCheck className="size-7 text-emerald-600" />
              ) : hidden ? (
                <EyeOff
                  className="size-7 cursor-pointer text-muted-foreground"
                  onClick={onHide}
                />
              ) : bookmarked ? (
                <FaBookmark
                  className="size-7 cursor-pointer text-red-500"
                  onClick={onBookmark}
                />
              ) : (
                <FaRegBookmark
                  className="size-7 cursor-pointer"
                  onClick={onBookmark}
                />
              )}
            </div>
          </div>
        </div>
        <NavTabs
          tabs={tabList}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        >
          <div id="openCall">
            <OpenCallCard event={event} openCall={openCall} format="desktop" />
            <div className="mt-6 flex w-full justify-end">
              <ApplyButton
                id={event._id}
                openCallId={openCallId}
                slug={slug}
                appUrl={appUrl}
                edition={event.dates.edition}
                openCall={openCallStatus}
                manualApplied={appStatus}
                isBookmarked={bookmarked}
                isHidden={hidden}
                eventCategory={eventCategory}
                appFee={basicInfo?.appFee ?? 0}
                className="mx-auto w-full max-w-52"
                detailCard
                finalButton
              />
            </div>
          </div>
          <div id="event">
            <EventCard event={event} organizer={organizer} format="desktop" />
          </div>
          <div id="organizer">
            <OrganizerCard organizer={organizer} format="desktop" />
          </div>
          <div id="application">
            <p>Application content</p>
          </div>
        </NavTabs>
      </Card>
    </div>
  );
};
