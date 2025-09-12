"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CheckCircleIcon, EyeOff, MapPin } from "lucide-react";

import { FaBookmark, FaRegBookmark } from "react-icons/fa6";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ApplyButton } from "@/features/events/event-apply-btn";
import { OpenCallCardProps } from "@/types/openCall";

import { DraftPendingBanner } from "@/components/ui/draft-pending-banner";
import { EventOrgLogo } from "@/components/ui/event-org-logo";
import { useToggleListAction } from "@/features/artists/helpers/listActions";
import EventDates from "@/features/events/components/event-dates";
import { EventCard } from "@/features/events/components/events-card";
import OpenCallCard from "@/features/events/open-calls/components/open-call-card";
import { getOpenCallStatus } from "@/features/events/open-calls/helpers/openCallStatus";
import { OrganizerCard } from "@/features/organizers/components/organizer-card";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { getEventCategoryLabel, getEventTypeLabel } from "@/lib/eventFns";
import { getFormattedLocationString } from "@/lib/locations";
import { useMutation, usePreloadedQuery } from "convex/react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { api } from "~/convex/_generated/api";

export const OpenCallCardDetailMobile = (props: OpenCallCardProps) => {
  const router = useRouter();
  const { preloadedSubStatus, preloadedUserData } = useConvexPreload();
  const subData = usePreloadedQuery(preloadedSubStatus);
  const userData = usePreloadedQuery(preloadedUserData);
  const user = userData?.user ?? null;
  const userPref = userData?.userPref ?? null;
  const fontSize = userPref?.fontSize === "large" ? "text-base" : "text-sm";
  const isAdmin = user?.role?.includes("admin") || false;
  const hasActiveSubscription =
    (subData?.hasActiveSubscription || isAdmin) ?? false;
  const {
    data,
    artist,
    // userPref,
    className,
    // organizer,
  } = props;

  const { event, organizer, openCall, application } = data;
  const {
    // id: eventId,
    logo: eventLogo,
    category: eventCategory,
    type: eventType,
    location,
    state: eventState,
    slug,
  } = event;
  //todo: now that this is dynamically calculated in the combine function, utilize it as a simpler way to show/hide info

  const manualApplied = application?.manualApplied ?? false;

  const appStatus = application?.applicationStatus ?? null;

  const { bookmarked, hidden } = artist?.listActions?.find(
    (la) => la.eventId === event._id,
  ) ?? {
    bookmarked: false,
    hidden: false,
  };

  const {
    basicInfo,
    requirements,
    _id: openCallId,
    state: openCallState,
  } = openCall;

  const appUrl = requirements?.applicationLink;
  const appLinkFormat = requirements?.applicationLinkFormat;
  const mailLink = appLinkFormat === "mailto:";
  const mailSubject = requirements?.applicationLinkSubject;
  const outputAppLink = mailLink
    ? `mailto:${appUrl}${mailSubject ? `?subject=${mailSubject}` : ""}`
    : appUrl;
  //todo: figure out fallback url for something without an application link. Maybe just use the event url? Will obviously need to vary or be missing later when I implement the application system, but for now.

  const { callType, dates: callDates } = basicInfo;
  const { ocStart, ocEnd } = callDates;

  const openCallStatus = getOpenCallStatus(
    ocStart ? new Date(ocStart) : null,
    ocEnd ? new Date(ocEnd) : null,
    callType,
  );

  const isOwner = user?._id === organizer?.ownerId;
  // const hasOpenCall = openCallStatus === "active";

  // console.log("has open call", hasOpenCall)

  const updateUserLastActive = useMutation(api.users.updateUserLastActive);
  const [activeTab, setActiveTab] = useState("opencall");
  const [hasMounted, setHasMounted] = useState(false);

  const locationString = getFormattedLocationString(location);

  const { toggleListAction } = useToggleListAction(event._id);

  const onBookmark = async () => {
    if (!hasActiveSubscription) {
      router.push("/pricing");
    } else {
      toggleListAction({ bookmarked: !bookmarked });
      await updateUserLastActive({ email: user?.email ?? "" });
    }
  };

  const onHide = async () => {
    if (!hasActiveSubscription) {
      router.push("/pricing");
    } else {
      toggleListAction({ hidden: !hidden });
      await updateUserLastActive({ email: user?.email ?? "" });
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => setHasMounted(true), 50);
    return () => clearTimeout(timeout);
  }, []);
  return (
    <Card
      className={cn(
        "mb-10 grid w-full min-w-[340px] max-w-[400px] grid-cols-[75px_auto] gap-x-3 rounded-3xl border-foreground/20 bg-white/50 p-3 first:mt-6 lg:hidden",
        className,
      )}
    >
      {(isAdmin || isOwner) && (
        <DraftPendingBanner
          format="mobile"
          openCallState={openCallState}
          eventState={eventState}
          eventId={event._id}
        />
      )}
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
      <div className="col-span-full mb-4 grid w-full grid-cols-[75px_auto] gap-x-3">
        <div className="col-span-1 flex flex-col items-center justify-around space-y-6 pb-3 pt-3">
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

          <div className="flex flex-col items-center space-y-4">
            {appStatus !== null ? (
              <CheckCircleIcon className="mt-3 size-8 text-emerald-600" />
            ) : bookmarked ? (
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
          </div>
        </div>

        <div className="flex flex-col justify-between gap-y-3 pb-3 pr-3 pt-3">
          <div className="flex flex-col gap-y-1">
            <p className="mb-1 text-base font-semibold capitalize">
              {event?.name}
            </p>

            <p className={cn("inline-flex items-end gap-x-1", fontSize)}>
              {locationString}
              <MapPin
                onClick={() => setActiveTab("event")}
                className="cursor-pointer transition-transform duration-150 hover:scale-105"
              />
            </p>
          </div>
          <div
            className={cn("flex flex-col justify-between gap-y-1", fontSize)}
          >
            <div className="flex items-start gap-x-1">
              <span className="font-semibold">Dates:</span>
              <EventDates event={event} format="mobile" type="event" />
            </div>
            <p className="flex items-center gap-x-1">
              <span className="font-semibold">Category:</span>
              {getEventCategoryLabel(eventCategory)}
            </p>
            {eventType && eventCategory === "event" && (
              <p className="flex items-start gap-x-1">
                <span className="font-semibold">Type:</span>{" "}
                {eventType.map((type, index) => {
                  return (
                    <React.Fragment key={type}>
                      {eventType.length > 1 && index > 0 && <br />}
                      {getEventTypeLabel(type)}
                      {eventType.length > 1 &&
                        index < eventType.length - 1 &&
                        " |"}
                    </React.Fragment>
                  );
                })}
              </p>
            )}
            {basicInfo?.appFee !== 0 && (
              <p className="flex items-center gap-x-1 text-red-600">
                <span className="font-semibold">Application Fee:</span>
                {`$${basicInfo?.appFee}`}
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
            {["opencall", "event", "organizer"].map((tab) => (
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
                    className="absolute inset-0 z-0 rounded-md border-1.5 border-foreground bg-background shadow-sm"
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
                  {tab === "event" && getEventCategoryLabel(eventCategory)}
                  {tab === "organizer" && "Organizer"}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="opencall">
            <OpenCallCard
              artist={artist}
              event={event}
              openCall={openCall}
              format="mobile"
              userPref={userPref}
              publicPreview={!hasActiveSubscription}
              fontSize={fontSize}
            />
            <ApplyButton
              user={user}
              userPref={userPref}
              id={event._id}
              event={event}
              openCallId={openCallId}
              openCallState={openCallState ?? null}
              slug={slug}
              appUrl={outputAppLink}
              appLinkformat={appLinkFormat}
              edition={event.dates.edition}
              // appStatus={appStatus}
              openCall={openCallStatus}
              callType={callType}
              manualApplied={appStatus}
              // setManualApplied={setManualApplied}
              isBookmarked={bookmarked}
              // setIsBookmarked={setIsBookmarked}
              isHidden={hidden}
              // setIsHidden={setIsHidden}
              eventCategory={eventCategory}
              appFee={basicInfo?.appFee ?? 0}
              className="mx-auto mb-3 w-full"
              detailCard
              finalButton
            />
          </TabsContent>
          <TabsContent value="event">
            <EventCard event={event} format="mobile" fontSize={fontSize} />
          </TabsContent>
          <TabsContent value="organizer">
            <OrganizerCard
              organizer={organizer}
              format="mobile"
              fontSize={fontSize}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
};
