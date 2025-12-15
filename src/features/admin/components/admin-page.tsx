"use client";

import { usePathname, useRouter } from "next/navigation";

import ThisweekRecapPost from "@/features/events/thisweek-recap-post";

export default function AdminScreen() {
  const pathname = usePathname();
  const router = useRouter();

  // Create booleans based on the URL.
  switch (pathname) {
    case "/admin/thisweek":
      return <ThisweekRecapPost source="thisweek" />;
    case "/admin/nextweek":
      return <ThisweekRecapPost source="nextweek" />;

    default:
      router.push("/404-not-found");
      return;
  }
}
