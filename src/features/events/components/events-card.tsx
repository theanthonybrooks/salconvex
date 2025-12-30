import {
  hasProductionCategories,
  noProdCategories,
} from "@/constants/eventConsts";

import { EventData } from "@/types/eventTypes";

import { RefObject, useState } from "react";

import { FaMapLocationDot } from "react-icons/fa6";

import { Card } from "@/components/ui/card";
import { LinkList } from "@/components/ui/link-list";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/state-accordion-test";
import EventDates from "@/features/events/components/event-dates";
import { LazyMap } from "@/features/wrapper-elements/map/lazy-map";
import { getEventCategoryLabel } from "@/helpers/eventFns";
import { getLocationType } from "@/helpers/locationFns";
import { RichTextDisplay } from "@/helpers/richTextFns";
import { cn } from "@/helpers/utilsFns";

interface LinkProps {
  event: EventData;
}

interface EventCardProps extends LinkProps {
  format: "mobile" | "desktop";
  aboutRef?: RefObject<HTMLDivElement | null>;
  fontSize?: string;
}

//TODO: Add in logic for the event dates, a structured (formatted) about section that will utilize something like Quill on the submission form. Perhaps have a specific "Dates" accordion section that just gives the event dates/times and/or artist/production dates/times.

export const EventCard = ({
  event,
  format,
  fontSize,
  aboutRef,
}: EventCardProps) => {
  const [viewFull, setViewFull] = useState(false);
  const { category: eventCategory, location, dates } = event;

  const latitude = location.coordinates?.latitude ?? 0;
  const longitude = location.coordinates?.longitude ?? 0;
  const isMobile = format === "mobile";
  const { prodDates } = dates;
  const prodEnd = prodDates?.[0]?.end;
  const baseDesktopAccordionClassName = "rounded-lg border-2 bg-white/30 px-4";

  return (
    <>
      {isMobile ? (
        <Card className="w-full rounded-xl border-foreground/20 bg-white/60 p-5">
          <Accordion type="multiple" defaultValue={["location"]}>
            {location.coordinates && (
              <AccordionItem value="location">
                <AccordionTrigger title="Location:" fontSize={fontSize} />

                <AccordionContent>
                  <LazyMap
                    points={[
                      {
                        latitude,
                        longitude,
                        label: event.name,
                        edition: event.dates.edition,
                      },
                    ]}
                    locationType={getLocationType(location)}
                    className={cn(
                      "z-0 mb-4 h-[200px] w-full overflow-hidden rounded-xl",
                      viewFull && "h-[600px]",
                    )}
                    fullScreen={viewFull}
                    setFullScreenAction={setViewFull}
                  />
                  <p className={cn("font-medium", fontSize)}>Full Location:</p>
                  <span className={cn("flex items-center gap-2", fontSize)}>
                    {event.location.full}
                    {eventCategory === "event" && (
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`}
                        className="flex items-center justify-center gap-x-1 text-sm font-medium underline-offset-2 hover:underline"
                      >
                        {/* Get directions */}
                        <FaMapLocationDot className="size-5 md:size-4" />
                      </a>
                    )}
                  </span>
                </AccordionContent>
              </AccordionItem>
            )}

            {(event.about || event.blurb) && (
              <AccordionItem value="about">
                <AccordionTrigger title="About:" fontSize={fontSize} />

                <AccordionContent ref={aboutRef}>
                  {event.about ? (
                    <div className="flex flex-col space-y-3 pb-3">
                      <RichTextDisplay html={event.about} fontSize={fontSize} />
                    </div>
                  ) : (
                    <p className={cn("pb-3", fontSize)}>{event.blurb}</p>
                  )}
                </AccordionContent>
              </AccordionItem>
            )}
            {event.links && (
              <AccordionItem value="links">
                <AccordionTrigger title="Links:" fontSize={fontSize} />

                <AccordionContent>
                  <LinkList
                    event={event}
                    purpose="detail"
                    fontSize={fontSize}
                  />
                </AccordionContent>
              </AccordionItem>
            )}

            {event.otherInfo && (
              <AccordionItem value="other">
                <AccordionTrigger title="Other info:" fontSize={fontSize} />
                <AccordionContent>
                  <RichTextDisplay html={event.otherInfo} fontSize={fontSize} />
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </Card>
      ) : (
        <Accordion
          type="multiple"
          defaultValue={["map", "dates", "about", "links"]}
          className="space-y-4"
        >
          {location.coordinates && (
            <AccordionItem
              value="map"
              className={cn(baseDesktopAccordionClassName)}
            >
              <AccordionTrigger title="Location:" fontSize={fontSize} />

              <AccordionContent className={cn(fontSize)}>
                <LazyMap
                  points={[
                    {
                      latitude,
                      longitude,
                      label: event.name,
                      edition: event.dates.edition,
                    },
                  ]}
                  fullScreen={viewFull}
                  setFullScreenAction={setViewFull}
                  locationType={getLocationType(location)}
                  className={
                    "z-0 mb-4 h-[400px] w-full overflow-hidden rounded-xl"
                  }
                />
                <section className="flex flex-col gap-2">
                  <p className="font-medium">Full Location:</p>
                  <span className="flex items-center gap-2">
                    <p>{event.location.full}</p>

                    {eventCategory === "event" && (
                      <>
                        {"-"}
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`}
                          className="flex items-center justify-center gap-x-1 text-sm font-medium underline-offset-2 hover:underline"
                        >
                          Get directions
                          <FaMapLocationDot className="size-5 md:size-4" />
                        </a>
                      </>
                    )}
                  </span>
                </section>
                {/* <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`}
                  className="flex items-center justify-center gap-x-1 text-sm font-medium underline-offset-2 hover:underline"
                >
                  Get directions
                  <FaMapLocationDot className="size-5 md:size-4" />
                </a> */}
              </AccordionContent>
            </AccordionItem>
          )}
          {event && !noProdCategories.includes(eventCategory) && (
            <AccordionItem
              value="dates"
              className={cn(baseDesktopAccordionClassName)}
            >
              <AccordionTrigger title="Dates:" fontSize={fontSize} />
              <AccordionContent className={cn(fontSize)}>
                <span className="flex flex-col gap-1">
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

                  {hasProductionCategories.includes(eventCategory) &&
                    prodEnd && (
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
                  {/* </div> */}
                </span>
              </AccordionContent>
            </AccordionItem>
          )}

          {(event.about || event.blurb) && (
            <AccordionItem
              value="about"
              className={cn(baseDesktopAccordionClassName)}
            >
              <AccordionTrigger title="About:" fontSize={fontSize} />

              <AccordionContent ref={aboutRef}>
                {event.about ? (
                  <div className="mb-4 flex flex-col space-y-3 pb-3">
                    <RichTextDisplay html={event.about} fontSize={fontSize} />
                  </div>
                ) : (
                  <p className={cn("mb-4 pb-3", fontSize)}>{event.blurb}</p>
                )}
              </AccordionContent>
            </AccordionItem>
          )}

          {event.links && (
            <AccordionItem
              value="links"
              className={cn(baseDesktopAccordionClassName)}
            >
              <AccordionTrigger title="Links:" fontSize={fontSize} />

              <AccordionContent>
                <LinkList event={event} purpose="detail" fontSize={fontSize} />
              </AccordionContent>
            </AccordionItem>
          )}

          {event.otherInfo && (
            <AccordionItem
              value="other"
              className={cn(baseDesktopAccordionClassName)}
            >
              <AccordionTrigger title="Other info:" fontSize={fontSize} />
              <AccordionContent>
                <RichTextDisplay html={event.otherInfo} fontSize={fontSize} />
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      )}
    </>
  );
};
