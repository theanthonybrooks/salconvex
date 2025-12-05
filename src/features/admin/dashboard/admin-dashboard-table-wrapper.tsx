"use client";

import { TableTypes } from "@/types/tanstack-table";

import { useState } from "react";
import { useDashboard } from "@/app/(pages)/dashboard/_components/DashboardContext";
import { NewsletterMainPage } from "@/app/(pages)/dashboard/admin/_components/newsletter/newsletterMainPage";

import type { Id } from "~/convex/_generated/dataModel";
import { DataTable } from "@/components/data-table/DataTable";
import { ResponsiveDataTable } from "@/components/data-table/DataTableWrapper";
import { useAdminPreload } from "@/features/admin/admin-preload-context";
import { artistColumns } from "@/features/admin/dashboard/artist-columns";
import { newsletterColumns } from "@/features/admin/dashboard/newsletter-columns";
import { resourceColumns } from "@/features/admin/dashboard/resources-column";
import { socialColumns } from "@/features/admin/dashboard/socials-columns";
import { AdminToolbar } from "@/features/admin/dashboard/user-admin-toolbar";
import { userColumns } from "@/features/admin/dashboard/user-columns";
import { userAddOnColumns } from "@/features/admin/dashboard/userAddon-columns";
import { getEventColumns } from "@/features/events/components/events-data-table/event-columns";
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
  // const appsPage = page === "applications";
  const usersPage = page === "users";
  const artistsPage = page === "artists";
  const newsletterPage = page === "newsletter";
  const resourcesPage = page === "resources";
  const socialsPage = page === "socials";

  const usersData = useQuery(
    api.users.usersWithSubscriptions,
    usersPage ? {} : "skip",
  );
  const newsletterData = useQuery(
    api.newsletter.subscriber.getNewsletterSubscribers,
    newsletterPage ? {} : "skip",
  );

  const artistsData = useQuery(
    api.artists.artistQueries.getActiveArtists,
    artistsPage ? {} : "skip",
  );

  const resourcesData = useQuery(
    api.userAddOns.onlineEvents.getAllOnlineEvents,
    resourcesPage ? {} : "skip",
  );

  const eventRegistrations = useQuery(
    api.userAddOns.onlineEvents.getAllRegistrationsForEvent,
    resourcesPage && selectedRow
      ? { eventId: selectedRow as Id<"onlineEvents"> }
      : "skip",
  );

  const socialsEvents = useQuery(
    api.events.socials.getEventsForSocials,
    socialsPage ? {} : "skip",
  );

  return (
    <>
      {submissionsPage && (
        <>
          <div className="hidden max-h-full w-full px-10 pb-10 pt-7 lg:block">
            <h3 className="mb-3 text-xl">Submitted Events & Open Calls</h3>
            <DataTable
              columns={getEventColumns(isAdmin)}
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
              defaultSort={[{ id: `lastEditedAt`, desc: true }]}
              pageSize={50}
            />
          </div>
          <div className="flex flex-col items-center justify-center gap-4 py-7 lg:hidden">
            <DataTable
              columns={getEventColumns(isAdmin)}
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
              defaultSort={[{ id: `lastEditedAt`, desc: true }]}
            />
          </div>
        </>
      )}
      {resourcesPage && (
        <>
          <ResponsiveDataTable
            title="Online Events"
            description="View all of your online events"
            data={resourcesData?.events ?? []}
            columns={resourceColumns}
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
            defaultFilters={[{ id: `state`, value: ["published", "draft"] }]}
            defaultSort={[{ id: `startDate`, desc: true }]}
            tableType="resources"
            pageType="dashboard"
            pageSize={10}
            adminActions={adminActions}
          />
          {eventRegistrations && (
            <ResponsiveDataTable
              title="User Registrations"
              description="View user registrations for your events."
              data={eventRegistrations ?? []}
              columns={userAddOnColumns}
              defaultVisibility={{
                desktop: {
                  paid: false,
                  canceled: false,
                },
                mobile: {
                  paid: false,
                  canceled: false,
                  createdAt: false,
                },
              }}
              defaultFilters={[{ id: `canceled`, value: ["false"] }]}
              defaultSort={[{ id: `createdAt`, desc: true }]}
              tableType="userAddOns"
              pageType="dashboard"
              pageSize={10}
              adminActions={adminActions}
              className="pb-0 pt-0"
            />
          )}
        </>
      )}
      {newsletterPage && (
        <>
          <NewsletterMainPage />
          <ResponsiveDataTable
            title="Newsletter Subscriptions"
            description="View newsletter subscribers & their preferences"
            data={newsletterData?.subscribers ?? []}
            defaultFilters={[{ id: `active`, value: ["true"] }]}
            defaultSort={[{ id: `createdAt`, desc: true }]}
            columns={newsletterColumns}
            tableType="newsletter"
            pageType="dashboard"
            pageSize={{ desktop: 50, mobile: 10 }}
            adminActions={adminActions}
          />
        </>
      )}
      {usersPage && (
        <ResponsiveDataTable
          extraToolbar={
            <AdminToolbar
              toolbarData={{
                totalMonthly: usersData?.totalMonthly ?? 0,
                totalYearly: usersData?.totalYearly ?? 0,
                totalThisMonth: usersData?.totalThisMonth ?? 0,
                totalThisYear: usersData?.totalThisYear ?? 0,
                userCount: usersData?.users?.length ?? 0,
              }}
            />
          }
          title="Site Users"
          columns={userColumns}
          data={usersData?.users ?? []}
          defaultVisibility={{
            desktop: {
              role: isSidebarCollapsed,
              accountType: isSidebarCollapsed,
              instagram: false,
              website: false,
              organizationNames: false,
              canFeature: false,
            },
            mobile: {
              type: false,
              category: false,
              role: false,
              lastEditedAt: false,
              dates_edition: false,
            },
          }}
          defaultSort={[{ id: `createdAt`, desc: true }]}
          tableType="users"
          pageType="dashboard"
          pageSize={{ desktop: 50, mobile: 10 }}
          adminActions={adminActions}
          minimalView={{ desktop: !isSidebarCollapsed, mobile: true }}
          collapsedSidebar={isSidebarCollapsed}
        />
      )}
      {artistsPage && (
        <ResponsiveDataTable
          title="Artists"
          description="Actively subscribed artists & their links"
          columns={artistColumns}
          data={artistsData ?? []}
          adminActions={adminActions}
          tableType="artists"
          pageType="dashboard"
          collapsedSidebar={isSidebarCollapsed}
          defaultSort={[{ id: `createdAt`, desc: true }]}
          pageSize={50}
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
        />
      )}
      {socialsPage && (
        <ResponsiveDataTable
          title="Social Media Posts"
          description="Planned and posted open calls"
          columns={socialColumns}
          data={socialsEvents?.data ?? []}
          adminActions={adminActions}
          tableType="socials"
          pageType="dashboard"
          collapsedSidebar={isSidebarCollapsed}
          defaultSort={[
            // { id: "posted", desc: true },
            { id: "plannedDate", desc: false },
          ]}
          pageSize={50}
          defaultFilters={[]}
        />
      )}
    </>
  );
}
