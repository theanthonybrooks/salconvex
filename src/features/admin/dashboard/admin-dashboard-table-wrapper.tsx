"use client";

import { TableTypes } from "@/types/tanstack-table";

import { useState } from "react";
import { useDashboard } from "@/app/(pages)/dashboard/_components/dashboard-context";

import type { Id } from "~/convex/_generated/dataModel";
import { DataTable } from "@/components/data-table/data-table";
import { useAdminPreload } from "@/features/admin/admin-preload-context";
import {
  ArtistColumnProps,
  artistColumns,
} from "@/features/admin/dashboard/artist-columns";
import { extraColumns } from "@/features/admin/dashboard/extras-column";
import { newsletterColumns } from "@/features/admin/dashboard/newsletter-columns";
import { userColumns } from "@/features/admin/dashboard/user-columns";
import { userAddOnColumns } from "@/features/admin/dashboard/userAddon-columns";
import { applicationColumns } from "@/features/artists/applications/components/events-data-table/application-columns";
import { getColumns } from "@/features/events/components/events-data-table/columns";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { cn } from "@/helpers/utilsFns";

import { api } from "~/convex/_generated/api";
import { useQuery } from "convex-helpers/react/cache";
import { usePreloadedQuery } from "convex/react";

interface AdminDashboardTableWrapperProps {
  page: TableTypes;
}

export function AdminDashboardTableWrapper({
  page,
}: AdminDashboardTableWrapperProps) {
  // const [existingEvent, setExistingEvent] = useState<Doc<"events"> | null>(
  //   null,
  // );
  // const [existingOpenCall, setExistingOpenCall] =
  //   useState<Doc<"openCalls"> | null>(null);
  const { isSidebarCollapsed } = useDashboard();

  const { preloadedEventData } = useAdminPreload();
  const { preloadedUserData } = useConvexPreload();
  const [selectedRow, setSelectedRow] = useState<string | null>(null);
  const userData = usePreloadedQuery(preloadedUserData);
  const userRole = userData?.user?.role;
  const isAdmin = userRole?.includes("admin") ?? false;

  const allEventsData = usePreloadedQuery(preloadedEventData);
  // const subEventsData = usePreloadedQuery(preloadedSubmissionData);

  const eventsData = allEventsData ?? [];
  const adminActions = {
    isAdmin,
  };
  const submissionsPage = page === "events";
  const appsPage = page === "applications";
  const usersPage = page === "users";
  const artistsPage = page === "artists";
  const newsletterPage = page === "newsletter";
  const extrasPage = page === "extras";

  const usersData = useQuery(
    api.users.usersWithSubscriptions,
    usersPage ? {} : "skip",
  );
  const newsletterData = useQuery(
    api.newsletter.subscriber.getNewsletterSubscribers,
    newsletterPage ? {} : "skip",
  );
  const applicationData = useQuery(
    api.artists.applications.getArtistApplications2,
    appsPage ? {} : "skip",
  );

  const artistsData = useQuery(
    api.artists.artistQueries.getActiveArtists,
    artistsPage ? {} : "skip",
  );

  const extrasData = useQuery(
    api.userAddOns.onlineEvents.getAllOnlineEvents,
    extrasPage ? {} : "skip",
  );

  const eventRegistrations = useQuery(
    api.userAddOns.onlineEvents.getAllRegistrationsForEvent,
    extrasPage && selectedRow
      ? { eventId: selectedRow as Id<"onlineEvents"> }
      : "skip",
  );

  return (
    <>
      {submissionsPage && (
        <>
          <div className="hidden max-h-full w-full px-10 pb-10 pt-7 lg:block">
            <h3 className="mb-3 text-xl">Submitted Events & Open Calls</h3>
            <DataTable
              columns={getColumns(isAdmin)}
              data={eventsData}
              // columnVisibility={{
              //   category: true,
              // }}
              defaultVisibility={{
                category: isSidebarCollapsed,
                dates_edition: true,
                type: false,
                _id: false,
              }}
              adminActions={adminActions}
              tableType="events"
              pageType="dashboard"
              defaultSort={{ id: `lastEditedAt`, desc: true }}
              pageSize={50}
            />
          </div>
          <div className="flex flex-col items-center justify-center gap-4 py-7 lg:hidden">
            <DataTable
              columns={getColumns(isAdmin)}
              data={eventsData}
              defaultVisibility={{
                type: false,
                category: false,
                lastEditedAt: false,
                dates_edition: false,
                _id: false,
              }}
              adminActions={adminActions}
              tableType="events"
              pageType="dashboard"
              className="mx-auto w-full max-w-[80dvw] overflow-x-auto sm:max-w-[90vw]"
              outerContainerClassName={cn("lg:hidden")}
              defaultSort={{ id: `lastEditedAt`, desc: true }}
            />
          </div>
        </>
      )}
      {extrasPage && (
        <>
          <div className="hidden max-h-full w-full px-10 pb-10 pt-7 lg:block">
            <h3 className="mb-3 text-xl">Online Events</h3>
            <DataTable
              columns={extraColumns}
              data={extrasData?.events ?? []}
              defaultVisibility={{
                description: false,
                terms: false,
                requirements: false,
                location: false,
                updatedAt: false,
                createdAt: false,
                img: false,
              }}
              onRowSelect={(row) => setSelectedRow(row?._id ?? null)}
              adminActions={adminActions}
              tableType="extras"
              pageType="dashboard"
              defaultSort={{ id: `startDate`, desc: true }}
              pageSize={10}
            />
            {eventRegistrations && (
              <DataTable
                columns={userAddOnColumns}
                data={eventRegistrations ?? []}
                // defaultVisibility={{

                // }}

                adminActions={adminActions}
                tableType="userAddOns"
                pageType="dashboard"
                pageSize={10}
              />
            )}
          </div>
          <div className="flex flex-col items-center justify-center gap-4 py-7 lg:hidden">
            <DataTable
              columns={extraColumns}
              data={extrasData?.events ?? []}
              defaultVisibility={{
                description: false,
                terms: false,
                requirements: false,
                location: false,
                updatedAt: false,
                createdAt: false,
                img: false,
              }}
              onRowSelect={(row) => console.log(row?._id)}
              defaultSort={{ id: `startDate`, desc: true }}
              adminActions={adminActions}
              tableType="extras"
              pageType="dashboard"
              className="mx-auto w-full max-w-[80dvw] overflow-x-auto sm:max-w-[90vw]"
              outerContainerClassName={cn("lg:hidden")}
            />
            <p className={cn("h-screen")}>{selectedRow}</p>
          </div>
        </>
      )}
      {newsletterPage && (
        <>
          <div className="hidden max-h-full w-full px-10 pb-10 pt-7 lg:block">
            <h3 className="mb-3 text-xl">Newsletter Subscriptions</h3>
            <DataTable
              columns={newsletterColumns}
              data={newsletterData?.subscribers ?? []}
              defaultVisibility={
                {
                  // category: viewAll ? true : false,
                  // dates_edition: viewAll ? true : false,
                  // type: false,
                  // role: false,
                }
              }
              adminActions={adminActions}
              tableType="newsletter"
              pageType="dashboard"
              defaultSort={{ id: `createdAt`, desc: true }}
              pageSize={50}
            />
          </div>
          <div className="flex flex-col items-center justify-center gap-4 py-7 lg:hidden">
            <DataTable
              columns={newsletterColumns}
              data={newsletterData?.subscribers ?? []}
              defaultVisibility={
                {
                  // type: false,
                  // category: false,
                  // role: false,
                  // lastEditedAt: false,
                  // dates_edition: false,
                }
              }
              defaultSort={{ id: `createdAt`, desc: true }}
              adminActions={adminActions}
              tableType="newsletter"
              pageType="dashboard"
              className="mx-auto w-full max-w-[80dvw] overflow-x-auto sm:max-w-[90vw]"
              outerContainerClassName={cn("lg:hidden")}
            />
          </div>
        </>
      )}
      {usersPage && (
        <>
          <div className="hidden max-h-full w-full px-10 pb-10 pt-7 lg:block">
            <h3 className="mb-3 text-xl">Site Users</h3>
            <DataTable
              columns={userColumns}
              data={usersData?.users ?? []}
              defaultVisibility={{
                role: isSidebarCollapsed,
                accountType: isSidebarCollapsed,
                instagram: false,
                website: false,
                organizationNames: false,
                canFeature: false,
              }}
              toolbarData={{
                totalMonthly: usersData?.totalMonthly ?? 0,
                totalYearly: usersData?.totalYearly ?? 0,
                totalThisMonth: usersData?.totalThisMonth ?? 0,
                totalThisYear: usersData?.totalThisYear ?? 0,
                userCount: usersData?.users?.length ?? 0,
              }}
              adminActions={adminActions}
              tableType="users"
              pageType="dashboard"
              minimalView={!isSidebarCollapsed}
              collapsedSidebar={isSidebarCollapsed}
              defaultSort={{ id: `createdAt`, desc: true }}
              pageSize={50}
            />
          </div>
          <div className="flex flex-col items-center justify-center gap-4 py-7 lg:hidden">
            <DataTable
              columns={userColumns}
              data={usersData?.users ?? []}
              defaultVisibility={{
                type: false,
                category: false,
                role: false,
                lastEditedAt: false,
                dates_edition: false,
              }}
              toolbarData={{
                totalMonthly: usersData?.totalMonthly ?? 0,
                totalYearly: usersData?.totalYearly ?? 0,
                totalThisMonth: usersData?.totalThisMonth ?? 0,
                totalThisYear: usersData?.totalThisYear ?? 0,
                userCount: usersData?.users?.length ?? 0,
              }}
              defaultSort={{ id: `createdAt`, desc: true }}
              onRowSelect={(row) => {
                console.log(row);
                // setExistingEvent(row.getValue("event"));
                // setExistingOpenCall(row.getValue("openCall"));
              }}
              minimalView
              collapsedSidebar={isSidebarCollapsed}
              adminActions={adminActions}
              tableType="users"
              pageType="dashboard"
              className="mx-auto w-full max-w-[80dvw] overflow-x-auto sm:max-w-[90vw]"
              outerContainerClassName={cn("lg:hidden")}
            />
          </div>
        </>
      )}
      {artistsPage && (
        <>
          <div className="hidden max-h-full w-full px-10 pb-10 pt-7 lg:block">
            <h3 className="mb-3 text-xl">Artists</h3>
            <DataTable
              columns={artistColumns}
              data={(artistsData ?? []) as ArtistColumnProps[]}
              defaultFilters={[
                {
                  id: `canFeature`,
                  value: ["true"],
                },
                {
                  id: `instagram`,
                  value: ["true"],
                },
                { id: `feature`, value: ["true", "none"] },
              ]}
              toolbarData={{
                userCount: artistsData?.length ?? 0,
              }}
              adminActions={adminActions}
              tableType="artists"
              pageType="dashboard"
              collapsedSidebar={isSidebarCollapsed}
              defaultSort={{ id: `createdAt`, desc: true }}
              pageSize={50}
            />
          </div>
          <div className="flex flex-col items-center justify-center gap-4 py-7 lg:hidden">
            <DataTable
              columns={artistColumns}
              data={(artistsData ?? []) as ArtistColumnProps[]}
              defaultFilters={[
                {
                  id: `canFeature`,
                  value: ["true"],
                },
                {
                  id: `instagram`,
                  value: ["true"],
                },
                { id: `feature`, value: ["true", "none"] },
              ]}
              defaultSort={{ id: `createdAt`, desc: true }}
              adminActions={adminActions}
              tableType="artists"
              pageType="dashboard"
              collapsedSidebar={isSidebarCollapsed}
              className="mx-auto w-full max-w-[80dvw] overflow-x-auto sm:max-w-[90vw]"
              outerContainerClassName={cn("lg:hidden")}
            />
          </div>
        </>
      )}
      {appsPage && (
        <>
          <div className="hidden max-h-full w-full px-10 pb-10 pt-7 lg:block">
            <h3 className="mb-3 text-xl">Applications</h3>
            <DataTable
              columns={applicationColumns}
              data={applicationData ?? []}
              defaultVisibility={{
                dates_edition: false,
                manualApplied: false,
                productionEnd: false,
                eventEnd: false,
              }}
              // onRowSelect={(row) => {
              //   console.log(row);
              // }}
              adminActions={adminActions}
              tableType="applications"
              pageType="dashboard"
            />
          </div>
          <div className="flex flex-col items-center justify-center gap-4 py-7 lg:hidden">
            <DataTable
              columns={applicationColumns}
              data={applicationData ?? []}
              defaultVisibility={{
                dates_edition: false,
                manualApplied: false,
                productionEnd: false,
                eventEnd: false,
              }}
              // onRowSelect={(row) => {
              //   console.log(row);
              // }}
              adminActions={adminActions}
              tableType="applications"
              pageType="dashboard"
              className="mx-auto w-full max-w-[80dvw] overflow-x-auto sm:max-w-[90vw]"
              outerContainerClassName={cn("lg:hidden")}
            />
          </div>
        </>
      )}
    </>
  );
}
