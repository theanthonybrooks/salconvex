"use client";

import { ChartAreaInteractive } from "@/components/ui/charts/area-chart-interactive";
import WorldMapComponent from "@/components/ui/map/map-component";
import ThisweekRecapPost from "@/features/events/thisweek-recap-post";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { makeUseQueryWithStatus } from "convex-helpers/react";
import { usePreloadedQuery, useQueries } from "convex/react";

import { usePathname, useRouter } from "next/navigation";
import { api } from "~/convex/_generated/api";

export default function AdminScreen() {
  const pathname = usePathname();
  const router = useRouter();
  const { preloadedUserData } = useConvexPreload();
  const userData = usePreloadedQuery(preloadedUserData);
  const isAdmin = userData?.user?.role?.includes("admin");
  const useQueryWithStatus = makeUseQueryWithStatus(useQueries);

  const { data: applicationData, isPending } = useQueryWithStatus(
    api.organizer.applications.getAllApplications,
    isAdmin ? {} : "skip",
  );

  if (!isAdmin) router.push("/thelist");

  // Create booleans based on the URL.
  switch (pathname) {
    case "/admin/thisweek":
      return <ThisweekRecapPost source="thisweek" />;
    case "/admin/nextweek":
      return <ThisweekRecapPost source="nextweek" />;
    case "/admin/map":
      return <WorldMapComponent />;
    case "/admin/applications":
      return (
        <ChartAreaInteractive
          data={applicationData ?? []}
          loading={isPending}
        />
      );
    default:
      router.push("/thelist");
      return;
  }
}
