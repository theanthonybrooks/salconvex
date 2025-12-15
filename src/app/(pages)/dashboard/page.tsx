"use client";

import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

import { FaGear, FaRegBookmark } from "react-icons/fa6";
import { PiPiggyBank } from "react-icons/pi";
import {
  EyeOff,
  IdCard,
  LucideCalendar,
  LucideCalendarPlus2,
  LucideCircleCheck,
  LucideCircleEqual,
  LucideCircleFadingPlus,
  LucideClipboardList,
  LucideFolderHeart,
  LucideScrollText,
  Megaphone,
  Newspaper,
  TrendingUp,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { CanceledBanner } from "@/components/ui/canceled-banner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartWrapper } from "@/components/ui/charts/chart-wrapper";
import { Link } from "@/components/ui/custom-link";
import { PreviewCard } from "@/components/ui/dashboard/dashboard-preview-card";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { countApplicationsByTimeRange } from "@/helpers/applicationFns";
import { getEventCategoryLabel } from "@/helpers/eventFns";
import { getUserFontSizePref } from "@/helpers/stylingFns";
import { cn } from "@/helpers/utilsFns";

import { api } from "~/convex/_generated/api";
import { makeUseQueryWithStatus } from "convex-helpers/react";
import { useQueries } from "convex-helpers/react/cache";
import { usePreloadedQuery } from "convex/react";

export default function Dashboard() {
  const router = useRouter();
  const { preloadedUserData, preloadedSubStatus } = useConvexPreload();
  const userData = usePreloadedQuery(preloadedUserData);
  const subData = usePreloadedQuery(preloadedSubStatus);
  const { hasActiveSubscription, subStatus, cancelAt } = subData ?? {};
  // const subStatus = subData?.subStatus ?? "none";
  const useQueryWithStatus = makeUseQueryWithStatus(useQueries);
  // const userId = userData?.userId ?? "guest";
  const user = userData?.user || null;
  const userPref = userData?.userPref ?? null;
  const fontSizePref = getUserFontSizePref(userPref?.fontSize);
  const fontSize = fontSizePref?.body;
  const subFontSize = fontSizePref?.small;
  const accountType = user?.accountType;
  const role = user?.role;
  const isCreator = role?.includes("creator");
  const isAdmin = role?.includes("admin");
  const isArtist = accountType?.includes("artist");
  const adminPrivileges = isAdmin || isCreator;
  const hasValidSub = (hasActiveSubscription && isArtist) || isCreator;
  const isOrganizer = accountType?.includes("organizer") || adminPrivileges;

  const { data: latestFive, isPending: latestPending } = useQueryWithStatus(
    api.events.event.get5latestPublishedEvents,
  );

  const { data: totalOpenCallsData } = useQueryWithStatus(
    api.openCalls.openCall.getTotalNumberOfOpenCalls,
    adminPrivileges ? {} : "skip",
  );

  const { data: allEventsData } = useQueryWithStatus(
    api.events.event.getTotalNumberOfEvents,
    adminPrivileges ? {} : "skip",
  );

  const { data: totalSubmittedEventCount } = useQueryWithStatus(
    api.events.event.getSubmittedEventCount,
    adminPrivileges ? {} : "skip",
  );

  const { data: totalUsersData } = useQueryWithStatus(
    api.users.getTotalUsers,
    adminPrivileges ? {} : "skip",
  );

  const { data: totalNewsletterSubsData } = useQueryWithStatus(
    api.newsletter.subscriber.getNewsletterSubscribers,
    adminPrivileges ? {} : "skip",
  );
  const { data: artistData } = useQueryWithStatus(
    api.artists.applications.getArtistData,
    hasValidSub || isAdmin ? {} : "skip",
  );

  const totalUsers = totalUsersData ?? 0;
  const totalNewsletterSubs = totalNewsletterSubsData?.totalSubscribers ?? 0;
  const totalOpenCalls = totalOpenCallsData?.totalOpenCalls ?? 0;
  const activeOpenCalls = totalOpenCallsData?.activeOpenCalls ?? 0;
  const totalEvents = allEventsData?.totalEvents ?? 0;
  const activeEvents = allEventsData?.activeEvents ?? 0;
  // const archivedEvents = allEventsData?.archivedEvents ?? 0;
  // const draftEvents = allEventsData?.draftEvents ?? 0;
  const pendingEvents = totalSubmittedEventCount ?? 0;
  const pendingOpenCalls = totalOpenCallsData?.pendingOpenCalls ?? 0;
  const totalPending = pendingOpenCalls + pendingEvents;

  const { applications, listActions } = artistData ?? {};
  const bookmarkedEvents = listActions?.filter((la) => la.bookmarked === true);
  const hiddenEvents = listActions?.filter((la) => la.hidden === true);
  const lastMonthCount = countApplicationsByTimeRange(
    applications ?? [],
    "month",
  );
  //todo: add this back when application system is in place
  // const acceptedApps = applications?.filter(
  //   (app) => app.applicationStatus === "accepted",
  // );

  // const rejectedApps = applications?.filter(
  //   (app) => app.applicationStatus === "rejected",
  // );
  // const pendingApps = applications?.filter(
  //   (app) => app.applicationStatus === "pending",
  // );

  return (
    <div className="flex flex-col gap-6 p-6">
      <CanceledBanner
        activeSub={hasActiveSubscription}
        subStatus={subStatus}
        willCancel={cancelAt}
        fontSize={fontSize}
      />
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-foreground">
          Welcome to your dashboard overview.
        </p>
      </div>

      {/* Quick Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {adminPrivileges && (
          <div className="col-span-full flex flex-col gap-4">
            <h3 className="underline underline-offset-2">Admin Dashboard:</h3>
            <div className="scrollable justx flex flex-col flex-wrap gap-4 sm:flex-row">
              {totalPending > 0 && (
                <PreviewCard
                  fontSize={fontSize}
                  card={{
                    icon: LucideCircleFadingPlus,
                    title: "New Submissions",
                    total: totalPending,
                    path: "/dashboard/admin/submissions?state=submitted",
                  }}
                />
              )}
              <PreviewCard
                fontSize={fontSize}
                card={{
                  icon: Megaphone,
                  title: "Total Open Calls",
                  subTitle: "(incl. pending/drafts)",
                  total: totalOpenCalls,
                  path: "/dashboard/admin/submissions?openCallState=published,archived,submitted,draft",
                }}
              />
              <PreviewCard
                fontSize={fontSize}
                card={{
                  icon: Megaphone,
                  title: "Active Open Calls",
                  total: activeOpenCalls,
                  path: "/dashboard/admin/submissions?openCallState=published",
                }}
              />
              <PreviewCard
                fontSize={fontSize}
                card={{
                  icon: LucideCircleEqual,
                  title: "Total Events",
                  subTitle: "(incl. pending/drafts)",
                  total: totalEvents,
                  path: "/dashboard/admin/submissions",
                }}
              />
              <PreviewCard
                fontSize={fontSize}
                card={{
                  icon: LucideCircleCheck,
                  title: "Active Events",
                  total: activeEvents,
                  path: "/dashboard/admin/submissions?state=published",
                }}
              />
              <PreviewCard
                fontSize={fontSize}
                card={{
                  icon: Users,
                  title: "Total Users",
                  total: totalUsers,
                  path: "/dashboard/admin/users",
                }}
              />
              <PreviewCard
                fontSize={fontSize}
                card={{
                  icon: Newspaper,
                  title: "Newsletter Subscribers",
                  total: totalNewsletterSubs,
                  path: "/dashboard/admin/newsletter",
                }}
              />
            </div>
          </div>
        )}
        {hasValidSub && (
          <div className="col-span-full flex flex-col gap-4">
            <h3 className="underline underline-offset-2">Artist Dashboard:</h3>
            <div className="scrollable justx flex flex-col flex-wrap gap-4 sm:flex-row">
              <PreviewCard
                fontSize={fontSize}
                card={{
                  icon: LucideClipboardList,
                  title: "Total Applications",
                  subTitle:
                    lastMonthCount > 0
                      ? `+${lastMonthCount} from last month`
                      : undefined,
                  total: applications?.length ?? 0,
                  path: "/dashboard/artist/apps",
                }}
              />
              <PreviewCard
                fontSize={fontSize}
                card={{
                  icon: FaRegBookmark,
                  title: "Bookmarked Events",
                  total: bookmarkedEvents?.length ?? 0,
                  path: "/dashboard/artist/bookmarks",
                }}
              />
              <PreviewCard
                fontSize={fontSize}
                card={{
                  icon: EyeOff,
                  title: "Hidden Events",
                  total: hiddenEvents?.length ?? 0,
                  path: "/dashboard/artist/hidden",
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="lg:col-span-2 min-[1400px]:col-span-1 2xl:col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              asChild
              variant="salWithShadowHiddenYlw"
              className="w-full justify-start gap-2"
            >
              <Link variant="standard" href="/thelist">
                <LucideScrollText className="size-5" />
                Go to The List
              </Link>
            </Button>
            {isOrganizer && (
              <Button
                asChild
                variant="salWithShadowHiddenYlw"
                className="w-full justify-start gap-2"
              >
                <Link variant="standard" href="/dashboard/organizer/events">
                  <LucideCalendar className="size-5" />
                  My Events
                </Link>
              </Button>
            )}
            {hasActiveSubscription && (
              <>
                <Button
                  asChild
                  variant="salWithShadowHiddenYlw"
                  className="w-full justify-start gap-2"
                >
                  <Link variant="standard" href="/dashboard/artist">
                    <IdCard className="size-5" />
                    Artist Profile
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="salWithShadowHiddenYlw"
                  className="w-full justify-start gap-2"
                >
                  <Link variant="standard" href="/dashboard/billing">
                    <PiPiggyBank className="size-5" />
                    Manage Billing
                  </Link>
                </Button>
              </>
            )}
            <Button
              asChild
              variant="salWithShadowHiddenYlw"
              className="w-full justify-start gap-2"
            >
              <Link variant="standard" href="/dashboard/settings">
                <FaGear className="size-5" />
                Account Settings
              </Link>
            </Button>

            {/* TODO: add this logic once I've gotten the application system up and there's a reason for users to upload a portfolio and related files */}
            {isCreator && (
              <Button
                asChild
                variant="salWithShadowHiddenYlw"
                className="w-full justify-start gap-2"
              >
                {/* <Link variant="standard" href="/dashboard/projects"> */}
                <Link variant="standard" href="/dashboard/">
                  <LucideFolderHeart className="size-5" />
                  Manage Portfolio
                </Link>
              </Button>
            )}
            {adminPrivileges && (
              <Button
                asChild
                variant="salWithShadowHiddenYlw"
                className="w-full justify-start gap-2"
              >
                <Link variant="standard" href="/dashboard/admin/analytics">
                  <TrendingUp className="size-5" />
                  View Analytics
                </Link>
              </Button>
            )}

            {isOrganizer && (
              <Button
                asChild
                variant="salWithShadowHiddenYlw"
                className="w-full justify-start gap-2"
              >
                <Link variant="standard" href="/submit">
                  <LucideCalendarPlus2 className="size-5" />
                  Submit Event/Open Call
                </Link>
              </Button>
            )}
            {/* {isOrganizer && (
              <Button
                asChild
                variant="salWithShadowHiddenYlw"
                className="w-full justify-start gap-2"
              >
                <Link variant="standard" href="/dashboard/account/settings">
                  <Users className="size-5" />
                  Invite Judges
                </Link>
              </Button>
            )} */}
          </CardContent>
        </Card>

        {(hasValidSub || adminPrivileges) && (
          <Card className="lg:col-span-2 min-[1400px]:col-span-3">
            <CardHeader>
              <CardTitle>Latest Updates</CardTitle>
              <CardDescription>Recently added open calls</CardDescription>
            </CardHeader>
            <CardContent>
              {!latestPending && (
                <div className="space-y-4">
                  {latestFive && latestFive.length > 0 ? (
                    latestFive.map((event) => (
                      <div
                        key={event._id}
                        className="flex flex-col justify-between gap-1 sm:flex-row sm:gap-4"
                      >
                        <div>
                          <Link
                            href={`/thelist/event/${event.slug}/${event.dates.edition}/call`}
                            className="font-medium hover:underline"
                            fontSize={fontSize}
                          >
                            {event.name}
                          </Link>
                          <span
                            className={cn(
                              "flex items-center gap-1 text-sm text-muted-foreground",
                              subFontSize,
                            )}
                          >
                            <p>{event.location.country}</p>-
                            <p> {getEventCategoryLabel(event.category)}</p>
                          </span>
                        </div>
                        <p
                          className={cn(
                            "whitespace-nowrap text-xs text-muted-foreground",
                            subFontSize,
                          )}
                        >
                          {event.approvedAt
                            ? formatDistanceToNow(new Date(event.approvedAt), {
                                addSuffix: true,
                              })
                            : "Unknown time"}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm italic text-muted-foreground">
                      No recent published events found.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                variant="ghost"
                className={cn("mx-auto w-max hover:scale-105", fontSize)}
                onClick={() => router.push("/thelist")}
              >
                View All Updates
              </Button>
            </CardFooter>
          </Card>
        )}
        {adminPrivileges && <ChartWrapper className="col-span-full" />}
      </div>
    </div>
  );
}
