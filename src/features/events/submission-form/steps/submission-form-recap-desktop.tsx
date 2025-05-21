// TODO: Add the terms of service checkboxes

"use client";
import { LinkList } from "@/components/ui/link-list";
import NavTabs from "@/components/ui/nav-tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/state-accordion-test";
import EventDates from "@/features/events/components/event-dates";
import { EventOCFormValues } from "@/features/events/event-add-form";
import { getEventCategoryLabel, getEventTypeLabel } from "@/lib/eventFns";
import { RichTextDisplay } from "@/lib/richTextFns";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";
import { useFormContext } from "react-hook-form";

interface SubmissionFormRecapDesktopProps {
  formType: number;
}

export const SubmissionFormRecapDesktop = ({
  formType,
}: SubmissionFormRecapDesktopProps) => {
  const eventOnly = formType === 1;
  const {
    // getValues,
    watch,
  } = useFormContext<EventOCFormValues>();
  const eventData = watch("event");
  const ocData = watch("openCall");
  const orgData = watch("organization");
  const tabList = [
    // { id: "application", label: "My Application" },
    { id: "event", label: getEventCategoryLabel(eventData.category) },
    // { id: "openCall", label: "Open Call" },
    ...(!eventOnly ? [{ id: "openCall", label: "Open Call" }] : []),

    { id: "organizer", label: "Organizer" },
  ];
  const [activeTab, setActiveTab] = useState("event");

  console.log(eventOnly, tabList);

  return (
    <NavTabs
      tabs={tabList}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      className="form-recap"
    >
      <div id="event" className="px-4">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[40%_60%]">
          <table className="w-full table-auto border-separate border-spacing-y-2 text-left text-sm">
            <tbody>
              <tr>
                <th className="event-logo pr-4 align-top font-medium">Logo</th>
                <td className="event-logo">
                  {typeof eventData.logo === "string" && (
                    <Image
                      src={eventData.logo}
                      alt="Event Logo"
                      width={80}
                      height={80}
                      className={cn("size-20 rounded-full border-2")}
                    />
                  )}
                </td>
              </tr>
              <tr>
                <th className="pr-4 align-top font-medium">Name</th>
                <td>{eventData.name}</td>
              </tr>

              <tr>
                <th className="pr-4 align-top font-medium">Location</th>
                <td>{eventData.location?.full}</td>
              </tr>

              <tr>
                <th className="pr-4 align-top font-medium">Category</th>
                <td>{getEventCategoryLabel(eventData.category)}</td>
              </tr>

              {eventData.type && eventData.type?.length > 0 && (
                <tr>
                  <th className="pr-4 align-top font-medium">Type</th>
                  <td>
                    {Array.isArray(eventData.type)
                      ? getEventTypeLabel(eventData.type)
                      : getEventTypeLabel([eventData.type])}
                  </td>
                </tr>
              )}

              {eventData.dates.eventFormat === "ongoing" && (
                <tr>
                  <th className="pr-4 align-top font-medium">
                    Event Dates Format
                  </th>
                  <td>Ongoing</td>
                </tr>
              )}

              <tr>
                <th className="pr-4 align-top font-medium">Dates</th>
                <td>
                  <EventDates
                    event={{
                      dates: {
                        ...eventData.dates,
                        eventFormat:
                          eventData.dates.eventFormat === ""
                            ? undefined
                            : eventData.dates.eventFormat,
                        prodFormat:
                          eventData.dates.prodFormat === ""
                            ? undefined
                            : eventData.dates.prodFormat,
                      },
                    }}
                    format="desktop"
                    limit={0}
                    type="event"
                  />
                </td>
              </tr>

              <tr>
                <th className="pr-4 align-top font-medium">Production Dates</th>
                <td>
                  {eventData.dates?.prodFormat === "sameAsEvent"
                    ? "Same Dates as Event"
                    : "Custom"}
                </td>
              </tr>

              {eventData.dates?.prodFormat !== "sameAsEvent" && (
                <tr>
                  <th className="pr-4 align-top font-medium">
                    Production Dates
                  </th>
                  <td>
                    {eventData.dates?.prodDates
                      ?.map((d) => d.start)
                      .join(", ") || "-"}
                  </td>
                </tr>
              )}

              <tr>
                <th className="event-links pr-4 align-top font-medium">
                  Links
                </th>
                <td className="event-links">
                  <LinkList event={eventData} purpose="recap" />
                </td>
              </tr>
            </tbody>
          </table>
          {/* <Separator
            thickness={2}
            orientation="vertical"
            className="my-4 mx-auto border-foreground/"
          /> */}
          <div className="space-y-6 border-l-2 border-foreground/10 px-8 pt-2">
            <Accordion type="multiple" defaultValue={["About", "OtherInfo"]}>
              {eventData.about && (
                <AccordionItem value="About">
                  {/* <p className="mb-1 text-sm font-medium">About</p> */}
                  <AccordionTrigger title="About" />
                  <AccordionContent>
                    <RichTextDisplay
                      html={eventData.about || ""}
                      className="text-sm"
                    />
                  </AccordionContent>
                </AccordionItem>
              )}
              {eventData.otherInfo && (
                <AccordionItem value="OtherInfo">
                  {/* <p className="mb-1 text-sm font-medium">About</p> */}
                  <AccordionTrigger title="Other Info" />
                  <AccordionContent>
                    <RichTextDisplay
                      html={eventData.otherInfo || ""}
                      className="text-sm"
                    />
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          </div>
        </div>
      </div>

      {!eventOnly && (
        <div id="openCall">
          <pre className="max-w-[74dvw] whitespace-pre-wrap break-words rounded p-4 text-sm lg:max-w-[90dvw]">
            {JSON.stringify(ocData, null, 2)}
          </pre>
        </div>
      )}
      <div id="organizer">
        <pre className="max-w-[74dvw] whitespace-pre-wrap break-words rounded p-4 text-sm lg:max-w-[90dvw]">
          {JSON.stringify(orgData, null, 2)}
        </pre>
        {/* <OrganizerCard organizer={organizer} format="desktop" /> */}
      </div>
    </NavTabs>
  );
};
