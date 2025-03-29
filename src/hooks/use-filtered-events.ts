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

        if (sortBy === "date") {
          const aDate = new Date(a.dates.eventStart || a.dates.eventEnd)
          const bDate = new Date(b.dates.eventStart || b.dates.eventEnd)
          return sortDirection === "asc"
            ? aDate.getTime() - bDate.getTime()
            : bDate.getTime() - aDate.getTime()
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
