// TODO: Add the terms of service checkboxes

"use client";

import { LinkList } from "@/components/ui/link-list";
import NavTabs from "@/components/ui/nav-tabs";
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
      <div id="event" className="overflow-x-auto px-4">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <table className="w-full table-auto border-separate border-spacing-y-2 text-left text-sm">
            <tbody>
              <tr>
                <th className="pr-4 align-top font-medium">Logo</th>
                <td>
                  {typeof eventData.logo === "string" && (
                    <Image
                      src={eventData.logo}
                      alt="Event Logo"
                      width={60}
                      height={60}
                      className={cn("size-[60px] rounded-full border-2")}
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
                <th className="pr-4 align-top font-medium">Links</th>
                <td>
                  <LinkList event={eventData} purpose="recap" />
                </td>
              </tr>
            </tbody>
          </table>
          <div className="space-y-6">
            {eventData.about && (
              <div>
                <h4 className="mb-1 text-sm font-medium text-muted-foreground">
                  About
                </h4>
                <RichTextDisplay html={eventData.about || ""} />
              </div>
            )}
            {eventData.otherInfo && (
              <div>
                <h4 className="mb-1 text-sm font-medium text-muted-foreground">
                  Other Info
                </h4>
                <RichTextDisplay html={eventData.otherInfo || ""} />
              </div>
            )}
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
