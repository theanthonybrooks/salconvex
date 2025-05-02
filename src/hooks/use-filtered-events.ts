import { CombinedEventPreviewCardData } from "@/hooks/use-combined-events";
import { isValidIsoDate } from "@/lib/dateFns";
import { Filters, SortOptions } from "@/types/thelist";
import { useMemo } from "react";

//TODO: Check that all instances of the date are properly validated to accommodate strings that are non iso dates

export const useFilteredEvents = (
  events: CombinedEventPreviewCardData[],
  filters: Filters,
  sortOptions: SortOptions,
): CombinedEventPreviewCardData[] => {
  return useMemo(() => {
    return events
      .filter((event) => {
        if (!filters.showHidden && event.hidden) return false;
        if (filters.bookmarkedOnly && !event.bookmarked) return false;

        if (
          filters.eventTypes &&
          filters.eventTypes.length > 0 &&
          (!event.type ||
            !event.type.some((type) => filters.eventTypes!.includes(type)))
        ) {
          return false;
        }

        if (
          filters.eventCategories &&
          filters.eventCategories.length > 0 &&
          !filters.eventCategories.includes(event.category)
        ) {
          return false;
        }

        if (
          filters.continent &&
          event.location.continent !== filters.continent
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const { sortBy, sortDirection } = sortOptions;
        const directionMultiplier = sortDirection === "asc" ? 1 : -1;

        if (sortBy === "eventStart") {
          const getPriority = (item: CombinedEventPreviewCardData) => {
            const now = new Date();
            now.setHours(0, 0, 0, 0);

            const startDate = item.dates.eventDates[0].start;
            const isValid = startDate && isValidIsoDate(startDate);
            const validStartDate = isValid ? new Date(startDate) : null;
            const isOngoing = item.dates.eventFormat === "ongoing";
            const eventStartDate = new Date(startDate ?? Infinity);
            const isPast = eventStartDate < now; //is technically handled by the combiner, but I'm keeping it here for now

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
              else priority = 4; // Open call with unknown type or no end date
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

          // Step 1: sort by priority
          if (priorityA.priority !== priorityB.priority) {
            return priorityA.priority - priorityB.priority;
          }

          if (priorityA.priority === 3 && priorityB.priority === 3) {
            const aDate = new Date(a.dates.eventDates[0].start ?? 0);
            const bDate = new Date(b.dates.eventDates[0].start ?? 0);

            const aYear = aDate.getFullYear();
            const bYear = bDate.getFullYear();

            if (aYear !== bYear) return bYear - aYear; // most recent year first

            const aMonth = aDate.getMonth();
            const bMonth = bDate.getMonth();
            if (aMonth !== bMonth) return aMonth - bMonth;

            const aDay = aDate.getDate();
            const bDay = bDate.getDate();
            return aDay - bDay;
          }

          // Step 2: fallback to eventStart

          return sortDirection === "asc"
            ? priorityA.eventStart - priorityB.eventStart
            : priorityB.eventStart - priorityA.eventStart;
        }
        if (sortBy === "openCall") {
          const getPriority = (item: CombinedEventPreviewCardData) => {
            const now = new Date();
            now.setHours(0, 0, 0, 0);

            const hasOpenCall = item.hasActiveOpenCall;
            const callType = item.tabs.opencall?.basicInfo?.callType;
            const ocEndRaw = item.tabs.opencall?.basicInfo?.dates?.ocEnd;
            const isRolling = callType === "Rolling";
            const ocEnd = new Date(ocEndRaw ?? 0);
            const isPast = ocEnd < now; //is technically handled by the combiner, but I'm keeping it here for now

            let priority: number;

            if (hasOpenCall && (!isPast || isRolling)) {
              if (callType === "Fixed") priority = 0;
              else if (callType === "Rolling") priority = 1;
              else if (callType === "Email") priority = 2;
              else priority = 3; // Open call with unknown type or no end date
            } else if (!hasOpenCall && !!callType) {
              priority = 4;
            } else {
              priority = 5;
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

          // // Step 1: sort by priority
          // if (priorityA.priority !== priorityB.priority) {
          //   return priorityA.priority - priorityB.priority;
          // }

          // // Step 2: if both have same priority, and it’s for active open calls, sort by ocEnd
          // if (priorityA.priority < 3) {
          //   return priorityA.ocEnd - priorityB.ocEnd;
          // }

          // return sortDirection === "asc"
          //   ? priorityA.ocEnd - priorityB.ocEnd
          //   : priorityB.ocEnd - priorityA.ocEnd;

          // Step 1: sort by priority (keeps the priority order while just reversing the order of the dates)
          if (priorityA.priority !== priorityB.priority) {
            return priorityA.priority - priorityB.priority;
          }

          // Step 2: for same priority, sort by ocEnd if priority < 3
          if (priorityA.priority < 3) {
            return directionMultiplier * (priorityA.ocEnd - priorityB.ocEnd);
          }

          // Step 3: fallback to eventStart
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
      });
    // .slice(0, filters.limit)
  }, [events, filters, sortOptions]);
};
