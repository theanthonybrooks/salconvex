"use client"

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import EventCardPreview from "@/features/events/event-card-preview"
import { EventFilters } from "@/features/events/event-list-filters"
import { useMockEventCards } from "@/hooks/use-combined-events"
import { useFilteredEvents } from "@/hooks/use-filtered-events"
import { setParamIfNotDefault } from "@/lib/utils"
import { EventCategory, EventType } from "@/types/event"
import { Filters, SortOptions } from "@/types/thelist"
import { UserPref } from "@/types/user"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

interface Props {
  // initialEvents: EventData[]
  publicView: boolean
  userPref: UserPref | null
}

const ClientEventList = ({
  // initialEvents,
  publicView,
}: // userPref,

Props) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const allEvents = useMockEventCards()

  // console.log("allEvents", allEvents)

  const defaultFilters: Filters = {
    showHidden: false,
    bookmarkedOnly: false,
    limit: 10,

    eventTypes: [],
    eventCategories: [],
  }

  const defaultSort: SortOptions = {
    sortBy: "date",
    sortDirection: "asc",
  }

  const currentFilters: Filters = {
    showHidden: searchParams.get("h") === "true",
    bookmarkedOnly: searchParams.get("b") === "true",
    limit: Number(searchParams.get("l")) || defaultFilters.limit,
    page: Number(searchParams.get("page")) || 1,
    eventTypes:
      (searchParams.get("type")?.split(",") as EventType[]) ??
      defaultFilters.eventTypes,
    eventCategories:
      (searchParams.get("cat")?.split(",") as EventCategory[]) ??
      defaultFilters.eventCategories,
  }

  const currentSort: SortOptions = {
    sortBy:
      (searchParams.get("sb") as SortOptions["sortBy"]) ?? defaultSort.sortBy,
    sortDirection:
      (searchParams.get("sd") as SortOptions["sortDirection"]) ??
      defaultSort.sortDirection,
  }

  const [filters, setFilters] = useState<Filters>(currentFilters)
  const [sortOptions, setSortOptions] = useState<SortOptions>(currentSort)

  const handleResetFilters = () => {
    setFilters(defaultFilters)
    setSortOptions(defaultSort)
  }

  useEffect(() => {
    const params = new URLSearchParams()
    setParamIfNotDefault(params, "h", filters.showHidden, false)
    setParamIfNotDefault(params, "b", filters.bookmarkedOnly, false)
    setParamIfNotDefault(params, "l", filters.limit, 10)
    if (filters.eventTypes?.length)
      params.set("type", filters.eventTypes.join(","))
    else params.delete("type")

    if (filters.eventCategories?.length)
      params.set("cat", filters.eventCategories.join(","))
    else params.delete("cat")

    if (filters.page && filters.page !== 1) {
      params.set("page", filters.page.toString())
    } else {
      params.delete("page")
    }

    setParamIfNotDefault(params, "sb", sortOptions.sortBy, "date")
    setParamIfNotDefault(params, "sd", sortOptions.sortDirection, "asc")

    const queryString = params.toString()
    const baseUrl = window.location.origin + window.location.pathname
    window.history.replaceState(
      null,
      "",
      baseUrl + (queryString ? `?${queryString}` : "")
    )
  }, [filters, sortOptions, router])

  const filteredEvents = useFilteredEvents(allEvents, filters, sortOptions)
  const currentPage = filters.page ?? 1
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * filters.limit,
    currentPage * filters.limit
  )

  return (
    <>
      {!publicView && (
        <>
          <EventFilters
            filters={filters}
            sortOptions={sortOptions}
            onChange={(partial) =>
              setFilters((prev) => ({ ...prev, ...partial }))
            }
            onSortChange={(partial) =>
              setSortOptions((prev) => ({ ...prev, ...partial }))
            }
            onResetFilters={handleResetFilters}
          />
          {/* Add in pagination logic here later. Should use convex as well as params*/}
          <Pagination className='mb-6'>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href='#' />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href='#'>1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href='#' />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </>
      )}

      {filteredEvents.length === 0 ? (
        <p className='mt-8 text-center text-muted-foreground text-sm'>
          No events found matching the selected filters.
        </p>
      ) : (
        (publicView ? paginatedEvents.slice(0, 2) : paginatedEvents).map(
          (event) => (
            <EventCardPreview
              key={event.id}
              event={event}
              publicView={publicView}
            />
            // <div key={event.id}>
            //   {event.id}
            //   {event.name}
            // </div>
          )
        )
      )}
      {/* NOTE: Do I need to make the full "List" available to public or is the calendar, map, and archive (tabs) enough? Plus the "This Week" tab? */}
      {publicView && (
        <div>
          For the full list and access to all of the other work that I do, you
          can view that here:{" "}
        </div>
      )}
    </>
  )
}

export default ClientEventList
