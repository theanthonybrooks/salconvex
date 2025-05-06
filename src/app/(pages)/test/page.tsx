"use client";

import { DataTable } from "@/components/data-table/data-table";
import { columns } from "@/features/events/components/events-data-table/columns";
import { cn } from "@/lib/utils";
// import { columns } from "@/features/events/components/events-data-table/columns";
import { makeUseQueryWithStatus } from "convex-helpers/react";
import { useQueries, useQuery } from "convex-helpers/react/cache/hooks";
import { useState } from "react";
import { api } from "~/convex/_generated/api";

export default function DemoPage() {
  const isAdmin = useQuery(api.users.isAdmin, {}) ?? false;
  const useQueryWithStatus = makeUseQueryWithStatus(useQueries);
  const [viewAll, setViewAll] = useState(true);
  const { data: subEventsData, isPending: subEventsPending } =
    useQueryWithStatus(
      api.events.event.getSubmittedEvents,
      !viewAll ? {} : "skip",
    );
  const { data: allEventsData, isPending: allEventsPending } =
    useQueryWithStatus(api.events.event.getAllEvents, viewAll ? {} : "skip");

  const eventsData = (viewAll ? allEventsData : subEventsData) ?? [];

  console.log(subEventsPending, allEventsPending);

  if (
    !subEventsPending &&
    !allEventsPending &&
    ((!viewAll && !subEventsData) || (viewAll && !allEventsData))
  ) {
    return <p>No events found</p>;
  }

  const adminActions = {
    isAdmin,
    viewAll,
    setViewAll,
  };
  return (
    <>
      <div className="mx-auto hidden max-w-7xl py-10 lg:block">
        <DataTable
          columns={columns}
          data={eventsData}
          defaultVisibility={{ category: false }}
          adminActions={adminActions}
          tableType="events"
        />
      </div>
      <div className="flex flex-col items-center justify-center gap-4 py-7 lg:hidden">
        <DataTable
          columns={columns}
          data={eventsData}
          defaultVisibility={{
            type: false,
            category: false,
            lastEditedAt: false,
          }}
          onRowSelect={(row) => {
            console.log(row);
          }}
          adminActions={adminActions}
          tableType="events"
          className="mx-auto w-full max-w-[74dvw] overflow-x-auto sm:max-w-[90vw]"
          containerClassName={cn("lg:hidden")}
        />
      </div>
    </>
  );
}
