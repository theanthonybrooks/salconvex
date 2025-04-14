"use client";

import { columns } from "@/features/artists/applications/data-table/columns";
import { DataTable } from "@/features/artists/applications/data-table/data-table";
// import { columns } from "@/features/events/components/events-data-table/columns";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { api } from "~/convex/_generated/api";

export default function DemoPage() {
  const data = useQuery(api.events.event.getAllEvents, {});
  const events = data ?? [];

  return (
    <>
      <div className="mx-auto hidden max-w-7xl py-10 lg:block">
        <DataTable
          columns={columns}
          data={events}
          defaultVisibility={{ eventCategory: false }}
        />
      </div>
      <div className="mx-auto max-w-7xl py-10 lg:hidden">
        <DataTable
          columns={columns}
          data={events}
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
