import { isValidIsoDate } from "@/lib/dateFns";
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
      const eventStartDate = new Date(startDate ?? Infinity);
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
      now.setHours(0, 0, 0, 0);

      const hasOpenCall = item.hasActiveOpenCall;
      const callType = item.tabs.opencall?.basicInfo?.callType;
      const ocEndRaw = item.tabs.opencall?.basicInfo?.dates?.ocEnd;
      const ocState = item.tabs.opencall?.state;
      const isPublished = ocState === "published";
      const ocStatus = item.openCallStatus;
      const isRolling = callType === "Rolling";
      const ocEnd = new Date(ocEndRaw ?? 0);
      const isPast = ocEnd < now;

      let priority: number;

      if (hasOpenCall && (!isPast || isRolling)) {
        if (callType === "Fixed") priority = 0;
        else if (callType === "Rolling") priority = 1;
        else if (callType === "Email") priority = 2;
        else priority = 3;
      } else if (ocStatus === "coming-soon") {
        priority = 4;
      } else if (!hasOpenCall && !!callType && isPublished) {
        priority = 5;
      } else {
        priority = 6;
      }

      return {
        priority,
        ocEnd: ocEnd.getTime(),
        eventStart: new Date(
          item.dates.eventDates[0].start ?? Infinity,
        ).getTime(),
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
