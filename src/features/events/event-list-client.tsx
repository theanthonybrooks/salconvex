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
import { useFilteredEvents } from "@/hooks/use-filtered-events"
import { EventData } from "@/types/event"
import { Filters, SortOptions } from "@/types/thelist"
import { UserPref } from "@/types/user"
import { useState } from "react"

interface Props {
  initialEvents: EventData[]
  publicView: boolean
  userPref: UserPref | null
}

const ClientEventList = ({ initialEvents, publicView, userPref }: Props) => {
  const [filters, setFilters] = useState<Filters>({
    showHidden: false,
    bookmarkedOnly: false,
    limit: 10,
    eventTypes: [],
    eventCategories: [],
  })

  const [sortOptions, setSortOptions] = useState<SortOptions>({
    sortBy: "date",
    sortDirection: "asc",
  })
  const filteredEvents = useFilteredEvents(initialEvents, filters, sortOptions)

  return (
    <>
      {!publicView && (
        <>
          <Pagination>
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
          <EventFilters
            filters={filters}
            sortOptions={sortOptions}
            onChange={(partial) =>
              setFilters((prev) => ({ ...prev, ...partial }))
            }
            onSortChange={(partial) =>
              setSortOptions((prev) => ({ ...prev, ...partial }))
            }
          />
        </>
      )}

      {filteredEvents.length === 0 ? (
        <p className='mt-8 text-center text-muted-foreground text-sm'>
          No events found matching the selected filters.
        </p>
      ) : (
        (publicView ? filteredEvents.slice(0, 2) : filteredEvents).map(
          (event, index) => (
            <EventCardPreview
              key={index}
              {...event}
              publicView={publicView}
              userPref={userPref}
            />
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
