"use client";

import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { usePreloadedQuery } from "convex/react";

import { DashboardProvider } from "@/app/(pages)/dashboard/_components/dashboard-context";
import { useRouter } from "next/navigation";
import DashboardSideBar from "./dashboard-sidebar";
import DashboardTopNav from "./dashbord-top-nav";

interface DashboardWrapperProps {
  children: React.ReactNode;
}

export function DashboardWrapper({ children }: DashboardWrapperProps) {
  const router = useRouter();
  const { preloadedUserData, preloadedSubStatus } = useConvexPreload();

  const userData = usePreloadedQuery(preloadedUserData);

  const userId = userData?.userId ?? "guest";
  const user = userData?.user || null;
  const role = user?.role;

  const subData = usePreloadedQuery(preloadedSubStatus);
  const subStatus = subData?.subStatus ?? "none";
  if (!userData) {
    router.replace("/auth/sign-in");
    return null;
  }
  return (
    <DashboardProvider>
      <DashboardTopNav user={user} subStatus={subStatus} userId={userId} />

      <div className="flex flex-1">
        <DashboardSideBar user={user} subStatus={subStatus} role={role} />
        <main className="scrollable max-h-[calc(100dvh-5rem)] flex-1 bg-dashboardBgLt white:bg-stone-200">
          {children}
        </main>
      </div>
    </DashboardProvider>
  );
}
