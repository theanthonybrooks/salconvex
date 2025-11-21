"use client";

import { useDashboard } from "@/app/(pages)/dashboard/_components/DashboardContext";

import { ResponsiveDataTable } from "@/components/data-table/DataTableWrapper";
import { orgColumns } from "@/features/organizers/dashboard/data-tables/organizer-columns";

import { api } from "~/convex/_generated/api";
import { useQuery } from "convex-helpers/react/cache";

export function OrganizerDashboardTableWrapper() {
  const { isSidebarCollapsed } = useDashboard();
  const results = useQuery(api.events.event.getUserEvents);

  const orgEventsData = results ?? [];

  return (
    <ResponsiveDataTable
      title="My Submissions"
      description="View/track your events, projects, & open calls"
      columns={orgColumns}
      data={orgEventsData}
      defaultVisibility={{
        desktop: {
          category: true,
          dates_edition: true,
          type: false,
          lastEditedAt: isSidebarCollapsed,
        },
        mobile: {
          type: false,
          category: false,
          lastEditedAt: false,
          dates_edition: false,
        },
      }}
      tableType="orgEvents"
      pageType="dashboard"
      minimalView={!isSidebarCollapsed}
      defaultSort={{ id: "lastEditedAt", desc: true }}
      pageSize={{ desktop: 50 }}
    />
  );
}
