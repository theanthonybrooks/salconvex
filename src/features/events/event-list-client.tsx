"use client";

import { BasicPagination } from "@/components/ui/pagination2";
import EventCardPreview from "@/features/events/event-card-preview";
import { EventFilters } from "@/features/events/event-list-filters";
import { getGroupKeyFromEvent } from "@/features/events/helpers/groupHeadings";
import Pricing from "@/features/homepage/pricing";
import {
  CombinedEventPreviewCardData,
  useEventPreviewCards,
} from "@/hooks/use-combined-events";
import { useFilteredEvents } from "@/hooks/use-filtered-events";
// import { getFourCharMonth } from "@/lib/dateFns"
import { setParamIfNotDefault } from "@/lib/utils";
import { EventCategory, EventType } from "@/types/event";
import { Filters, SortOptions } from "@/types/thelist";
import { UserPref } from "@/types/user";
// import { format } from "date-fns"

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface Props {
  // initialEvents: EventData[]
  publicView: boolean;
  userPref: UserPref | null;
}

const ClientEventList = ({
  // initialEvents,
  publicView,
}: // userPref,

Props) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const allEvents = useEventPreviewCards();

  // console.log("allEvents", allEvents)

  const defaultFilters: Filters = {
    showHidden: false,
    bookmarkedOnly: false,
    limit: 10,

    eventTypes: [],
    eventCategories: [],
  };

  const defaultSort: SortOptions = {
    sortBy: "openCall",
    sortDirection: "asc",
  };

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
  };

  const currentSort: SortOptions = {
    sortBy:
      (searchParams.get("sb") as SortOptions["sortBy"]) ?? defaultSort.sortBy,
    sortDirection:
      (searchParams.get("sd") as SortOptions["sortDirection"]) ??
      defaultSort.sortDirection,
  };

  const [filters, setFilters] = useState<Filters>(currentFilters);
  const [sortOptions, setSortOptions] = useState<SortOptions>(currentSort);

  const handleResetFilters = () => {
    setFilters(defaultFilters);
    setSortOptions(defaultSort);
  };

  useEffect(() => {
    const params = new URLSearchParams();
    setParamIfNotDefault(params, "h", filters.showHidden, false);
    setParamIfNotDefault(params, "b", filters.bookmarkedOnly, false);
    setParamIfNotDefault(params, "l", filters.limit, 10);
    if (filters.eventTypes?.length)
      params.set("type", filters.eventTypes.join(","));
    else params.delete("type");

    if (filters.eventCategories?.length)
      params.set("cat", filters.eventCategories.join(","));
    else params.delete("cat");

    if (filters.page && filters.page !== 1) {
      params.set("page", filters.page.toString());
    } else {
      params.delete("page");
    }

    setParamIfNotDefault(params, "sb", sortOptions.sortBy, "openCall");
    setParamIfNotDefault(params, "sd", sortOptions.sortDirection, "asc");

    const queryString = params.toString();
    const baseUrl = window.location.origin + window.location.pathname;
    window.history.replaceState(
      null,
      "",
      baseUrl + (queryString ? `?${queryString}` : ""),
    );
  }, [filters, sortOptions, router]);

  useEffect(() => {
    const pageParam = Number(searchParams.get("page") ?? "1");
    if (pageParam !== filters.page) {
      setFilters((prev) => ({ ...prev, page: pageParam }));
    }
  }, [searchParams, filters.page]);

  const filteredEvents = useFilteredEvents(allEvents, filters, sortOptions);
  const currentPage = filters.page ?? 1;

  console.log("current page: ", currentPage);
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * filters.limit,
    currentPage * filters.limit,
  );
  // console.log("filteredEvents", filteredEvents)

  const totalPages = Math.ceil(filteredEvents.length / filters.limit);
  // console.log(filteredEvents.length, filters.limit, totalPages)

  const groupedEvents = useMemo(() => {
    const groups: Record<
      string,
      {
        title: ReturnType<typeof getGroupKeyFromEvent>;
        events: CombinedEventPreviewCardData[];
      }
    > = {};
    const orderedGroupKeys: string[] = [];

    const list = publicView ? paginatedEvents.slice(0, 10) : paginatedEvents;

    for (const event of list) {
      const title = getGroupKeyFromEvent(event, sortOptions.sortBy);
      const groupKey = title.raw;

      if (!groups[groupKey]) {
        groups[groupKey] = { title, events: [] };
        orderedGroupKeys.push(groupKey);
      }

      groups[groupKey].events.push(event);
    }

    return orderedGroupKeys.map((key) => groups[key]);
  }, [paginatedEvents, sortOptions, publicView]);

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

          <BasicPagination currentPage={currentPage} totalPages={totalPages} />
        </>
      )}

      {filteredEvents.length === 0 ? (
        <p className="mt-8 text-center text-sm text-muted-foreground">
          No events found matching the selected filters.
        </p>
      ) : (
        groupedEvents.map((group) => (
          <div key={group.title.raw} className="mb-6">
            <h3 className="mb-2 flex items-center justify-center gap-x-2 text-center text-3xl font-semibold">
              {group.title.parts ? (
                <>
                  {group.title.parts.month}
                  <span className="flex items-start">
                    {group.title.parts.day}
                    <p className="align-super text-sm">
                      {group.title.parts.suffix}
                    </p>
                  </span>
                  {group.title.parts.year && ` (${group.title.parts.year})`}
                </>
              ) : (
                group.title.raw
              )}
            </h3>
            <div className="space-y-4">
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
        <>
          <h2>
            For the full list and access to all of the other work that I do,
            sign up!
          </h2>
          <Pricing />
        </>
      )}
    </>
  );
};

export default ClientEventList;
