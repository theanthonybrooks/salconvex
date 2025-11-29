"use client";

// import { getFourCharMonth } from "@/lib/dateFns"
import { MergedEventPreviewData } from "@/types/eventTypes";
import { SortOptions } from "@/types/thelist";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useFilteredEventsQuery } from "@/hooks/use-filtered-events-query";

import { LucideUploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/custom-link";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import EventCardPreview from "@/features/events/event-card-preview";
import { getGroupKeyFromEvent } from "@/features/events/helpers/groupHeadings";
import Pricing from "@/features/homepage/pricing";
// import { format } from "date-fns"
// import { MergedEventPreviewData } from "@/types/event";

import { useArtistPreload } from "@/features/wrapper-elements/artist-preload-context";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { formatCondensedDateRange } from "@/helpers/dateFns";
import { generateSkeletonGroups } from "@/helpers/skeletonFns";
import { cn } from "@/helpers/utilsFns";

import { usePreloadedQuery } from "convex/react";

// interface Props {

// }

const ClientThisWeekList = (
  {
    // initialEvents,
    // publicView,
    // user,
  },
) => {
  // inside ClientThisWeekList()
  const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const router = useRouter();
  const { preloadedArtistData } = useArtistPreload();
  const { preloadedUserData, preloadedSubStatus } = useConvexPreload();
  const userData = usePreloadedQuery(preloadedUserData);
  const subStatus = usePreloadedQuery(preloadedSubStatus);
  const artistData = usePreloadedQuery(preloadedArtistData);
  // console.log(artistData);
  const { hasActiveSubscription, subscription } = subStatus;

  const user = userData?.user || null;
  const accountType = user?.accountType ?? [];
  const isAdmin = user?.role?.includes("admin") || false;
  const isArtist = accountType?.includes("artist");

  const publicView = !hasActiveSubscription || !(isArtist || isAdmin);
  const userPref = userData?.userPref ?? null;
  const userTimeZone = userPref?.timezone || browserTimeZone;
  const hasTZPref = !!userPref?.timezone;
  const [source, setSource] = useState<"thisweek" | "nextweek">("thisweek");
  const sortOptions = useMemo<SortOptions>(
    () => ({
      sortBy: "openCall",
      sortDirection: "asc",
    }),
    [],
  );

  useEffect(() => {
    const baseUrl = window.location.origin + window.location.pathname;
    // document.cookie =
    //   "login_url=/thisweek; path=/; max-age=300; SameSite=Lax; Secure";

    sessionStorage.setItem("previousSalPage", baseUrl);
  }, []);

  // const queryResult = useFilteredEventsQuery(filters, sortOptions, { page });
  const queryResult = useFilteredEventsQuery(
    {
      showHidden: isAdmin,
      bookmarkedOnly: false,
      limit: 20,
      eventTypes: [],
      eventCategories: [],
    },
    sortOptions,
    { page: 1 },
    source,
    "openCall",
    {
      subscription: subscription ?? undefined,
      userOrgs: [],
    },
  );

  const total = queryResult?.total ?? 0;
  const displayRange =
    queryResult?.weekStartISO && queryResult?.weekEndISO
      ? formatCondensedDateRange(
          queryResult.weekStartISO,
          queryResult.weekEndISO,
        )
      : "";

  const isLoading = !queryResult;

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
    const groups: Record<
      string,
      {
        title: ReturnType<typeof getGroupKeyFromEvent>;
        events: MergedEventPreviewData[];
      }
    > = {};
    const orderedGroupKeys: string[] = [];

    const list = publicView ? paginatedEvents.slice(0, 5) : paginatedEvents;

    for (const event of list) {
      const title = getGroupKeyFromEvent(
        event,
        sortOptions.sortBy,
        userTimeZone,
        hasTZPref,
        "openCall",
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
  const skeletonGroups = useMemo(() => generateSkeletonGroups(1), []);
  const hasResults = totalResults > 0;
  let flatIndex = 0;
  return (
    <>
      {isLoading ? (
        <div className="mb-10 w-full max-w-[90vw] space-y-4 sm:space-y-6">
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
        <div className={cn(!publicView && "mb-16")}>
          <div className="mb-12 flex flex-col gap-8">
            <section>
              <h1 className="mx-auto text-center font-tanker text-3xl lowercase tracking-wide">
                {displayRange}
              </h1>
              <Separator
                orientation="horizontal"
                thickness={3}
                className="mx-auto mt-1 max-w-[min(70vw,165px)] bg-foreground"
              />
              {isAdmin && (
                <div className="flex items-center justify-center gap-3 pt-4">
                  <Button
                    variant="salWithShadowHiddenBg"
                    onClick={() => setSource("thisweek")}
                    disabled={source === "thisweek"}
                  >
                    This Week
                  </Button>
                  <Button
                    variant="salWithShadowHiddenBg"
                    onClick={() => setSource("nextweek")}
                    disabled={source === "nextweek"}
                  >
                    Next Week
                  </Button>
                  <Button
                    variant="salWithShadowHiddenBg"
                    onClick={() =>
                      router.push(
                        source === "thisweek"
                          ? "/admin/thisweek"
                          : "/admin/nextweek",
                      )
                    }
                  >
                    <LucideUploadCloud className="size-5" />
                  </Button>
                </div>
              )}
            </section>
            <section>
              <p className="mb-4 mt-2 text-center text-sm">
                List of street art, graffiti, & mural projects.
                <br /> Info gathered and shared by{" "}
                <Link
                  href="https://instagram.com/anthonybrooksart"
                  target="_blank"
                  className="font-semibold"
                >
                  @anthonybrooksart
                </Link>
              </p>
              {/* <SocialsRow className="size-8 md:size-6" contClassName="gap-8" /> */}
            </section>
            {/* {publicView && (
              <p className="mx-auto">
                Members view this week&apos;s open calls 
              </p>
            )} */}
          </div>

          {hasResults ? (
            groupedEvents.map((group, index) => {
              const isEndedGroup = !!group.title.parts?.year;

              const isFirstEnded =
                isEndedGroup &&
                !groupedEvents.slice(0, index).some((g) => g.title.parts?.year);

              return (
                <div key={group.title.raw} className="mb-6">
                  {isFirstEnded && (
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
                            activeSub={hasActiveSubscription}
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
              <h1 className="text-2xl font-bold">Nothing this week</h1>
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
        </div>
      )}

      {/* NOTE: Do I need to make the full "List" available to public or is the calendar, map, and archive (tabs) enough? Plus the "This Week" tab? */}
      {publicView && (
        <div className="mx-auto -mt-10 mb-20 max-w-[90vw]">
          <div className="mx-auto max-w-[90dvw] pb-8 sm:max-w-[1200px] sm:pb-4">
            <div className="flex flex-col gap-3 text-center font-bold tracking-wide text-foreground sm:flex-row sm:items-center sm:justify-center sm:gap-2 lg:text-xl">
              <Button
                variant="salWithShadowHiddenBg"
                className="text-lg font-bold lg:text-xl"
                onClick={() => {
                  if (subStatus?.subStatus === "past_due") {
                    router.push("/dashboard/billing");
                  } else {
                    router.push("/pricing?type=artist");
                  }
                }}
              >
                {subStatus?.subStatus === "past_due"
                  ? "Resume your membership"
                  : "Become a member"}
              </Button>
              <p className="sm:hidden">for the full list & open call details</p>
              <p className="hidden sm:block">
                to view the full list and open call details
              </p>
            </div>
          </div>
          <Pricing />
        </div>
      )}
    </>
  );
};

export default ClientThisWeekList;
