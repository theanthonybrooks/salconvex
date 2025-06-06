import { FAR_FUTURE, isValidIsoDate, parseEventDate } from "@/lib/dateFns";
import { SortOptions } from "@/types/thelist";

import { EventData } from "@/types/event";
import { OpenCall, OpenCallStatus } from "@/types/openCall";

export type EnrichedEventsCardData = EventData & {
  tabs: { opencall: OpenCall | null };
  hasActiveOpenCall: boolean;
  appFee?: number;
  openCallStatus: OpenCallStatus | null;
  adminNoteOC?: string | null;
  eventId: string;
  slug: string;
};

export const compareEnrichedEvents = (
  a: EnrichedEventsCardData,
  b: EnrichedEventsCardData,
  sortOptions: SortOptions,
): number => {
  const { sortBy, sortDirection } = sortOptions;
  const directionMultiplier = sortDirection === "asc" ? 1 : -1;

  if (sortBy === "eventStart") {
    const getPriority = (item: EnrichedEventsCardData) => {
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const startDate = item.dates.eventDates[0].start;
      const isValid = startDate && isValidIsoDate(startDate);
      const validStartDate = isValid ? new Date(startDate) : null;
      const isOngoing = item.dates.eventFormat === "ongoing";
      const eventStartDate = parseEventDate(startDate) ?? FAR_FUTURE;
      const isPast = eventStartDate < now;

      let priority: number;
      if (startDate) {
        if (validStartDate) {
          if (validStartDate >= now) {
            priority = 0;
          } else {
            priority = 3;
          }
        } else if (!isValid) priority = 1;
        else if (isOngoing) priority = 2;
        else if (isPast) priority = 3;
        else priority = 4;
      } else {
        priority = 5;
      }

      return {
        priority,
        eventStart: eventStartDate.getTime(),
      };
    };

    const priorityA = getPriority(a);
    const priorityB = getPriority(b);

    if (priorityA.priority !== priorityB.priority) {
      return priorityA.priority - priorityB.priority;
    }

    if (priorityA.priority === 3 && priorityB.priority === 3) {
      const aDate = new Date(a.dates.eventDates[0].start ?? 0);
      const bDate = new Date(b.dates.eventDates[0].start ?? 0);

      const aYear = aDate.getFullYear();
      const bYear = bDate.getFullYear();

      if (aYear !== bYear) return bYear - aYear;

      const aMonth = aDate.getMonth();
      const bMonth = bDate.getMonth();
      if (aMonth !== bMonth) return aMonth - bMonth;

      const aDay = aDate.getDate();
      const bDay = bDate.getDate();
      return aDay - bDay;
    }

    return directionMultiplier * (priorityA.eventStart - priorityB.eventStart);
  }

  //   return sortDirection === "asc"
  //   ? priorityA.eventStart - priorityB.eventStart
  //   : priorityB.eventStart - priorityA.eventStart;
  // }

  if (sortBy === "openCall") {
    const getPriority = (item: EnrichedEventsCardData) => {
      const now = new Date();
      // now.setHours(0, 0, 0, 0);

      const hasOpenCall = item.hasActiveOpenCall;
      const callType = item.tabs.opencall?.basicInfo?.callType;
      const ocEndRaw = item.tabs.opencall?.basicInfo?.dates?.ocEnd;
      const ocState = item.tabs.opencall?.state;
      const isPublished = ocState === "published" && item.state === "published";
      const isArchivedOC = ocState === "archived" && item.state === "published";
      const isApproved = isPublished || isArchivedOC;
      const ocStatus = item.openCallStatus;
      const isRolling = callType === "Rolling";
      const startDate = item.dates.eventDates[0].start;

      const ocEnd = new Date(ocEndRaw ?? 0);
      const isPast = ocEnd < now;
      const eventStartDate = parseEventDate(startDate) ?? FAR_FUTURE;
      const eventFormat = item.dates.eventFormat;

      // if (item.name === "asdfasfd") {
      //   console.log(
      //     item.name,
      //     eventStartDate,
      //     startDate,
      //     parseEventDate(startDate),
      //     eventFormat,
      //   );
      // }

      let priority: number;

      if (hasOpenCall && (!isPast || isRolling)) {
        if (callType === "Fixed") priority = 0;
        else if (callType === "Rolling") priority = 1;
        else if (callType === "Email") priority = 2;
        else priority = 3;
      } else if (ocStatus === "coming-soon") {
        priority = 4;
      } else if (!hasOpenCall && !!callType && isApproved) {
        priority = 5;
      } else if (eventFormat === "ongoing") {
        priority = 6;
      } else if (eventFormat === "noEvent") {
        priority = 8;
      } else {
        priority = eventFormat ? 7 : Infinity;
      }

      // if (item.name === "asdfasfd ") {
      // console.log(item.name, priority);
      // } else if (item.name === "something newer") {
      //   console.log(item.name, priority);
      // }

      return {
        name: item.name,
        priority,
        ocEnd: ocEnd.getTime(),
        ocEndDate: ocEnd,
        eventStart: eventStartDate.getTime(),
      };
    };

    const priorityA = getPriority(a);
    const priorityB = getPriority(b);

    if (priorityA.priority !== priorityB.priority) {
      return priorityA.priority - priorityB.priority;
    }

    if (priorityA.priority < 3) {
      return directionMultiplier * (priorityA.ocEnd - priorityB.ocEnd);
    }

    if (priorityA.priority === 5) {
      const aDate = priorityA.ocEndDate ?? FAR_FUTURE;
      const bDate = priorityB.ocEndDate ?? FAR_FUTURE;

      console.log(aDate.getTime(), bDate.getTime());
      const aYear = aDate.getFullYear();
      const bYear = bDate.getFullYear();

      if (aYear !== bYear) {
        // Prefer this year first, then descending by year
        const thisYear = new Date().getFullYear();
        if (aYear === thisYear && bYear !== thisYear) return -1;
        if (bYear === thisYear && aYear !== thisYear) return 1;
        return bYear - aYear; // Descending order
      }

      // If same year, compare by month/day ascending
      const aMonth = aDate.getMonth();
      const bMonth = bDate.getMonth();
      if (aMonth !== bMonth) return aMonth - bMonth;

      const aDay = aDate.getDate();
      const bDay = bDate.getDate();
      if (aDay !== bDay) return aDay - bDay;

      // Same day — now compare by full timestamp
      return aDate.getTime() - bDate.getTime();
    }

    if (priorityA.priority === 6 || priorityA.priority === 8) {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      return directionMultiplier * aName.localeCompare(bName);
    }

    if (priorityA.priority === 7) {
      const aEventStart = new Date(priorityA.eventStart) ?? FAR_FUTURE;
      const bEventStart = new Date(priorityB.eventStart) ?? FAR_FUTURE;
      // const aName = a.name.toLowerCase();
      // const bName = b.name.toLowerCase();

      // console.log(aName, bName, aEventStart, bEventStart);

      const aYear = aEventStart.getFullYear();
      const bYear = bEventStart.getFullYear();
      const thisYear = new Date().getFullYear();

      const aIsThisYear = aYear === thisYear;
      const bIsThisYear = bYear === thisYear;

      // Prefer events from this year
      if (aIsThisYear && !bIsThisYear) return -1;
      if (!aIsThisYear && bIsThisYear) return 1;

      // If both in same year, sort by time
      if (aYear === bYear) {
        return (
          directionMultiplier * (aEventStart.getTime() - bEventStart.getTime())
        );
      }

      // Otherwise, sort by year descending (newer first)
      return 1;
    }

    return directionMultiplier * (priorityA.ocEnd - priorityB.ocEnd);
  }

  if (sortBy === "name") {
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();
    return sortDirection === "asc"
      ? aName.localeCompare(bName)
      : bName.localeCompare(aName);
  }

  return 0;
};
