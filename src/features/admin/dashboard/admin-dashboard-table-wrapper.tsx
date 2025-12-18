"use client";

import { TableTypes } from "@/types/tanstack-table";

import { useState } from "react";
import { useDashboard } from "@/app/(pages)/dashboard/_components/DashboardContext";

import { X } from "lucide-react";

import type { Id } from "~/convex/_generated/dataModel";
import { DataTable } from "@/components/data-table/DataTable";
import { ResponsiveDataTable } from "@/components/data-table/DataTableWrapper";
import { Card } from "@/components/ui/card";
import { Link } from "@/components/ui/custom-link";
import { useAdminPreload } from "@/features/admin/admin-preload-context";
import SACToolbar from "@/features/admin/components/sac-toolbar";
import { artistColumns } from "@/features/admin/dashboard/artist-columns";
import { resourceColumns } from "@/features/admin/dashboard/resources-column";
import { sacColumns } from "@/features/admin/dashboard/sac-columns";
import { socialColumns } from "@/features/admin/dashboard/socials-columns";
import { supportColumns } from "@/features/admin/dashboard/support-columns";
import { AdminToolbar } from "@/features/admin/dashboard/user-admin-toolbar";
import { userColumns } from "@/features/admin/dashboard/user-columns";
import { userAddOnColumns } from "@/features/admin/dashboard/userAddon-columns";
import { getEventColumns } from "@/features/events/components/events-data-table/event-columns";
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
  const [selectedRow, setSelectedRow] = useState<string | null>(null);

  const allEventsData = usePreloadedQuery(preloadedEventData);

  const eventsData = allEventsData ?? [];
  const adminActions = {
    isAdmin: true,
  };
  const submissionsPage = page === "events";
  // const appsPage = page === "applications";
  const usersPage = page === "users";
  const supportPage = page === "support";
  const artistsPage = page === "artists";
  const resourcesPage = page === "resources";
  const socialsPage = page === "socials";
  const sacPage = page === "sac";

  const usersData = useQuery(
    api.users.usersWithSubscriptions,
    usersPage ? {} : "skip",
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

  const supportTickets = useQuery(
    api.support.tickets.getSupportTickets,
    supportPage ? {} : "skip",
  );

  const supportTicketData = useQuery(
    api.support.tickets.getSupportTicketStatus,
    supportPage && selectedRow
      ? { ticketId: selectedRow as Id<"support"> }
      : "skip",
  );

  const sacData = useQuery(api.sac.sacData.getSacData, sacPage ? {} : "skip");

  return (
    <>
      {submissionsPage && (
        <>
          <div className="hidden max-h-full w-full px-10 pb-10 pt-7 lg:block">
            <h3 className="mb-3 text-xl">Submitted Events & Open Calls</h3>
            <DataTable
              columns={getEventColumns(true)}
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
              columns={getEventColumns(true)}
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
          defaultVisibility={{
            id: false,
          }}
          pageSize={50}
          defaultFilters={[]}
        />
      )}
      {supportPage && (
        <>
          <ResponsiveDataTable
            title="Support Tickets"
            description="Current & Archived Support Tickets"
            columns={supportColumns}
            data={supportTickets ?? []}
            adminActions={adminActions}
            tableType="support"
            pageType="dashboard"
            collapsedSidebar={isSidebarCollapsed}
            defaultSort={[{ id: "status", desc: false }]}
            onRowSelect={(row) => setSelectedRow(row?._id ?? null)}
            pageSize={50}
            defaultVisibility={{
              desktop: {
                name: isSidebarCollapsed,
                updatedAt: isSidebarCollapsed,
              },
            }}
            defaultFilters={[]}
          />
          {supportTicketData && (
            <div className="px-10">
              <Card className="relative my-10 flex flex-col gap-2 border-1.5 p-4">
                <X
                  className="absolute right-4 top-4 cursor-pointer"
                  onClick={() => setSelectedRow(null)}
                />
                <h3>Support Ticket #{supportTicketData.ticketNumber}</h3>
                <p className="text-sm">
                  <strong>Name:</strong> {supportTicketData.name}
                </p>
                <span className="flex items-center gap-2 text-sm">
                  <strong>Email: </strong>
                  <Link
                    href={`mailto:${supportTicketData.email}?subject=Ticket%20%23${supportTicketData.ticketNumber}`}
                  >
                    {supportTicketData.email}
                  </Link>
                </span>
                <p className="text-sm">
                  <strong>Message:</strong> {supportTicketData.message}
                </p>
              </Card>
            </div>
          )}
        </>
      )}
      {sacPage && (
        <ResponsiveDataTable
          title="Street Art Calls Data"
          extraToolbar={<SACToolbar />}
          columns={sacColumns}
          data={sacData ?? []}
          adminActions={adminActions}
          tableType="sac"
          pageType="dashboard"
          defaultSort={[{ id: "updatedAt", desc: true }]}
          defaultVisibility={{}}
          defaultFilters={[{ id: "checked", value: ["false"] }]}
        />
      )}
    </>
  );
}
