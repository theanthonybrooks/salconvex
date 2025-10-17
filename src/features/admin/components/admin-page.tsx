"use client";

import WorldMapComponent from "@/components/ui/map/map-component";
import ThisweekRecapPost from "@/features/events/thisweek-recap-post";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { usePreloadedQuery } from "convex/react";

import { usePathname, useRouter } from "next/navigation";

export default function AdminScreen() {
  const pathname = usePathname();
  const router = useRouter();
  const { preloadedUserData } = useConvexPreload();
  const userData = usePreloadedQuery(preloadedUserData);
  const isAdmin = userData?.user?.role?.includes("admin");

  if (!isAdmin) router.push("/thelist");

  // Create booleans based on the URL.
  switch (pathname) {
    case "/admin/thisweek":
      return <ThisweekRecapPost source="thisweek" />;
    case "/admin/nextweek":
      return <ThisweekRecapPost source="nextweek" />;
    case "/admin/map":
      return <WorldMapComponent />;
    default:
      router.push("/thelist");
      return;
  }
}
