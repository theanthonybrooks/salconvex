import { ViewOptions } from "@/features/events/event-list-client";
import {
  getFourCharMonthFromLuxon,
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
  viewType: ViewOptions,
): {
  raw: string;
  subHeading?: string;
  label?: JSX.Element;
  parts?: {
    month: string;
    day: number;
    suffix: string;
    year?: string;
  };
  isEnded?: boolean;
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
  const thisYear = DateTime.now().year;

  const isPast = ocEndDT ? ocEndDT < DateTime.now() : false;
  const isPastStart = eventStartDT ? eventStartDT < DateTime.now() : false;
  // const isPast = !!ocEndDate && ocEndDate < new Date();
  // const isPastStart = eventStart ? new Date(eventStart) < new Date() : false;
  const isYear = eventStart.trim().length === 4;
  const isAfterThisYear = eventStartDT ? eventStartDT.year > thisYear : false;
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
      const month = getFourCharMonthFromLuxon(dt);
      const suffix = getOrdinalSuffix(day);
      const year = isPast || isAfterThisYear ? dt.toFormat("yyyy") : undefined;
      return {
        raw: `${month} ${day}${suffix}${year ? ` (${year})` : ""}`,
        parts: { month, day, suffix, year },
        isEnded: isPast,
      };
    } else {
      return { raw: `${ocEnd}`, isEnded: isPast };
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
      // const month = getFourCharMonth(dt.toJSDate());
      const month = getFourCharMonthFromLuxon(dt);

      const suffix = getOrdinalSuffix(day);
      const year =
        isPastStart || isAfterThisYear ? dt.toFormat("yyyy") : undefined;

      return {
        raw: `${month} ${day}${suffix}${year ? ` (${year})` : ""}`,
        parts: { month, day, suffix, year },
        isEnded: isPastStart,
      };
    } else {
      return { raw: `${eventStart}`, isEnded: isPastStart };
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

  // if (sortBy === "name") {
  //   return {
  //     raw: `${event.name.slice(0, 1).toUpperCase()}`,
  //     label: (
  //       <span className="inline-flex items-center gap-1">
  //         <FaQuoteLeft className="-translate-y-1 text-xs" />
  //         {event.name.slice(0, 1).toUpperCase()}
  //         <FaQuoteRight className="-translate-y-1 text-xs" />
  //       </span>
  //     ),
  //   };
  // }
  if (sortBy === "name") {
    const firstChar = event.name.trim().charAt(0);
    if (firstChar.match(/[0-9]/)) {
      return {
        raw: "0-9",
        label: (
          <span className="inline-flex items-center gap-1">
            <FaQuoteLeft className="-translate-y-1 text-xs" />
            0-9
            <FaQuoteRight className="-translate-y-1 text-xs" />
          </span>
        ),
      };
    } else if (firstChar.match(/[A-Za-z]/)) {
      return {
        raw: firstChar.toUpperCase(),
        label: (
          <span className="inline-flex items-center gap-1">
            <FaQuoteLeft className="-translate-y-1 text-xs" />
            {firstChar.toUpperCase()}
            <FaQuoteRight className="-translate-y-1 text-xs" />
          </span>
        ),
      };
    } else {
      return {
        raw: "",
      };
    }
  }

  // if (sortBy === "country") {
  //   const country = event.location?.country;
  //   const countryAbbr = event.location?.countryAbbr;
  //   return {
  //     raw: countryAbbr ? `${country} (${countryAbbr})` : (country ?? "Unknown"),
  //   };
  // }

  if (sortBy === "country") {
    const country = event.location?.country ?? "Unknown";
    const countryAbbr = event.location?.countryAbbr;
    const state = event.location?.state;
    const orgName = event.orgName ?? undefined;

    const isUS =
      country.toLowerCase() === "united states" ||
      countryAbbr?.toUpperCase() === "US" ||
      countryAbbr?.toUpperCase() === "USA";

    const isCanada =
      country.toLowerCase() === "canada" ||
      countryAbbr?.toUpperCase() === "CA" ||
      countryAbbr?.toUpperCase() === "CAN";

    const isUK =
      country.toLowerCase() === "united kingdom" ||
      countryAbbr?.toUpperCase() === "UK" ||
      countryAbbr?.toUpperCase() === "GB" ||
      countryAbbr?.toUpperCase() === "GBR";

    const isAustralia =
      country.toLowerCase() === "australia" ||
      countryAbbr?.toUpperCase() === "AU" ||
      countryAbbr?.toUpperCase() === "AUS";

    const isBrazil = country.toLowerCase() === "brazil" || countryAbbr === "BR";

    const hasSubHeading =
      isUS ||
      isCanada ||
      isUK ||
      isAustralia ||
      isBrazil ||
      viewType === "organizer";

    const displayCountryAbbr = countryAbbr === "US" ? "USA" : countryAbbr;

    let subHeading: string | undefined;

    if (hasSubHeading) {
      switch (viewType) {
        case "organizer":
          subHeading = orgName;
          break;
        case "event":
          subHeading = state;
          break;
        default:
          subHeading = undefined;
      }
    }
    return {
      raw: countryAbbr ? `${country} (${displayCountryAbbr})` : country,
      subHeading,
    };
  }

  if (sortBy === "organizer") {
    const orgName = event.orgName ?? "";
    return { raw: orgName };
  }

  // if (sortBy === "recent") {
  //   const approvedAt =
  //     event.tabs.opencall?.approvedAt ?? event.approvedAt ?? null;

  //   if (approvedAt) {
  //     const dt = DateTime.fromMillis(approvedAt, { zone: timeZone });
  //     const day = dt.day;
  //     const month = getFourCharMonthFromLuxon(dt);
  //     const suffix = getOrdinalSuffix(day);
  //     const year = dt.toFormat("yyyy");

  //     return {
  //       raw: `${month} ${day}${suffix} (${year})`,
  //       parts: { month, day, suffix, year },
  //     };
  //   }
  // }

  return { raw: "" };
}
