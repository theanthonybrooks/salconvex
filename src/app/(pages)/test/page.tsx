"use client";

import { columns } from "@/features/artists/applications/data-table/columns";
import { DataTable } from "@/features/artists/applications/data-table/data-table";
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
          defaultVisibility={{ eventCategory: false }}
          adminActions={adminActions}
        />
      </div>
      <div className="mx-auto max-w-7xl py-10 lg:hidden">
        <DataTable
          columns={columns}
          data={eventsData}
          defaultVisibility={{
            eventCategory: false,
            lastEditedAt: false,
          }}
          onRowSelect={(row) => {
            console.log(row);
          }}
        />
      </div>
    </>
  );
}
