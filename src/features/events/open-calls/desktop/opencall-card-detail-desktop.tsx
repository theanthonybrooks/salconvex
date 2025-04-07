"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  CalendarClockIcon,
  CircleCheck,
  Download,
  EyeOff,
  Globe,
  Info,
  MapIcon,
  MapPin,
  Phone,
} from "lucide-react";

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
  FaPaintRoller,
  FaRegBookmark,
  FaRegCommentDots,
  FaThreads,
  FaVk,
} from "react-icons/fa6";
import { IoAirplane } from "react-icons/io5";
import {
  PiForkKnifeFill,
  PiHouseLineFill,
  PiPencilLineFill,
} from "react-icons/pi";
import { TiArrowRight } from "react-icons/ti";

import { TbStairs } from "react-icons/tb";

import { ApplyButton } from "@/features/events/event-apply-btn";

import { OpenCallCardProps } from "@/types/openCall";

import NavTabs from "@/components/ui/nav-tabs";
import { useToggleListAction } from "@/features/artists/helpers/listActions";
import { getOpenCallStatus } from "@/features/events/open-calls/helpers/openCallStatus";
import { LazyMap } from "@/features/wrapper-elements/map/lazy-map";
import { generateICSFile } from "@/lib/addToCalendar";
import {
  formatEventDates,
  formatOpenCallDeadline,
  formatSingleDate,
  isValidIsoDate,
} from "@/lib/dateFns";
import {
  formatCurrency,
  formatRate,
  getEventCategoryLabel,
  getEventTypeLabel,
} from "@/lib/eventFns";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import slugify from "slugify";

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

  const orgHasOtherEvents = organizer?.events?.length > 1;
  const manualApplied = application?.manualApplied ?? false;
  const appStatus = application?.applicationStatus ?? null;
  const hasApplied = appStatus !== null;

  const { bookmarked, hidden } = artist?.listActions?.find(
    (la) => la.eventId === event._id,
  ) ?? {
    bookmarked: false,
    hidden: false,
  };

  const { locale, city, stateAbbr, country, countryAbbr } = location;
  const { eventStart, eventEnd, ongoing, artistStart, artistEnd } = dates;
  const {
    compensation,
    basicInfo,
    eligibility,
    requirements,
    _id: openCallId,
  } = openCall;

  const appUrl = requirements?.applicationLink ?? "/thelist"; //todo: figure out fallback url for something without an application link. Maybe just use the event url? Will obviously need to vary or be missing later when I implement the application system, but for now.

  const {
    type: eligibilityType,
    whom: eligibilityWhom,
    details: eligibilityDetails,
  } = eligibility;
  const { budget, categories } = compensation;
  const {
    designFee,
    accommodation,
    food,
    travelCosts,
    materials,
    equipment,
    other: otherCat,
  } = categories;

  const {
    min: budgetMin,
    max: budgetMax,
    currency,
    rate: budgetRate,

    allInclusive: allInclusiveBudget,
  } = budget;

  const {
    requirements: reqs,
    more: reqsMore,
    destination: reqsDestination,
    documents: reqsDocs,
  } = requirements;

  const catLength = Object.keys(categories).length;
  const hasCategories = catLength > 0;
  const allInclusive = allInclusiveBudget && !hasCategories;

  const [activeTab, setActiveTab] = useState("openCall");

  const { toggleListAction } = useToggleListAction(event._id);
  const { callType, dates: callDates } = basicInfo;
  const { ocStart, ocEnd, timezone } = callDates;

  const hasBudgetRange = budgetMax && budgetMax > 0;
  const hasBudget = !!(budgetMin > 0 || hasBudgetRange);
  const hasRate = !!budgetRate && budgetRate > 0;
  const noBudgetInfo = !hasBudget && !hasRate;

  const orgSlug = slugify(organizer.name);
  const latitude = location.coordinates?.latitude ?? 0;
  const longitude = location.coordinates?.longitude ?? 0;
  const openCallStatus = getOpenCallStatus(
    ocStart ? new Date(ocStart) : null,
    ocEnd ? new Date(ocEnd) : null,
    basicInfo.callType,
  );

  const hasEventDates =
    eventStart &&
    isValidIsoDate(eventStart) &&
    eventEnd &&
    isValidIsoDate(eventEnd);

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

  const icsLink =
    callType === "Fixed" && isValidIsoDate(ocStart) && isValidIsoDate(ocEnd)
      ? generateICSFile(
          event.name,
          ocStart,
          ocEnd,
          locationString,
          event.about ?? "",
          eventCategory,
          true,
          hasEventDates ? dates.eventStart! : "",
          hasEventDates ? dates.eventEnd! : "",
          `${openCallId}`,
        )
      : null;

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

          {/* <div className="col-span-1 row-start-2 flex flex-col items-center space-y-4 pt-2">
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
          </div> */}

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
            <p className="flex items-center gap-1 text-xs">
              Open call posted: {formatSingleDate(openCall._creationTime)}
            </p>

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
              // appStatus={appStatus}
              openCall={openCallStatus}
              manualApplied={appStatus}
              // setManualApplied={setManualApplied}
              isBookmarked={bookmarked}
              // setIsBookmarked={setIsBookmarked}
              isHidden={hidden}
              // setIsHidden={setIsHidden}
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
          {/*    <Tabs
            onValueChange={(value) => setActiveTab(value)}
            value={activeTab}
            defaultValue={activeTab}
            className="flex w-full flex-col justify-center"
          >
            /~ <TabsList className="relative flex h-12 w-full justify-around rounded-xl bg-white/60">
              {["openCall", "event", "organizer"].map((tab) => (
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
                      layoutId="tab-bg"
                      className="absolute inset-0 z-0 rounded-md bg-background shadow-sm"
                      initial={false}
                      exit={{ opacity: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative z-10">
                    {tab === "openCall" && "Open Call"}
                    {tab === "event" && getEventCategoryLabel(eventCategory)}
                    {tab === "organizer" && "Organizer"}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList> ~/

            /~ <TabsContent value="openCall">
          
            </TabsContent> ~/
            /~ <TabsContent value="event">
              <Card className="w-full max-w-[95vw] rounded-xl border-foreground/20 bg-white/60 p-5"></Card>
            </TabsContent> ~/
            <TabsContent value="organizer">
          
            </TabsContent>
          </Tabs>*/}
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
                    {/* <CircleCheck className="inline-block size-3 text-emerald-600 xl:size-4" /> */}
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
                    {/* <CircleCheck className="inline-block size-3 text-emerald-600 xl:size-4" /> */}
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
            <Accordion
              type="multiple"
              defaultValue={["item-1", "item-2", "item-3"]}
              className="space-y-4"
            >
              <AccordionItem
                value="item-1"
                className="rounded-lg border-2 bg-white/30 px-4"
              >
                <AccordionTrigger title="Deadline & Eligibility:" />
                <AccordionContent>
                  <div className="space-y-2 p-3">
                    <p>
                      <span className="font-semibold underline underline-offset-2">
                        Deadline:
                      </span>
                      <br />{" "}
                      <span className="flex items-center gap-x-2">
                        {formatOpenCallDeadline(
                          ocEnd || "",
                          timezone,
                          callType,
                        )}
                        {icsLink && callType === "Fixed" && (
                          <a
                            href={icsLink}
                            download={`${event.name.replace(/\s+/g, "_")}.ics`}
                          >
                            <CalendarClockIcon className="size-7 md:size-4" />
                          </a>
                        )}
                      </span>
                    </p>
                    <p>
                      <span className="font-semibold underline underline-offset-2">
                        Eligible:
                      </span>
                      <br />
                      <span
                        className={cn(
                          eligibilityType !== "International" && "text-red-600",
                        )}
                      >
                        {eligibilityType !== "International"
                          ? `${eligibilityType}: ${eligibilityWhom
                              .map((whom) => whom)
                              .join("/ ")} Artists*`
                          : eligibilityWhom}
                      </span>
                    </p>
                    {eligibilityDetails && (
                      <p>
                        <span className="font-semibold underline underline-offset-2">
                          More Info:
                        </span>
                        <br /> {eligibilityDetails}
                      </p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-2"
                className="rounded-lg border-2 bg-white/30 px-4"
              >
                <AccordionTrigger
                  title=" Budget & Compensation:"
                  // hasPreview
                  // hidePreview
                  className="w-full"
                >
                  {/* ----------------- Preview Section ------------------/ */}
                  {/*todo: add functionality for cases where no budget/no info is present*/}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="mb-4 grid grid-cols-2 p-3">
                    <div className="flex flex-col gap-2">
                      {!noBudgetInfo && (
                        <>
                          <div className="flex flex-col items-start gap-1">
                            <span className="font-semibold underline underline-offset-2">
                              {hasBudgetRange ? "Budget Range" : "Budget"}:
                            </span>
                            {hasBudget &&
                              formatCurrency(
                                budgetMin,
                                budgetMax,
                                currency,
                                false,
                                allInclusive,
                              )}
                          </div>
                          {hasRate && (
                            <div className="flex flex-col items-start gap-1">
                              <span className="font-semibold underline underline-offset-2">
                                Rate:
                              </span>
                              {formatRate(
                                budget.rate,
                                budget.unit,
                                budget.currency,
                                true,
                              )}
                            </div>
                          )}
                        </>
                      )}

                      {noBudgetInfo && <p className="text-sm">No Info</p>}
                      {budget.allInclusive && hasBudget && !hasCategories && (
                        <span className="text-sm font-bold italic text-red-600">
                          All-inclusive budget (no additional compensation)
                        </span>
                      )}
                      <div
                        id="budget-icons-${id}"
                        className="mt-2 flex max-w-full items-center gap-x-3"
                      >
                        <span
                          className={cn(
                            "rounded-full border-1.5 p-1",
                            designFee
                              ? "border-emerald-500 text-emerald-500"
                              : "border-foreground/20 text-foreground/20",
                          )}
                        >
                          <PiPencilLineFill size={18} />
                        </span>
                        <span
                          className={cn(
                            "rounded-full border-1.5 p-1",
                            accommodation
                              ? "border-emerald-500 text-emerald-500"
                              : "border-foreground/20 text-foreground/20",
                          )}
                        >
                          <PiHouseLineFill size={18} />
                        </span>
                        <span
                          className={cn(
                            "rounded-full border-1.5 p-1",
                            food
                              ? "border-emerald-500 text-emerald-500"
                              : "border-foreground/20 text-foreground/20",
                          )}
                        >
                          <PiForkKnifeFill size={18} />
                        </span>
                        <span
                          className={cn(
                            "rounded-full border-1.5 p-1",
                            materials
                              ? "border-emerald-500 text-emerald-500"
                              : "border-foreground/20 text-foreground/20",
                          )}
                        >
                          <FaPaintRoller size={18} />
                        </span>
                        <span
                          className={cn(
                            "rounded-full border-1.5 p-1",
                            travelCosts
                              ? "border-emerald-500 text-emerald-500"
                              : "border-foreground/20 text-foreground/20",
                          )}
                        >
                          <IoAirplane size={18} />
                        </span>
                        <span
                          className={cn(
                            "rounded-full border-1.5 p-1",
                            equipment
                              ? "border-emerald-500 text-emerald-500"
                              : "border-foreground/20 text-foreground/20",
                          )}
                        >
                          <TbStairs size={18} />
                        </span>
                        <span
                          className={cn(
                            "rounded-full border-1.5 p-1",
                            otherCat
                              ? "border-emerald-500 text-emerald-500"
                              : "border-foreground/20 text-foreground/20",
                          )}
                        >
                          <FaRegCommentDots size={18} />
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-y-2">
                      <p className="font-semibold underline underline-offset-2">
                        Compensation Includes:
                      </p>
                      {/* NOTE: How to better display this? It's a bit jarring at the moment
                    when viewing it. */}
                      <div className="flex flex-col justify-between gap-y-3 pr-[1px]">
                        <div className="flex items-center justify-between border-b border-dashed border-foreground/20">
                          <p className="font-medium">Design Fee:</p>
                          <p className="text-right">
                            {designFee && !allInclusive ? (
                              //todo: format the currency and possibly allow a union of either number or string for these. Then use typeof to determine which display method is used
                              // formatCurrency(designFee, null, currency)
                              designFee
                            ) : (
                              <span
                                className={cn(
                                  "italic text-red-500",
                                  noBudgetInfo && "text-muted-foreground",
                                )}
                              >
                                {!allInclusive ? "(not provided)" : "-"}
                              </span>
                            )}
                          </p>
                        </div>

                        <div className="flex items-center justify-between border-b border-dashed border-foreground/20">
                          <p className="font-medium">Accommodation:</p>
                          <p className="text-right">
                            {accommodation && !allInclusive ? (
                              accommodation
                            ) : (
                              <span
                                className={cn(
                                  "italic text-red-500",
                                  noBudgetInfo && "text-muted-foreground",
                                )}
                              >
                                {!allInclusive ? "(not provided)" : "-"}
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="flex items-center justify-between border-b border-dashed border-foreground/20">
                          <p className="font-medium">Food:</p>
                          <p className="text-right">
                            {food && !allInclusive ? (
                              food
                            ) : (
                              <span
                                className={cn(
                                  "italic text-red-500",
                                  noBudgetInfo && "text-muted-foreground",
                                )}
                              >
                                {!allInclusive ? "(not provided)" : "-"}
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="flex items-center justify-between border-b border-dashed border-foreground/20">
                          <p className="font-medium">Travel Costs:</p>
                          <p className="text-right">
                            {travelCosts && !allInclusive ? (
                              travelCosts
                            ) : (
                              <span
                                className={cn(
                                  "italic text-red-500",
                                  noBudgetInfo && "text-muted-foreground",
                                )}
                              >
                                {!allInclusive ? "(not provided)" : "-"}
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="flex items-center justify-between border-b border-dashed border-foreground/20">
                          <p className="font-medium">Materials:</p>
                          {materials && !allInclusive ? (
                            materials
                          ) : (
                            <span
                              className={cn(
                                "italic text-red-500",
                                noBudgetInfo && "text-muted-foreground",
                              )}
                            >
                              {!allInclusive ? "(not provided)" : "-"}
                            </span>
                          )}
                        </div>
                        {/* NOTE: this is a good thought. To add the ability for organizers to just check that it's included in the overall budget so artists don't think it's an additional amount.  */}
                        <div className="flex items-center justify-between border-b border-dashed border-foreground/20">
                          <p className="font-medium">Equipment:</p>
                          <p className="text-right">
                            {equipment && !allInclusive ? (
                              equipment
                            ) : (
                              <span
                                className={cn(
                                  "italic text-red-500",
                                  noBudgetInfo && "text-muted-foreground",
                                )}
                              >
                                {!allInclusive ? "(not provided)" : "-"}
                              </span>
                            )}
                          </p>
                        </div>
                        {hasCategories && otherCat && (
                          <div className="flex flex-col items-start justify-between gap-y-2">
                            <p className="font-medium">Other:</p>
                            <p>{otherCat && !allInclusive && otherCat}</p>
                          </div>
                        )}
                        {/* <li>Must have liability insurance</li> */
                        /* Note-to-self: this is something that coold/should be later. These sort of requirements*/}
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-3"
                className="rounded-lg border-2 bg-white/30 px-4"
              >
                <AccordionTrigger title="Application Requirements" />
                <AccordionContent>
                  <div className="mb-4 flex flex-col space-y-3 p-3">
                    <ol className="list-inside list-decimal px-4">
                      {reqs.map((requirement, index) => (
                        <li key={index}>{requirement}</li>
                      ))}

                      {/* <li>Must have liability insurance</li> */
                      /* TODO: this is something that could/should be later. These sort of requirements*/}
                    </ol>
                    <p className="text-sm">
                      {reqsMore.map((requirement, index) => (
                        <span key={index} className="mr-1 py-1">
                          {requirement}
                        </span>
                      ))}
                    </p>
                    <p className="">
                      Send applications to
                      <a
                        href={`mailto:${reqsDestination}?subject=${event.name} Open Call`}
                        className="mx-1 underline"
                      >
                        {reqsDestination}
                      </a>
                      and feel free to reach out with any questions
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-4"
                className="rounded-lg border-2 bg-white/30 px-4 pt-3"
              >
                <AccordionTrigger title="Documents:" />
                <AccordionContent>
                  <ol className="list-outside list-decimal px-4 pl-6">
                    {reqsDocs?.map((document, index) => (
                      <li key={index} className="py-2">
                        <div className="flex items-center gap-x-2">
                          {document.title}
                          <a href={document.href} download={document.title}>
                            <Download className="size-5 hover:scale-110" />
                          </a>
                        </div>
                      </li>
                    ))}
                  </ol>
                </AccordionContent>
              </AccordionItem>
              {openCall?.requirements?.otherInfo && (
                <AccordionItem value="item-5">
                  <AccordionTrigger title="Other info:" />
                  <AccordionContent>
                    <div className="mb-4 grid grid-cols-[1fr_auto] border-foreground/20 pb-3">
                      <ol className="list-inside list-decimal px-4">
                        {openCall?.requirements?.otherInfo?.map(
                          (info, index) => (
                            <li key={index} className="py-1">
                              {info}
                            </li>
                          ),
                        )}
                      </ol>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
            <div className="mt-6 flex w-full justify-end">
              <ApplyButton
                id={event._id}
                openCallId={openCallId}
                slug={slug}
                appUrl={appUrl}
                edition={event.dates.edition}
                // appStatus={appStatus}
                openCall={openCallStatus}
                manualApplied={appStatus}
                // setManualApplied={setManualApplied}
                isBookmarked={bookmarked}
                // setIsBookmarked={setIsBookmarked}
                isHidden={hidden}
                // setIsHidden={setIsHidden}
                eventCategory={eventCategory}
                appFee={basicInfo?.appFee ?? 0}
                className="mx-auto w-full max-w-52"
                detailCard
                finalButton
              />
            </div>
          </div>
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
                  <div className="mb-4 flex flex-col space-y-3 p-3">
                    <p>{event.about}</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
              {event.links && (
                <AccordionItem value="item-3">
                  <AccordionTrigger title="Links:" />

                  <AccordionContent>
                    <ul className="flex flex-col gap-y-2 p-3">
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
                  <AccordionContent className="p-3">
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
          </div>
          <div id="application">
            <p>Application content</p>
          </div>
        </NavTabs>
      </Card>
    </div>
  );
};

{
  /*
<Card
className={cn(
  "mb-10 hidden w-full min-w-[340px] max-w-[400px] grid-cols-[75px_auto] gap-x-3 rounded-3xl border-foreground/20 bg-white/50 p-3 first:mt-6 lg:grid",
  className,
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
    Application appStatus:{" "}
    <span className="font-bold">
      {appStatus === "accepted"
        ? "Accepted"
        : appStatus === "rejected"
          ? "Rejected"
          : "Pending"}
    </span>
  </span>
)}
<div className="col-span-full mb-4 grid w-full grid-cols-[75px_auto] gap-x-3">
  <div className="col-span-1 flex flex-col items-center justify-around space-y-6 pb-3 pt-3">
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
        <EyeOff
          className="h-6 w-6 cursor-pointer"
          onClick={onHide}
        />
      )}
    </div>
  </div>

  <div className="flex flex-col justify-between gap-y-3 pb-3 pr-3 pt-3">
    <div className="flex flex-col gap-y-1">
      <p className="mb-1 text-base font-semibold">
        {event?.name}
      </p>

      <p className="inline-flex items-end gap-x-1 text-sm">
        {locationString}
        <MapPin
          onClick={() => setActiveTab("event")}
          className="cursor-pointer transition-transform duration-150 hover:scale-105"
        />
      </p>
    </div>
    <div className="flex flex-col justify-between gap-y-1">
      <p className="flex items-center gap-x-1 text-sm">
        <span className="font-semibold">Dates:</span>
        {formatEventDates(
          eventStart || "",
          eventEnd || "",
          ongoing,
          "mobile",
        )}
      </p>
      <p className="flex items-center gap-x-1 text-sm">
        <span className="font-semibold">Category:</span>
        {getEventCategoryLabel(eventCategory)}
      </p>
      {eventType && eventCategory === "event" && (
        <p className="flex items-center gap-x-1 text-sm">
          <span className="font-semibold">Type:</span>{" "}
          {eventType
            .map((type) => getEventTypeLabel(type))
            .join(" | ")}
        </p>
      )}
      {basicInfo?.appFee !== 0 && (
        <p className="flex items-center gap-x-1 text-sm text-red-600">
          <span className="font-semibold">Application Fee:</span>
          {`$${basicInfo?.appFee}`}
        </p>
      )}
    </div>
    /~ NOTE: Make these dynamic and perhaps make a dropdown menu or popover or something for them. Not sure if they're really necessary right here.  ~/
    /~ <div className='flex gap-x-4 mt-3 items-center justify-start'>
        <MailIcon size={24} />
        <Globe size={24} />
        <FaInstagram size={24} />
        <FiFacebook size={24} />
        <FaVk size={24} />
      </div> ~/
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
      {["opencall", "event", "organizer"].map((tab) => (
        <TabsTrigger
          key={tab}
          value={tab}
          className={cn(
            "relative z-10 flex h-10 w-full items-center justify-center px-4 text-sm font-medium",
            activeTab === tab
              ? "text-black"
              : "text-muted-foreground",
          )}
        >
          {hasMounted && activeTab === tab && (
            <motion.div
              layoutId="tab-bg"
              className="absolute inset-0 z-0 rounded-md bg-background shadow-sm"
              initial={false}
              exit={{ opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 30,
              }}
            />
          )}
          <span className="relative z-10">
            {tab === "opencall" && "Open Call"}
            {tab === "event" &&
              getEventCategoryLabel(eventCategory)}
            {tab === "organizer" && "Organizer"}
          </span>
        </TabsTrigger>
      ))}
    </TabsList>

    <TabsContent value="opencall">
      <Card className="w-full rounded-xl border-foreground/20 bg-white/60 p-5">
        <Accordion defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger title="Deadline & Eligibility:" />
            <AccordionContent>
              <div className="space-y-2">
                <p>
                  <span className="font-semibold underline underline-offset-2">
                    Deadline:
                  </span>
                  <br />{" "}
                  <span className="flex items-center gap-x-2">
                    {formatOpenCallDeadline(
                      ocEnd || "",
                      timezone,
                      callType,
                    )}
                    {icsLink && callType === "Fixed" && (
                      <a
                        href={icsLink}
                        download={`${event.name.replace(
                          /\s+/g,
                          "_",
                        )}.ics`}
                      >
                        <CalendarClockIcon className="size-7 md:size-4" />
                      </a>
                    )}
                  </span>
                </p>
                <p>
                  <span className="font-semibold underline underline-offset-2">
                    Eligible:
                  </span>
                  <br />
                  <span
                    className={cn(
                      eligibilityType !== "International" &&
                        "text-red-600",
                    )}
                  >
                    {eligibilityType !== "International"
                      ? `${eligibilityType}: ${eligibilityWhom
                          .map((whom) => whom)
                          .join("/ ")} Artists*`
                      : eligibilityWhom}
                  </span>
                </p>
                {eligibilityDetails && (
                  <p>
                    <span className="font-semibold underline underline-offset-2">
                      More Info:
                    </span>
                    <br /> {eligibilityDetails}
                  </p>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger
              title=" Budget & Compensation:"
              hasPreview
              hidePreview
              className="w-full"
            >
              /~ ----------------- Preview Section ------------------/ ~/
              /~todo: add functionality for cases where no budget/no info is present~/
              <section className="flex w-full flex-col items-center justify-center gap-y-3 pt-2">
                <div className="flex justify-start">
                  {hasBudget &&
                    formatCurrency(
                      budgetMin,
                      budgetMax,
                      currency,
                      false,
                      allInclusive,
                    )}

                  {hasBudget && hasRate && (
                    <span className="text-sm"> | </span>
                  )}

                  {hasRate &&
                    formatRate(
                      budget.rate,
                      budget.unit,
                      budget.currency,
                      true,
                    )}

                  {noBudgetInfo && (
                    <p className="text-sm">No Info</p>
                  )}
                </div>

                <div
                  id="budget-icons-${id}"
                  className="col-span-2 flex max-w-full items-center justify-center gap-x-3"
                >
                  <span
                    className={cn(
                      "rounded-full border-1.5 p-1",
                      designFee
                        ? "border-emerald-500 text-emerald-500"
                        : "border-foreground/20 text-foreground/20",
                    )}
                  >
                    <PiPencilLineFill size={18} />
                  </span>
                  <span
                    className={cn(
                      "rounded-full border-1.5 p-1",
                      accommodation
                        ? "border-emerald-500 text-emerald-500"
                        : "border-foreground/20 text-foreground/20",
                    )}
                  >
                    <PiHouseLineFill size={18} />
                  </span>
                  <span
                    className={cn(
                      "rounded-full border-1.5 p-1",
                      food
                        ? "border-emerald-500 text-emerald-500"
                        : "border-foreground/20 text-foreground/20",
                    )}
                  >
                    <PiForkKnifeFill size={18} />
                  </span>
                  <span
                    className={cn(
                      "rounded-full border-1.5 p-1",
                      materials
                        ? "border-emerald-500 text-emerald-500"
                        : "border-foreground/20 text-foreground/20",
                    )}
                  >
                    <FaPaintRoller size={18} />
                  </span>
                  <span
                    className={cn(
                      "rounded-full border-1.5 p-1",
                      travelCosts
                        ? "border-emerald-500 text-emerald-500"
                        : "border-foreground/20 text-foreground/20",
                    )}
                  >
                    <IoAirplane size={18} />
                  </span>
                  <span
                    className={cn(
                      "rounded-full border-1.5 p-1",
                      equipment
                        ? "border-emerald-500 text-emerald-500"
                        : "border-foreground/20 text-foreground/20",
                    )}
                  >
                    <TbStairs size={18} />
                  </span>
                  <span
                    className={cn(
                      "rounded-full border-1.5 p-1",
                      other
                        ? "border-emerald-500 text-emerald-500"
                        : "border-foreground/20 text-foreground/20",
                    )}
                  >
                    <FaRegCommentDots size={18} />
                  </span>
                </div>
              </section>
            </AccordionTrigger>
            <AccordionContent>
              <div className="mb-4 flex flex-col space-y-3 pb-3">
                <div className="flex items-center gap-x-1">
                  <span className="font-semibold underline underline-offset-2">
                    Budget:
                  </span>
                  <span>
                    {hasBudget &&
                      formatCurrency(
                        budgetMin,
                        budgetMax,
                        currency,
                        false,
                        allInclusive,
                      )}
                    {hasBudget && hasRate && (
                      <span className="text-sm"> | </span>
                    )}
                    {hasRate &&
                      formatRate(
                        budget.rate,
                        budget.unit,
                        budget.currency,
                        true,
                      )}
                    {noBudgetInfo && (
                      <p className="text-sm">No Info</p>
                    )}
                  </span>
                </div>
                <p className="font-semibold underline underline-offset-2">
                  Compensation Includes:
                </p>
                /~ NOTE: How to better display this? It's a bit jarring at the moment
      when viewing it. ~/
                <div className="flex flex-col justify-between gap-y-3 pr-[1px]">
                  <div className="flex items-center justify-between border-b border-dashed border-foreground/20">
                    <p className="font-medium">Design Fee:</p>
                    <p className="text-right">
                      {designFee && !allInclusive ? (
                        //todo: format the currency and possibly allow a union of either number or string for these. Then use typeof to determine which display method is used
                        // formatCurrency(designFee, null, currency)
                        designFee
                      ) : (
                        <span
                          className={cn(
                            "italic text-red-500",
                            noBudgetInfo &&
                              "text-muted-foreground",
                          )}
                        >
                          {!noBudgetInfo ? "(not provided)" : "-"}
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-b border-dashed border-foreground/20">
                    <p className="font-medium">Accommodation:</p>
                    <p className="text-right">
                      {accommodation && !allInclusive ? (
                        accommodation
                      ) : (
                        <span
                          className={cn(
                            "italic text-red-500",
                            noBudgetInfo &&
                              "text-muted-foreground",
                          )}
                        >
                          {!noBudgetInfo ? "(not provided)" : "-"}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center justify-between border-b border-dashed border-foreground/20">
                    <p className="font-medium">Food:</p>
                    <p className="text-right">
                      {food && !allInclusive ? (
                        food
                      ) : (
                        <span
                          className={cn(
                            "italic text-red-500",
                            noBudgetInfo &&
                              "text-muted-foreground",
                          )}
                        >
                          {!noBudgetInfo ? "(not provided)" : "-"}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center justify-between border-b border-dashed border-foreground/20">
                    <p className="font-medium">Travel Costs:</p>
                    <p className="text-right">
                      {travelCosts && !allInclusive ? (
                        travelCosts
                      ) : (
                        <span
                          className={cn(
                            "italic text-red-500",
                            noBudgetInfo &&
                              "text-muted-foreground",
                          )}
                        >
                          {!noBudgetInfo ? "(not provided)" : "-"}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center justify-between border-b border-dashed border-foreground/20">
                    <p className="font-medium">Materials:</p>
                    {materials && !allInclusive ? (
                      materials
                    ) : (
                      <span
                        className={cn(
                          "italic text-red-500",
                          noBudgetInfo && "text-muted-foreground",
                        )}
                      >
                        {!noBudgetInfo ? "(not provided)" : "-"}
                      </span>
                    )}
                  </div>
                  /~ NOTE: this is a good thought. To add the ability for organizers to just check that it's included in the overall budget so artists don't think it's an additional amount.  ~/
                  <div className="flex items-center justify-between border-b border-dashed border-foreground/20">
                    <p className="font-medium">Equipment:</p>
                    <p className="text-right">
                      {equipment && !allInclusive ? (
                        equipment
                      ) : (
                        <span
                          className={cn(
                            "italic text-red-500",
                            noBudgetInfo &&
                              "text-muted-foreground",
                          )}
                        >
                          {!noBudgetInfo ? "(not provided)" : "-"}
                        </span>
                      )}
                    </p>
                  </div>
                  {categories && other && (
                    <div className="flex flex-col items-start justify-between gap-y-2">
                      <p className="font-medium">Other:</p>
                      <p>
                        {other && !allInclusive ? (
                          other
                        ) : (
                          <span className="italic text-red-500">
                            {!noBudgetInfo
                              ? "(not provided)"
                              : "No Info"}
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                  /~ <li>Must have liability insurance</li> */
  /* Note-to-self: this is something that coold/should be later. These sort of requirements~/
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger title="Application Requirements" />
            <AccordionContent>
              <div className="mb-4 flex flex-col space-y-3 pb-3">
                <ol className="list-inside list-decimal px-4">
                  {reqs.map((requirement, index) => (
                    <li key={index}>{requirement}</li>
                  ))}

                  /~ <li>Must have liability insurance</li> */
  /* TODO: this is something that could/should be later. These sort of requirements~/
                </ol>
                <p className="text-sm">
                  {reqsMore.map((requirement, index) => (
                    <span key={index} className="mr-1 py-1">
                      {requirement}
                    </span>
                  ))}
                </p>
                <p className="">
                  Send applications to
                  <a
                    href={`mailto:${reqsDestination}?subject=${event.name} Open Call`}
                    className="mx-1 underline"
                  >
                    {reqsDestination}
                  </a>
                  and feel free to reach out with any questions
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger title="Documents:" />
            <AccordionContent>
              <ol className="list-outside list-decimal px-4 pl-6">
                {reqsDocs?.map((document, index) => (
                  <li key={index} className="py-2">
                    <div className="flex items-center gap-x-2">
                      {document.title}
                      <a
                        href={document.href}
                        download={document.title}
                      >
                        <Download className="size-5 hover:scale-110" />
                      </a>
                    </div>
                  </li>
                ))}
              </ol>
            </AccordionContent>
          </AccordionItem>
          {openCall?.requirements?.otherInfo && (
            <AccordionItem value="item-5">
              <AccordionTrigger title="Other info:" />
              <AccordionContent>
                <div className="mb-4 grid grid-cols-[1fr_auto] border-foreground/20 pb-3">
                  <ol className="list-inside list-decimal px-4">
                    {openCall?.requirements?.otherInfo?.map(
                      (info, index) => (
                        <li key={index} className="py-1">
                          {info}
                        </li>
                      ),
                    )}
                  </ol>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
        <ApplyButton
          id={event._id}
          openCallId={openCallId}
          slug={slug}
          appUrl={appUrl}
          edition={event.dates.edition}
          // appStatus={appStatus}
          openCall={openCallStatus}
          manualApplied={appStatus}
          // setManualApplied={setManualApplied}
          isBookmarked={bookmarked}
          // setIsBookmarked={setIsBookmarked}
          isHidden={hidden}
          // setIsHidden={setIsHidden}
          eventCategory={eventCategory}
          appFee={basicInfo?.appFee ?? 0}
          className="w-full"
          detailCard
        />
      </Card>
    </TabsContent>
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
                        {link.type === "email" ||
                        link.type === "website"
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
            <p className="text-sm">{orgLocationString}</p>
          </div>
        </div>
        <div className="w-full space-y-5">
          <section>
            <p className="text-sm font-semibold">
              About the Organization:
            </p>
            <p className="line-clamp-4 text-sm">
              {organizer.about}
            </p>
          </section>
          <section className="flex flex-col gap-y-2">
            <span>
              <p className="text-sm font-semibold">Organizer:</p>
              <p className="line-clamp-4 text-sm">
                {organizer.contact.organizer}
              </p>
            </span>
            <span>
              <p className="text-sm font-semibold">
                Main Contact:
              </p>
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
            {orgHasOtherEvents && (
              <a
                className="mt-6 line-clamp-4 flex items-center justify-center gap-1 text-sm underline-offset-2 hover:underline"
                href={`/organizer/${orgSlug}`}
              >
                Check out other events by this organizer
                <TiArrowRight className="inline-block size-6" />
                /~ Check out {organizer.name}&apos;s other events ~/
              </a>
            )}
          </section>
        </div>

        /~ <div className='col-span-full'>
          <h3>Other Events/Projects by this organizer:</h3>
          <ul>
            <li>
              Event Name <Link href='#'>(link)</Link>
            </li>
            <li>
              Event Name <Link href='#'>(link)</Link>
            </li>
          </ul>
        </div> ~/
      </Card>
    </TabsContent>
  </Tabs>
</div>
</Card>*/
}
