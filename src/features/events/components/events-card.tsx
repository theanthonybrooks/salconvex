import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/state-accordion-test";
import { LazyMap } from "@/features/wrapper-elements/map/lazy-map";
import { EventData } from "@/types/event";

import { MapIcon, Phone } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Organizer } from "@/types/organizer";
import {
  FaEnvelope,
  FaFacebook,
  FaGlobe,
  FaInstagram,
  FaLink,
  FaThreads,
  FaVk,
} from "react-icons/fa6";

interface LinkProps {
  event: EventData;
  organizer: Organizer;
}

interface EventCardProps extends LinkProps {
  format: "mobile" | "desktop";
}

//TODO: Add in logic for the event dates, a structured (formatted) about section that will utilize something like Quill on the submission form. Perhaps have a specific "Dates" accordion section that just gives the event dates/times and/or artist/production dates/times.

export const EventCard = ({ event, organizer, format }: EventCardProps) => {
  const {
    // eventCategory,
    // eventType,
    location,
    // dates,
    // slug,
  } = event;

  const latitude = location.coordinates?.latitude ?? 0;
  const longitude = location.coordinates?.longitude ?? 0;
  const isMobile = format === "mobile";
  const isHtml = (str: string) => /<\/?[a-z][\s\S]*>/i.test(str);

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
                    <MapIcon className="size-5 md:size-4" />
                  </a>
                </AccordionContent>
              </AccordionItem>
            )}

            {event.about && (
              <AccordionItem value="item-2">
                <AccordionTrigger title="About:" />

                <AccordionContent>
                  <div className="mb-4 flex flex-col space-y-3 pb-3">
                    {isHtml(event.about) ? (
                      <div dangerouslySetInnerHTML={{ __html: event.about }} />
                    ) : (
                      <p>{event.about}</p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
            {event.links && <LinkList event={event} organizer={organizer} />}

            {event.otherInfo && event.otherInfo.length > 0 && (
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
      ) : (
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

          {event.about && (
            <AccordionItem value="item-2">
              <AccordionTrigger title="About:" />

              <AccordionContent>
                <div className="mb-4 flex flex-col space-y-3 pb-3">
                  {isHtml(event.about) ? (
                    <div dangerouslySetInnerHTML={{ __html: event.about }} />
                  ) : (
                    <p>{event.about}</p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          <LinkList event={event} organizer={organizer} />

          {event.otherInfo && event.otherInfo.length > 0 && (
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
      )}
    </>
  );
};

export const LinkList = ({ event, organizer }: LinkProps) => {
  return (
    <>
      {event.links && !event.links?.sameAsOrganizer && (
        <AccordionItem value="item-3">
          <AccordionTrigger title="Links:" />

          <AccordionContent>
            <div className="flex flex-col gap-y-2 p-3">
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
              {event.links?.linkAggregate && (
                <a href={event.links.linkAggregate}>
                  <div className="flex items-center gap-x-2">
                    <FaLink className="size-5" />
                    <span className="underline-offset-2 hover:underline">
                      {event.links.linkAggregate.split("www.").slice(-1)[0]}
                    </span>
                  </div>
                </a>
              )}
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
          </AccordionContent>
        </AccordionItem>
      )}
      {event.links &&
        event.links?.sameAsOrganizer &&
        Object.keys(organizer.links || {}).length > 0 && (
          <AccordionItem value="item-3">
            <AccordionTrigger title="Links:" />

            <AccordionContent>
              <div className="flex flex-col gap-y-2 p-3">
                {organizer.links?.email && (
                  <a
                    href={`mailto:${organizer.links.email}?subject=${event.name}`}
                  >
                    <div className="flex items-center gap-x-2">
                      <FaEnvelope className="size-5" />
                      <span className="underline-offset-2 hover:underline">
                        {organizer.links.email}
                      </span>
                    </div>
                  </a>
                )}
                {organizer.links?.website && (
                  <a href={organizer.links.website}>
                    <div className="flex items-center gap-x-2">
                      <FaGlobe className="size-5" />
                      <span className="underline-offset-2 hover:underline">
                        {organizer.links.website.split("www.").slice(-1)[0]}
                      </span>
                    </div>
                  </a>
                )}
                {organizer.links?.linkAggregate && (
                  <a href={organizer.links.linkAggregate}>
                    <div className="flex items-center gap-x-2">
                      <FaLink className="size-5" />
                      <span className="underline-offset-2 hover:underline">
                        {
                          organizer.links.linkAggregate
                            .split("www.")
                            .slice(-1)[0]
                        }
                      </span>
                    </div>
                  </a>
                )}

                {organizer.links?.phone && (
                  <a href={`tel:${organizer.links.phone}`}>
                    <div className="flex items-center gap-x-2">
                      <Phone className="size-5" />

                      <span className="underline-offset-2 hover:underline">
                        {organizer.links.phone}
                      </span>
                    </div>
                  </a>
                )}
                {organizer.links?.instagram && (
                  <a href={organizer.links.instagram}>
                    <div className="flex items-center gap-x-2">
                      <FaInstagram className="size-5" />

                      <span className="underline-offset-2 hover:underline">
                        @{organizer.links.instagram.split(".com/").slice(-1)[0]}
                      </span>
                    </div>
                  </a>
                )}
                {organizer.links?.facebook && (
                  <a href={organizer.links.facebook}>
                    <div className="flex items-center gap-x-2">
                      <FaFacebook className="size-5" />

                      <span className="underline-offset-2 hover:underline">
                        @{organizer.links.facebook.split(".com/").slice(-1)[0]}
                      </span>
                    </div>
                  </a>
                )}
                {organizer.links?.threads && (
                  <a href={organizer.links.threads}>
                    <div className="flex items-center gap-x-2">
                      <FaThreads className="size-5" />

                      <span className="underline-offset-2 hover:underline">
                        @{organizer.links.threads.split(".net/").slice(-1)[0]}
                      </span>
                    </div>
                  </a>
                )}
                {organizer.links?.vk && (
                  <a href={organizer.links.vk}>
                    <div className="flex items-center gap-x-2">
                      <FaVk className="size-5" />

                      <span className="underline-offset-2 hover:underline">
                        @{organizer.links.vk.split(".com/").slice(-1)[0]}
                      </span>
                    </div>
                  </a>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}
    </>
  );
};
