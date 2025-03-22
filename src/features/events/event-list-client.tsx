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
import { useState } from "react"

interface Props {
  initialEvents: EventData[]
}

const ClientEventList = ({ initialEvents }: Props) => {
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
        onChange={(partial) => setFilters((prev) => ({ ...prev, ...partial }))}
        onSortChange={(partial) =>
          setSortOptions((prev) => ({ ...prev, ...partial }))
        }
      />

      {filteredEvents.length === 0 ? (
        <p className='mt-8 text-center text-muted-foreground text-sm'>
          No events found matching the selected filters.
        </p>
      ) : (
        filteredEvents.map((event, index) => (
          <EventCardPreview key={index} {...event} />
        ))
      )}
    </>
  )
}

export default ClientEventList
