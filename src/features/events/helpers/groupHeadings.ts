import { CombinedEventPreviewCardData } from "@/hooks/use-combined-events";
import {
  getFourCharMonth,
  getOrdinalSuffix,
  isValidIsoDate,
} from "@/lib/dateFns";
import { format } from "date-fns";

export function getGroupKeyFromEvent(
  event: CombinedEventPreviewCardData,
  sortBy: string,
): {
  raw: string;
  parts?: {
    month: string;
    day: number;
    suffix: string;
    year?: string;
  };
} {
  const basicInfo = event.tabs.opencall?.basicInfo;
  const callType = basicInfo?.callType;
  const ocEnd = basicInfo?.dates?.ocEnd;
  const ocEndDate = ocEnd && isValidIsoDate(ocEnd) ? new Date(ocEnd) : null;

  const eventStart = event.dates?.eventDates[0]?.start;
  const eventStartDate =
    eventStart && isValidIsoDate(eventStart) ? new Date(eventStart) : null;
  const isPast = !!ocEndDate && ocEndDate < new Date();
  const isPastStart = eventStart ? new Date(eventStart) < new Date() : false;

  if (sortBy === "openCall" && callType === "Fixed" && ocEnd) {
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
    if (callType === "Email") return { raw: "Email Open Call" };
    if (!!callType) return { raw: "Past Open Call" };
    return { raw: "No Public Open Call" };
  }

  if (sortBy === "eventStart" && eventStart) {
    if (eventStartDate) {
      const day = eventStartDate.getDate();
      const month = getFourCharMonth(eventStartDate);
      const suffix = getOrdinalSuffix(day);
      const year = isPastStart ? format(eventStartDate, "yyyy") : undefined;
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

  if (sortBy === "name") {
    return { raw: `"${event.name.slice(0, 1)}"` };
  }

  return { raw: "Ungrouped" };
}
