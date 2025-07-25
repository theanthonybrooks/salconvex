"use client";

import { DataTable } from "@/components/data-table/data-table";
import { applicationColumns } from "@/features/artists/applications/components/events-data-table/application-columns";
import { bookmarkColumns } from "@/features/artists/dashboard/data-tables/bookmark-columns";
import { hiddenColumns } from "@/features/artists/dashboard/data-tables/hidden-columns";
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
  const bookmarksPage = page === "bookmarks";
  const hiddenPage = page === "hidden";
  const applicationData = useQuery(
    api.artists.applications.getArtistApplications2,
    appsPage ? {} : "skip",
  );
  const bookmarkData = useQuery(
    api.artists.listActions.getBookmarkedEventsWithDetails,
    bookmarksPage ? {} : "skip",
  );
  const hiddenData = useQuery(
    api.artists.listActions.getHiddenEvents,
    hiddenPage ? {} : "skip",
  );

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
              defaultSort={{ id: `applicationTime`, desc: true }}
              pageSize={50}
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
              defaultSort={{ id: `applicationTime`, desc: true }}
            />
          </div>
        </>
      )}
      {bookmarksPage && (
        <>
          <div className="hidden max-h-full w-full px-10 py-10 lg:block">
            <DataTable
              columns={bookmarkColumns}
              data={bookmarkData ?? []}
              defaultVisibility={{
                edition: false,
                prodEnd: false,
                eventStart: false,
                eventEnd: false,
              }}
              // onRowSelect={(row) => {
              //   console.log(row);
              // }}
              tableType="bookmarks"
              pageType="dashboard"
              defaultSort={{ id: "deadline", desc: true }}
              pageSize={50}
            />
          </div>
          <div className="flex flex-col items-center justify-center gap-4 py-7 lg:hidden">
            <DataTable
              columns={bookmarkColumns}
              data={bookmarkData ?? []}
              defaultVisibility={{
                edition: false,
                prodEnd: false,
                eventEnd: false,
                eventStart: false,
              }}
              // onRowSelect={(row) => {
              //   console.log(row);
              // }}
              tableType="bookmarks"
              pageType="dashboard"
              className="mx-auto w-full max-w-[80dvw] overflow-x-auto sm:max-w-[90vw]"
              outerContainerClassName={cn("lg:hidden")}
              defaultSort={{ id: "deadline", desc: true }}
            />
          </div>
        </>
      )}
      {hiddenPage && (
        <>
          <div className="hidden max-h-full w-full px-10 py-10 lg:block">
            <DataTable
              columns={hiddenColumns}
              data={hiddenData ?? []}
              defaultVisibility={{
                edition: false,
                eventEnd: false,
              }}
              // onRowSelect={(row) => {
              //   console.log(row);
              // }}
              tableType="hidden"
              pageType="dashboard"
              defaultSort={{ id: "name", desc: false }}
              pageSize={50}
            />
          </div>
          <div className="flex flex-col items-center justify-center gap-4 py-7 lg:hidden">
            <DataTable
              columns={hiddenColumns}
              data={hiddenData ?? []}
              defaultVisibility={{
                edition: false,
                eventEnd: false,
              }}
              // onRowSelect={(row) => {
              //   console.log(row);
              // }}
              tableType="hidden"
              pageType="dashboard"
              className="mx-auto w-full max-w-[80dvw] overflow-x-auto sm:max-w-[90vw]"
              outerContainerClassName={cn("lg:hidden")}
              defaultSort={{ id: "name", desc: false }}
            />
          </div>
        </>
      )}
    </>
  );
}
