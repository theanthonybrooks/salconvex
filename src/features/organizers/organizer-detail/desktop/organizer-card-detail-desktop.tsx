"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";

import { Link } from "@/components/ui/custom-link";
import NavTabs from "@/components/ui/nav-tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/state-accordion-test";
import { SalBackNavigation } from "@/features/events/components/sal-back-navigation";
import { OrganizerCard } from "@/features/organizers/components/organizer-card";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { formatEventDates } from "@/lib/dateFns";
import { getFormattedLocationString } from "@/lib/locations";
import { RichTextDisplay } from "@/lib/richTextFns";
import { validOCVals } from "@/types/openCall";
import { OrganizerCardProps } from "@/types/organizer";
import { usePreloadedQuery } from "convex/react";
import Image from "next/image";
import { useState } from "react";

export const OrganizerCardDetailDesktop = (props: OrganizerCardProps) => {
  const { preloadedSubStatus, preloadedUserData } = useConvexPreload();
  const subData = usePreloadedQuery(preloadedSubStatus);
  const userData = usePreloadedQuery(preloadedUserData);
  const user = userData?.user ?? null;
  const isAdmin = user?.role?.includes("admin") || false;
  const hasActiveSubscription =
    (subData?.hasActiveSubscription || isAdmin) ?? false;
  const { data, className } = props;
  const { events, organizer } = data;
  const {
    logo: orgLogo,
    location,
    //  links
  } = organizer;

  // const { bookmarked, hidden } = artist?.listActions?.find(
  //   (la) => la.eventId === event._id,
  // ) ?? {
  //   bookmarked: false,
  //   hidden: false,
  // };

  const groupedEvents = events?.reduce(
    (acc, event) => {
      const edition = event.dates.edition;
      if (!acc[edition]) acc[edition] = [];
      acc[edition].push(event);
      return acc;
    },
    {} as Record<string, typeof events>,
  );

  const locationString = getFormattedLocationString(location);

  const isOwner = user?._id === organizer?.ownerId;

  const tabList = [
    // { id: "application", label: "My Application" },
    { id: "events", label: "Events/Projects" },
    { id: "organizer", label: "Organizer" },
  ];
  const [activeTab, setActiveTab] = useState("events");
  // const { toggleListAction } = useToggleListAction(event._id);

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
          "row-start-2 hidden w-full max-w-[350px] grid-cols-[75px_auto] gap-x-3 self-start rounded-3xl border-foreground/20 bg-white/50 p-3 first:mt-6 xl:sticky xl:top-24 xl:grid",
        )}
      >
        <div className="col-span-full mb-4 grid w-full grid-cols-[75px_auto] gap-x-3 pt-2">
          <div className="col-span-1 flex items-center justify-center">
            <Image
              src={orgLogo}
              alt="Organizer Logo"
              width={60}
              height={60}
              className={cn(
                "size-[60px] rounded-full border-2 border-foreground",
              )}
            />
          </div>

          <div className="col-start-2 row-start-1 flex items-center">
            <p className="mb-1 text-balance pr-1 text-base font-semibold capitalize">
              {organizer?.name}
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

            {/* //todo: ensure that this is required in the submission form */}
            {organizer.about && (
              <Accordion type="multiple" defaultValue={["about"]}>
                <AccordionItem value="about">
                  <AccordionTrigger title="About:" className="pb-2" />
                  <AccordionContent className="text-sm">
                    <RichTextDisplay html={organizer.about} maxChars={200} />
                    {organizer.about?.length > 200 && (
                      <button
                        className="mt-2 w-full text-center text-sm underline underline-offset-2 hover:underline-offset-4 active:underline-offset-1"
                        onClick={() => setActiveTab("organizer")}
                      >
                        Read more
                      </button>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
          </div>
        </div>
      </Card>

      <Card className="col-start-2 row-start-2 flex w-full flex-col gap-y-2 rounded-3xl border-foreground/20 bg-white/50 p-4">
        <div className="flex h-20 w-full items-center gap-x-4 rounded-2xl border border-dotted border-foreground/50 bg-card-secondary p-4">
          <div className="flex w-full items-center justify-between pr-2">
            <div className="flex items-center gap-x-4 px-4">
              <Image
                src={orgLogo}
                alt="Event Logo"
                width={60}
                height={60}
                className={cn("size-[60px] rounded-full border-2 xl:hidden")}
              />
              <div className="flex flex-col">
                <span className="text-xl font-bold capitalize">
                  {organizer?.name}
                </span>
                <span className="inline-flex items-end gap-x-1 text-sm leading-[0.95rem]">
                  {locationString}

                  <MapPin
                    onClick={() => setActiveTab("event")}
                    className="size-4 cursor-pointer transition-transform duration-150 hover:scale-105"
                  />
                </span>
              </div>
            </div>
          </div>
        </div>
        <NavTabs
          tabs={tabList}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        >
          {/* <div id="events">
            <ol className="list-outside list-decimal px-2">
              {events?.map((event) => (
                <li key={event._id} className="text-sm">
                  <div className="flex items-center gap-x-2">
                    <Link
                      href={`/thelist/event/${event.slug}/${event.dates.edition}`}
                      target="_blank"
                    >
                      <p className="text-sm">
                        <span className="font-bold">{event.name}</span>
                        {" - "}
                        <span className="font-light italic">
                          {event.dates.edition}
                        </span>
                      </p>
                    </Link>
                  </div>
                </li>
              ))}
            </ol>
          </div> */}
          <div id="events" className="px-4">
            {groupedEvents &&
              Object.entries(groupedEvents)
                .sort((a, b) => b[0].localeCompare(a[0])) // Optional: sort editions descending
                .map(([edition, editionEvents]) => {
                  return (
                    <div key={edition} className="mb-4">
                      <h3 className="mb-2 font-semibold underline underline-offset-2">
                        {edition}
                      </h3>
                      <ul className="list-outside list-none px-2">
                        {editionEvents.map((event) => {
                          return (
                            <li key={event._id} className="text-sm">
                              <div className="flex items-center gap-x-2">
                                <Link
                                  href={`/thelist/event/${event.slug}/${event.dates.edition}${validOCVals.includes(event.hasOpenCall) ? "/call" : ""}`}
                                >
                                  <p className="text-sm">
                                    <span className="font-bold capitalize">
                                      {event.name}
                                    </span>

                                    {" - "}
                                    <span className="font-light italic">
                                      {event.dates.eventFormat !== "noEvent"
                                        ? formatEventDates(
                                            event.dates.eventDates[0].start,
                                            event.dates.eventDates[
                                              event.dates.eventDates.length - 1
                                            ].end,
                                            event.dates.eventFormat ===
                                              "ongoing",
                                            "desktop",
                                          )
                                        : event.dates.prodDates
                                          ? formatEventDates(
                                              event.dates.prodDates[0].start,
                                              event.dates.prodDates[
                                                event.dates.prodDates.length - 1
                                              ].end,
                                              false,
                                              "desktop",
                                            )
                                          : event.dates.edition}
                                    </span>
                                  </p>
                                </Link>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
          </div>
          <div id="organizer">
            <OrganizerCard
              organizer={organizer}
              format="desktop"
              srcPage="organizer"
            />
          </div>
          <div id="application">
            <p>Application content</p>
          </div>
        </NavTabs>
      </Card>
    </div>
  );
};
