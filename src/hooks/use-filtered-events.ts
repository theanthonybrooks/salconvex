import { CombinedEventCardData } from "@/hooks/use-combined-events"
import { Filters, SortOptions } from "@/types/thelist"
import { useMemo } from "react"

export const useFilteredEvents = (
  events: CombinedEventCardData[],
  filters: Filters,
  sortOptions: SortOptions
): CombinedEventCardData[] => {
  return useMemo(() => {
    return events
      .filter((event) => {
        if (!filters.showHidden && event.hidden) return false
        if (filters.bookmarkedOnly && !event.bookmarked) return false

        if (
          filters.eventTypes &&
          filters.eventTypes.length > 0 &&
          (!event.eventType ||
            !event.eventType.some((type) => filters.eventTypes!.includes(type)))
        ) {
          return false
        }

        if (
          filters.eventCategories &&
          filters.eventCategories.length > 0 &&
          !filters.eventCategories.includes(event.category)
        ) {
          return false
        }

        if (
          filters.continent &&
          event.location.continent !== filters.continent
        ) {
          return false
        }

        return true
      })
      .sort((a, b) => {
        const { sortBy, sortDirection } = sortOptions

        // if (sortBy === "openCall") {
        //   const hasOpenCallA = a.hasActiveOpenCall
        //   const hasOpenCallB = b.hasActiveOpenCall

        //   console.log("has open call a", hasOpenCallA, hasOpenCallB)

        //   // Step 1: prioritize events with open calls
        //   if (hasOpenCallA && !hasOpenCallB) return -1
        //   if (!hasOpenCallA && hasOpenCallB) return 1

        //   // Step 2: sort those with open calls by ocEnd
        //   if (hasOpenCallA && hasOpenCallB) {
        //     const aOCDate = new Date(
        //       a.tabs.opencall?.basicInfo?.dates?.ocEnd ?? Infinity
        //     )
        //     const bOCDate = new Date(
        //       b.tabs.opencall?.basicInfo?.dates?.ocEnd ?? Infinity
        //     )
        //     return aOCDate.getTime() - bOCDate.getTime()
        //   }

        //   // Step 3: sort the rest by eventStart
        //   const aEventDate = new Date(a.dates.eventStart ?? Infinity)
        //   const bEventDate = new Date(b.dates.eventStart ?? Infinity)
        //   return aEventDate.getTime() - bEventDate.getTime()
        // }

        if (sortBy === "openCall") {
          const hasOpenCallA = a.hasActiveOpenCall
          const hasOpenCallB = b.hasActiveOpenCall

          // Step 1: prioritize events with open calls
          if (hasOpenCallA && !hasOpenCallB) return -1
          if (!hasOpenCallA && hasOpenCallB) return 1

          // If neither has open call, fall back to eventStart sort
          if (!hasOpenCallA && !hasOpenCallB) {
            const aEventDate = new Date(a.dates.eventStart ?? Infinity)
            const bEventDate = new Date(b.dates.eventStart ?? Infinity)
            return aEventDate.getMonth() - bEventDate.getMonth()
          }

          // Step 2: categorize current/future vs past open calls
          const now = new Date()
          now.setHours(0, 0, 0, 0)

          const aOCDate = new Date(
            a.tabs.opencall?.basicInfo?.dates?.ocEnd ?? Infinity
          )
          const bOCDate = new Date(
            b.tabs.opencall?.basicInfo?.dates?.ocEnd ?? Infinity
          )

          const aIsPast = aOCDate < now
          const bIsPast = bOCDate < now

          if (!aIsPast && bIsPast) return -1
          if (aIsPast && !bIsPast) return 1

          // Step 3a: if both are current/future, sort by ocEnd
          if (!aIsPast && !bIsPast) {
            return aOCDate.getTime() - bOCDate.getTime()
          }

          // Step 3b: if both are in the past, sort by ocEnd month
          return aOCDate.getTime() - bOCDate.getTime()
        }

        if (sortBy === "eventStart") {
          const hasStartA = a.dates.eventStart !== null
          const hasStartB = b.dates.eventStart !== null

          if (hasStartA && !hasStartB) return -1
          if (!hasStartA && hasStartB) return 1

          if (a.dates.eventStart && b.dates.eventStart) {
            const now = new Date()
            now.setHours(0, 0, 0, 0) // strip time portion to compare dates only

            const aDate = new Date(a.dates.eventStart)
            const bDate = new Date(b.dates.eventStart)

            const aIsToday = aDate.toDateString() === now.toDateString()
            const bIsToday = bDate.toDateString() === now.toDateString()

            const aInFuture = aDate > now
            const bInFuture = bDate > now

            // Prioritize today first
            if (aIsToday && !bIsToday) return -1
            if (!aIsToday && bIsToday) return 1

            // Then future dates
            if (aInFuture && !bInFuture) return -1
            if (!aInFuture && bInFuture) return 1

            // If both are in the past, sort by month (Jan = 0, Dec = 11)
            return aDate.getMonth() - bDate.getMonth()
          }

          return 0
        }

        if (sortBy === "name") {
          const aName = a.name.toLowerCase()
          const bName = b.name.toLowerCase()
          return sortDirection === "asc"
            ? aName.localeCompare(bName)
            : bName.localeCompare(aName)
        }

        return 0
      })
      .slice(0, filters.limit)
  }, [events, filters, sortOptions])
}
