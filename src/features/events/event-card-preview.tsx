"use client";

import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToggleListAction } from "@/features/artists/helpers/listActions";
import {
  ApplyButton,
  ApplyButtonShort,
} from "@/features/events/event-apply-btn";
import EventContextMenu from "@/features/events/ui/event-context-menu";
import { CombinedEventPreviewCardData } from "@/hooks/use-combined-events";
import { formatEventDates, formatOpenCallDeadline } from "@/lib/dateFns";
import {
  formatCurrency,
  formatRate,
  getEventCategoryLabel,
  getEventTypeLabel,
} from "@/lib/eventFns";

import { cn } from "@/lib/utils";
import {
  CheckCircleIcon,
  CircleDollarSignIcon,
  EyeOff,
  Info,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaBookmark,
  FaEnvelope,
  FaFacebook,
  FaGlobe,
  FaInstagram,
  FaMapLocationDot,
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
import { TbStairs } from "react-icons/tb";

export interface EventCardPreviewProps {
  event: CombinedEventPreviewCardData;
  publicView?: boolean;
}

const EventCardPreview = ({ event, publicView }: EventCardPreviewProps) => {
  const router = useRouter();
  const {
    dates,
    location,
    eventCategory,

    eventType,
    name,
    logo,
    tabs,
    bookmarked,

    // manualApplied,
    // organizerId,
    // hasActiveOpenCall,
    hidden,
    openCallStatus,
    // eventId,
    // orgName,
    status: appStatus,
    slug,
  } = event;

  const { opencall } = tabs;
  const orgLinkName = slug;

  // const { compensation, basicInfo, eligibility } = opencall
  // const { budget, categories } = compensation
  const compensation = event.hasActiveOpenCall
    ? opencall?.compensation
    : undefined;
  const basicInfo = event.hasActiveOpenCall ? opencall?.basicInfo : undefined;
  const eligibility = event.hasActiveOpenCall
    ? opencall?.eligibility
    : undefined;
  const budget = compensation?.budget;
  const categories = compensation?.categories ?? {};
  const noCategories =
    categories === null || Object.keys(categories).length === 0;

  const { locale, city, stateAbbr, country, countryAbbr } = location;

  const locationParts: string[] = [];
  const hasOpenCall = openCallStatus === "active";
  const eventNameUrl = event.name.split(" ").join("-");

  if (locale) locationParts.push(locale);

  if (city && stateAbbr) {
    locationParts.push(`${city}, ${stateAbbr}`);
  } else if (city) {
    locationParts.push(city);
  } else if (stateAbbr) {
    locationParts.push(stateAbbr);
  }

  if (countryAbbr === "UK" || countryAbbr === "USA") {
    locationParts.push(countryAbbr);
  } else if (country) {
    locationParts.push(country);
  }

  const locationString = locationParts.join(",\n");

  // console.log("appStatus", appStatus);
  //Todo: This should technically override the status if cleared and remove any application status for that event for that user

  // const icsLink =
  //   callType === "Fixed" && dates.ocStart && dates.ocEnd
  //     ? generateICSFile(
  //         event.name,
  //         dates.ocStart,
  //         dates.ocEnd,
  //         locationString,
  //         eventTab.about,
  //         dates.eventStart ? dates.eventStart : "",
  //         dates.eventEnd,
  //         `${id}`
  //       )
  //     : null

  const hasBudget = !!(
    budget &&
    (budget.min > 0 || (budget.max && budget.max > 0))
  );
  const hasRate = !!(budget && budget.rate && budget.rate > 0);

  const isCurrentlyOpen =
    basicInfo && budget && eligibility && event.hasActiveOpenCall;

  // const userCurrency = userPref?.currency ?? ""

  const { toggleListAction } = useToggleListAction(event._id);

  const onBookmark = () => {
    if (publicView) {
      router.push("/pricing");
    } else {
      toggleListAction({ bookmarked: !bookmarked });
    }
  };

  const onHide = () => {
    if (publicView) {
      router.push("/pricing");
    } else {
      toggleListAction({ hidden: !hidden });
    }
  };

  return (
    <>
      {/* //---------------------- (Mobile) Layout ---------------------- */}
      <Card className="mb-6 grid w-[90vw] min-w-[340px] max-w-[400px] grid-cols-[75px_minmax(0,auto)_50px] gap-x-3 rounded-3xl border-foreground/20 bg-white/40 px-1 py-2 first:mt-6 last:mb-2 lg:hidden">
        <div className="col-span-1 row-span-2 flex flex-col items-center justify-between pb-3 pl-2 pt-3">
          <Link
            href={
              !publicView ? `/organization/${orgLinkName}` : "/pricing#plans"
            }
            target="_blank"
            passHref
          >
            <Image
              src={logo}
              alt="Event Logo"
              className={cn(
                "size-12 rounded-full border border-black",
                !publicView &&
                  hasOpenCall &&
                  (event.status === "accepted"
                    ? "ring-4 ring-emerald-500 ring-offset-1"
                    : event.status === "rejected"
                      ? "ring-4 ring-red-500 ring-offset-1"
                      : event.status === "pending"
                        ? "ring-4 ring-foreground/30 ring-offset-1"
                        : ""),
              )}
              height={48}
              width={48}
            />
          </Link>
          <div
            className={cn(
              "flex h-11 w-14 flex-col items-center justify-center rounded-lg border-1.5 border-dotted py-[5px]",
              !isCurrentlyOpen && "opacity-0",
            )}
          >
            <span className="text-2xs leading-[0.85rem]">Call Type</span>
            <span className="text-md font-foreground font-bold leading-[0.85rem]">
              {basicInfo && basicInfo.callFormat}
            </span>
            {/* // todo: make this dynamic to show project, event, etc for the type */}
            <span className="text-2xs leading-[0.85rem]">
              {getEventCategoryLabel(eventCategory)}
            </span>
          </div>
        </div>

        {/* <CardHeader>
            <CardTitle>The List</CardTitle>
          </CardHeader>*/}
        <div className="flex flex-col gap-y-3 pb-3 pt-3">
          <div className="mb-2 flex flex-col gap-y-1">
            <div className="mb-2 flex flex-col gap-y-1">
              <p className="text-base font-semibold">{event?.name}</p>
              <p className="text-sm">{locationString}</p>
            </div>
            <p className="flex items-center gap-x-1 text-sm">
              {/* // todo: make this dynamic to show whether event, project, or... else. This won't necessarily be an event timeline, and I think it should default to painting dates rather than event dates */}
              <span className="font-semibold">Dates:</span>
              {formatEventDates(
                dates?.eventStart || "",
                dates?.eventEnd || "",
                dates?.ongoing,
                "mobile",
                true,
              )}
            </p>
            {isCurrentlyOpen && (
              <p className={cn("flex items-center gap-x-1 text-sm")}>
                <span className={"font-semibold"}>
                  {basicInfo.callType === "Fixed" ? "Deadline" : "Status"}:
                </span>
                {publicView ? (
                  <span className="pointer-events-none blur-[5px]">
                    This Year
                  </span>
                ) : (
                  formatOpenCallDeadline(
                    basicInfo.dates?.ocEnd || "",
                    basicInfo.dates?.timezone,
                    basicInfo.callType,
                    true,
                  )
                )}
              </p>
            )}
            {isCurrentlyOpen && (
              <p className={cn("flex items-center gap-x-1 text-sm")}>
                <span className="font-semibold">Budget:</span>
                {publicView ? (
                  <span className="pointer-events-none blur-[5px]">
                    Sign in to view
                  </span>
                ) : budget.min > 0 || (budget.max && budget.max > 0) ? (
                  formatCurrency(
                    budget.min,
                    budget.max,
                    budget.currency,
                    true,
                    budget.allInclusive,
                    // userCurrency !== currency ? userCurrency : undefined
                  )
                ) : budget.rate && budget.rate > 0 ? (
                  formatRate(
                    budget.rate,
                    budget.unit,
                    budget.currency,
                    budget.allInclusive,
                    // userCurrency !== currency ? userCurrency : undefined
                  )
                ) : (
                  "No Info"
                )}
              </p>
            )}
            {isCurrentlyOpen && (
              <p
                className={cn(
                  "flex items-center gap-x-1 text-sm",
                  !event.hasActiveOpenCall && "hidden",
                )}
              >
                <span className="font-semibold">Eligible:</span>
                {publicView ? (
                  <span className="pointer-events-none blur-[5px]">
                    $3 per month
                  </span>
                ) : (
                  <span
                    className={cn(
                      eligibility.type !== "International" && "text-red-600",
                    )}
                  >
                    {eligibility.whom.length > 1
                      ? "See details"
                      : eligibility.whom[0]}
                    {eligibility.type !== "International" &&
                      eligibility.whom.length === 1 &&
                      " Artists*"}
                  </span>
                )}
              </p>
            )}
          </div>

          <ApplyButtonShort
            slug={eventNameUrl}
            edition={event.dates.edition}
            appStatus={event.status}
            openCall={event.openCallStatus}
            publicView={publicView}
            appFee={basicInfo ? basicInfo.appFee : 0}
          />
        </div>
        <div className="flex flex-col items-center justify-between pb-5 pr-2 pt-5">
          {event.status === null && !appStatus ? (
            <CircleDollarSignIcon
              className={cn(
                "size-6 text-red-600",
                !basicInfo?.appFee && "opacity-0",
              )}
            />
          ) : (
            <CheckCircleIcon
              className={cn(
                "size-6 text-emerald-600",
                (publicView || !hasOpenCall) && "hidden",
              )}
            />
          )}
          <div className="flex items-center justify-center gap-x-2">
            {bookmarked ? (
              <FaBookmark
                className="size-8 cursor-pointer text-red-600"
                onClick={onBookmark}
              />
            ) : (
              <FaRegBookmark
                className="size-8 cursor-pointer"
                onClick={onBookmark}
              />
            )}
          </div>
        </div>
      </Card>
      {/* //---------------------- (Desktop) Layout ---------------------- */}
      <Card
        className={cn(
          "mb-10 hidden min-h-[15em] w-[90vw] min-w-[640px] max-w-7xl grid-cols-[60px_minmax(0,auto)_15%_22%_20%] gap-x-3 rounded-3xl border-foreground/20 bg-white/40 transition-colors duration-100 ease-in-out first:mt-6 hover:bg-white/50 hover:shadow-lg lg:grid xl:grid-cols-[60px_minmax(0,auto)_15%_25%_25%]",
        )}
      >
        <div className="flex flex-col items-center justify-between border-r border-foreground/20 pb-3 pt-5">
          <div className="flex flex-col items-center gap-y-3">
            {bookmarked ? (
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger>
                    <FaBookmark
                      className="size-7 cursor-pointer text-red-600"
                      onClick={onBookmark}
                    />
                  </TooltipTrigger>
                  <TooltipContent align="start">
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
                    />
                  </TooltipTrigger>
                  <TooltipContent align="start">
                    <p>Bookmark {getEventCategoryLabel(event.eventCategory)}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {appStatus === null ? (
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger>
                    <CircleDollarSignIcon
                      className={cn(
                        "size-6 text-red-600",
                        !basicInfo?.appFee && "hidden",
                      )}
                    />
                  </TooltipTrigger>
                  <TooltipContent align="start">
                    <p>Has application fee</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger>
                    <CheckCircleIcon
                      className={cn(
                        "size-6 text-emerald-600",
                        publicView && "hidden",
                      )}
                    />
                  </TooltipTrigger>
                  <TooltipContent align="start">
                    <p>
                      Status:{" "}
                      {appStatus.slice(0, 1).toUpperCase() + appStatus.slice(1)}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {hidden && (
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger>
                    <EyeOff
                      className="size-6 cursor-pointer"
                      onClick={onHide}
                    />
                  </TooltipTrigger>
                  <TooltipContent align="start">
                    <p>Unhide event?</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {/* TODO: Add publicView check to this as well (when the state is set up) */}
          </div>
          <EventContextMenu
            eventId={event._id}
            openCallId={opencall ? opencall._id : ""}
            isHidden={hidden}
            // sethidden={sethidden}
            publicView={publicView}
            appStatus={appStatus}
            eventCategory={eventCategory}
            openCallStatus={openCallStatus}
            // setManualApplied={setManualApplied}
            align="start"
          />
        </div>

        <div className="flex flex-col gap-y-3 pb-3 pl-3 pr-7 pt-5">
          <div className="mb-2 flex flex-col gap-y-1 p-2">
            <Link
              href={
                !publicView ? `/organization/${orgLinkName}` : "/pricing#plans"
              }
              target="_blank"
            >
              <div className="mb-2 flex items-center gap-x-3">
                <Image
                  src={logo}
                  alt="Event Logo"
                  className={cn(
                    "size-12 rounded-full border border-black",
                    !publicView &&
                      hasOpenCall &&
                      (event.status === "accepted"
                        ? "ring-4 ring-emerald-500 ring-offset-1"
                        : event.status === "rejected"
                          ? "ring-4 ring-red-500 ring-offset-1"
                          : event.status === "pending"
                            ? "ring-4 ring-foreground/30 ring-offset-1"
                            : ""),
                  )}
                  height={48}
                  width={48}
                />
                <p className="text-base font-semibold">{name}</p>
                {/* <p className='text-sm'>{locationString}</p> */}
              </div>
            </Link>
            <p className="flex items-center gap-x-1 text-sm">
              {/* // todo: make this dynamic to show whether event, project, or... else. This won't necessarily be an event timeline, and I think it should default to painting dates rather than event dates */}
              <span className="font-semibold">Dates:</span>
              {formatEventDates(
                dates?.eventStart || "",
                dates?.eventEnd || "",
                dates.ongoing,
                "desktop",
              )}
            </p>
            <p className="flex items-center gap-x-1 text-sm">
              <span className="font-semibold">Category:</span>

              {getEventCategoryLabel(eventCategory)}
            </p>
            {eventCategory === "event" && eventType && (
              <p className="flex items-center gap-x-1 text-sm">
                <span className="font-semibold">Type:</span>
                {eventType.map((type) => getEventTypeLabel(type)).join(" | ")}
              </p>
            )}
            {(event.adminNote || event.adminNoteOC) && (
              <p className="flex flex-col gap-y-1 text-sm">
                <span className="font-semibold">Note:</span>
                {event.adminNoteOC && event.adminNoteOC}
                {event.adminNote && !event.adminNoteOC && event.adminNote}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-y-6 pb-3 pt-8 text-sm">
          {/* // todo: make this dynamic to show whether event, project, or... else. This won't necessarily be an event timeline, and I think it should default to painting dates rather than event dates */}
          <span className="font-semibold">Location:</span>
          <div className="flex flex-col gap-y-4">
            <div>
              {locationString.split("\n").map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
            {/* TODO: Add a link to the map */}
            <span
              className="inline-flex items-center gap-x-1 font-semibold hover:cursor-pointer [&>svg]:hover:scale-110"
              onClick={() => console.log("map clicked")}
            >
              <FaMapLocationDot className="size-4" /> View on Map
            </span>
          </div>
        </div>
        {isCurrentlyOpen ? (
          <div className="flex flex-col gap-y-6 pb-3 pt-8 text-sm">
            <span className="font-semibold">Open Call:</span>
            <div className="flex flex-col gap-y-2">
              <p className={cn("flex items-center gap-x-1 text-sm")}>
                <span className={"font-semibold"}>
                  {/* {basicInfo?.callType === "Fixed" ? "Deadline" : "Status"}: */}
                  {hasOpenCall &&
                    (basicInfo.callType === "Fixed"
                      ? "Deadline"
                      : basicInfo?.callType === "Email"
                        ? "Email by"
                        : "Status")}
                  :
                </span>
                {publicView ? (
                  <span className="pointer-events-none blur-[5px]">
                    This Year
                  </span>
                ) : (
                  <>
                    <span className="hidden xl:block">
                      {formatOpenCallDeadline(
                        basicInfo.dates?.ocEnd || "",
                        basicInfo.dates?.timezone,
                        basicInfo.callType,
                      )}
                    </span>
                    <span className="block xl:hidden">
                      {formatOpenCallDeadline(
                        basicInfo.dates?.ocEnd || "",
                        basicInfo.dates?.timezone,
                        basicInfo.callType,
                        true,
                      )}
                    </span>
                  </>
                )}
              </p>
              <p className={cn("flex items-center gap-x-1 text-sm")}>
                <span className="font-semibold">Eligible:</span>
                {publicView ? (
                  <span className="pointer-events-none blur-[5px]">
                    $3 per month
                  </span>
                ) : (
                  <>
                    <span
                      className={cn(
                        "hidden xl:block",
                        eligibility.type !== "International" && "text-red-600",
                      )}
                    >
                      {eligibility.type !== "International" &&
                        `${eligibility.type}: `}
                      {eligibility.whom.map((whom) => whom).join(" & ")}
                      {eligibility.type !== "International" && " Artists*"}
                    </span>
                    <span
                      className={cn(
                        "xl:hidden",
                        eligibility.type !== "International" && "text-red-600",
                      )}
                    >
                      {eligibility.whom.length > 1
                        ? "See app details"
                        : eligibility.whom[0]}
                      {eligibility.type !== "International" &&
                        eligibility.whom.length === 1 &&
                        " Artists*"}
                    </span>
                  </>
                )}
              </p>
              <div className="flex items-center gap-x-1">
                <span className="font-semibold">Budget:</span>
                {publicView ? (
                  <span className="pointer-events-none blur-[5px]">
                    Get paid for your work
                  </span>
                ) : (
                  <>
                    {(hasBudget || hasRate) && (
                      <>
                        <span className="hidden items-center gap-x-1 xl:flex">
                          {hasBudget &&
                            formatCurrency(
                              budget.min,
                              budget.max,
                              budget.currency,
                              false,
                              budget.allInclusive,
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
                        </span>
                        <span className="xl:hidden">
                          {hasBudget &&
                            formatCurrency(
                              budget.min,
                              budget.max,
                              budget.currency,
                              false,
                              budget.allInclusive,
                            )}
                        </span>
                      </>
                    )}
                    {!hasRate && !hasBudget && (
                      <p className="text-sm">No Info</p>
                    )}
                    {!budget.allInclusive && !noCategories && (
                      <span className="text-sm">*</span>
                    )}
                  </>
                )}
              </div>
              {!publicView && (
                <div
                  id="budget-icons-${id}"
                  className="col-span-2 mt-1 hidden max-w-full items-center justify-start gap-x-3 xl:flex"
                >
                  <span
                    className={cn(
                      "rounded-full border-1.5 p-1",
                      categories.designFee && !budget.allInclusive
                        ? "border-emerald-500 text-emerald-500"
                        : "border-foreground/20 text-foreground/20",
                    )}
                  >
                    <PiPencilLineFill size={18} />
                  </span>
                  <span
                    className={cn(
                      "rounded-full border-1.5 p-1",
                      categories.accommodation && !budget.allInclusive
                        ? "border-emerald-500 text-emerald-500"
                        : "border-foreground/20 text-foreground/20",
                    )}
                  >
                    <PiHouseLineFill size={18} />
                  </span>
                  <span
                    className={cn(
                      "rounded-full border-1.5 p-1",
                      categories.food && !budget.allInclusive
                        ? "border-emerald-500 text-emerald-500"
                        : "border-foreground/20 text-foreground/20",
                    )}
                  >
                    <PiForkKnifeFill size={18} />
                  </span>
                  <span
                    className={cn(
                      "rounded-full border-1.5 p-1",
                      categories.materials && !budget.allInclusive
                        ? "border-emerald-500 text-emerald-500"
                        : "border-foreground/20 text-foreground/20",
                    )}
                  >
                    <FaPaintRoller size={18} />
                  </span>
                  <span
                    className={cn(
                      "rounded-full border-1.5 p-1",
                      categories.travelCosts && !budget.allInclusive
                        ? "border-emerald-500 text-emerald-500"
                        : "border-foreground/20 text-foreground/20",
                    )}
                  >
                    <IoAirplane size={18} />
                  </span>
                  <span
                    className={cn(
                      "rounded-full border-1.5 p-1",
                      categories.equipment && !budget.allInclusive
                        ? "border-emerald-500 text-emerald-500"
                        : "border-foreground/20 text-foreground/20",
                    )}
                  >
                    <TbStairs size={18} />
                  </span>
                  <span
                    className={cn(
                      "rounded-full border-1.5 p-1",
                      categories.other && !budget.allInclusive
                        ? "border-emerald-500 text-emerald-500"
                        : "border-foreground/20 text-foreground/20",
                    )}
                  >
                    <FaRegCommentDots size={18} />
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-y-6 pb-3 pt-8 text-sm">
            <span className="font-semibold">Event Links:</span>
            <div className="flex flex-col gap-y-2">
              {/*TODO: In the future, this should first check if it has sameAsOrganizer checked, and if so, should use the links from the organizer. Otherwise, it should check if there are any links at all. */}
              {(Object.keys(event.links || {}).length === 0 ||
                (Object.keys(event.links || {}).length > 0 &&
                  event.links?.sameAsOrganizer === true)) && (
                <div className="flex items-center gap-x-2">
                  <Info className="size-5" />
                  <span className="underline-offset-2 hover:underline">
                    No links found
                  </span>
                </div>
              )}
              {event.links?.email && (
                <a href={`mailto:${event.links.email}?subject=${event.name}`}>
                  <div className="flex items-center gap-x-2">
                    <FaEnvelope className="size-5" />
                    <span className="underline-offset-2 hover:underline">
                      {event.links.email}
                    </span>
                  </div>
                </a>
              )}
              {event.links?.website && (
                <a href={event.links.website}>
                  <div className="flex items-center gap-x-2">
                    <FaGlobe className="size-5" />
                    <span className="underline-offset-2 hover:underline">
                      {event.links.website.split("www.").slice(-1)[0]}
                    </span>
                  </div>
                </a>
              )}

              {/* {event.links?.phone && (
                <a href={`tel:${event.links.phone}`}>
                  <div className="flex items-center gap-x-2">
                    <Phone className="size-5" />

                    <span className="underline-offset-2 hover:underline">
                      {event.links.phone}
                    </span>
                  </div>
                </a>
              )} */}
              {event.links?.instagram && (
                <a href={event.links.instagram}>
                  <div className="flex items-center gap-x-2">
                    <FaInstagram className="size-5" />

                    <span className="underline-offset-2 hover:underline">
                      @{event.links.instagram.split(".com/").slice(-1)[0]}
                    </span>
                  </div>
                </a>
              )}
              {event.links?.facebook && (
                <a href={event.links.facebook}>
                  <div className="flex items-center gap-x-2">
                    <FaFacebook className="size-5" />

                    <span className="underline-offset-2 hover:underline">
                      @{event.links.facebook.split(".com/").slice(-1)[0]}
                    </span>
                  </div>
                </a>
              )}
              {event.links?.threads && (
                <a href={event.links.threads}>
                  <div className="flex items-center gap-x-2">
                    <FaThreads className="size-5" />

                    <span className="underline-offset-2 hover:underline">
                      @{event.links.threads.split(".net/").slice(-1)[0]}
                    </span>
                  </div>
                </a>
              )}
              {event.links?.vk && (
                <a href={event.links.vk}>
                  <div className="flex items-center gap-x-2">
                    <FaVk className="size-5" />

                    <span className="underline-offset-2 hover:underline">
                      @{event.links.vk.split(".com/").slice(-1)[0]}
                    </span>
                  </div>
                </a>
              )}
            </div>
          </div>
        )}
        <div className="flex flex-col items-center justify-center gap-y-6 py-6 text-sm">
          {/* {openCall === "active" && (
            <div
              className={cn(
                "border-dotted border-1.5 h-11 w-14 rounded-lg flex flex-col justify-center items-center py-[5px]",
                !event.hasActiveOpenCall && "opacity-0"
              )}>
              <span className='text-2xs leading-[0.85rem]'>Call Type</span>
              <span className='text-md font-bold font-foreground leading-[0.85rem]'>
                {callFormat}
              </span>
              /~ // todo: make this dynamic to show project, event, etc for the type ~/
              <span className='text-2xs leading-[0.85rem]'>
                {getEventCategoryLabel(eventCategory)}
              </span>
            </div>
          )}*/}
          {event.openCallStatus !== null && (
            <>
              {event.openCallStatus === "coming-soon" ? (
                <p className="text-sm">Open Call Coming Soon!</p>
              ) : event.openCallStatus === "ended" ? (
                <p className="text-sm">Open Call Ended</p>
              ) : (
                ""
              )}
            </>
          )}
          {isCurrentlyOpen && basicInfo.appFee !== 0 && (
            <p className="flex items-center gap-x-1 text-sm text-red-600">
              <span className="flex items-center gap-x-1 font-semibold">
                <Info /> Application Fee:
              </span>
              {`$${basicInfo.appFee}`}
            </p>
          )}
          <ApplyButtonShort
            slug={eventNameUrl}
            edition={event.dates.edition}
            appStatus={event.status}
            openCall={event.openCallStatus}
            publicView={publicView}
            appFee={basicInfo ? basicInfo.appFee : 0}
            className="max-w-40 xl:hidden"
          />

          <ApplyButton
            id={event._id}
            openCallId={opencall ? opencall._id : ""}
            slug={eventNameUrl}
            edition={event.dates.edition}
            // status={status}
            openCall={event.openCallStatus}
            publicView={publicView}
            manualApplied={appStatus}
            // setManualApplied={setManualApplied}
            isBookmarked={bookmarked}
            // setbookmarked={setbookmarked}
            isHidden={hidden}
            // sethidden={sethidden}
            eventCategory={eventCategory}
            isPreview={false}
            appFee={basicInfo ? basicInfo.appFee : 0}
            className="hidden xl:flex"
          />
        </div>
      </Card>
    </>
  );
};

export default EventCardPreview;
