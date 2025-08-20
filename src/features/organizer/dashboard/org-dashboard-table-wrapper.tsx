"use client";

import { DataTable } from "@/components/data-table/data-table";
import { orgColumns } from "@/features/organizers/dashboard/data-tables/organizer-columns";
import { cn } from "@/lib/utils";
import { useQuery } from "convex-helpers/react/cache";
import { api } from "~/convex/_generated/api";

export function OrganizerDashboardTableWrapper() {
  const results = useQuery(api.events.event.getUserEvents);

  const orgEventsData = results ?? [];

  return (
    <>
      <div className="hidden max-h-full w-full px-10 py-10 lg:block">
        <DataTable
          columns={orgColumns}
          data={orgEventsData}
          defaultVisibility={{
            category: true,
            dates_edition: true,
            type: false,
          }}
          tableType="orgEvents"
          pageType="dashboard"
          defaultSort={{ id: "lastEditedAt", desc: true }}
        />
      </div>
      <div className="flex flex-col items-center justify-center gap-4 py-7 lg:hidden">
        <DataTable
          columns={orgColumns}
          data={orgEventsData}
          defaultVisibility={{
            type: false,
            category: false,
            lastEditedAt: false,
            dates_edition: false,
          }}
          tableType="orgEvents"
          pageType="dashboard"
          className="mx-auto w-full max-w-[80dvw] overflow-x-auto sm:max-w-[90vw]"
          outerContainerClassName={cn("lg:hidden")}
          defaultSort={{ id: "lastEditedAt", desc: true }}
        />
      </div>
    </>
  );
}
