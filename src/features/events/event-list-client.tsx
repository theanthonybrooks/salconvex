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
import {
  CombinedEventPreviewCardData,
  EventCategory,
  EventType,
} from "@/types/event";
import { Continents, Filters, SortOptions } from "@/types/thelist";
// import { format } from "date-fns"
// import { CombinedEventPreviewCardData } from "@/types/event";

import { Button } from "@/components/ui/button";
import { useArtistPreload } from "@/features/wrapper-elements/artist-preload-context";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { useFilteredEventsQuery } from "@/hooks/use-filtered-events-query";
import { useMediaQuery } from "@/hooks/use-media-query";
import type { MergedEventPreviewData } from "@/types/event"; // or define a local merged type inline
import { usePreloadedQuery } from "convex/react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
// interface Props {

// }

const ClientEventList = (
  {
    // initialEvents,
    // publicView,
    // user,
  },
) => {
  // inside ClientEventList()
  const initialTitleRef = useRef(
    document.title ?? "The List | The Street Art List",
  );
  console.log("initialTitleRef", initialTitleRef);
  console.log(document.title);

  const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { preloadedArtistData } = useArtistPreload();
  const { preloadedUserData, preloadedSubStatus } = useConvexPreload();
  const userData = usePreloadedQuery(preloadedUserData);
  const subStatus = usePreloadedQuery(preloadedSubStatus);
  const artistData = usePreloadedQuery(preloadedArtistData);
  // console.log(artistData);
  const user = userData?.user || null;
  const accountType = user?.accountType ?? [];
  const isArtist = accountType?.includes("artist");
  const isAdmin = user?.role?.includes("admin");
  const publicView =
    (!subStatus?.hasActiveSubscription || !isArtist) && !isAdmin;
  const userPref = userData?.userPref ?? null;
  const userTimeZone = userPref?.timezone || browserTimeZone;
  const hasTZPref = !!userPref?.timezone;
  const searchParams = useSearchParams();

  const defaultFilters: Filters = {
    showHidden: false,
    bookmarkedOnly: false,
    limit: 10,

    eventTypes: [],
    eventCategories: [],
    eligibility: [],
    callType: [],
    callFormat: "",
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
    continent:
      (searchParams.get("cont")?.split(",") as Continents[]) ??
      defaultFilters.continent,
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
    filters,
    sortOptions,
    { page },
    "thelist",
  );
  void useFilteredEventsQuery(
    filters,
    sortOptions,
    {
      page: page + 1,
    },
    "thelist",
  );
  const total = queryResult?.total ?? 0;
  const totalOpen = queryResult?.totalOpenCalls ?? 0;
  const isLoading = !queryResult;

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

    if (filters.continent?.length)
      params.set("cont", filters.continent.join(","));
    else params.delete("cont");

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

  useEffect(() => {
    window.scroll({ top: 0 });
  }, [page]);

  const totalPages = Math.ceil(total / filters.limit);

  const enrichedEvents: MergedEventPreviewData[] = useMemo(() => {
    return (queryResult?.results ?? []).map((event) => {
      const openCallId = event.tabs?.opencall?._id;
      return {
        ...event,
        bookmarked: artistData?.bookmarked.includes(event._id) ?? false,
        hidden: artistData?.hidden.includes(event._id) ?? false,
        applied: artistData?.applied.includes(event._id) ?? false,
        manualApplied: openCallId
          ? (artistData?.applicationData?.[openCallId]?.manualApplied ?? false)
          : false,
        status: openCallId
          ? (artistData?.applicationData?.[openCallId]?.status ?? null)
          : null,
        artistNationality: artistData?.artistNationality ?? [],
      };
    });
  }, [queryResult?.results, artistData]);

  const totalResults = total;

  const paginatedEvents = enrichedEvents;

  const groupedEvents = useMemo(() => {
    const groups: Record<
      string,
      {
        title: ReturnType<typeof getGroupKeyFromEvent>;
        events: CombinedEventPreviewCardData[];
      }
    > = {};
    const orderedGroupKeys: string[] = [];

    const list = publicView ? paginatedEvents.slice(0, 6) : paginatedEvents;

    for (const event of list) {
      const title = getGroupKeyFromEvent(
        event,
        sortOptions.sortBy,
        userTimeZone,
        hasTZPref,
      );
      const groupKey = title.raw;

      if (!groups[groupKey]) {
        groups[groupKey] = { title, events: [] };
        orderedGroupKeys.push(groupKey);
      }

      groups[groupKey].events.push(event);
    }

    return orderedGroupKeys.map((key) => groups[key]);
  }, [paginatedEvents, sortOptions, publicView, userTimeZone, hasTZPref]);
  const totalCards = groupedEvents.reduce(
    (sum, group) => sum + group.events.length,
    0,
  );
  const handleFilterChange = (partial: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
    setPage(1);
  };

  const handleSortChange = (partial: Partial<SortOptions>) => {
    setSortOptions((prev) => ({ ...prev, ...partial }));
    setPage(1);
  };

  const skeletonGroups = useMemo(() => generateSkeletonGroups(page), [page]);
  const hasResults = totalResults > 0;
  let flatIndex = 0;

  useEffect(() => {
    if (page && page > 1) {
      document.title = `${initialTitleRef.current} - Pg.${page}`;
    } else {
      document.title = initialTitleRef.current;
    }
  }, [page]);
  return (
    <>
      {!publicView && (
        <>
          {/* todo: make this public with some features that are only available to logged in users */}
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

          {!isLoading && hasResults && (
            <BasicPagination
              page={page}
              totalPages={totalPages}
              totalOpenCalls={totalOpen}
              totalResults={totalResults}
              onPageChange={setPage}
            />
          )}
        </>
      )}
      {publicView && (
        <div className="mx-auto max-w-[90dvw] pb-8 pt-4 sm:max-w-[1200px] sm:py-8">
          <div className="flex flex-col gap-3 text-center font-bold tracking-wide text-foreground sm:flex-row sm:items-center sm:gap-2 lg:text-xl">
            <Button
              variant="salWithShadowHiddenBg"
              className="text-lg font-bold lg:text-xl"
              onClick={() => {
                if (subStatus?.subStatus === "past_due") {
                  router.push("/dashboard/account/billing");
                } else {
                  router.push("/pricing");
                }
              }}
            >
              {subStatus?.subStatus === "past_due"
                ? "Resume your membership"
                : "Become a member"}
            </Button>{" "}
            <p className="sm:hidden">for the full list & open call details</p>
            <p className="hidden sm:block">
              to view the full list and open call details
            </p>
          </div>
        </div>
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
        <>
          {hasResults ? (
            groupedEvents.map((group, index) => {
              const isEndedGroup = !!group.title.parts?.year;

              const isFirstEnded =
                isEndedGroup &&
                !groupedEvents.slice(0, index).some((g) => g.title.parts?.year);
              return (
                <div key={group.title.raw} className="mb-6">
                  {isFirstEnded && sortOptions.sortBy === "openCall" && (
                    <h2 className="mb-4 mt-10 text-center text-xl font-semibold">
                      Ended Calls
                    </h2>
                  )}
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
                        {group.title.parts.year &&
                          ` (${group.title.parts.year})`}
                      </>
                    ) : group.title.label ? (
                      group.title.label
                    ) : (
                      group.title.raw
                    )}
                  </h3>
                  <div className="space-y-4 sm:space-y-6">
                    {group.events.map((event, index) => {
                      const showPublic = publicView
                        ? flatIndex < 1
                        : publicView;
                      const isMaskedCard =
                        publicView && flatIndex === totalCards - 1;

                      const card = (
                        <div
                          key={index}
                          className={cn(
                            isMaskedCard &&
                              "masked-card pointer-events-none blur-[1px]",
                          )}
                        >
                          <EventCardPreview
                            key={index}
                            event={event}
                            publicView={publicView}
                            publicPreview={showPublic}
                            user={user}
                            userPref={userPref}
                          />
                        </div>
                      );

                      flatIndex++;
                      return card;
                    })}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="mb-12 mt-6 flex flex-col items-center gap-5">
              <h1 className="text-2xl font-bold">No Results</h1>
              <Image
                src="/nothinghere.gif"
                alt="No Results Found"
                loading="eager"
                width={300}
                height={300}
                className="w-full max-w-[80vw] rounded-full"
              />
            </div>
          )}
        </>
      )}

      {!publicView && hasResults && (
        <BasicPagination
          page={page}
          totalPages={totalPages}
          totalResults={totalResults}
          onPageChange={setPage}
          bottomPag
          className={cn("mb-6", !publicView && "mb-12")}
        />
      )}
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
        <div className="mx-auto mb-20 max-w-[90vw] -translate-y-14">
          <h2 className="text-balance text-center">
            Become a member to view the full list and apply to open calls.
            <br />
            All plans have a two week free trial that you can cancel at any time
          </h2>
          <Pricing />
        </div>
      )}
    </>
  );
};

export default ClientEventList;
