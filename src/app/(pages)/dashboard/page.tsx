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
import { makeUseQueryWithStatus } from "convex-helpers/react";
import { useQueries } from "convex-helpers/react/cache";
import { usePreloadedQuery, useQuery } from "convex/react";
import {
  EyeOff,
  LucideCalendarPlus2,
  LucideCircleCheck,
  LucideCircleCheckBig,
  LucideCircleEqual,
  LucideCircleFadingPlus,
  LucideCircleOff,
  LucideClipboardList,
  LucideFolderHeart,
  LucideScrollText,
  TrendingUp,
} from "lucide-react";
import { FaGear, FaRegBookmark } from "react-icons/fa6";
import { PiPiggyBank } from "react-icons/pi";
import { api } from "~/convex/_generated/api";

export default function Dashboard() {
  const { preloadedUserData } = useConvexPreload();
  const userData = usePreloadedQuery(preloadedUserData);
  const useQueryWithStatus = makeUseQueryWithStatus(useQueries);
  // const userId = userData?.userId ?? "guest";
  const user = userData?.user || null;
  const accountType = user?.accountType;
  const role = user?.role;
  const isAdmin = role?.includes("admin");
  const isArtist = accountType?.includes("artist");
  const isOrganizer = accountType?.includes("organizer");

  const { data: allEventsData } = useQueryWithStatus(
    api.events.event.getTotalNumberOfEvents,
    isAdmin ? {} : "skip",
  );

  const { data: submittedEventsData } = useQueryWithStatus(
    api.events.event.getSubmittedEvents,
    isAdmin ? {} : "skip",
  );

  const totalEvents = allEventsData?.totalEvents ?? 0;
  const activeEvents = allEventsData?.activeEvents ?? 0;
  const archivedEvents = allEventsData?.archivedEvents ?? 0;
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    New Submissions
                  </CardTitle>
                  <LucideCircleFadingPlus className="size-4 text-muted-foreground" />
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
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Events (incl. pending/drafts)
                  </CardTitle>
                  <LucideCircleEqual className="size-4 text-muted-foreground" />
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
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Events
                  </CardTitle>
                  <LucideCircleCheck className="size-4 text-muted-foreground" />
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
              <Card>
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
              </Card>
            </div>
          </div>
        )}
        {isArtist && (
          <div className="col-span-full flex flex-col gap-4">
            <h3 className="underline underline-offset-2">Artist Dashboard:</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
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
                    <Link
                      variant="subtleUnderline"
                      href="/dashboard/admin/applications"
                    >
                      <p className="mt-1 text-xs">View all</p>
                    </Link>
                  </div>
                </CardContent>
              </Card>
              <Card>
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
                  <Link
                    variant="subtleUnderline"
                    href="/dashboard/apps/accepted"
                  >
                    <p className="mt-1 text-xs">View all</p>
                  </Link>
                </CardContent>
              </Card>
              {/* <Card>
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
                    href="/dashboard/apps/bookmarked"
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
                    href="/dashboard/apps/rejected"
                  >
                    <p className="mt-1 text-xs">View all</p>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
        {/* <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <Activity className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89%</div>
            <p className="mt-1 text-xs">+5% this week</p>
          </CardContent>
        </Card> */}
      </div>

      {/* Featured Section */}
      {/* <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Project Growth</CardTitle>
            <CardDescription>
              Your project creation and completion rate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-[200px] items-end gap-2">
              {[40, 25, 45, 30, 60, 75, 65, 45, 50, 65, 70, 80].map(
                (height, i) => (
                  <div
                    key={i}
                    className="w-full rounded-md bg-primary/10 transition-colors hover:bg-primary/20"
                    style={{ height: `${height}%` }}
                  />
                ),
              )}
            </div>
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
              <span>Jul</span>
              <span>Aug</span>
              <span>Sep</span>
              <span>Oct</span>
              <span>Nov</span>
              <span>Dec</span>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Achievements</CardTitle>
            <CardDescription>Latest milestones reached</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-primary/10 p-2">
                  <Star className="size-4 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">First 1000 Users</p>
                  <Progress value={100} />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-primary/10 p-2">
                  <TrendingUp className="size-4 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">50 Projects Created</p>
                  <Progress value={75} />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-primary/10 p-2">
                  <Zap className="size-4 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Premium Features</p>
                  <Progress value={45} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div> */}

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              asChild
              variant="outline"
              className="w-full justify-start gap-2"
            >
              <Link variant="standard" href="/thelist">
                <LucideScrollText className="size-4" />
                Go to The List
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-start gap-2"
            >
              <Link variant="standard" href="/dashboard/account/billing">
                <PiPiggyBank className="size-4" />
                Manage Billing
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-start gap-2"
            >
              <Link variant="standard" href="/dashboard/account/settings">
                <FaGear className="size-4" />
                Account Settings
              </Link>
            </Button>

            {/* TODO: add this logic once I've gotten the application system up and there's a reason for users to upload a portfolio and related files */}
            {isAdmin && isArtist && (
              <Button
                asChild
                variant="outline"
                className="w-full justify-start gap-2"
              >
                <Link variant="standard" href="/dashboard/projects">
                  <LucideFolderHeart className="size-4" />
                  Manage Portfolio
                </Link>
              </Button>
            )}
            {isAdmin && (
              <Button
                asChild
                variant="outline"
                className="w-full justify-start gap-2"
              >
                <Link variant="standard" href="/dashboard/admin/analytics">
                  <TrendingUp className="size-4" />
                  View Analytics
                </Link>
              </Button>
            )}

            {isOrganizer && (
              <Button
                asChild
                variant="outline"
                className="w-full justify-start gap-2"
              >
                <Link variant="standard" href="/pricing#plans">
                  <LucideCalendarPlus2 className="size-4" />
                  Submit Event/Open Call
                </Link>
              </Button>
            )}
            {/* {isOrganizer && (
              <Button
                asChild
                variant="outline"
                className="w-full justify-start gap-2"
              >
                <Link variant="standard" href="/dashboard/account/settings">
                  <Users className="size-4" />
                  Invite Judges
                </Link>
              </Button>
            )} */}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Latest Updates</CardTitle>
            <CardDescription>Recent changes and notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  title: "New Feature Released",
                  description:
                    "Enhanced project analytics and reporting tools are now available.",
                  time: "2 hours ago",
                },
                {
                  title: "System Update",
                  description:
                    "Performance improvements and bug fixes deployed.",
                  time: "5 hours ago",
                },
                {
                  title: "Community Milestone",
                  description:
                    "Over 1,000 projects created using Nextjs Starter Kit!",
                  time: "1 day ago",
                },
              ].map((update, i) => (
                <div key={i} className="flex justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">{update.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {update.description}
                    </p>
                  </div>
                  <p className="whitespace-nowrap text-xs text-muted-foreground">
                    {update.time}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full">
              View All Updates
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
