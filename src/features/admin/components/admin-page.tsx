"use client";

import ThisweekRecapPost from "@/features/events/thisweek-recap-post";

import { usePathname } from "next/navigation";

export default function AdminScreen() {
  const pathname = usePathname();
  // const callbackUrl = useSearchParams().get("src")

  // Create booleans based on the URL.
  const weeklyPost =
    pathname.endsWith("/thisweek") || pathname.endsWith("/nextweek");
  const thisWeekPost = pathname.endsWith("/thisweek");
  const individualPost = pathname.includes("/event");
  // const isSignIn = !isRegister && !isForgotPassword // default

  return (
    <>
      {weeklyPost ? (
        <ThisweekRecapPost source={thisWeekPost ? "thisweek" : "nextweek"} />
      ) : individualPost ? (
        <p>Individual Post</p>
      ) : (
        <p>else</p>
      )}
    </>
  );
}
