"use client";

import { BasicPagination } from "@/components/ui/pagination2";
import { Skeleton } from "@/components/ui/skeleton";
import EventCardPreview from "@/features/events/event-card-preview";
import { EventFilters } from "@/features/events/event-list-filters";
import { getGroupKeyFromEvent } from "@/features/events/helpers/groupHeadings";
import Pricing from "@/features/homepage/pricing";
import { generateSkeletonGroups } from "@/lib/skeletonFns";
// import { getFourCharMonth } from "@/lib/dateFns"
import { cn, setParamIfNotDefault } from "@/lib/utils";
import { EventCategory, EventType } from "@/types/event";
import { Filters, SortOptions } from "@/types/thelist";
// import { format } from "date-fns"
import { CombinedEventPreviewCardData } from "@/types/event";

import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { useFilteredEventsQuery } from "@/hooks/use-filtered-events-query";
import { useMediaQuery } from "@/hooks/use-media-query";
import { usePreloadedQuery } from "convex/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

// interface Props {

// }

const ClientEventList = (
  {
    // initialEvents,
    // publicView,
    // user,
  },
) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { preloadedUserData, preloadedSubStatus } = useConvexPreload();
  const userData = usePreloadedQuery(preloadedUserData);
  const subStatus = usePreloadedQuery(preloadedSubStatus);
  const user = userData?.user || null;
  const accountType = user?.accountType ?? [];
  const isArtist = accountType?.includes("artist");
  const isAdmin = user?.role?.includes("admin");
  const publicView =
    (!subStatus?.hasActiveSubscription || !isArtist) && !isAdmin;
  const userPref = userData?.userPref ?? null;

  const searchParams = useSearchParams();
  // const allEvents = useEventPreviewCards();
  // const isLoading = allEvents?.length === 0;
  // // const hasResults = allEvents?.length > 0;

  // // console.log("allEvents", allEvents)

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
    // page: Number(searchParams.get("page")) || 1,
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
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  // const queryResult = useFilteredEventsQuery(filters, sortOptions, { page });
  const queryResult = useFilteredEventsQuery(
    {
      showHidden: false,
      bookmarkedOnly: false,
      limit: 10,
      eventTypes: [],
      eventCategories: [],
    },
    {
      sortBy: "openCall",
      sortDirection: "asc",
    },
    { page: 1 },
  );

  const filteredEvents = queryResult?.results ?? [];
  const total = queryResult?.total ?? 0;
  const isLoading = !queryResult;
  console.log("filteredEvents", filteredEvents);
  console.log("total", total);
  console.log("isLoading", isLoading);
  console.log("queryResult", queryResult);

  const handleResetFilters = () => {
    setFilters(defaultFilters);
    setSortOptions(defaultSort);
    setPage(1);
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

    if (page && page !== 1) {
      params.set("page", page.toString());
    } else {
      params.delete("page");
    }

    setParamIfNotDefault(params, "sb", sortOptions.sortBy, "openCall");
    setParamIfNotDefault(params, "sd", sortOptions.sortDirection, "asc");

    const queryString = params.toString();
    const baseUrl = window.location.origin + window.location.pathname;
    sessionStorage.setItem(
      "previousSalPage",
      baseUrl + (queryString ? `?${queryString}` : ""),
    );
    window.history.replaceState(
      null,
      "",
      baseUrl + (queryString ? `?${queryString}` : ""),
    );
  }, [filters, sortOptions, page]);

  // const filteredEvents = useFilteredEvents(allEvents, filters, sortOptions);
  const totalPages = Math.ceil(total / filters.limit);
  const totalResults = total;

  const paginatedEvents = filteredEvents;

  const groupedEvents = useMemo(() => {
    const groups: Record<
      string,
      {
        title: ReturnType<typeof getGroupKeyFromEvent>;
        events: CombinedEventPreviewCardData[];
      }
    > = {};
    const orderedGroupKeys: string[] = [];

    const list = publicView ? paginatedEvents.slice(0, 5) : paginatedEvents;

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
  const handleFilterChange = (partial: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
    setPage(1);
  };

  const handleSortChange = (partial: Partial<SortOptions>) => {
    setSortOptions((prev) => ({ ...prev, ...partial }));
    setPage(1);
  };

  const skeletonGroups = useMemo(() => generateSkeletonGroups(page), [page]);

  return (
    <>
      {!publicView && (
        <>
          <EventFilters
            filters={filters}
            sortOptions={sortOptions}
            onChange={handleFilterChange}
            onSortChange={handleSortChange}
            onResetFilters={handleResetFilters}
            userPref={userPref}
            user={user}
            isMobile={isMobile}
          />

          {!isLoading && (
            <BasicPagination
              page={page}
              totalPages={totalPages}
              totalResults={totalResults}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      {isLoading ? (
        <div className="mb-10 w-full max-w-[90vw] space-y-4 sm:space-y-6">
          <div className="mx-auto mb-10 mt-6 flex w-full max-w-[min(70vw,1200px)] grid-cols-[30%_40%_30%] flex-col items-center justify-center gap-4 sm:grid sm:gap-0">
            <Skeleton className="h-10 w-40 rounded-xl bg-black/20" />
            <div className="mx-auto mb-2 flex items-center gap-x-2">
              <Skeleton className="h-10 w-14 rounded-xl bg-black/20" />
              <Skeleton className="h-10 w-20 rounded-xl bg-black/20" />
              <Skeleton className="ml-8 h-10 w-8 rounded-xl bg-black/20" />
            </div>

            <div />
          </div>
          {skeletonGroups.map((group) => (
            <div key={group.id} className="flex flex-col items-center gap-6">
              <Skeleton className="mx-auto mt-3 h-10 w-64 rounded-xl bg-black/20" />

              {group.results.map((_, idx) => (
                <Skeleton
                  key={idx}
                  className="min-h-[200px] w-full rounded-3xl bg-black/20 sm:min-h-[250px]"
                />
              ))}
            </div>
          ))}
        </div>
      ) : (
        groupedEvents.map((group) => (
          <div key={group.title.raw} className="mb-6">
            <h3 className="mb-2 flex items-center justify-center gap-x-2 text-center text-3xl font-semibold sm:mt-4">
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
            <div className="space-y-4 sm:space-y-6">
              {group.events.map((event, index) => (
                <EventCardPreview
                  key={index}
                  event={event}
                  publicView={publicView}
                  user={user}
                  userPref={userPref}
                />
              ))}
            </div>
          </div>
        ))
      )}

      <BasicPagination
        page={page}
        totalPages={totalPages}
        totalResults={totalResults}
        onPageChange={setPage}
        bottomPag
        className={cn("mb-6", !publicView && "mb-12")}
      />
      {isLoading && (
        <div
          className={cn(
            "mb-6 flex w-full items-center justify-center",
            !publicView && "mb-12",
          )}
        >
          <div className="mx-auto flex items-center gap-x-2">
            <Skeleton className="h-10 w-14 rounded-xl bg-black/20" />
            <Skeleton className="h-10 w-20 rounded-xl bg-black/20" />
            <Skeleton className="ml-8 h-10 w-8 rounded-xl bg-black/20" />
          </div>
        </div>
      )}
      {/* NOTE: Do I need to make the full "List" available to public or is the calendar, map, and archive (tabs) enough? Plus the "This Week" tab? */}
      {publicView && (
        <div className="mx-auto mb-20 mt-10 max-w-[90vw]">
          <h2 className="text-balance text-center">
            For the full list and access to all of the other work that I do,
            sign up!
          </h2>
          <Pricing />
        </div>
      )}
    </>
  );
};

export default ClientEventList;
