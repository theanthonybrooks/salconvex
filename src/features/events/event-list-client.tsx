"use client";

//TODO: Add view sync to the params. Otherwise when you refresh or go back, it resets to the default view.
import { MergedEventPreviewData } from "@/types/eventTypes";
import { Filters, SortOptions } from "@/types/thelist";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useFilteredEventsQuery } from "@/hooks/use-filtered-events-query";
import { useIsMobile } from "@/hooks/use-media-query";
import { motion } from "framer-motion";
import { debounce } from "lodash";

import { Button } from "@/components/ui/button";
import SalHeader from "@/components/ui/headers/sal-header";
import { BasicPagination } from "@/components/ui/pagination2";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EventCardPreview from "@/features/events/event-card-preview";
import { EventFilters } from "@/features/events/event-list-filters";
import { getGroupKeyFromEvent } from "@/features/events/helpers/groupHeadings";
import Pricing from "@/features/homepage/pricing";
import { useEventListContext } from "@/features/the-list/client-provider";
import { useArtistPreload } from "@/features/wrapper-elements/artist-preload-context";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { generateSkeletonGroups } from "@/helpers/skeletonFns";
import { cn } from "@/helpers/utilsFns";

import { usePreloadedQuery } from "convex/react";

export const viewOptionValues = [
  { value: "openCall", label: "Open Calls" },
  { value: "organizer", label: "Organizers" },
  { value: "event", label: "Events Only" },
  { value: "archive", label: "Archive" },
  { value: "orgView", label: "My Submissions" },
] as const;

export type ViewOptions = (typeof viewOptionValues)[number]["value"];

const ClientEventList = () => {
  // const searchParams = useSearchParams();
  const isMobile = useIsMobile();
  const initialTitleRef = useRef<string | null>(null);
  const {
    filters,
    sortOptions,
    setSortOptions,
    search,
    // setSearch,
    view,
    setView,
    page,
    setPage,
    getDefaultSortForView,
    handleResetFilters,
  } = useEventListContext();

  const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const { preloadedArtistData } = useArtistPreload();
  const { preloadedUserData, preloadedSubStatus, preloadedOrganizerData } =
    useConvexPreload();
  const userData = usePreloadedQuery(preloadedUserData);
  const subStatus = usePreloadedQuery(preloadedSubStatus);
  const orgData = usePreloadedQuery(preloadedOrganizerData);
  const { subStatus: userSubStatus, subscription } = subStatus;

  const artistData = usePreloadedQuery(preloadedArtistData);
  // console.log(artistData);
  const user = userData?.user || null;
  const accountType = user?.accountType ?? [];
  const isAdmin = user?.role?.includes("admin");
  const isArtist = accountType?.includes("artist");
  // const isOrganizer = accountType?.includes("organizer");
  const { hasOrgEvents } = orgData ?? {};

  const hasActiveSubscription = subStatus?.hasActiveSubscription;
  // const hasValidSub = hasActiveSubscription && isArtist;
  const publicView = !hasActiveSubscription || !(isArtist || isAdmin);
  const publicEventOnly =
    (publicView && view === "event") || (hasOrgEvents && view === "orgView");
  const userPref = userData?.userPref ?? null;
  const userTimeZone = userPref?.timezone || browserTimeZone;
  const hasTZPref = !!userPref?.timezone;

  const prevPage = Math.max(page - 1, 1);

  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const [debouncedSort, setDebouncedSort] = useState(sortOptions);

  const updateDebouncedValues = useMemo(
    () =>
      debounce(
        (filters: Filters, sort: SortOptions) => {
          setDebouncedFilters(filters);
          setDebouncedSort(sort);
        },
        0, // milliseconds
      ),
    [],
  );

  useEffect(() => {
    updateDebouncedValues(filters, sortOptions);
  }, [filters, sortOptions, updateDebouncedValues]);

  // const queryResult = useFilteredEventsQuery(filters, sortOptions, { page });
  const queryResult = useFilteredEventsQuery(
    debouncedFilters,
    debouncedSort,
    { page },
    "thelist",
    view,
    // {
    //   bookmarked: artistData?.bookmarked ?? [],
    //   hidden: artistData?.hidden ?? [],
    // },
    {
      subscription: subscription ?? undefined,
      userOrgs: orgData?.orgIds ?? [],
    },
    false,
    // { searchTerm: "fresh", searchType: "all" },
    search,
  );
  void useFilteredEventsQuery(
    debouncedFilters,
    debouncedSort,
    {
      page: page + 1,
    },
    "thelist",
    view,
    // {
    //   bookmarked: artistData?.bookmarked ?? [],
    //   hidden: artistData?.hidden ?? [],
    // },
    {
      subscription: subscription ?? undefined,
      userOrgs: orgData?.orgIds ?? [],
    },
    !hasActiveSubscription || view === "organizer" || view === "archive",
    hasActiveSubscription ? search : undefined,
  );
  void useFilteredEventsQuery(
    debouncedFilters,
    debouncedSort,
    {
      page: prevPage,
    },
    "thelist",
    view,
    // {
    //   bookmarked: artistData?.bookmarked ?? [],
    //   hidden: artistData?.hidden ?? [],
    // },
    {
      subscription: subscription ?? undefined,
      userOrgs: orgData?.orgIds ?? [],
    },
    !hasActiveSubscription ||
      view === "organizer" ||
      view === "archive" ||
      page === 1,
    hasActiveSubscription ? search : undefined,
  );

  useEffect(() => {
    return () => updateDebouncedValues.cancel();
  }, [updateDebouncedValues]);
  const rawTotal = queryResult?.total;
  const total = rawTotal ?? 0;
  const totalOpen = queryResult?.totalOpenCalls;
  const totalComingSoon = queryResult?.comingSoonCalls;
  const totalActive = queryResult?.totalActive;
  const totalArchived = queryResult?.totalArchived;
  // const isLoading = !queryResult;
  // const isLoading = !queryResult?.finishedLoading;
  const isLoading =
    !queryResult?.finishedLoading || (!artistData && hasActiveSubscription);
  const handleViewChange = (newView: ViewOptions) => {
    setView(newView);
    // setSearch(getDefaultSearchForView(newView));
    if (
      newView === "archive" ||
      (newView === "openCall" && !hasActiveSubscription)
    ) {
      handleResetFilters();
    }
    setSortOptions(getDefaultSortForView(newView));
    setPage(1);
  };

  useEffect(() => {
    sessionStorage.setItem("salView", view);
  }, [view]);

  useEffect(() => {
    window.scroll({ top: 240 });
  }, [page]);

  const totalPages = Math.ceil(total / filters.limit);
  //? todo: - would it make sense to separate out the fetching logic? So that it gathers the events through one and the opencalls and orgs through another? Simultaneously or perhaps sequentially? That way each can be cached and then filtered on device, which I imagine would speed things up considerably while still remaining reactive to its respective dataset.
  const enrichedEvents: MergedEventPreviewData[] = useMemo(() => {
    return (queryResult?.results ?? []).map((event) => {
      const openCallId = event.tabs?.openCall?._id;
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
    const list =
      publicView && view !== "event"
        ? paginatedEvents.slice(0, 6)
        : paginatedEvents;

    // Step 1: Group by main raw key
    const groups: Record<
      string,
      {
        title: ReturnType<typeof getGroupKeyFromEvent>;
        subgroups: Record<string, MergedEventPreviewData[]>;
        events: MergedEventPreviewData[];
      }
    > = {};

    for (const event of list) {
      const title = getGroupKeyFromEvent(
        event,
        sortOptions.sortBy,
        userTimeZone,
        hasTZPref,
        view,
      );

      // const mainKey = title.raw || "";
      const mainKey = `${title.raw || ""}__${title.isEnded ? "ended" : "active"}`;

      const subKey = title.subHeading ?? null;

      if (!groups[mainKey]) {
        groups[mainKey] = { title, subgroups: {}, events: [] };
      }

      if (subKey) {
        if (!groups[mainKey].subgroups[subKey]) {
          groups[mainKey].subgroups[subKey] = [];
        }
        groups[mainKey].subgroups[subKey].push(event);
      } else {
        groups[mainKey].events.push(event);
      }
    }
    return Object.values(groups);
  }, [paginatedEvents, sortOptions, publicView, userTimeZone, hasTZPref, view]);

  const totalCards = groupedEvents.reduce(
    (sum, group) => sum + group.events.length,
    0,
  );

  const skeletonGroups = useMemo(() => generateSkeletonGroups(page), [page]);
  const hasResults = totalResults > 0;
  let flatIndex = 0;

  useEffect(() => {
    if (
      typeof document !== "undefined" &&
      initialTitleRef.current === null &&
      !document.title.includes("Pg.")
    ) {
      initialTitleRef.current = document.title;
    }
  }, []);

  useEffect(() => {
    const baseTitle =
      initialTitleRef.current ?? "The List | The Street Art List";

    if (page && page > 1) {
      document.title = `${baseTitle} - Pg.${page}`;
    } else {
      document.title = baseTitle;
    }
  }, [page]);

  // useEffect(() => {
  //   if (page && page > 1) {
  //     document.title = `${document.title} - Pg.${page}`;
  //   }
  // }, [page]);
  return (
    <>
      <SalHeader source={view !== "archive" ? "thelist" : "archive"} />
      {publicView && (
        <PublicHeader
          subStatus={userSubStatus}
          setViewAction={handleViewChange}
          view={view}
        />
      )}
      {(!publicView || publicEventOnly) && (
        <>
          {/* TODO: make this public with some features that are only available to logged in users */}

          <EventFilters
            userPref={userPref}
            user={user}
            isMobile={isMobile}
            results={paginatedEvents}
            isLoading={isLoading}
          />

          {hasActiveSubscription && (
            <Tabs
              defaultValue={view}
              className="relative w-max max-w-[90vw]"
              // value={view}
              // onValueChange={(val) => setView(val as ViewOptions)}
              onValueChange={(val) => handleViewChange(val as ViewOptions)}
            >
              <TabsList className="scrollable justx invis relative flex h-12 w-full justify-around bg-white/70">
                {(isMobile
                  ? viewOptionValues.slice(0, 3)
                  : hasOrgEvents
                    ? viewOptionValues
                    : viewOptionValues.slice(0, 4)
                ).map((opt) => (
                  <TabsTrigger
                    key={opt.value}
                    value={opt.value}
                    className={cn("relative z-10")}
                  >
                    {view === opt.value && (
                      <motion.div
                        exit={{ opacity: 0 }}
                        layoutId="tab-bg"
                        className="absolute inset-0 z-0 flex items-center justify-center rounded-md border-2 bg-background shadow-sm"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}

                    <span className="z-10"> {opt.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          )}

          {!hasActiveSubscription && hasOrgEvents && (
            <Tabs
              defaultValue={view}
              className="relative w-max max-w-[90vw]"
              // value={view}
              onValueChange={(val) => {
                setView(val as ViewOptions);
              }}
            >
              <TabsList className="scrollable justx invis relative flex h-12 w-full justify-around bg-white/70">
                {viewOptionValues
                  .filter(
                    (opt) => opt.value === "event" || opt.value === "orgView",
                  )
                  .map((opt) => (
                    <TabsTrigger
                      key={opt.value}
                      value={opt.value}
                      className={cn(
                        "relative z-10 flex h-10 w-full items-center justify-center px-4 text-sm font-medium hover:font-bold",
                        view === opt.value
                          ? "font-bold text-black"
                          : "text-foreground/80",
                      )}
                    >
                      {view === opt.value && (
                        <motion.div
                          exit={{ opacity: 0 }}
                          layoutId="tab-bg"
                          className="absolute inset-0 z-0 flex items-center justify-center rounded-md border-2 bg-background shadow-sm"
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 30,
                          }}
                        />
                      )}

                      <span className="z-10"> {opt.label}</span>
                    </TabsTrigger>
                  ))}
              </TabsList>
            </Tabs>
          )}

          {!isLoading && hasResults && (
            <BasicPagination
              page={page}
              totalPages={totalPages}
              totalOpenCalls={totalOpen}
              totalActive={totalActive}
              totalComingSoon={totalComingSoon}
              totalArchived={totalArchived}
              totalResults={totalResults}
              onPageChange={setPage}
              setViewAction={setView}
              viewType={view}
            />
          )}
        </>
      )}

      {isLoading ? (
        <div className="mb-10 w-full space-y-4 sm:max-w-[min(100rem,90vw)] sm:space-y-6">
          <div className="mx-auto mb-10 mt-6 flex w-full max-w-[min(70vw,1200px)] grid-cols-[30%_40%_30%] flex-col items-center justify-center gap-4 sm:grid sm:gap-0">
            <Skeleton className="h-10 w-40 rounded-xl bg-black/20" />
            <div className="mx-auto mb-2 flex items-center gap-x-2">
              <Skeleton className="h-10 w-14 rounded-xl bg-black/20" />
              <Skeleton className="h-10 w-20 rounded-xl bg-black/20" />
              <Skeleton className="ml-8 h-10 w-8 rounded-xl bg-black/20" />
            </div>

            <div />
          </div>
          {skeletonGroups.map((group, index) => (
            <div
              key={group.id + index}
              className="flex flex-col items-center gap-6"
            >
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
              const isEndedGroup = !!group.title.isEnded;

              const isFirstEnded =
                isEndedGroup &&
                !groupedEvents.slice(0, index).some((g) => g.title.isEnded);

              return (
                <div key={group.title.raw + index} className="mb-6">
                  {isFirstEnded && sortOptions.sortBy === "openCall" && (
                    <h2 className="mb-4 mt-10 text-center text-xl font-semibold">
                      Ended Calls
                    </h2>
                  )}
                  {isFirstEnded && sortOptions.sortBy === "eventStart" && (
                    <h2 className="mb-4 mt-10 text-center text-xl font-semibold">
                      Past Events
                    </h2>
                  )}

                  <h3 className="mb-3 flex items-center justify-center gap-x-2 text-center text-3xl font-semibold sm:mt-4">
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

                  {group.events.length > 0 && (
                    <div className="space-y-4 sm:space-y-6">
                      {group.events.map((event) => {
                        const showPublic = publicView
                          ? flatIndex < 1
                          : publicView;
                        const isMaskedCard =
                          publicView &&
                          !publicEventOnly &&
                          flatIndex === totalCards - 1;
                        flatIndex++;

                        return (
                          <div
                            key={event._id}
                            className={cn(
                              isMaskedCard &&
                                "masked-card pointer-events-none blur-[1px]",
                            )}
                          >
                            <EventCardPreview
                              event={event}
                              publicView={publicView}
                              publicPreview={showPublic}
                              user={user}
                              userPref={userPref}
                              activeSub={hasActiveSubscription}
                              viewType={view}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {Object.entries(group.subgroups).map(
                    ([subHeading, subEvents]) => (
                      <div key={subHeading} className="mb-4">
                        <h4 className="mb-4 mt-5 text-center text-xl font-semibold">
                          {subHeading}
                        </h4>
                        <div className="space-y-4 sm:space-y-6">
                          {subEvents.map((event) => {
                            const showPublic = publicView
                              ? flatIndex < 1
                              : publicView;
                            const isMaskedCard =
                              publicView &&
                              !publicEventOnly &&
                              flatIndex === totalCards - 1;
                            flatIndex++;

                            return (
                              <div
                                key={event._id}
                                className={cn(
                                  isMaskedCard &&
                                    "masked-card pointer-events-none blur-[1px]",
                                )}
                              >
                                <EventCardPreview
                                  event={event}
                                  publicView={publicView}
                                  publicPreview={showPublic}
                                  user={user}
                                  userPref={userPref}
                                  activeSub={hasActiveSubscription}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              );
            })
          ) : (
            <div className="mb-12 mt-6 flex flex-col items-center gap-5">
              <h1 className="text-2xl font-bold">
                No Results {view === "orgView" ? "(yet)" : ""}
              </h1>
              {view === "orgView" && (
                <p className="mb-3 text-sm italic sm:text-base">
                  Your submissions will show here once they&apos;re approved
                </p>
              )}
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

      {(!publicView || publicEventOnly) && hasResults && (
        <BasicPagination
          page={page}
          totalPages={totalPages}
          totalResults={totalResults}
          onPageChange={setPage}
          bottomPag
          className={cn("mb-6", !publicView && "mb-12")}
          setViewAction={setView}
          viewType={view}
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

      {publicView && (
        <div
          className={cn(
            "mx-auto mb-20 max-w-[90vw]",
            publicEventOnly && "translate-y-0",
            hasResults && !publicEventOnly && "-translate-y-14",
          )}
        >
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

type publicHeaderProps = {
  view: ViewOptions;
  subStatus?: string;
  setViewAction: (view: ViewOptions) => void;
};

const PublicHeader = ({
  view,
  subStatus,
  setViewAction,
}: publicHeaderProps) => {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-[90dvw] pb-8 pt-4 sm:max-w-[1200px] sm:py-8">
      <div className="flex flex-col gap-3 text-center font-bold tracking-wide text-foreground sm:flex-row sm:items-center sm:gap-2 lg:text-xl">
        <Button
          variant="salWithShadowHiddenBg"
          className="text-lg font-bold lg:text-xl"
          onClick={() => setViewAction(view === "event" ? "openCall" : "event")}
        >
          {view === "event" ? "Go Back" : "View Events Only"}
        </Button>
        <p>or</p>
        <Button
          variant="salWithShadowHiddenBg"
          className="text-lg font-bold lg:text-xl"
          onClick={() => {
            if (subStatus === "past_due") {
              router.push("/dashboard/billing");
            } else {
              router.push("/pricing?type=artist");
            }
          }}
        >
          {subStatus === "past_due"
            ? "Resume your membership"
            : "Become a member"}
        </Button>
        <p className="sm:hidden">for the full list & open call details</p>
        <p className="hidden sm:block">
          to view the full list and open call details
        </p>
      </div>
    </div>
  );
};
