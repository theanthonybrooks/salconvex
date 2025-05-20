import {
  getFourCharMonth,
  getOrdinalSuffix,
  isValidIsoDate,
  seasonalTerms,
} from "@/lib/dateFns";
import { PublicEventPreviewData } from "@/types/event";

import { format } from "date-fns";
import { JSX } from "react";
import { FaQuoteLeft, FaQuoteRight } from "react-icons/fa6";

export function getGroupKeyFromEvent(
  event: PublicEventPreviewData,
  sortBy: string,
): {
  raw: string;
  label?: JSX.Element;
  parts?: {
    month: string;
    day: number;
    suffix: string;
    year?: string;
  };
} {
  const basicInfo = event.tabs.opencall?.basicInfo;
  // const isPublished = event.tabs.opencall?.state === "published";
  const callType = basicInfo?.callType;
  const ocEnd = basicInfo?.dates?.ocEnd;
  const ocEndDate = ocEnd && isValidIsoDate(ocEnd) ? new Date(ocEnd) : null;
  const ocStatus = event.openCallStatus;
  // const eventFormat = event.dates.eventFormat;
  const eventStart = event.dates?.eventDates[0]?.start;
  const eventOCStatus = event.hasOpenCall;
  const eventStartDate =
    eventStart && isValidIsoDate(eventStart) ? new Date(eventStart) : null;
  const isPast = !!ocEndDate && ocEndDate < new Date();
  const isPastStart = eventStart ? new Date(eventStart) < new Date() : false;
  const isYear = eventStart.trim().length === 4;
  const isSeason = seasonalTerms.includes(eventStart.trim());

  if (
    sortBy === "openCall" &&
    callType === "Fixed" &&
    ocEnd &&
    (ocStatus === "active" || ocStatus === "ended")
  ) {
    if (ocEndDate) {
      const day = ocEndDate.getDate();
      const month = getFourCharMonth(ocEndDate);
      const suffix = getOrdinalSuffix(day);
      const year = isPast ? format(ocEndDate, "yyyy") : undefined;

      return {
        raw: `${month} ${day}${suffix}${year ? ` (${year})` : ""}`,
        parts: { month, day, suffix, year },
      };
    } else {
      return { raw: `${ocEnd}` };
    }
  }

  if (sortBy === "openCall") {
    if (callType === "Rolling") return { raw: "Rolling Open Call" };
    if (callType === "Email") return { raw: "Open Email Submissions" };
    if (eventOCStatus === "Invite") return { raw: "Invite Only" };
    if (ocStatus === "coming-soon") return { raw: "Coming Soon!" };
    if (ocStatus === "ended") return { raw: "Past Open Call" };

    // if (!!callType && isPublished) return { raw: String(callType) };
    return { raw: "No Public Open Call" };
  }

  if (sortBy === "eventStart" && eventStart) {
    if (eventStartDate && !isYear && !isSeason) {
      const day = eventStartDate.getDate();
      const month = getFourCharMonth(eventStartDate);
      const suffix = getOrdinalSuffix(day);
      const year = isPastStart ? format(eventStartDate, "yyyy") : undefined;

      if (event.name === "asdfasfd ") {
        console.log(event.name, eventStart, isSeason, isYear);
      }

      return {
        raw: `${month} ${day}${suffix}${year ? ` (${year})` : ""}`,
        parts: { month, day, suffix, year },
      };
    } else {
      return { raw: `${eventStart}` };
    }
  } else if (sortBy === "eventStart" && !eventStart) {
    const ongoing = event.dates.eventFormat === "ongoing";
    return {
      raw: ongoing ? "Ongoing" : "No Event Date",
    };
  }

  // if (sortBy === "name") {
  //   return { raw: `"${event.name.slice(0, 1).toUpperCase()}"` };
  // }

  if (sortBy === "name") {
    return {
      raw: `${event.name.slice(0, 1).toUpperCase()}`,
      label: (
        <span className="inline-flex items-center gap-1">
          <FaQuoteLeft className="-translate-y-1 text-xs" />
          {event.name.slice(0, 1).toUpperCase()}
          <FaQuoteRight className="-translate-y-1 text-xs" />
        </span>
      ),
    };
  }

  return { raw: "Ungrouped" };
}
