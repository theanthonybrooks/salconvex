"use client";

import TheListNavBar from "@/app/(pages)/(artist)/thelist/components/artist-navbar";
import NavBar from "./navbar";

interface NavBarWrapperProps {
  type?: "public" | "thelist" | "dashboard";
}

export function NavbarWrapper({ type }: NavBarWrapperProps) {
  // const { preloadedUserData, preloadedSubStatus } = useConvexPreload();
  // const userData = usePreloadedQuery(preloadedUserData);
  // const subData = usePreloadedQuery(preloadedSubStatus);
  // const userId = userData?.userId ?? "guest";
  // const user = userData?.user ?? null;
  // const subStatus = subData?.subStatus ?? "none";
  return (
    <>
      {type === "public" && <NavBar />}
      {type === "thelist" && <TheListNavBar />}
      {/* {type === "dashboard" && (
        <TheListNavBar userId={userId} user={user} subStatus={subStatus} />
      )} */}
    </>
  );
}
