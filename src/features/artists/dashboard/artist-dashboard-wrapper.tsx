"use client";

import { TableTypes } from "@/types/tanstack-table";

import { useDashboard } from "@/app/(pages)/dashboard/_components/DashboardContext";

import { ResponsiveDataTable } from "@/components/data-table/DataTableWrapper";
import { applicationColumns } from "@/features/artists/applications/components/events-data-table/application-columns";
import { bookmarkColumns } from "@/features/artists/dashboard/data-tables/bookmark-columns";
import { hiddenColumns } from "@/features/artists/dashboard/data-tables/hidden-columns";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";

import { api } from "~/convex/_generated/api";
import { useQuery } from "convex-helpers/react/cache";
import { usePreloadedQuery } from "convex/react";

interface ArtistDashboardTableWrapperProps {
  page: TableTypes;
}

export function ArtistDashboardTableWrapper({
  page,
}: ArtistDashboardTableWrapperProps) {
  const { isSidebarCollapsed } = useDashboard();
  const { preloadedUserData, preloadedSubStatus } = useConvexPreload();
  const userData = usePreloadedQuery(preloadedUserData);
  const subData = usePreloadedQuery(preloadedSubStatus);
  const hasActiveSubscription = subData?.hasActiveSubscription ?? false;
  const user = userData?.user;
  const isAdmin = user?.role?.includes("admin");
  const isArtist =
    (user?.accountType?.includes("artist") && hasActiveSubscription) || isAdmin;

  const appsPage = page === "applications";
  const bookmarksPage = page === "bookmarks";
  const hiddenPage = page === "hidden";
  const applicationData = useQuery(
    api.artists.applications.getArtistApplications2,
    appsPage && isArtist ? {} : "skip",
  );
  const bookmarkData = useQuery(
    api.artists.listActions.getBookmarkedEventsWithDetails,
    bookmarksPage && isArtist ? {} : "skip",
  );
  const hiddenData = useQuery(
    api.artists.listActions.getHiddenEvents,
    hiddenPage && isArtist ? {} : "skip",
  );

  return (
    <>
      {appsPage && (
        <ResponsiveDataTable
          title="My Applications"
          description="View/track your applications"
          data={applicationData ?? []}
          columns={applicationColumns}
          defaultVisibility={{
            dates_edition: false,
            manualApplied: false,
            productionEnd: false,
            eventEnd: false,
          }}
          minimalView={!isSidebarCollapsed}
          tableType="applications"
          pageType="dashboard"
          defaultSort={{ id: `applicationTime`, desc: true }}
          pageSize={{ desktop: 50 }}
        />
      )}
      {bookmarksPage && (
        <ResponsiveDataTable
          title="My Bookmarks"
          description="View/track your bookmarks"
          data={bookmarkData ?? []}
          columns={bookmarkColumns}
          defaultVisibility={{
            edition: false,
            prodEnd: false,
            eventStart: false,
            eventEnd: false,
          }}
          minimalView={!isSidebarCollapsed}
          tableType="bookmarks"
          pageType="dashboard"
          defaultSort={{ id: "deadline", desc: false }}
          pageSize={{ desktop: 50 }}
        />
      )}
      {hiddenPage && (
        <ResponsiveDataTable
          title="Things I've Hidden"
          description="View/track your hidden events & projects"
          columns={hiddenColumns}
          data={hiddenData ?? []}
          minimalView={!isSidebarCollapsed}
          tableType="hidden"
          pageType="dashboard"
          defaultSort={{ id: "name", desc: false }}
          pageSize={{ desktop: 50 }}
          defaultVisibility={{
            mobile: {
              edition: false,
            },
          }}
        />
      )}
    </>
  );
}
