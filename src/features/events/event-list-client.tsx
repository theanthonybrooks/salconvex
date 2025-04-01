"use client"

import { BasicPagination } from "@/components/ui/pagination2"
import EventCardPreview from "@/features/events/event-card-preview"
import { EventFilters } from "@/features/events/event-list-filters"
import { getGroupKeyFromEvent } from "@/features/events/helpers/groupHeadings"
import {
  CombinedEventCardData,
  useMockEventCards,
} from "@/hooks/use-combined-events"
import { useFilteredEvents } from "@/hooks/use-filtered-events"
// import { getFourCharMonth } from "@/lib/dateFns"
import { setParamIfNotDefault } from "@/lib/utils"
import { EventCategory, EventType } from "@/types/event"
import { Filters, SortOptions } from "@/types/thelist"
import { UserPref } from "@/types/user"
// import { format } from "date-fns"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

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
    sortBy: "openCall",
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

    setParamIfNotDefault(params, "sb", sortOptions.sortBy, "openCall")
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
  // console.log("filteredEvents", filteredEvents)

  const totalPages = Math.ceil(filteredEvents.length / filters.limit)

  // const groupedEvents = useMemo(() => {
  //   const groups: Record<string, CombinedEventCardData[]> = {}

  //   for (const event of publicView
  //     ? paginatedEvents.slice(0, 10)
  //     : paginatedEvents) {
  //     let groupKey = "Unsorted"

  //     if (sortOptions.sortBy === "openCall" && event.tabs.opencall) {
  //       const ocEnd = event.tabs.opencall.basicInfo?.dates?.ocEnd
  //       groupKey = ocEnd
  //         ? format(new Date(ocEnd), "MMM d")
  //         : "No Open Call Date"
  //     }

  //     if (sortOptions.sortBy === "eventStart" && event.dates.eventStart) {
  //       groupKey = format(new Date(event.dates.eventStart), "MMM d")
  //     }

  //     if (!groups[groupKey]) groups[groupKey] = []
  //     groups[groupKey].push(event)
  //   }

  //   return groups
  // }, [paginatedEvents, sortOptions, publicView])

  // const groupedEvents = useMemo(() => {
  //   const groups: Record<string, CombinedEventCardData[]> = {}
  //   const orderedGroupKeys: string[] = []

  //   for (const event of publicView
  //     ? paginatedEvents.slice(0, 10)
  //     : paginatedEvents) {
  //     let groupKey = "Ungrouped"
  //     if (sortOptions.sortBy === "openCall") {
  //       if (event.tabs.opencall) {
  //         if (event.tabs.opencall.basicInfo) {
  //           const basicInfo = event.tabs.opencall.basicInfo
  //           if (basicInfo.callType === "Fixed") {
  //             const ocEnd = basicInfo?.dates?.ocEnd
  //             groupKey = ocEnd
  //               ? format(new Date(ocEnd), "MMM d")
  //               : "No Open Call Date"
  //           } else if (basicInfo.callType === "Rolling") {
  //             groupKey = "Rolling Open Call"
  //           } else if (basicInfo.callType === "Email") {
  //             groupKey = "Email Open Call"
  //           }
  //         }
  //       } else {
  //         groupKey = "No Public Open Call"
  //       }
  //     }

  //     if (sortOptions.sortBy === "eventStart" && event.dates.eventStart) {
  //       const eventStart = event.dates?.eventStart
  //       groupKey = eventStart
  //         ? getFourCharMonth(new Date(event.dates.eventStart)) +
  //           format(new Date(event.dates.eventStart), " d")
  //         : "No Event Date"
  //     } else if (
  //       sortOptions.sortBy === "eventStart" &&
  //       !event.dates.eventStart
  //     ) {
  //       groupKey = "No Event Date"
  //     }

  //     if (!groups[groupKey]) {
  //       groups[groupKey] = []
  //       orderedGroupKeys.push(groupKey)
  //     }

  //     groups[groupKey].push(event)
  //   }

  //   return orderedGroupKeys.map((key) => ({
  //     title: key,
  //     events: groups[key],
  //   }))
  // }, [paginatedEvents, sortOptions, publicView])

  // const groupedEvents = useMemo(() => {
  //   const groups: Record<string, CombinedEventCardData[]> = {}
  //   const orderedGroupKeys: string[] = []

  //   for (const event of publicView
  //     ? paginatedEvents.slice(0, 10)
  //     : paginatedEvents) {
  //     const groupKey = getGroupKeyFromEvent(event, sortOptions.sortBy)

  //     if (!groups[groupKey]) {
  //       groups[groupKey] = []
  //       orderedGroupKeys.push(groupKey)
  //     }

  //     groups[groupKey].push(event)
  //   }

  //   return orderedGroupKeys.map((key) => ({
  //     title: key,
  //     events: groups[key],
  //   }))
  // }, [paginatedEvents, sortOptions, publicView])

  const groupedEvents = useMemo(() => {
    const groups: Record<
      string,
      {
        title: ReturnType<typeof getGroupKeyFromEvent>
        events: CombinedEventCardData[]
      }
    > = {}
    const orderedGroupKeys: string[] = []

    const list = publicView ? paginatedEvents.slice(0, 10) : paginatedEvents

    for (const event of list) {
      const title = getGroupKeyFromEvent(event, sortOptions.sortBy)
      const groupKey = title.raw

      if (!groups[groupKey]) {
        groups[groupKey] = { title, events: [] }
        orderedGroupKeys.push(groupKey)
      }

      groups[groupKey].events.push(event)
    }

    return orderedGroupKeys.map((key) => groups[key])
  }, [paginatedEvents, sortOptions, publicView])

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
          ...
          <BasicPagination currentPage={currentPage} totalPages={totalPages} />
        </>
      )}

      {filteredEvents.length === 0 ? (
        <p className='mt-8 text-center text-muted-foreground text-sm'>
          No events found matching the selected filters.
        </p>
      ) : (
        // (publicView ? paginatedEvents.slice(0, 10) : paginatedEvents).map(
        //   (event, index) => (
        //     <EventCardPreview
        //       key={index}
        //       event={event}
        //       publicView={publicView}
        //     />
        //     // <div key={event.id}>
        //     //   {event.id}
        //     //   {event.name}
        //     // </div>
        //   )
        // )
        // Object.entries(groupedEvents).map(([groupTitle, eventsInGroup]) => (
        //   <div key={groupTitle} className='mb-6'>
        //     <h3 className='text-lg font-semibold mb-2'>{groupTitle}</h3>
        //     <div className='space-y-4'>
        //       {eventsInGroup.map((event, index) => (
        //         <EventCardPreview
        //           key={index}
        //           event={event}
        //           publicView={publicView}
        //         />
        //       ))}
        //     </div>
        //   </div>
        // ))
        // groupedEvents.map((group) => (
        //   <div key={group.title} className='mb-6'>
        //     <h3 className='text-lg font-semibold mb-2'>{group.title}</h3>
        //     <div className='space-y-4'>
        //       {group.events.map((event, index) => (
        //         <EventCardPreview
        //           key={index}
        //           event={event}
        //           publicView={publicView}
        //         />
        //       ))}
        //     </div>
        //   </div>
        // ))

        groupedEvents.map((group) => (
          <div key={group.title.raw} className='mb-6'>
            <h3 className='text-lg font-semibold mb-2'>
              {group.title.parts ? (
                <>
                  {group.title.parts.month} {group.title.parts.day}
                  <sup className='text-xs'>{group.title.parts.suffix}</sup>
                  {group.title.parts.year ? ` (${group.title.parts.year})` : ""}
                </>
              ) : (
                group.title.raw
              )}
            </h3>
            <div className='space-y-4'>
              {group.events.map((event, index) => (
                <EventCardPreview
                  key={index}
                  event={event}
                  publicView={publicView}
                />
              ))}
            </div>
          </div>
        ))
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
