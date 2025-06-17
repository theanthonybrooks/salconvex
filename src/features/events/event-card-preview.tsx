"use client";

import { Card } from "@/components/ui/card";
import { LinkList } from "@/components/ui/link-list";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToggleListAction } from "@/features/artists/helpers/listActions";
import EventDates from "@/features/events/components/event-dates";
import {
  ApplyButton,
  ApplyButtonShort,
} from "@/features/events/event-apply-btn";
import { EligibilityLabel } from "@/features/events/open-calls/components/eligibility-label";
import { OpenCallProvidedPreview } from "@/features/events/open-calls/components/open-call-provided";
import EventContextMenu from "@/features/events/ui/event-context-menu";
import { formatOpenCallDeadline } from "@/lib/dateFns";
import {
  formatCurrency,
  formatRate,
  getEventCategoryLabel,
  getEventCategoryLabelAbbr,
  getEventTypeLabel,
} from "@/lib/eventFns";
import { RichTextDisplay } from "@/lib/richTextFns";

import { cn } from "@/lib/utils";
import { CombinedEventPreviewCardData } from "@/types/event";
import { User, UserPref } from "@/types/user";
import {
  CheckCircleIcon,
  CircleDollarSignIcon,
  EyeOff,
  Info,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaBookmark, FaMapLocationDot, FaRegBookmark } from "react-icons/fa6";

export interface EventCardPreviewProps {
  event: CombinedEventPreviewCardData;
  user: User | null;
  userPref: UserPref | null;
  publicView?: boolean;
  publicPreview?: boolean;
}

// interface EventCardPreviewProps {
//   event: PublicEventPreviewData & {
//     bookmarked: boolean;
//     hidden: boolean;
//     applied: boolean;
//     manualApplied: boolean;
//     status: ApplicationStatus | null;
//     artistNationality: string[];
//   };
//   user: User | null;
//   userPref: UserPref | null;
//   publicView?: boolean;
// }

const EventCardPreview = ({
  event,
  publicView,
  user,
  userPref,
  publicPreview,
}: EventCardPreviewProps) => {
  const userTZ = !!userPref?.timezone ? userPref.timezone : undefined;
  const router = useRouter();
  const {
    location,
    category: eventCategory,

    type: eventType,
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
    artistNationality,
  } = event;

  const { opencall } = tabs;
  const compensation = event.hasActiveOpenCall
    ? opencall?.compensation
    : undefined;
  const basicInfo = event.hasActiveOpenCall ? opencall?.basicInfo : undefined;
  const eligibility = event.hasActiveOpenCall
    ? opencall?.eligibility
    : undefined;
  const eligibilityType = eligibility?.type ?? "";
  const eligibilityWhom = eligibility?.whom ?? [];
  const artistEligible = artistNationality.some((artistNat) =>
    eligibilityWhom.some(
      (whom) => artistNat.trim().toLowerCase() === whom.trim().toLowerCase(),
    ),
  );
  const budget = compensation?.budget;
  const {
    min: budgetMin,
    max: budgetMax,
    rate: budgetRate,
  } = budget || {
    min: 0,
    max: 0,
    rate: 0,
  };
  const categories = compensation?.categories ?? {};
  const noCategories =
    categories === null || Object.keys(categories).length === 0;

  const { locale, city, stateAbbr, country, countryAbbr } = location;
  const hasCoordinates = !!location.coordinates;
  const coordinates = location.coordinates || { latitude: 0, longitude: 0 };
  const { latitude, longitude } = coordinates;

  const locationParts: string[] = [];
  const hasOpenCall = openCallStatus === "active";

  const isValidStateAbbr = stateAbbr && /^[A-Za-z]+$/.test(stateAbbr);

  if (locale) locationParts.push(locale);

  if (city && isValidStateAbbr) {
    locationParts.push(`${city}, ${stateAbbr}`);
  } else if (city) {
    locationParts.push(city);
  } else if (isValidStateAbbr) {
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

  const hasBudgetRange = budgetMax && budgetMax > 0;
  const hasBudget = !!(budgetMin > 0 || hasBudgetRange);
  const hasRate = !!budgetRate && budgetRate > 0;
  const noBudgetInfo = !hasBudget && !hasRate;

  const isCurrentlyOpen =
    basicInfo && budget && eligibility && event.hasActiveOpenCall;
  //Todo: Add functionality that provides info for upcoming open calls as well. Maybe.
  // const isUpcoming =  basicInfo && budget && eligibility && openCallStatus === "coming-soon"

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
          <div
            onClick={() => {
              router.push(
                !publicView || publicPreview
                  ? `/thelist/event/${slug}/${event.dates.edition}${openCallStatus ? "/call" : ""}`
                  : "/pricing#plans",
              );
            }}
            className="active:scale-95"
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
          </div>
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
              {getEventCategoryLabelAbbr(eventCategory)}
            </span>
          </div>
        </div>

        {/* <CardHeader>
            <CardTitle>The List</CardTitle>
          </CardHeader>*/}
        <div className="flex flex-col gap-y-3 pb-3 pt-3">
          <div className="mb-2 flex flex-col gap-y-1">
            <div className="mb-2 flex flex-col gap-y-1">
              <p className="break-words text-base font-semibold">
                {event?.name}
              </p>
              <p className="text-sm">{locationString}</p>
            </div>
            <div className="flex items-start gap-x-1 text-sm">
              {/* // todo: make this dynamic to show whether event, project, or... else. This won't necessarily be an event timeline, and I think it should default to painting dates rather than event dates */}
              <span className="font-semibold">Dates:</span>
              <EventDates
                event={event}
                format="mobile"
                limit={1}
                preview={true}
                type="event"
              />
            </div>
            {isCurrentlyOpen && (
              <p className={cn("flex items-center gap-x-1 text-sm")}>
                <span className={"font-semibold"}>
                  {basicInfo.callType === "Fixed" ? "Deadline" : "Status"}:
                </span>
                {publicView && !publicPreview ? (
                  <span className="pointer-events-none blur-[5px]">
                    This Year
                  </span>
                ) : (
                  formatOpenCallDeadline(
                    basicInfo.dates?.ocEnd || "",
                    userTZ ?? basicInfo.dates?.timezone,
                    basicInfo.callType,
                    true,
                  )
                )}
              </p>
            )}
            {isCurrentlyOpen && (
              <p className={cn("flex items-center gap-x-1 text-sm")}>
                <span className="font-semibold">Budget:</span>
                {publicView && !publicPreview ? (
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
              <span
                className={cn(
                  "flex items-center gap-x-1 text-sm",
                  !event.hasActiveOpenCall && "hidden",
                )}
              >
                <span className="font-semibold">Eligible:</span>
                {publicView && !publicPreview ? (
                  <span className="pointer-events-none blur-[5px]">
                    $3 per month
                  </span>
                ) : (
                  <span
                    className={cn(
                      !artistEligible &&
                        !publicView &&
                        !publicPreview &&
                        eligibilityType !== "International" &&
                        "text-red-600",
                      artistEligible && "text-emerald-800",
                    )}
                  >
                    <EligibilityLabel
                      type={eligibility.type}
                      whom={eligibility.whom}
                      format="mobile"
                      preview={true}
                      publicView={publicView}
                      eligible={artistEligible}
                    />
                  </span>
                )}
              </span>
            )}
          </div>

          <ApplyButtonShort
            slug={slug}
            edition={event.dates.edition}
            appStatus={event.status}
            openCall={event.openCallStatus}
            publicView={publicPreview ? false : publicView}
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
                      onClick={() => {
                        if (!publicView && !publicPreview) onBookmark();
                      }}
                    />
                  </TooltipTrigger>
                  <TooltipContent align="start">
                    {publicView || publicPreview ? (
                      <p>Become a member to bookmark</p>
                    ) : (
                      <p>Bookmark {getEventCategoryLabel(eventCategory)}</p>
                    )}
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
          </div>
          <EventContextMenu
            eventId={event._id}
            openCallId={opencall ? opencall._id : ""}
            isHidden={hidden}
            publicView={publicView}
            appStatus={appStatus}
            eventCategory={eventCategory}
            openCallStatus={openCallStatus}
            user={user}
            align="start"
          />
        </div>

        <div className="flex flex-col gap-y-3 pb-3 pl-3 pr-7 pt-5">
          <div className="mb-2 flex flex-col gap-y-1 p-2">
            <div
              onClick={() => {
                router.push(
                  !publicView || publicPreview
                    ? `/thelist/event/${slug}/${event.dates.edition}${openCallStatus ? "/call" : ""}`
                    : "/pricing#plans",
                );
              }}
              className="group hover:cursor-pointer"
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
                <p className="break-words text-base font-semibold group-hover:underline group-hover:underline-offset-2">
                  {name}
                </p>
                {/* <p className='text-sm'>{locationString}</p> */}
              </div>
            </div>
            <div className="flex items-start gap-x-1 text-sm">
              {/* // todo: make this dynamic to show whether event, project, or... else. This won't necessarily be an event timeline, and I think it should default to painting dates rather than event dates */}
              <span className="font-semibold">Dates:</span>
              <EventDates
                event={event}
                format="desktop"
                limit={1}
                preview={true}
                type="event"
              />
            </div>
            <p className="flex items-center gap-x-1 text-sm">
              <span className="font-semibold">Category:</span>

              {getEventCategoryLabel(eventCategory)}
            </p>
            {eventCategory === "event" && eventType && (
              <p className="flex items-start gap-x-1 text-sm">
                <span className="font-semibold">Type:</span>
                {eventType.map((type) => getEventTypeLabel(type)).join(" | ")}
              </p>
            )}
            {event.about && (
              <div className="flex flex-col gap-y-1 text-sm">
                <span className="font-semibold">About:</span>

                <RichTextDisplay
                  html={event.about}
                  className="line-clamp-3 text-sm"
                />
              </div>
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

            {hasCoordinates && (
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`}
                className="flex items-center gap-x-1 text-sm font-semibold underline-offset-2 hover:underline [&>svg]:hover:scale-110"
              >
                <FaMapLocationDot className="size-4" /> View on Map
              </a>
            )}
          </div>
        </div>
        {isCurrentlyOpen ? (
          <div className="flex flex-col gap-y-6 pb-3 pt-8 text-sm">
            <span className="font-semibold">Open Call:</span>
            <div className="flex flex-col gap-y-2">
              <span className={cn("flex items-center gap-x-1 text-sm")}>
                <span className={"font-semibold"}>
                  {/* {basicInfo?.callType === "Fixed" ? "Deadline" : "Status"}: */}
                  {basicInfo.callType === "Fixed"
                    ? "Deadline"
                    : basicInfo?.callType === "Email"
                      ? "Email by"
                      : "Status"}
                  :
                </span>
                {publicView && !publicPreview ? (
                  <span className="pointer-events-none blur-[5px]">
                    This Year
                  </span>
                ) : (
                  <>
                    <span className="hidden 2xl:block">
                      {formatOpenCallDeadline(
                        basicInfo.dates?.ocEnd || "",
                        userTZ ?? basicInfo.dates?.timezone,
                        basicInfo.callType,
                      )}
                    </span>
                    <span className="block 2xl:hidden">
                      {formatOpenCallDeadline(
                        basicInfo.dates?.ocEnd || "",
                        userTZ ?? basicInfo.dates?.timezone,
                        basicInfo.callType,
                        true,
                      )}
                    </span>
                  </>
                )}
              </span>
              <span className={cn("flex items-center gap-x-1 text-sm")}>
                <span className="font-semibold">Eligible:</span>
                {publicView && !publicPreview ? (
                  <span className="pointer-events-none blur-[5px]">
                    $3 per month
                  </span>
                ) : (
                  <>
                    <span
                      className={cn(
                        "hidden xl:block",
                        !artistEligible &&
                          !publicView &&
                          !publicPreview &&
                          eligibilityType !== "International" &&
                          "text-red-600",
                        artistEligible && "text-emerald-800",
                      )}
                    >
                      <EligibilityLabel
                        type={eligibility.type}
                        whom={eligibility.whom}
                        format="desktop"
                        preview={true}
                        publicView={publicView}
                        eligible={artistEligible}
                      />
                    </span>
                    <span
                      className={cn(
                        "xl:hidden",
                        !artistEligible &&
                          !publicView &&
                          !publicPreview &&
                          eligibilityType !== "International" &&
                          "text-red-600",
                        artistEligible && "text-emerald-800",
                      )}
                    >
                      <EligibilityLabel
                        type={eligibility.type}
                        whom={eligibility.whom}
                        format="mobile"
                        preview={true}
                        publicView={publicView}
                        eligible={artistEligible}
                      />
                    </span>
                  </>
                )}
              </span>
              <div className="flex items-center gap-x-1">
                <span className="font-semibold">Budget:</span>
                {publicView && !publicPreview ? (
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
                <OpenCallProvidedPreview
                  id={event._id}
                  categories={categories}
                  noBudgetInfo={noBudgetInfo}
                  format="desktop"
                  className="col-span-2 mt-1 hidden max-w-full items-center justify-start gap-x-3 xl:flex"
                />
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-y-6 pb-3 pt-8 text-sm">
            <span className="font-semibold">Event Links:</span>

            <LinkList event={event} purpose="preview" />
          </div>
        )}
        <div className="flex flex-col items-center justify-center gap-y-6 py-6 text-sm">
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
              ${basicInfo.appFee}
            </p>
          )}

          <ApplyButtonShort
            slug={slug}
            edition={event.dates.edition}
            appStatus={event.status}
            openCall={event.openCallStatus}
            publicView={publicPreview ? false : publicView}
            appFee={basicInfo ? basicInfo.appFee : 0}
            className="max-w-40 xl:hidden"
          />

          <ApplyButton
            user={user}
            id={event._id}
            openCallId={opencall ? opencall._id : ""}
            slug={slug}
            edition={event.dates.edition}
            // status={status}
            openCall={event.openCallStatus}
            publicView={publicPreview ? false : publicView}
            publicPreview={publicPreview}
            manualApplied={appStatus}
            // setManualApplied={setManualApplied}
            isBookmarked={bookmarked}
            // setbookmarked={setbookmarked}
            isHidden={hidden}
            // sethidden={sethidden}
            eventCategory={eventCategory}
            isPreview={true}
            appFee={basicInfo ? basicInfo.appFee : 0}
            className="hidden xl:flex"
          />
          {isCurrentlyOpen && basicInfo.callFormat && (
            <div className="flex max-w-40 items-center justify-center gap-x-1 text-center text-sm xl:max-w-none">
              <span className="flex items-center gap-x-1 rounded-sm text-xl font-bold xl:text-sm">
                {basicInfo.callFormat}:
              </span>

              <p>
                {basicInfo.callFormat === "RFP"
                  ? "Request for Proposals"
                  : "Request for Qualifications"}
              </p>
            </div>
          )}
        </div>
      </Card>
    </>
  );
};

export default EventCardPreview;
