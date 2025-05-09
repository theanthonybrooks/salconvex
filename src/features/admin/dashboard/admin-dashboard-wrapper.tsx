"use client";

import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { usePreloadedQuery } from "convex/react";

import { DataTable } from "@/components/data-table/data-table";
import { useAdminPreload } from "@/features/admin/admin-preload-context";
import { columns } from "@/features/events/components/events-data-table/columns";
import { cn } from "@/lib/utils";
import { useState } from "react";
// interface AdminDashboardWrapperProps {

// }

export function AdminDashboardWrapper() {
  const { preloadedEventData, preloadedSubmissionData } = useAdminPreload();
  const { preloadedUserData } = useConvexPreload();
  const userData = usePreloadedQuery(preloadedUserData);
  const userRole = userData?.user?.role;
  const isAdmin = userRole?.includes("admin") ?? false;

  const allEventsData = usePreloadedQuery(preloadedEventData);
  const subEventsData = usePreloadedQuery(preloadedSubmissionData);

  const [viewAll, setViewAll] = useState(true);

  const eventsData = (viewAll ? allEventsData : subEventsData) ?? [];
  const adminActions = {
    isAdmin,
    viewAll,
    setViewAll,
  };

  return (
    <>
      <div className="hidden max-h-full w-full px-10 py-10 lg:block">
        <DataTable
          columns={columns}
          data={eventsData}
          defaultVisibility={{
            category: viewAll ? true : false,
            dates_edition: viewAll ? true : false,
            type: false,
          }}
          adminActions={adminActions}
          tableType="events"
          pageType="dashboard"
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
            dates_edition: false,
          }}
          onRowSelect={(row) => {
            //TODO: make the preview open in new page? Or section below? Or modal? It just needs to have the event/oc data shown with a check mark for each overarching section and a spot for some admin notes and some buttons.
            console.log(row);
          }}
          adminActions={adminActions}
          tableType="events"
          className="mx-auto w-full max-w-[80dvw] overflow-x-auto sm:max-w-[90vw]"
          outerContainerClassName={cn("lg:hidden")}
        />
      </div>
    </>
  );
}
