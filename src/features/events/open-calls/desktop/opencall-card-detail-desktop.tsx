"use client";

import { publicStateValues } from "@/constants/openCallConsts";
import { OpenCallCardProps } from "@/types/openCallTypes";

import { Card } from "@/components/ui/card";
import NavTabs from "@/components/ui/nav-tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/state-accordion-test";

import { useEffect, useRef, useState } from "react";

import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { useMutation, usePreloadedQuery, useQueries } from "convex/react";
import { CheckCircleIcon, EyeOff, MapPin } from "lucide-react";
import { FaBookmark, FaRegBookmark } from "react-icons/fa6";

import { useToggleListAction } from "@/features/artists/helpers/listActions";
import { EventCard } from "@/features/events/components/events-card";
import { ApplyButton } from "@/features/events/event-apply-btn";
import OpenCallCard from "@/features/events/open-calls/components/open-call-card";
import { getOpenCallStatus } from "@/features/events/open-calls/helpers/openCallStatus";
import { OrganizerCard } from "@/features/organizers/components/organizer-card";

import EventDates from "@/features/events/components/event-dates";
import { SalBackNavigation } from "@/features/events/components/sal-back-navigation";
import { OrganizerLogoNameCard } from "@/features/organizers/components/organizer-logo-name-card";
import { formatOpenCallDeadline, formatSingleDate } from "@/helpers/dateFns";
import { getEventCategoryLabel, getEventTypeLabel } from "@/helpers/eventFns";
import { getFormattedLocationString } from "@/helpers/locations";
import { RichTextDisplay } from "@/helpers/richTextFns";
import { cn } from "@/helpers/utilsFns";
import { api } from "~/convex/_generated/api";

import { ApproveBtn } from "@/components/ui/approve-btn";
import { ChartAreaInteractive } from "@/components/ui/charts/area-chart-interactive";
import { DraftPendingBanner } from "@/components/ui/draft-pending-banner";
import { EventOrgLogo } from "@/components/ui/event-org-logo";
import { Separator } from "@/components/ui/separator";
import { TooltipSimple } from "@/components/ui/tooltip";
import { formatApplicationLink } from "@/helpers/applicationFns";
import { getUserFontSizePref } from "@/helpers/stylingFns";
import { makeUseQueryWithStatus } from "convex-helpers/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Id } from "~/convex/_generated/dataModel";

export const OpenCallCardDetailDesktop = (props: OpenCallCardProps) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const tabParam = searchParams.get("tab");
  const { preloadedSubStatus, preloadedUserData } = useConvexPreload();
  const subData = usePreloadedQuery(preloadedSubStatus);
  const userData = usePreloadedQuery(preloadedUserData);
  const user = userData?.user ?? null;
  const userPref = userData?.userPref ?? null;
  const fontSizePref = getUserFontSizePref(userPref?.fontSize);
  const fontSize = fontSizePref?.body;

  const isAdmin = user?.role?.includes("admin") || false;
  const hasActiveSubscription =
    (subData?.hasActiveSubscription || isAdmin) ?? false;
  const activeArtist =
    user?.accountType?.includes("artist") && hasActiveSubscription;
  const aboutRef = useRef<HTMLDivElement | null>(null);

  const { data, artist, className } = props;
  const { event, organizer, openCall, application } = data;
  const {
    isUserOrg,
    logo: eventLogo,
    category: eventCategory,
    type: eventType,
    location,
    dates,
    slug,
    mainOrgId,
    state: eventState,
  } = event;

  const manualApplied = application?.manualApplied ?? false;
  const appStatus = application?.applicationStatus ?? null;
  const hasApplied = appStatus !== null;

  const { bookmarked, hidden } = artist?.listActions?.find(
    (la) => la.eventId === event._id,
  ) ?? {
    bookmarked: false,
    hidden: false,
  };

  // const { locale, city, stateAbbr, state, country, countryAbbr } = location;
  const { prodDates } = dates;
  // const prodStart = prodDates?.[0]?.start;
  const prodEnd = prodDates?.[0]?.end;
  const {
    basicInfo,
    requirements,
    _id: openCallId,
    state: openCallState,
  } = openCall;
  const useQueryWithStatus = makeUseQueryWithStatus(useQueries);

  const validEventState = publicStateValues.includes(eventState ?? "");
  const validOpenCallState = publicStateValues.includes(openCallState ?? "");
  const bothValid = validEventState && validOpenCallState;
  const oneValid = validEventState || validOpenCallState;

  // const appUrl = requirements?.applicationLink;
  const appLinkFormat = requirements?.applicationLinkFormat;
  // const mailLink = appLinkFormat === "mailto:";
  // const mailSubject = requirements?.applicationLinkSubject;
  // const outputAppLink = mailLink
  //   ? `mailto:${appUrl}${mailSubject ? `?subject=${mailSubject}` : ""}`
  //   : appUrl;

  const outputAppLink = formatApplicationLink(requirements);

  const [activeTab, setActiveTab] = useState("openCall");
  const updateUserLastActive = useMutation(api.users.updateUserLastActive);
  const { toggleListAction } = useToggleListAction(event._id);
  const { callType, dates: callDates } = basicInfo;
  const { ocStart, ocEnd, timezone } = callDates;
  const userPrefTZ = userPref?.timezone;
  const deadlineTimezone =
    userPref?.timezone && userPrefTZ !== "" ? userPref.timezone : timezone;

  const openCallStatus = getOpenCallStatus(
    ocStart ? new Date(ocStart) : null,
    ocEnd ? new Date(ocEnd) : null,
    basicInfo.callType,
  );

  const locationString = getFormattedLocationString(location);

  const onBookmark = async () => {
    if (!activeArtist) return;
    toggleListAction({ bookmarked: !bookmarked });

    await updateUserLastActive({ email: user?.email ?? "" });
  };

  const onHide = async () => {
    if (!activeArtist) return;
    toggleListAction({ hidden: !hidden });
    await updateUserLastActive({ email: user?.email ?? "" });
  };

  const tabList = [
    { id: "openCall", label: "Open Call" },
    // { id: "application", label: "My Application" },
    { id: "event", label: getEventCategoryLabel(eventCategory) },
    { id: "organizer", label: "Organizer" },
  ];

  const adminTabList = [...tabList, { id: "admin", label: "Admin" }];

  const scrollToAbout = () => {
    setActiveTab("event");
    setTimeout(() => {
      const element = aboutRef.current;
      if (element) {
        const offset = element.getBoundingClientRect().top + window.scrollY;

        const scrollOffset = offset - 160;

        window.scrollTo({
          top: scrollOffset,
          behavior: "smooth",
        });
      }
    }, 50);
  };

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (tabParam === "event" && activeTab !== "event") {
      setActiveTab("event");

      params.delete("tab");

      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [tabParam, activeTab, router, pathname, searchParams]);

  const { data: appChartData, isPending: appChartLoading } = useQueryWithStatus(
    api.organizer.applications.getOpenCallApplications,
    openCallId && isAdmin && activeTab === "admin"
      ? { openCallId, ownerId: userData?.userId as Id<"users"> }
      : "skip",
  );

  return (
    <div
      className={cn(
        "flex w-full max-w-[min(90vw,1400px)] flex-col gap-x-6 pb-10 xl:grid xl:grid-cols-[300px_auto]",
        className,
        fontSize,
      )}
    >
      <SalBackNavigation
        format="desktop"
        user={user}
        activeSub={hasActiveSubscription}
        isOwner={isUserOrg || isAdmin}
      />

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
          <div className="col-span-1 flex items-start justify-center">
            <EventOrgLogo
              imgSrc={eventLogo}
              type="event"
              className={cn(
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
            <p className="mb-1 max-w-[18ch] hyphens-auto text-balance break-words pr-1 text-base font-semibold capitalize">
              {event?.name}
            </p>
          </div>
          <div className="col-span-full row-start-2 flex flex-col justify-between gap-y-3 px-4 pt-4">
            <div className="flex flex-col items-start gap-1">
              <span className="flex items-baseline gap-1 font-semibold">
                Location:
                <TooltipSimple content="View on Map" side="top">
                  <MapPin
                    onClick={() => setActiveTab("event")}
                    className="size-4 cursor-pointer transition-transform duration-150 hover:scale-105"
                  />
                </TooltipSimple>
              </span>
              <span className="inline-flex items-end gap-x-1 leading-[0.95rem]">
                {locationString}
              </span>
            </div>
            {event.dates.eventFormat !== "noEvent" && (
              <div className="flex flex-col items-start gap-1">
                <span className="space-x-1 font-semibold">
                  {getEventCategoryLabel(eventCategory)} Dates:
                </span>
                <EventDates
                  event={event}
                  format="desktop"
                  limit={0}
                  type="event"
                />
              </div>
            )}

            {((eventCategory === "project" &&
              event.dates.eventFormat === "noEvent") ||
              (eventCategory === "event" && prodEnd)) && (
              <div className="flex flex-col items-start gap-1">
                <span className="space-x-1 font-semibold">
                  Painting/Production Dates:
                </span>
                <EventDates
                  event={event}
                  format="desktop"
                  limit={0}
                  type="production"
                />
              </div>
            )}
            <p className="flex flex-col items-start gap-1">
              <span className="font-semibold">Category:</span>
              {getEventCategoryLabel(eventCategory)}
            </p>
            {eventType && eventCategory === "event" && (
              <p className="flex flex-col items-start gap-1">
                <span className="font-semibold">Type:</span>{" "}
                {eventType.map((type) => getEventTypeLabel(type)).join(" | ")}
              </p>
            )}

            {/* //todo: ensure that this is required in the submission form */}
            {(event.about || event.blurb) && (
              <Accordion type="multiple" defaultValue={["about"]}>
                <AccordionItem value="about">
                  <AccordionTrigger
                    title="About:"
                    className="pb-2"
                    fontSize={fontSize}
                  />
                  <AccordionContent className="pb-3">
                    {event.blurb ? (
                      <p className={cn(fontSize)}>{event.blurb}</p>
                    ) : (
                      <RichTextDisplay
                        html={event.about ?? ""}
                        fontSize={fontSize}
                        maxChars={200}
                      />
                    )}
                    <button
                      className="mt-2 w-full text-center text-sm underline underline-offset-2 hover:underline-offset-4 active:underline-offset-1"
                      onClick={scrollToAbout}
                    >
                      Read more
                    </button>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
            <div className="flex flex-col items-start gap-1">
              <span className="font-semibold">Organized by:</span>
              <OrganizerLogoNameCard
                setActiveTab={setActiveTab}
                organizer={organizer}
                abbr={true}
                fontSize={fontSize}
              />
            </div>
            <p className="flex items-center gap-1 text-xs">
              Open call posted: {formatSingleDate(openCall._creationTime)}
            </p>
          </div>
        </div>

        <div className="col-span-full flex w-full flex-col items-start justify-start gap-y-3 overflow-hidden">
          <Card className="flex w-full flex-col gap-y-2 rounded-xl border-foreground/20 bg-white/60 p-5">
            {/* TODO: add this back once application system is made to signify when something is external */}
            {/* {!appUrl && (
              <p
                className={cn(
                  "flex items-center justify-center gap-x-2 text-center text-sm text-muted-foreground",
                  basicInfo?.appFee === 0 && "text-red-600",
                )}
                onClick={onHide}
              >
                <Info className="size-4" /> External Application
              </p>
            )} */}
            {basicInfo?.appFee !== 0 && (
              <p className="flex w-full items-center justify-center gap-x-1 text-center text-sm text-red-600">
                <span className="font-semibold">Application Fee:</span>
                {`$${basicInfo?.appFee}`}
              </p>
            )}
            {bothValid && (!isUserOrg || isAdmin) && (
              <>
                <ApplyButton
                  user={user}
                  isUserOrg={isUserOrg}
                  userPref={userPref}
                  activeSub={hasActiveSubscription}
                  id={event._id}
                  event={event}
                  openCallId={openCallId}
                  openCallState={openCallState ?? null}
                  mainOrgId={mainOrgId}
                  slug={slug}
                  appUrl={outputAppLink}
                  appLinkformat={appLinkFormat}
                  edition={event.dates.edition}
                  openCall={openCallStatus}
                  callType={callType}
                  manualApplied={appStatus}
                  isBookmarked={bookmarked}
                  isHidden={hidden}
                  eventCategory={eventCategory}
                  appFee={basicInfo?.appFee ?? 0}
                  className="w-full"
                  detailCard
                  finalButton
                />
                {activeArtist && (
                  <p
                    className={cn(
                      "mt-2 flex w-full items-center justify-center gap-x-1 text-center text-sm italic text-muted-foreground hover:cursor-pointer",
                      hidden && "text-red-600 underline underline-offset-2",
                    )}
                    onClick={onHide}
                  >
                    {hidden ? "Marked" : "Mark"} as not interested
                    {!hidden && "?"}
                  </p>
                )}
              </>
            )}
            {!bothValid && !isAdmin && !isUserOrg && (
              <ApplyButton
                user={user}
                isUserOrg={isUserOrg}
                userPref={userPref}
                activeSub={hasActiveSubscription}
                id={event._id}
                event={event}
                openCallId={openCallId}
                openCallState={openCallState ?? null}
                mainOrgId={mainOrgId}
                slug={slug}
                appUrl={outputAppLink}
                appLinkformat={appLinkFormat}
                edition={event.dates.edition}
                openCall={openCallStatus}
                callType={callType}
                manualApplied={appStatus}
                isBookmarked={bookmarked}
                isHidden={hidden}
                orgPreview
                eventCategory={eventCategory}
                appFee={basicInfo?.appFee ?? 0}
                className="w-full"
                detailCard
                finalButton
              />
            )}

            {((isAdmin && !bothValid) || isUserOrg) && (
              <>
                {isAdmin && oneValid && (
                  <Separator thickness={2} className="my-2" />
                )}
                <ApproveBtn
                  user={user}
                  event={event}
                  eventState={eventState}
                  eventCategory={eventCategory}
                  openCallState={openCallState}
                  eventId={event._id}
                  openCallId={openCallId}
                  orgId={event.mainOrgId}
                  openCallStatus={openCallStatus}
                  appStatus={appStatus}
                  appLink={outputAppLink}
                  isHidden={hidden}
                  isUserOrg={isUserOrg || isAdmin}
                />
              </>
            )}
          </Card>
        </div>
      </Card>

      <Card className="col-start-2 row-start-2 flex w-full flex-col gap-y-2 rounded-3xl border-foreground/20 bg-white/50 p-4">
        <div className="flex min-h-20 w-full flex-col rounded-2xl border border-dotted border-foreground/50 bg-card-secondary p-4 white:bg-card">
          {(isAdmin || isUserOrg) && (
            <DraftPendingBanner
              format="desktop"
              openCallState={openCallState}
              eventState={eventState}
              eventId={event._id}
            />
          )}
          <div className="flex w-full items-center gap-x-4 divide-x-2">
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
                <EventOrgLogo
                  imgSrc={eventLogo}
                  type="event"
                  size="large"
                  className={cn(
                    "xl:hidden",
                    appStatus === "accepted"
                      ? "ring-4 ring-emerald-500 ring-offset-1"
                      : appStatus === "rejected"
                        ? "ring-4 ring-red-500 ring-offset-1"
                        : appStatus === "pending"
                          ? "ring-4 ring-foreground/20 ring-offset-1"
                          : "",
                  )}
                />
                <div className="flex flex-col gap-2">
                  <span className="text-balance text-xl font-bold capitalize">
                    {event?.name}
                  </span>
                  <span className="inline-flex items-end gap-x-1 text-sm leading-[0.95rem]">
                    {locationString}

                    <TooltipSimple content="View on Map" side="top">
                      <MapPin
                        onClick={() => setActiveTab("event")}
                        className="size-4 cursor-pointer transition-transform duration-150 hover:scale-105"
                      />
                    </TooltipSimple>
                  </span>
                  <span className="inline-flex items-end gap-x-1 text-sm xl:hidden">
                    {getEventCategoryLabel(eventCategory)}

                    {eventType && eventCategory === "event" && (
                      <p className="flex items-center gap-1 text-sm">
                        {" - "}
                        {eventType
                          .map((type) => getEventTypeLabel(type))
                          .join(" | ")}
                      </p>
                    )}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-x-4 text-nowrap">
                <div className="flex flex-col items-end gap-1">
                  {openCallState === "published" && (
                    <span className="items-center gap-x-2 text-xs lg:text-sm xl:flex">
                      {openCallStatus === "ended" ? "Ended" : "Deadline"}:
                      &nbsp;
                      {formatOpenCallDeadline(
                        ocEnd || "",
                        deadlineTimezone,
                        callType,
                      )}
                    </span>
                  )}
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
                  <CheckCircleIcon className="size-7 text-emerald-600" />
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
                    className={cn(
                      "size-7 cursor-pointer",
                      !activeArtist &&
                        "invisible cursor-default text-foreground/50",
                    )}
                    onClick={onBookmark}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        <NavTabs
          tabs={isAdmin ? adminTabList : tabList}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          fontSize={fontSize}
        >
          <div id="openCall">
            <OpenCallCard
              artist={artist}
              event={event}
              openCall={openCall}
              format="desktop"
              userPref={userPref}
              publicPreview={!hasActiveSubscription}
              fontSize={fontSize}
            />
            <div className="mt-6 flex w-full justify-end xl:hidden">
              {((isAdmin && !bothValid) || isUserOrg) && (
                <>
                  <ApproveBtn
                    user={user}
                    event={event}
                    eventState={eventState}
                    eventCategory={eventCategory}
                    openCallState={openCallState}
                    eventId={event._id}
                    openCallId={openCallId}
                    orgId={event.mainOrgId}
                    openCallStatus={openCallStatus}
                    appStatus={appStatus}
                    appLink={outputAppLink}
                    isHidden={hidden}
                    isUserOrg={isUserOrg || isAdmin}
                    className="mx-auto mt-1 w-full max-w-52"
                  />
                </>
              )}
              {!isUserOrg && (
                <ApplyButton
                  user={user}
                  isUserOrg={isUserOrg}
                  userPref={userPref}
                  activeSub={hasActiveSubscription}
                  orgPreview={isUserOrg}
                  id={event._id}
                  mainOrgId={event.mainOrgId}
                  event={event}
                  openCallId={openCallId}
                  openCallState={openCallState ?? null}
                  slug={slug}
                  appUrl={outputAppLink}
                  edition={event.dates.edition}
                  openCall={openCallStatus}
                  callType={callType}
                  manualApplied={appStatus}
                  isBookmarked={bookmarked}
                  isHidden={hidden}
                  eventCategory={eventCategory}
                  appFee={basicInfo?.appFee ?? 0}
                  className="mx-auto w-full max-w-52"
                  detailCard
                  finalButton
                />
              )}
            </div>
          </div>
          <div id="event">
            <EventCard
              event={event}
              format="desktop"
              aboutRef={aboutRef}
              fontSize={fontSize}
            />
          </div>
          <div id="organizer">
            <OrganizerCard
              organizer={organizer}
              format="desktop"
              fontSize={fontSize}
            />
          </div>
          <div id="application">
            <p>Application content</p>
          </div>
          {isAdmin && (
            <div id="admin">
              <ChartAreaInteractive
                data={appChartData ?? []}
                loading={appChartLoading}
              />
            </div>
          )}
        </NavTabs>
      </Card>
    </div>
  );
};
