"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, MapPin } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/state-accordion-test";

import { FaBookmark, FaRegBookmark } from "react-icons/fa6";

import { ApproveBtn } from "@/components/ui/approve-btn";
import { EventOrgLogo } from "@/components/ui/event-org-logo";
import NavTabs from "@/components/ui/nav-tabs";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipSimple,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToggleListAction } from "@/features/artists/helpers/listActions";
import EventDates from "@/features/events/components/event-dates";
import { EventCard } from "@/features/events/components/events-card";
import { SalBackNavigation } from "@/features/events/components/sal-back-navigation";
import { OrganizerCard } from "@/features/organizers/components/organizer-card";
import { OrganizerLogoNameCard } from "@/features/organizers/components/organizer-logo-name-card";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { getEventCategoryLabel, getEventTypeLabel } from "@/lib/eventFns";
import { getFormattedLocationString } from "@/lib/locations";
import { RichTextDisplay } from "@/lib/richTextFns";
import { EventCardProps } from "@/types/event";
import { publicStateValues } from "@/types/openCall";
import { useMutation, usePreloadedQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { api } from "~/convex/_generated/api";

export const EventCardDetailDesktop = (props: EventCardProps) => {
  const router = useRouter();
  const { preloadedSubStatus, preloadedUserData } = useConvexPreload();
  const subData = usePreloadedQuery(preloadedSubStatus);
  const userData = usePreloadedQuery(preloadedUserData);
  const user = userData?.user ?? null;
  const userPref = userData?.userPref ?? null;
  const fontSize = userPref?.fontSize === "large" ? "text-base" : "text-sm";
  console.log(fontSize);
  const isAdmin = user?.role?.includes("admin") || false;

  const hasActiveSubscription =
    (subData?.hasActiveSubscription || isAdmin) ?? false;
  const { data, artist, className } = props;
  //note: removed artist from props. Add back when needed
  const aboutRef = useRef<HTMLDivElement | null>(null);
  const { event, organizer } = data;
  const {
    logo: eventLogo,
    category: eventCategory,
    type: eventType,
    location,
    dates,
    state: eventState,
  } = event;
  const validEventState = publicStateValues.includes(eventState ?? "");

  const { bookmarked, hidden } = artist?.listActions?.find(
    (la) => la.eventId === event._id,
  ) ?? {
    bookmarked: false,
    hidden: false,
  };

  const { prodDates } = dates;
  const prodEnd = prodDates?.[0]?.end;
  const tabList = [
    // { id: "application", label: "My Application" },
    { id: "event", label: getEventCategoryLabel(eventCategory) },
    { id: "organizer", label: "Organizer" },
  ];
  const [activeTab, setActiveTab] = useState("event");
  const { toggleListAction } = useToggleListAction(event._id);

  const locationString = getFormattedLocationString(location);
  const isOwner = user?._id === organizer?.ownerId;
  const updateUserLastActive = useMutation(api.users.updateUserLastActive);

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

  const scrollToAbout = () => {
    setActiveTab("event");
    setTimeout(() => {
      const element = aboutRef.current;
      console.log(element);
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

  return (
    <div
      className={cn(
        "flex w-full max-w-[min(90vw,1400px)] flex-col gap-x-6 pb-10 xl:grid xl:grid-cols-[300px_auto]",
        className,
      )}
    >
      <SalBackNavigation
        format="desktop"
        user={user}
        activeSub={hasActiveSubscription}
        isOwner={isOwner}
      />
      <Card
        className={cn(
          "row-start-2 hidden w-full max-w-[300px] grid-cols-[75px_auto] gap-x-3 self-start rounded-3xl border-foreground/20 bg-white/50 p-3 first:mt-6 xl:sticky xl:top-24 xl:grid",
        )}
      >
        <div className="col-span-full mb-4 grid w-full max-w-[calc(100%-12px)] grid-cols-[75px_auto] gap-x-3 pt-2">
          <div className="col-span-1 flex items-start justify-center">
            <EventOrgLogo imgSrc={eventLogo} type="event" />
          </div>

          <div className="col-start-2 row-start-1 flex items-center">
            <p className="mb-1 max-w-[18ch] hyphens-auto text-balance break-words pr-1 text-base font-semibold capitalize">
              {event?.name}
            </p>
          </div>
          <div className="col-span-full row-start-2 flex flex-col justify-between gap-y-3 px-4 pt-4">
            <div className="flex flex-col items-start gap-1 text-sm">
              <span className="flex items-baseline gap-1 font-semibold">
                Location:
                <TooltipSimple content="View on Map" side="top">
                  <MapPin
                    onClick={() => setActiveTab("event")}
                    className="size-4 cursor-pointer transition-transform duration-150 hover:scale-105"
                  />
                </TooltipSimple>
              </span>
              <span className="inline-flex items-end gap-x-1 text-sm leading-[0.95rem]">
                {locationString}
              </span>
            </div>
            {event.dates.eventFormat !== "noEvent" && (
              <div className="flex flex-col items-start gap-1 text-sm">
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
            {/*//todo: add this part */}
            {((eventCategory === "project" &&
              event.dates.eventFormat === "noEvent") ||
              (eventCategory === "event" && prodEnd)) && (
              <div className="flex flex-col items-start gap-1 text-sm">
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
                    <RichTextDisplay html={event.about} maxChars={200} />
                    {event.about?.length > 200 && (
                      <button
                        className="mt-2 w-full text-center text-sm underline underline-offset-2 hover:underline-offset-4 active:underline-offset-1"
                        onClick={scrollToAbout}
                      >
                        Read more
                      </button>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}

            <div className="flex flex-col items-start gap-1 text-sm">
              <span className="font-semibold">Organized by:</span>
              <OrganizerLogoNameCard
                setActiveTab={setActiveTab}
                organizer={organizer}
                abbr={true}
              />
              {isAdmin && !validEventState && (
                <>
                  <Separator
                    orientation="horizontal"
                    thickness={2}
                    className="col-span-full mx-auto mb-2 mt-3"
                  />
                  <ApproveBtn
                    user={user}
                    eventState={eventState}
                    eventCategory={eventCategory}
                    eventId={event._id}
                    openCallId={""}
                    orgId={event.mainOrgId}
                    openCallStatus={null}
                    appStatus={null}
                    isHidden={hidden}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Card className="col-start-2 row-start-2 flex w-full flex-col gap-y-2 rounded-3xl border-foreground/20 bg-white/50 p-4">
        <div className="flex min-h-20 w-full items-center gap-x-4 divide-x-2 rounded-2xl border border-dotted border-foreground/50 bg-card-secondary p-4">
          <div className="flex w-full items-center justify-between pr-2">
            <div className="flex items-center gap-x-4 px-4">
              <EventOrgLogo
                imgSrc={eventLogo}
                type="event"
                size="large"
                className="xl:hidden"
              />
              <div className="flex flex-col gap-2">
                <span className="text-xl font-bold capitalize">
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
              {eventState === "draft" && (
                <>
                  <Separator
                    orientation="vertical"
                    className="mr-2 h-10 bg-foreground"
                    thickness={2}
                  />
                  <p className="rounded-lg border-2 bg-stone-100 p-4 text-2xl font-bold uppercase text-foreground/60">
                    Draft
                  </p>
                </>
              )}
              {eventState === "submitted" && (
                <>
                  <Separator
                    orientation="vertical"
                    className="mr-2 h-10 bg-foreground"
                    thickness={2}
                  />
                  <p className="rounded-lg border-2 bg-salYellow/70 p-4 text-2xl font-bold uppercase text-foreground/60">
                    Pending
                  </p>
                </>
              )}
            </div>
            <div className="flex items-center gap-x-4">
              {hidden && hasActiveSubscription ? (
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger>
                      <EyeOff
                        className="size-7 cursor-pointer text-muted-foreground"
                        onClick={onHide}
                      />
                    </TooltipTrigger>
                    <TooltipContent align="end">
                      <p>Unhide {getEventCategoryLabel(eventCategory)}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger>
                      <Eye
                        className={cn(
                          "size-7 cursor-pointer",
                          !hasActiveSubscription &&
                            "cursor-default text-foreground/50",
                        )}
                        onClick={onHide}
                      />
                    </TooltipTrigger>
                    <TooltipContent align="end">
                      <p>Hide {getEventCategoryLabel(eventCategory)}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {bookmarked && hasActiveSubscription ? (
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
                        className={cn(
                          "size-7 cursor-pointer",
                          !hasActiveSubscription &&
                            "cursor-default text-foreground/50",
                        )}
                        onClick={onBookmark}
                      />{" "}
                    </TooltipTrigger>
                    <TooltipContent align="end">
                      <p>Bookmark {getEventCategoryLabel(eventCategory)}</p>
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
          fontSize={fontSize}
        >
          <div id="event">
            <EventCard event={event} format="desktop" aboutRef={aboutRef} />
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
