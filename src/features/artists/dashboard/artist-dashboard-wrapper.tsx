"use client";

import { DataTable } from "@/components/data-table/data-table";
import { applicationColumns } from "@/features/artists/applications/components/events-data-table/application-columns";
import { cn } from "@/lib/utils";
import { TableTypes } from "@/types/tanstack-table";
import { useQuery } from "convex-helpers/react/cache";
import { api } from "~/convex/_generated/api";
interface ArtistDashboardTableWrapperProps {
  page: TableTypes;
}

export function ArtistDashboardTableWrapper({
  page,
}: ArtistDashboardTableWrapperProps) {
  // const { preloadedUserData } = useConvexPreload();
  // const userData = usePreloadedQuery(preloadedUserData);

  const appsPage = page === "applications";
  const applicationData = useQuery(
    api.artists.applications.getArtistApplications2,
  );
  console.log(applicationData);

  return (
    <>
      {appsPage && (
        <>
          <div className="hidden max-h-full w-full px-10 py-10 lg:block">
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
