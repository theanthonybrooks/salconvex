import {
  getFourCharMonth,
  getOrdinalSuffix,
  isValidIsoDate,
  seasonalTerms,
} from "@/lib/dateFns";

import { PublicEventPreviewData } from "@/types/event";

import { DateTime } from "luxon";
import { JSX } from "react";
import { FaQuoteLeft, FaQuoteRight } from "react-icons/fa6";

export function getGroupKeyFromEvent(
  event: PublicEventPreviewData,
  sortBy: string,
  timeZone: string,
  hasTZPref: boolean,
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
  const ocEndDate =
    ocEnd && isValidIsoDate(ocEnd)
      ? DateTime.fromISO(ocEnd, { zone: timeZone }).toJSDate()
      : null;
  const ocEndTZ = basicInfo?.dates?.timezone;

  const ocStatus = event.openCallStatus;
  // const eventFormat = event.dates.eventFormat;
  const eventStart = event.dates?.eventDates[0]?.start;
  const eventOCStatus = event.hasOpenCall;
  const eventStartDate =
    eventStart && isValidIsoDate(eventStart) ? new Date(eventStart) : null;
  const ocEndDT =
    ocEnd && isValidIsoDate(ocEnd)
      ? DateTime.fromISO(ocEnd, {
          zone: hasTZPref ? timeZone : (ocEndTZ ?? "Europe/Berlin"),
        })
      : null;

  const eventStartDT =
    eventStart && isValidIsoDate(eventStart)
      ? DateTime.fromISO(eventStart, { zone: timeZone }).plus({ hours: 12 })
      : null;

  const isPast = ocEndDT ? ocEndDT < DateTime.now() : false;
  const isPastStart = eventStartDT ? eventStartDT < DateTime.now() : false;
  // const isPast = !!ocEndDate && ocEndDate < new Date();
  // const isPastStart = eventStart ? new Date(eventStart) < new Date() : false;
  const isYear = eventStart.trim().length === 4;
  const isSeason = seasonalTerms.includes(eventStart.trim());

  if (
    sortBy === "openCall" &&
    callType === "Fixed" &&
    ocEnd &&
    (ocStatus === "active" || ocStatus === "ended")
  ) {
    if (ocEndDate) {
      const dt = DateTime.fromISO(ocEnd, {
        zone: hasTZPref ? timeZone : (ocEndTZ ?? "Europe/Berlin"),
      });

      const day = dt.day;
      const month = getFourCharMonth(dt.toJSDate());
      const suffix = getOrdinalSuffix(day);
      const year = isPast ? dt.toFormat("yyyy") : undefined;
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
      const dt = DateTime.fromISO(eventStart, { zone: timeZone }).plus({
        hours: 12,
      });
      const day = dt.day;
      const month = getFourCharMonth(dt.toJSDate());
      const suffix = getOrdinalSuffix(day);
      const year = isPastStart ? dt.toFormat("yyyy") : undefined;

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
