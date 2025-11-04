"use client";

import type { ViewOptions } from "@/features/events/event-list-client";
import type { MergedEventPreviewData, PostStatus } from "@/types/eventTypes";
import type { User } from "@/types/user";

import { usePathname, useRouter } from "next/navigation";

import { FaRegCheckSquare } from "react-icons/fa";
import {
  FaBookmark,
  FaMapLocationDot,
  FaRegBookmark,
  FaRegSquare,
} from "react-icons/fa6";
import {
  CheckCircleIcon,
  CircleDollarSignIcon,
  EyeOff,
  Info,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { EventOrgLogo } from "@/components/ui/event-org-logo";
import { LinkList } from "@/components/ui/link-list";
import { TooltipSimple } from "@/components/ui/tooltip";
import { useToggleListAction } from "@/features/artists/helpers/listActions";
import EventDates from "@/features/events/components/event-dates";
import {
  ApplyButton,
  ApplyButtonShort,
} from "@/features/events/event-apply-btn";
import { EligibilityLabel } from "@/features/events/open-calls/components/eligibility-label-client";
import { OpenCallProvidedPreview } from "@/features/events/open-calls/components/open-call-provided";
import EventContextMenu from "@/features/events/ui/event-context-menu";
import { formatOpenCallDeadline } from "@/helpers/dateFns";
import {
  formatBudgetCurrency,
  formatEventLink,
  formatRate,
  getEventCategoryLabel,
  getEventTypeLabel,
} from "@/helpers/eventFns";
import { RichTextDisplay } from "@/helpers/richTextFns";
import { getUserFontSizePref } from "@/helpers/stylingFns";
import { cn } from "@/helpers/utilsFns";
import { getCallFormatLabel } from "@/lib/openCallFns";

import { api } from "~/convex/_generated/api";
import { UserPrefsType } from "~/convex/schema";
import { useMutation } from "convex/react";

export interface EventCardPreviewProps {
  event: MergedEventPreviewData;
  user: User | null;
  userPref: UserPrefsType | null;
  publicView?: boolean;
  publicPreview?: boolean;
  activeSub: boolean;
  viewType?: ViewOptions;
}

const EventCardPreview = ({
  event,
  publicView,
  user,
  userPref,
  publicPreview,
  activeSub,
  viewType,
}: EventCardPreviewProps) => {
  const pathname = usePathname();
  const thisWeekPage = pathname.includes("thisweek");
  const eventView = viewType === "event";

  const isAdmin = user?.role?.includes("admin");
  const isArtist = user?.accountType?.includes("artist");
  const hasValidSub = (activeSub && isArtist) || isAdmin;
  const userTZ = !!userPref?.timezone ? userPref.timezone : undefined;
  const router = useRouter();
  const {
    isUserOrg,
    location,
    category: eventCategory,

    type: eventType,
    name,
    logo,
    tabs,
    bookmarked,

    // manualApplied,
    // organizerId,
    mainOrgId,
    // hasActiveOpenCall,
    hidden,
    openCallStatus,
    // eventId,
    // orgName,
    status: appStatus,
    slug,
    artistNationality,
    posted,
  } = event;
  const fontSizePref = getUserFontSizePref(userPref?.fontSize);
  const fontSize = fontSizePref?.body;
  const fontPref = fontSizePref?.pref;
  const { openCall } = tabs;
  const compensation = event.hasActiveOpenCall
    ? openCall?.compensation
    : undefined;
  const ocState = openCall?.state;
  const ocAppLink = openCall?.requirements?.applicationLink;

  const basicInfo = event.hasActiveOpenCall ? openCall?.basicInfo : undefined;
  const eligibility = event.hasActiveOpenCall
    ? openCall?.eligibility
    : undefined;
  const eligibilityType = eligibility?.type ?? "";
  const eligibilityWhom = eligibility?.whom ?? [];
  const artistEligible = artistNationality.some((artistNat) =>
    eligibilityWhom.some(
      (whom) => artistNat.trim().toLowerCase() === whom.trim().toLowerCase(),
    ),
  );
  const noEligibilityParams =
    eligibilityType === "Regional/Local" || eligibilityType === "Other";

  const artistIsEligible =
    (artistEligible || eligibilityType === "International") &&
    !noEligibilityParams;
  const artistNotEligible = !artistEligible && eligibilityType === "National";
  const hasEligibilityDetails = !!(
    typeof eligibility?.details === "string" &&
    eligibility.details.trim().length > 0
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

  if (countryAbbr === "US") {
    locationParts.push("USA");
    // locationParts.push(countryAbbr);
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

  // const linkPath =
  //   !publicView || publicPreview || isUserOrg
  //     ? `/thelist/event/${slug}/${event.dates.edition}${openCallStatus ? "/call" : ""}${openCallStatus === "ended" ? "?tab=event" : null}`
  //     : "/pricing?type=artist";

  const linkPath = formatEventLink(
    event,
    hasValidSub || (publicPreview && !eventView) || isUserOrg,
    eventView || openCall?.state !== "published",
  );

  const { toggleListAction } = useToggleListAction(event._id);
  const updateUserLastActive = useMutation(api.users.updateUserLastActive);
  const updateEventPostStatus = useMutation(
    api.events.event.updateEventPostStatus,
  );
  const updateEventAnalytics = useMutation(
    api.analytics.eventAnalytics.markEventAnalytics,
  );

  const onBookmark = async () => {
    if (publicView) {
      router.push("/pricing?type=artist");
    } else {
      toggleListAction({ bookmarked: !bookmarked });
      try {
        await updateUserLastActive({ email: user?.email ?? "" });
        if (isAdmin || isUserOrg || bookmarked) return;
        updateEventAnalytics({
          eventId: event._id,
          plan: user?.plan ?? 0,
          action: "bookmark",
          src: thisWeekPage ? "thisWeek" : "theList",
          userType: user?.accountType,
          hasSub: activeSub,
        });
      } catch (error) {
        console.error("Error updating last active:", error);
      } finally {
      }
    }
  };

  const onHide = async () => {
    if (publicView) {
      router.push("/pricing?type=artist");
    } else {
      toggleListAction({ hidden: !hidden });
      try {
        await updateUserLastActive({ email: user?.email ?? "" });
        if (isAdmin || isUserOrg || hidden) return;
        updateEventAnalytics({
          eventId: event._id,
          plan: user?.plan ?? 0,
          action: "hide",
          src: thisWeekPage ? "thisWeek" : "theList",
          userType: user?.accountType,
          hasSub: activeSub,
        });
      } catch (error) {
        console.error("Error updating last active:", error);
      }
    }
  };

  const handlePostEvent = async (postStatus: PostStatus | null) => {
    if (!user) return;
    try {
      await updateEventPostStatus({ eventId: event._id, posted: postStatus });
    } catch (error) {
      console.error("Error updating event post status:", error);
    }
  };

  return (
    <>
      {/* //---------------------- (Mobile) Layout ---------------------- */}
      <Card className="mb-6 grid w-[90vw] min-w-[340px] max-w-[400px] grid-cols-[75px_minmax(0,auto)_50px] grid-rows-[repeat(3_auto)] gap-x-3 rounded-3xl border-foreground/20 bg-white/40 px-1 py-2 first:mt-6 last:mb-2 lg:hidden">
        <div
          onClick={() => {
            if (!isAdmin) {
              updateEventAnalytics({
                eventId: event._id,
                plan: user?.plan ?? 0,
                action: "view",
                src: thisWeekPage ? "thisWeek" : "theList",
                userType: user?.accountType,
                hasSub: activeSub,
              });
            }
            if (!publicPreview && !hasValidSub && !eventView) {
              router.push("/pricing?type=artist");
            } else {
              router.push(linkPath);
            }
          }}
          className="col-span-1 row-start-1 mx-auto pl-2 pt-3 active:scale-95"
        >
          <EventOrgLogo
            imgSrc={logo}
            type="event"
            className={cn(
              "size-12 rounded-full border",
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
          />
        </div>
        <div className="col-span-1 row-start-1 flex flex-col gap-y-1 pt-3">
          <p className="line-clamp-2 break-words text-base font-semibold">
            {event?.name}
          </p>
          <p className={fontSize}>{locationString}</p>
        </div>
        <div className="col-span-1 row-start-1 mx-auto pt-3">
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
        </div>

        <div className="col-span-2 col-start-2 mb-5 mt-4 flex flex-col gap-y-1">
          <div className={cn("flex items-start gap-x-1", fontSize)}>
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
            <span className={cn("flex items-center gap-x-1", fontSize)}>
              <p className={"font-semibold"}>
                {basicInfo.callType === "Fixed" ? "Deadline" : "Status"}:
              </p>
              {publicView && !publicPreview && !isUserOrg ? (
                <span className="pointer-events-none blur-[5px]">
                  This Year
                </span>
              ) : (
                formatOpenCallDeadline(
                  basicInfo.dates?.ocEnd || "",
                  userTZ ?? basicInfo.dates?.timezone,
                  basicInfo.callType,
                  true,
                  false,
                  "mobile",
                )
              )}
            </span>
          )}
          {isCurrentlyOpen && (
            <p className={cn("flex items-center gap-x-1", fontSize)}>
              <span className="font-semibold">Budget:</span>
              {publicView && !publicPreview && !isUserOrg ? (
                <span className="pointer-events-none blur-[5px]">
                  Sign in to view
                </span>
              ) : budget.min > 0 || (budget.max && budget.max > 0) ? (
                formatBudgetCurrency(
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
                "flex items-center gap-x-1",
                !event.hasActiveOpenCall && "hidden",
                fontSize,
              )}
            >
              <span className="font-semibold">Eligible:</span>
              {publicView && !publicPreview && !isUserOrg ? (
                <span className="pointer-events-none blur-[5px]">
                  $3 per month
                </span>
              ) : (
                <span
                  className={cn(
                    (artistNotEligible || noEligibilityParams) &&
                      !publicView &&
                      !publicPreview &&
                      "text-red-600",
                    artistIsEligible && "text-emerald-800",
                  )}
                >
                  <EligibilityLabel
                    type={eligibility.type}
                    whom={eligibility.whom}
                    hasDetails={hasEligibilityDetails}
                    format="mobile"
                    preview={true}
                    publicView={publicView}
                    eligible={artistIsEligible}
                  />
                </span>
              )}
            </span>
          )}
        </div>

        <div className="col-span-full row-start-3 flex items-center justify-around gap-x-4 px-3 pb-2">
          <div
            className={cn(
              "flex h-11 w-28 flex-col items-center justify-center rounded-lg border-1.5 border-dotted py-[5px]",
              !isCurrentlyOpen && "opacity-0",
            )}
          >
            <span className="text-2xs leading-[0.85rem]">Call Type</span>
            <span className="text-md font-foreground font-bold leading-[0.85rem]">
              {basicInfo && basicInfo.callFormat}
            </span>
            {/* // todo: make this dynamic to show project, event, etc for the type */}
            <span className="text-2xs leading-[0.85rem]">
              {getEventCategoryLabel(eventCategory, true)}
            </span>
          </div>
          <ApplyButtonShort
            src={thisWeekPage ? "thisWeek" : "theList"}
            isUserOrg={isUserOrg}
            user={user}
            eventId={event._id}
            activeSub={activeSub}
            slug={slug}
            edition={event.dates.edition}
            appStatus={event.status}
            openCall={event.openCallStatus}
            publicView={publicPreview || isUserOrg ? false : publicView}
            appFee={basicInfo ? basicInfo.appFee : 0}
          />
          <div className="flex items-center justify-center gap-x-2">
            {bookmarked && hasValidSub ? (
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
          "mb-10 hidden min-h-[15em] w-[95vw] min-w-[640px] grid-cols-[60px_minmax(0,auto)_15%_22%_20%] gap-x-3 rounded-3xl border-foreground/20 bg-white/40 transition-colors duration-100 ease-in-out first:mt-6 hover:bg-white/50 hover:shadow-lg sm:max-w-[min(100rem,91vw)] lg:grid xl:grid-cols-[60px_minmax(0,auto)_15%_27%_25%] 2xl:w-[90vw]",
        )}
      >
        <div className="flex flex-col items-center justify-between border-r border-foreground/20 pb-3 pt-5">
          <div className="flex flex-col items-center gap-y-3">
            {bookmarked && hasValidSub ? (
              <TooltipSimple
                content="Remove Bookmark"
                delayDuration={0}
                align="start"
              >
                <FaBookmark
                  className="size-7 cursor-pointer text-red-600 active:scale-95"
                  onClick={onBookmark}
                />
              </TooltipSimple>
            ) : (
              <TooltipSimple
                align="start"
                delayDuration={0}
                content={
                  publicView || publicPreview
                    ? "Become a member to bookmark"
                    : `Bookmark ${getEventCategoryLabel(eventCategory)}`
                }
              >
                <FaRegBookmark
                  className="size-7 cursor-pointer active:scale-95"
                  onClick={onBookmark}
                />
              </TooltipSimple>
            )}
            {isAdmin &&
              (posted === "toPost" ? (
                <FaRegSquare
                  className={cn(
                    "size-6 text-red-600 hover:scale-105 hover:cursor-pointer active:scale-95",
                  )}
                  onClick={() => handlePostEvent("posted")}
                />
              ) : posted === "posted" ? (
                <FaRegCheckSquare
                  className={cn(
                    "size-6 text-emerald-600 hover:scale-105 hover:cursor-pointer active:scale-95",
                  )}
                  onClick={() => handlePostEvent(null)}
                />
              ) : null)}
            {appStatus === null ? (
              <TooltipSimple
                align="start"
                delayDuration={0}
                content="Has application fee"
              >
                <CircleDollarSignIcon
                  className={cn(
                    "size-6 text-red-600",
                    !basicInfo?.appFee && "hidden",
                  )}
                />
              </TooltipSimple>
            ) : (
              <TooltipSimple
                align="start"
                delayDuration={0}
                content={`Status: ${appStatus.slice(0, 1).toUpperCase() + appStatus.slice(1)}`}
              >
                <CheckCircleIcon
                  className={cn(
                    "size-6 text-emerald-600",
                    publicView && "hidden",
                  )}
                />
              </TooltipSimple>
            )}

            {hidden && hasValidSub && (
              <TooltipSimple
                delayDuration={0}
                content="Unhide event?"
                align="start"
              >
                <EyeOff
                  className="size-6 cursor-pointer active:scale-95"
                  onClick={onHide}
                />
              </TooltipSimple>
            )}
          </div>
          <EventContextMenu
            event={event}
            isUserOrg={isUserOrg}
            eventId={event._id}
            mainOrgId={mainOrgId}
            openCallId={openCall ? openCall._id : null}
            appLink={ocAppLink}
            isHidden={hidden}
            publicView={publicView}
            appStatus={appStatus}
            eventCategory={eventCategory}
            openCallStatus={openCallStatus}
            openCallState={ocState ?? null}
            align="start"
            postStatus={posted}
            postOptions={true}
            src={thisWeekPage ? "thisWeek" : "theList"}
          />
        </div>

        <div className="flex flex-col gap-y-3 pb-3 pl-3 pr-7 pt-5">
          <div className="mb-2 flex flex-col gap-y-1 p-2">
            <div
              onClick={() => {
                if (!isAdmin) {
                  updateEventAnalytics({
                    eventId: event._id,
                    plan: user?.plan ?? 0,
                    action: "view",
                    src: thisWeekPage ? "thisWeek" : "theList",
                    userType: user?.accountType,
                    hasSub: activeSub,
                  });
                }
                if (!publicPreview && !hasValidSub && !eventView) {
                  router.push("/pricing?type=artist");
                } else {
                  router.push(linkPath);
                }
              }}
              className="group hover:cursor-pointer"
            >
              <div className="mb-2 flex items-center gap-x-3">
                <EventOrgLogo
                  imgSrc={logo}
                  type="event"
                  className={cn(
                    "size-12 rounded-full border",
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
                />
                <p className="line-clamp-2 break-words text-base font-semibold group-hover:underline group-hover:underline-offset-2">
                  {name}
                </p>
              </div>
            </div>
            <div className={cn("flex items-start gap-x-1", fontSize)}>
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
            <span className={cn("flex items-center gap-x-1", fontSize)}>
              <p className="font-semibold">Category:</p>

              {getEventCategoryLabel(eventCategory)}
            </span>
            {eventCategory === "event" && eventType && (
              <span
                className={cn("flex items-start gap-x-1 text-sm", fontSize)}
              >
                <p className="font-semibold">Type:</p>
                {eventType
                  .map((type) => getEventTypeLabel(type, fontPref === "large"))
                  .join(" | ")}
              </span>
            )}
            {event.about ||
              (event.blurb && (
                <div className={cn("flex flex-col gap-y-1 text-sm", fontSize)}>
                  <span className="font-semibold">About:</span>
                  {event.blurb ? (
                    <p>{event.blurb}</p>
                  ) : (
                    <RichTextDisplay
                      html={event.about ?? ""}
                      className="line-clamp-3 max-h-20 text-sm"
                      maxChars={100}
                      fontSize={fontSize}
                    />
                  )}
                </div>
              ))}
          </div>
        </div>
        <div className={cn("flex flex-col gap-y-6 pb-3 pt-8", fontSize)}>
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
          <div className={cn("flex flex-col gap-y-6 pb-3 pt-8", fontSize)}>
            <span className="font-semibold">Open Call:</span>
            <div className="flex flex-col gap-y-2">
              <span className={cn("flex items-start gap-x-1")}>
                <p className={"font-semibold"}>
                  {basicInfo.callType === "Fixed" ? "Deadline" : "Status"}:
                </p>
                {publicView && !publicPreview && !isUserOrg ? (
                  <p className="pointer-events-none blur-[5px]">This Year</p>
                ) : basicInfo?.callType === "Email" ? (
                  <p>Submit qualifications via email</p>
                ) : (
                  <>
                    <span className="hidden xl:block">
                      {formatOpenCallDeadline(
                        basicInfo.dates?.ocEnd || "",
                        userTZ ?? basicInfo.dates?.timezone,
                        basicInfo.callType,
                      )}
                    </span>
                    <span className="block xl:hidden">
                      {formatOpenCallDeadline(
                        basicInfo.dates?.ocEnd || "",
                        userTZ ?? basicInfo.dates?.timezone,
                        basicInfo.callType,
                        true,
                        false,
                        "tablet",
                      )}
                    </span>
                  </>
                )}
              </span>
              <span className={cn("flex items-center gap-x-1")}>
                <span className="font-semibold">Eligible:</span>
                {publicView && !publicPreview && !isUserOrg ? (
                  <span className="pointer-events-none blur-[5px]">
                    $3 per month
                  </span>
                ) : (
                  <>
                    <span
                      className={cn(
                        "hidden xl:block",

                        (artistNotEligible || noEligibilityParams) &&
                          !publicView &&
                          !publicPreview &&
                          "text-red-600",
                        artistIsEligible && "text-emerald-800",
                      )}
                    >
                      <EligibilityLabel
                        type={eligibility.type}
                        whom={eligibility.whom}
                        format="desktop"
                        preview={true}
                        publicView={publicView}
                        eligible={artistIsEligible}
                        hasDetails={hasEligibilityDetails}
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
                {publicView && !publicPreview && !isUserOrg ? (
                  <span className="pointer-events-none blur-[5px]">
                    Get paid for your work
                  </span>
                ) : (
                  <>
                    {(hasBudget || hasRate) && (
                      <>
                        <span className="hidden items-center gap-x-1 xl:flex">
                          {hasBudget &&
                            formatBudgetCurrency(
                              budget.min,
                              budget.max,
                              budget.currency,
                              false,
                              budget.allInclusive,
                            )}
                          {hasBudget && hasRate && <p> | </p>}

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
                            formatBudgetCurrency(
                              budget.min,
                              budget.max,
                              budget.currency,
                              false,
                              budget.allInclusive,
                            )}
                        </span>
                      </>
                    )}
                    {!hasRate && !hasBudget && <p>No Info</p>}
                    {!budget.allInclusive && !noCategories && <span>*</span>}
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
          <div
            className={cn("flex flex-col gap-y-6 pb-3 pt-8 text-sm", fontSize)}
          >
            <span className="font-semibold">Event Links:</span>

            <LinkList event={event} purpose="preview" fontSize={fontSize} />
          </div>
        )}
        <div
          className={cn(
            "flex flex-col items-center justify-center gap-y-6 py-6 text-sm",
            fontSize,
          )}
        >
          {event.openCallStatus !== null && (
            <>
              {event.openCallStatus === "coming-soon" ? (
                <p>Open Call Coming Soon!</p>
              ) : event.openCallStatus === "ended" ? (
                <p>Open Call Ended</p>
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
            src={thisWeekPage ? "thisWeek" : "theList"}
            isUserOrg={isUserOrg}
            eventId={event._id}
            user={user}
            activeSub={activeSub}
            slug={slug}
            edition={event.dates.edition}
            appStatus={event.status}
            openCall={event.openCallStatus}
            publicView={publicPreview || isUserOrg ? false : publicView}
            appFee={basicInfo ? basicInfo.appFee : 0}
            className="max-w-40 xl:hidden"
          />

          <ApplyButton
            src={thisWeekPage ? "thisWeek" : "theList"}
            user={user}
            id={event._id}
            isUserOrg={isUserOrg}
            activeSub={activeSub}
            event={event}
            openCallId={openCall ? openCall._id : null}
            openCallState={ocState ?? null}
            appUrl={ocAppLink}
            slug={slug}
            edition={event.dates.edition}
            mainOrgId={event.mainOrgId}
            // status={status}
            openCall={event.openCallStatus}
            publicView={publicPreview || isUserOrg ? false : publicView}
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
            fontSize={fontSize}
          />
          {isCurrentlyOpen && basicInfo.callFormat && (
            <div className="flex max-w-40 items-center justify-center gap-x-1 text-center text-sm xl:max-w-none">
              <span className="flex items-center gap-x-1 rounded-sm text-xl font-bold xl:text-sm">
                {basicInfo.callFormat}:
              </span>

              <p>{getCallFormatLabel(basicInfo.callFormat)}</p>
            </div>
          )}
        </div>
      </Card>
    </>
  );
};

export default EventCardPreview;
