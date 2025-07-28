import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/state-accordion-test";
import { LazyMap } from "@/features/wrapper-elements/map/lazy-map";
import { EventData } from "@/types/event";

import { Card } from "@/components/ui/card";
import { LinkList } from "@/components/ui/link-list";
import EventDates from "@/features/events/components/event-dates";
import { getEventCategoryLabel } from "@/lib/eventFns";
import { RichTextDisplay } from "@/lib/richTextFns";
import { FaMapLocationDot } from "react-icons/fa6";

interface LinkProps {
  event: EventData;
}

interface EventCardProps extends LinkProps {
  format: "mobile" | "desktop";
}

//TODO: Add in logic for the event dates, a structured (formatted) about section that will utilize something like Quill on the submission form. Perhaps have a specific "Dates" accordion section that just gives the event dates/times and/or artist/production dates/times.

export const EventCard = ({ event, format }: EventCardProps) => {
  const {
    category: eventCategory,
    // type: eventType,
    location,
    dates,
    // slug,
  } = event;

  const latitude = location.coordinates?.latitude ?? 0;
  const longitude = location.coordinates?.longitude ?? 0;
  const isMobile = format === "mobile";
  const { prodDates } = dates;
  // const prodStart = prodDates?.[0]?.start;
  const prodEnd = prodDates?.[0]?.end;

  return (
    <>
      {isMobile ? (
        <Card className="w-full max-w-[95vw] rounded-xl border-foreground/20 bg-white/60 p-5">
          <Accordion type="multiple" defaultValue={["item-1"]}>
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
                    <FaMapLocationDot className="size-5 md:size-4" />
                  </a>
                </AccordionContent>
              </AccordionItem>
            )}

            {event.about && (
              <AccordionItem value="item-2">
                <AccordionTrigger title="About:" />

                <AccordionContent>
                  <div className="mb-4 flex flex-col space-y-3 pb-3">
                    <RichTextDisplay html={event.about} />
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
            {event.links && (
              <AccordionItem value="item-3">
                <AccordionTrigger title="Links:" />

                <AccordionContent>
                  <LinkList event={event} purpose="detail" />
                </AccordionContent>
              </AccordionItem>
            )}

            {event.otherInfo && (
              <AccordionItem value="item-4">
                <AccordionTrigger title="Other info:" />
                <AccordionContent>
                  <RichTextDisplay html={event.otherInfo} />
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </Card>
      ) : (
        <Accordion
          type="multiple"
          defaultValue={["map", "dates", "about", "links"]}
        >
          {location.coordinates && (
            <AccordionItem value="map">
              <AccordionTrigger title="Location:" />

              <AccordionContent>
                <LazyMap
                  latitude={latitude}
                  longitude={longitude}
                  label={event.name}
                  hasDirections={true}
                  className="z-0 mb-4 h-[400px] w-full overflow-hidden rounded-xl"
                />
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
          {event && (
            <AccordionItem value="dates">
              <AccordionTrigger title="Dates:" />
              <AccordionContent>
                <span className="flex flex-col gap-1">
                  {/* <p className="flex flex-col items-start gap-1 text-sm">
                    <span className="font-semibold">Category:</span>
                    {getEventCategoryLabel(eventCategory)}
                  </p>
                  {eventType && eventCategory === "event" && (
                    <p className="flex flex-col items-start gap-1 text-sm">
                      <span className="font-semibold">Type:</span>{" "}
                      {eventType
                        .map((type) => getEventTypeLabel(type))
                        .join(" | ")}
                    </p>
                  )}
                  <div className="mt-3 flex flex-col gap-1"> */}
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

                  {((eventCategory === "project" &&
                    dates.eventFormat === "noEvent") ||
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
                  {/* </div> */}
                </span>
              </AccordionContent>
            </AccordionItem>
          )}

          {event.about && (
            <AccordionItem value="about">
              <AccordionTrigger title="About:" />

              <AccordionContent>
                <div className="mb-4 flex flex-col space-y-3 pb-3">
                  <RichTextDisplay html={event.about} />
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {event.links && (
            <AccordionItem value="links">
              <AccordionTrigger title="Links:" />

              <AccordionContent>
                <LinkList event={event} purpose="detail" />
              </AccordionContent>
            </AccordionItem>
          )}

          {event.otherInfo && (
            <AccordionItem value="other">
              <AccordionTrigger title="Other info:" />
              <AccordionContent>
                <RichTextDisplay html={event.otherInfo} />
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      )}
    </>
  );
};
