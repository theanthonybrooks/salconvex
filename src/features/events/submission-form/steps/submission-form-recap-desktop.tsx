// TODO: Add the terms of service checkboxes

"use client";

import NavTabs from "@/components/ui/nav-tabs";
import { EventOCFormValues } from "@/features/events/event-add-form";
import { getEventCategoryLabel, getEventTypeLabel } from "@/lib/eventFns";
import { RichTextDisplay } from "@/lib/richTextFns";
import { useState } from "react";
import { useFormContext } from "react-hook-form";

export const SubmissionFormRecapDesktop = () => {
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
    { id: "openCall", label: "Open Call" },
    { id: "organizer", label: "Organizer" },
  ];
  const [activeTab, setActiveTab] = useState("event");

  return (
    <NavTabs tabs={tabList} activeTab={activeTab} setActiveTab={setActiveTab}>
      {/*   <div id="event">
        /~ <pre className="max-w-[74dvw] whitespace-pre-wrap break-words rounded p-4 text-sm lg:max-w-[90dvw]">
          {JSON.stringify(eventData, null, 2)}
        </pre> ~/
        <p>Name: {eventData.name}</p>
        <p>Location: {eventData.location.full}</p>
        <p>Category: {getEventCategoryLabel(eventData.category)}</p>
        {eventData.type && eventData.type?.length > 0 && (
          <p>
            Type:{" "}
            {Array.isArray(eventData.type)
              ? getEventTypeLabel(eventData.type)
              : getEventTypeLabel([eventData.type])}
          </p>
        )}{" "}
        {eventData.dates.eventFormat === "ongoing" && (
          <p>Event Dates Format: Ongoing</p>
        )}
        <p>
          Dates: {eventData.dates?.eventDates?.map((d) => d.start).join(", ")}
        </p>
        {eventData.dates?.prodFormat === "sameAsEvent" && (
          <p>Production Format: Same Dates as Event</p>
        )}{" "}
        {eventData.dates?.prodFormat !== "sameAsEvent" && (
          <p>
            Production Dates:{" "}
            {eventData.dates?.prodDates?.map((d) => d.start).join(", ")}
          </p>
        )}
        <p>Links: Map out the links here </p>
        <span className="flex items-center gap-x-1">
          About: <RichTextDisplay html={eventData.about || ""} />
        </span>
        <span className="flex items-center gap-x-1">
          Other Info: <RichTextDisplay html={eventData.otherInfo || ""} />
        </span>
      </div>*/}
      <div id="event" className="overflow-x-auto px-4">
        <table className="w-full table-auto border-separate border-spacing-y-2 text-left text-sm">
          <tbody>
            <tr>
              <th className="pr-4 align-top font-medium">Name</th>
              <td>{eventData.name}</td>
            </tr>

            <tr>
              <th className="pr-4 align-top font-medium">Location</th>
              <td>{eventData.location.full}</td>
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
                {eventData.dates?.eventDates?.map((d) => d.start).join(", ") ||
                  "-"}
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
                <th className="pr-4 align-top font-medium">Production Dates</th>
                <td>
                  {eventData.dates?.prodDates?.map((d) => d.start).join(", ") ||
                    "-"}
                </td>
              </tr>
            )}

            <tr>
              <th className="pr-4 align-top font-medium">Links</th>
              <td>Map out the links here</td>
            </tr>

            <tr>
              <th className="pr-4 align-top font-medium">About</th>
              <td>
                <RichTextDisplay html={eventData.about || ""} />
              </td>
            </tr>

            <tr>
              <th className="pr-4 align-top font-medium">Other Info</th>
              <td>
                <RichTextDisplay html={eventData.otherInfo || ""} />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div id="openCall">
        <pre className="max-w-[74dvw] whitespace-pre-wrap break-words rounded p-4 text-sm lg:max-w-[90dvw]">
          {JSON.stringify(ocData, null, 2)}
        </pre>
      </div>
      <div id="organizer">
        <pre className="max-w-[74dvw] whitespace-pre-wrap break-words rounded p-4 text-sm lg:max-w-[90dvw]">
          {JSON.stringify(orgData, null, 2)}
        </pre>
        {/* <OrganizerCard organizer={organizer} format="desktop" /> */}
      </div>
    </NavTabs>
  );
};
