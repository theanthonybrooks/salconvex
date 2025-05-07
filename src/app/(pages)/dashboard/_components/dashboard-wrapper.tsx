"use client";

import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { usePreloadedQuery } from "convex/react";

import DashboardSideBar from "./dashboard-sidebar";
import DashboardTopNav from "./dashbord-top-nav";

interface DashboardWrapperProps {
  children: React.ReactNode;
}

export function DashboardWrapper({ children }: DashboardWrapperProps) {
  const { preloadedUserData, preloadedSubStatus } = useConvexPreload();
  const userData = usePreloadedQuery(preloadedUserData);
  const subData = usePreloadedQuery(preloadedSubStatus);
  const userId = userData?.userId ?? "guest";
  const user = userData?.user || null;
  const role = user?.role;
  const subStatus = subData?.subStatus ?? "none";
  return (
    <>
      <DashboardTopNav user={user} subStatus={subStatus} userId={userId} />

      <div className="flex flex-1 pt-20">
        <DashboardSideBar user={user} subStatus={subStatus} role={role} />
        <main className="scrollable max-h-[calc(100dvh-80px)] flex-1 bg-dashboardBgLt white:bg-stone-200">
          {children}
        </main>
      </div>
    </>
  );
}
