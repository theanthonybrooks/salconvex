"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/components/ui/custom-link";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { countApplicationsByTimeRange } from "@/lib/applicationFns";
import { getEventCategoryLabel } from "@/lib/eventFns";
import { makeUseQueryWithStatus } from "convex-helpers/react";
import { useQueries } from "convex-helpers/react/cache";
import { usePreloadedQuery, useQuery } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import {
  EyeOff,
  LucideCalendarPlus2,
  LucideCircleCheck,
  LucideCircleCheckBig,
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
import { useRouter } from "next/navigation";
import { FaGear, FaRegBookmark } from "react-icons/fa6";
import { PiPiggyBank } from "react-icons/pi";
import { api } from "~/convex/_generated/api";

export default function Dashboard() {
  const router = useRouter();
  const { preloadedUserData, preloadedSubStatus } = useConvexPreload();
  const userData = usePreloadedQuery(preloadedUserData);
  const subData = usePreloadedQuery(preloadedSubStatus);
  const hasActiveSubscription = subData?.hasActiveSubscription ?? false;
  const subStatus = subData?.subStatus ?? "none";
  const useQueryWithStatus = makeUseQueryWithStatus(useQueries);
  // const userId = userData?.userId ?? "guest";
  const user = userData?.user || null;
  const accountType = user?.accountType;
  const role = user?.role;
  const isAdmin = role?.includes("admin");
  const isArtist = accountType?.includes("artist") && hasActiveSubscription;
  const isOrganizer = accountType?.includes("organizer");

  const { data: latestFive, isPending: latestPending } = useQueryWithStatus(
    api.events.event.get5latestPublishedEvents,
  );

  const { data: totalOpenCallsData } = useQueryWithStatus(
    api.openCalls.openCall.getTotalNumberOfOpenCalls,
    isAdmin ? {} : "skip",
  );

  const { data: allEventsData } = useQueryWithStatus(
    api.events.event.getTotalNumberOfEvents,
    isAdmin ? {} : "skip",
  );

  const { data: submittedEventsData } = useQueryWithStatus(
    api.events.event.getSubmittedEvents,
    isAdmin ? {} : "skip",
  );

  const { data: totalUsersData } = useQueryWithStatus(
    api.users.getTotalUsers,
    isAdmin ? {} : "skip",
  );

  const { data: totalNewsletterSubsData } = useQueryWithStatus(
    api.newsletter.subscriber.getNewsletterSubscribers,
    isAdmin ? {} : "skip",
  );
  const totalUsers = totalUsersData ?? 0;
  const totalNewsletterSubs = totalNewsletterSubsData?.totalSubscribers ?? 0;
  const totalOpenCalls = totalOpenCallsData?.totalOpenCalls ?? 0;
  const activeOpenCalls = totalOpenCallsData?.activeOpenCalls ?? 0;
  const totalEvents = allEventsData?.totalEvents ?? 0;
  const activeEvents = allEventsData?.activeEvents ?? 0;
  // const archivedEvents = allEventsData?.archivedEvents ?? 0;
  // const draftEvents = allEventsData?.draftEvents ?? 0;
  const pendingEvents = submittedEventsData?.length ?? 0;

  const artistData = useQuery(api.artists.applications.getArtistApplications);
  const { applications, listActions } = artistData ?? {};
  const bookmarkedEvents = listActions?.filter((la) => la.bookmarked === true);
  const hiddenEvents = listActions?.filter((la) => la.hidden === true);

  const lastMonthCount = countApplicationsByTimeRange(
    applications ?? [],
    "month",
  );
  const acceptedApps = applications?.filter(
    (app) => app.applicationStatus === "accepted",
  );
  // const rejectedApps = applications?.filter(
  //   (app) => app.applicationStatus === "rejected",
  // );
  // const pendingApps = applications?.filter(
  //   (app) => app.applicationStatus === "pending",
  // );

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-foreground">
          Welcome to your dashboard overview.
        </p>
      </div>

      {/* Quick Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isAdmin && (
          <div className="col-span-full flex flex-col gap-4">
            <h3 className="underline underline-offset-2">Admin Dashboard:</h3>
            <div className="scrollable justx flex flex-col flex-wrap gap-4 sm:flex-row">
              <Card className="min-w-50 max-w-80 flex-1">
                <CardHeader className="flex flex-col pb-2">
                  <span className="flex items-center justify-between gap-2 sm:justify-start">
                    <CardTitle className="text-sm font-medium">
                      New Submissions
                    </CardTitle>
                    <LucideCircleFadingPlus className="my-auto size-4 text-muted-foreground" />
                  </span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingEvents ?? 0}</div>
                  <Link
                    variant="subtleUnderline"
                    href="/dashboard/admin/submissions"
                  >
                    <p className="mt-1 text-xs">View all</p>
                  </Link>
                </CardContent>
              </Card>
              <Card className="min-w-50 max-w-80 flex-1">
                <CardHeader className="flex flex-col pb-2">
                  <span className="flex items-center justify-between gap-2 sm:justify-start">
                    <CardTitle className="text-sm font-medium">
                      Total Open Calls
                    </CardTitle>
                    <Megaphone className="size-4 text-muted-foreground" />
                  </span>
                  <p className="text-xs italic text-muted-foreground">
                    (incl. pending/drafts)
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {totalOpenCalls ?? 0}
                  </div>
                  <Link
                    variant="subtleUnderline"
                    href="/dashboard/admin/submissions"
                  >
                    <p className="mt-1 text-xs">View all</p>
                  </Link>
                </CardContent>
              </Card>
              <Card className="min-w-50 max-w-80 flex-1">
                <CardHeader className="flex flex-col pb-2">
                  <span className="flex items-center justify-between gap-2 sm:justify-start">
                    <CardTitle className="text-sm font-medium">
                      Active Open Calls
                    </CardTitle>
                    <Megaphone className="size-4 text-muted-foreground" />
                  </span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {activeOpenCalls ?? 0}
                  </div>
                  <Link
                    variant="subtleUnderline"
                    href="/dashboard/admin/submissions"
                  >
                    <p className="mt-1 text-xs">View all</p>
                  </Link>
                </CardContent>
              </Card>
              <Card className="min-w-50 max-w-80 flex-1">
                <CardHeader className="flex flex-col pb-2">
                  <span className="flex items-center justify-between gap-2 sm:justify-start">
                    <CardTitle className="text-sm font-medium">
                      Total Events
                    </CardTitle>
                    <LucideCircleEqual className="size-4 text-muted-foreground" />
                  </span>
                  <p className="text-xs italic text-muted-foreground">
                    (incl. pending/drafts)
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalEvents ?? 0}</div>
                  <Link
                    variant="subtleUnderline"
                    href="/dashboard/admin/submissions"
                  >
                    <p className="mt-1 text-xs">View all</p>
                  </Link>
                </CardContent>
              </Card>
              <Card className="min-w-50 max-w-80 flex-1">
                <CardHeader className="flex flex-col pb-2">
                  <span className="flex items-center justify-between gap-2 sm:justify-start">
                    <CardTitle className="text-sm font-medium">
                      Active Events
                    </CardTitle>
                    <LucideCircleCheck className="size-4 text-muted-foreground" />
                  </span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeEvents ?? 0}</div>
                  <Link
                    variant="subtleUnderline"
                    href="/dashboard/admin/submissions"
                  >
                    <p className="mt-1 text-xs">View all</p>
                  </Link>
                </CardContent>
              </Card>
              {/* <Card className="min-w-50 max-w-80 flex-1">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Archived Events
                  </CardTitle>
                  <LucideCircleOff className="size-4 text-muted-foreground" />
                </CardHeader>
           
                <CardContent>
                  <div className="text-2xl font-bold">
                    {archivedEvents ?? 0}
                  </div>
                  <Link
                    variant="subtleUnderline"
                    href="/dashboard/admin/submissions"
                  >
                    <p className="mt-1 text-xs">View all</p>
                  </Link>
                </CardContent>
              </Card> */}

              <Card className="min-w-50 max-w-80 flex-1">
                <CardHeader className="flex flex-col pb-2">
                  <span className="flex items-center justify-between gap-2 sm:justify-start">
                    <CardTitle className="text-sm font-medium">
                      Total Users
                    </CardTitle>
                    <Users className="size-4 text-muted-foreground" />
                  </span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalUsers ?? 0}</div>
                  <Link variant="subtleUnderline" href="/dashboard/admin/users">
                    <p className="mt-1 text-xs">View all</p>
                  </Link>
                </CardContent>
                {/* <CardContent>
                  <div className="text-2xl font-bold">
                    {archivedEvents ?? 0}
                  </div>
                  <Link
                    variant="subtleUnderline"
                    href="/dashboard/admin/submissions"
                  >
                    <p className="mt-1 text-xs">View all</p>
                  </Link>
                </CardContent> */}
              </Card>
              <Card className="min-w-50 max-w-80 flex-1">
                <CardHeader className="flex flex-col pb-2">
                  <span className="flex items-center justify-between gap-2 sm:justify-start">
                    <CardTitle className="text-sm font-medium">
                      Total Newsletter Subs
                    </CardTitle>
                    <Newspaper className="size-4 text-muted-foreground" />
                  </span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {totalNewsletterSubs}
                  </div>
                  <Link
                    variant="subtleUnderline"
                    href="/dashboard/admin/newsletter"
                  >
                    <p className="mt-1 text-xs">View all</p>
                  </Link>
                </CardContent>
                {/* <CardContent>
                  <div className="text-2xl font-bold">
                    {archivedEvents ?? 0}
                  </div>
                  <Link
                    variant="subtleUnderline"
                    href="/dashboard/admin/submissions"
                  >
                    <p className="mt-1 text-xs">View all</p>
                  </Link>
                </CardContent> */}
              </Card>
            </div>
          </div>
        )}
        {isArtist && (
          <div className="col-span-full flex flex-col gap-4">
            <h3 className="underline underline-offset-2">Artist Dashboard:</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="min-w-50 max-w-80 flex-1">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Applications
                  </CardTitle>
                  <LucideClipboardList className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {applications?.length ?? 0}
                  </div>
                  <div className="inline-flex items-center gap-2">
                    <p className="mt-1 text-xs text-muted-foreground">
                      {lastMonthCount > 0
                        ? `+${lastMonthCount} from last month`
                        : "0 in the last month"}
                    </p>
                    {" - "}

                    <Link variant="subtleUnderline" href="/dashboard/artist/">
                      <p className="mt-1 text-xs">View all</p>
                    </Link>
                  </div>
                </CardContent>
              </Card>
              <Card className="min-w-50 max-w-80 flex-1">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Accepted Applications
                  </CardTitle>
                  <LucideCircleCheckBig className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {acceptedApps?.length ?? 0}
                  </div>
                  {/* TODO: Add this back */}
                  {/* <Link
                    variant="subtleUnderline"
                    href="/dashboard/apps/accepted"
                  >
                    <p className="mt-1 text-xs">View all</p>
                  </Link> */}
                </CardContent>
              </Card>
              {/* <Card className="min-w-50 max-w-80 flex-1">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Pending Applications
                  </CardTitle>
                  <Zap className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {pendingApps?.length ?? 0}
                  </div>
                  <Link
                    variant="subtleUnderline"
                    href="/dashboard/apps/pending"
                  >
                    <p className="mt-1 text-xs">View all</p>
                  </Link>
                </CardContent>
              </Card> */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Bookmarked Events
                  </CardTitle>
                  <FaRegBookmark className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {bookmarkedEvents?.length ?? 0}
                  </div>

                  <Link
                    variant="subtleUnderline"
                    href="/dashboard/artist/bookmarks"
                  >
                    <p className="mt-1 text-xs">View all</p>
                  </Link>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Hidden Events
                  </CardTitle>
                  <EyeOff className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {hiddenEvents?.length ?? 0}
                  </div>
                  <Link
                    variant="subtleUnderline"
                    href="/dashboard/artist/hidden"
                  >
                    <p className="mt-1 text-xs">View all</p>
                  </Link>
                </CardContent>
              </Card>
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
            {subStatus !== "none" && (
              <Button
                asChild
                variant="salWithShadowHiddenYlw"
                className="w-full justify-start gap-2"
              >
                <Link variant="standard" href="/dashboard/account/billing">
                  <PiPiggyBank className="size-5" />
                  Manage Billing
                </Link>
              </Button>
            )}
            <Button
              asChild
              variant="salWithShadowHiddenYlw"
              className="w-full justify-start gap-2"
            >
              <Link variant="standard" href="/dashboard/account/settings">
                <FaGear className="size-5" />
                Account Settings
              </Link>
            </Button>

            {/* TODO: add this logic once I've gotten the application system up and there's a reason for users to upload a portfolio and related files */}
            {isAdmin && isArtist && (
              <Button
                asChild
                variant="salWithShadowHiddenYlw"
                className="w-full justify-start gap-2"
              >
                <Link variant="standard" href="/dashboard/projects">
                  <LucideFolderHeart className="size-5" />
                  Manage Portfolio
                </Link>
              </Button>
            )}
            {isAdmin && (
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
                <Link variant="standard" href="/pricing?submit">
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
                        <p className="text-sm font-medium">
                          <Link
                            href={`/thelist/event/${event.slug}/${event.dates.edition}/call`}
                            className="hover:underline"
                          >
                            {event.name}
                          </Link>
                        </p>
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <p>{event.location.country}</p>-
                          <p> {getEventCategoryLabel(event.category)}</p>
                        </span>
                      </div>
                      <p className="whitespace-nowrap text-xs text-muted-foreground">
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
              className="w-full"
              onClick={() => router.push("/thelist")}
            >
              View All Updates
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
