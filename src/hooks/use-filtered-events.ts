import { CombinedEventCardData } from "@/hooks/use-combined-events"
import { isValidIsoDate } from "@/lib/dateFns"
import { Filters, SortOptions } from "@/types/thelist"
import { useMemo } from "react"

//TODO: Check that all instances of the date are properly validated to accommodate strings that are non iso dates

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

        // if (sortBy === "openCall") {
        //   const hasOpenCallA = a.hasActiveOpenCall
        //   const hasOpenCallB = b.hasActiveOpenCall

        //   // Step 1: prioritize events with open calls
        //   if (hasOpenCallA && !hasOpenCallB) return -1
        //   if (!hasOpenCallA && hasOpenCallB) return 1

        //   // If neither has open call, fall back to eventStart sort
        //   if (!hasOpenCallA && !hasOpenCallB) {
        //     const aEventDate = new Date(a.dates.eventStart ?? Infinity)
        //     const bEventDate = new Date(b.dates.eventStart ?? Infinity)
        //     return aEventDate.getMonth() - bEventDate.getMonth()
        //   }

        //   const isFixedA = a.tabs.opencall?.basicInfo?.callType === "Fixed"
        //   const isFixedB = b.tabs.opencall?.basicInfo?.callType === "Fixed"
        //   const isRollingA = a.tabs.opencall?.basicInfo?.callType === "Rolling"
        //   const isRollingB = b.tabs.opencall?.basicInfo?.callType === "Rolling"
        //   const isEmailA = a.tabs.opencall?.basicInfo?.callType === "Email"
        //   const isEmailB = b.tabs.opencall?.basicInfo?.callType === "Email"

        //   if (isFixedA && !isFixedB) return -1
        //   if (!isFixedA && isFixedB) return 1
        //   if (isRollingA && !isRollingB) return -1
        //   if (!isRollingA && isRollingB) return 1
        //   if (isEmailA && !isEmailB) return -1
        //   if (!isEmailA && isEmailB) return 1

        //   // Step 2: categorize current/future vs past open calls
        //   const now = new Date()
        //   now.setHours(0, 0, 0, 0)

        //   const aOCDate = new Date(
        //     a.tabs.opencall?.basicInfo?.dates?.ocEnd ?? Infinity
        //   )
        //   const bOCDate = new Date(
        //     b.tabs.opencall?.basicInfo?.dates?.ocEnd ?? Infinity
        //   )

        //   const aIsPast = aOCDate < now
        //   const bIsPast = bOCDate < now

        //   if (!aIsPast && bIsPast) return -1
        //   if (aIsPast && !bIsPast) return 1

        //   // Step 3a: if both are current/future, sort by ocEnd
        //   if (!aIsPast && !bIsPast) {
        //     return aOCDate.getTime() - bOCDate.getTime()
        //   }

        //   // Step 3b: if both are in the past, sort by ocEnd month
        //   return aOCDate.getTime() - bOCDate.getTime()
        // }

        if (sortBy === "eventStart") {
          const getPriority = (item: CombinedEventCardData) => {
            const now = new Date()
            now.setHours(0, 0, 0, 0)

            const startDate = item.dates.eventStart
            const isValid = startDate && isValidIsoDate(startDate)
            const validStartDate = isValid ? new Date(startDate) : null
            const isOngoing = item.dates.ongoing
            const eventStartDate = new Date(startDate ?? Infinity)
            const isPast = eventStartDate < now //is technically handled by the combiner, but I'm keeping it here for now

            let priority: number
            if (startDate) {
              if (validStartDate) {
                if (validStartDate >= now) {
                  priority = 0
                } else {
                  priority = 3
                }
              } else if (!isValid) priority = 1
              else if (isOngoing) priority = 2
              else if (isPast) priority = 3
              else priority = 4 // Open call with unknown type or no end date
            } else {
              priority = 5
            }

            // console.log(
            //   `${item.name}:`,
            //   eventStartDate,
            //   isValid,
            //   isOngoing,

            //   isPast,
            //   priority
            // )

            return {
              priority,
              eventStart: eventStartDate.getTime(),
            }
          }

          const priorityA = getPriority(a)
          const priorityB = getPriority(b)

          // Step 1: sort by priority
          if (priorityA.priority !== priorityB.priority) {
            return priorityA.priority - priorityB.priority
          }

          // // Step 2: fallback to sorting by month for past events
          // if (priorityA.priority === 3 && priorityB.priority === 3) {
          //   const monthA = new Date(a.dates.eventStart!).getMonth()
          //   const monthB = new Date(b.dates.eventStart!).getMonth()
          //   return monthA - monthB
          // }

          if (priorityA.priority === 3 && priorityB.priority === 3) {
            const aDate = new Date(a.dates.eventStart ?? 0)
            const bDate = new Date(b.dates.eventStart ?? 0)

            const aYear = aDate.getFullYear()
            const bYear = bDate.getFullYear()

            if (aYear !== bYear) return bYear - aYear // most recent year first

            const aMonth = aDate.getMonth()
            const bMonth = bDate.getMonth()
            if (aMonth !== bMonth) return aMonth - bMonth

            const aDay = aDate.getDate()
            const bDay = bDate.getDate()
            return aDay - bDay
          }

          // Step 2: fallback to eventStart
          return priorityA.eventStart - priorityB.eventStart
        }
        if (sortBy === "openCall") {
          const getPriority = (item: CombinedEventCardData) => {
            const now = new Date()
            now.setHours(0, 0, 0, 0)

            const hasOpenCall = item.hasActiveOpenCall
            const callType = item.tabs.opencall?.basicInfo?.callType
            const ocEndRaw = item.tabs.opencall?.basicInfo?.dates?.ocEnd
            const isRolling = callType === "Rolling"
            const ocEnd = new Date(ocEndRaw ?? 0)
            const isPast = ocEnd < now //is technically handled by the combiner, but I'm keeping it here for now

            let priority: number
            if (hasOpenCall && (!isPast || isRolling)) {
              if (callType === "Fixed") priority = 0
              else if (callType === "Rolling") priority = 1
              else if (callType === "Email") priority = 2
              else priority = 3 // Open call with unknown type or no end date
            } else if (!hasOpenCall && !!callType) {
              priority = 4
            } else {
              priority = 5
            }

            // console.log(
            //   `${item.name}:`,
            //   hasOpenCall,
            //   callType,
            //   isRolling,
            //   ocEnd,
            //   isPast,
            //   priority
            // )

            return {
              priority,
              ocEnd: ocEnd.getTime(),
              eventStart: new Date(item.dates.eventStart ?? Infinity).getTime(),
            }
          }

          const priorityA = getPriority(a)
          const priorityB = getPriority(b)

          // Step 1: sort by priority
          if (priorityA.priority !== priorityB.priority) {
            return priorityA.priority - priorityB.priority
          }

          // Step 2: if both have same priority, and it’s for active open calls, sort by ocEnd
          if (priorityA.priority < 3) {
            return priorityA.ocEnd - priorityB.ocEnd
          }

          // Step 3: fallback to eventStart
          return priorityA.eventStart - priorityB.eventStart
        }

        // if (sortBy === "eventStart") {
        //   const hasStartA = a.dates.eventStart !== null
        //   const hasStartB = b.dates.eventStart !== null

        //   if (hasStartA && !hasStartB) return -1
        //   if (!hasStartA && hasStartB) return 1

        //   if (a.dates.eventStart && b.dates.eventStart) {
        //     const now = new Date()
        //     now.setHours(0, 0, 0, 0) // strip time portion to compare dates only

        //     const aDate = new Date(a.dates.eventStart)
        //     const bDate = new Date(b.dates.eventStart)

        //     const aIsToday = aDate.toDateString() === now.toDateString()
        //     const bIsToday = bDate.toDateString() === now.toDateString()

        //     const aInFuture = aDate > now
        //     const bInFuture = bDate > now

        //     console.log(`${a.name}:`, aDate, aIsToday, aInFuture)
        //     console.log(`${b.name}:`, bDate, bIsToday, bInFuture)

        //     // Prioritize today first
        //     if (aIsToday && !bIsToday) return -1
        //     if (!aIsToday && bIsToday) return 1

        //     // Then future dates
        //     if (aInFuture && !bInFuture) return -1
        //     if (!aInFuture && bInFuture) return 1

        //     // If both are in the past, sort by month (Jan = 0, Dec = 11)
        //     return aDate.getMonth() - bDate.getMonth()
        //   }

        //   return 0
        // }

        if (sortBy === "name") {
          const aName = a.name.toLowerCase()
          const bName = b.name.toLowerCase()
          return sortDirection === "asc"
            ? aName.localeCompare(bName)
            : bName.localeCompare(aName)
        }

        return 0
      })
    // .slice(0, filters.limit)
  }, [events, filters, sortOptions])
}
