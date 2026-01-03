"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardProvider } from "@/app/(pages)/dashboard/_components/DashboardContext";
import { useIsMobile } from "@/hooks/use-media-query";

import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { cn } from "@/helpers/utilsFns";

import { usePreloadedQuery } from "convex/react";
import DashboardSideBar from "./DashboardSidebar";
import DashboardTopNav from "./DashboardTopNav";

interface DashboardWrapperProps {
  children: React.ReactNode;
}

export function DashboardWrapper({ children }: DashboardWrapperProps) {
  const isMobile = useIsMobile();
  const router = useRouter();
  const { preloadedUserData, preloadedSubStatus } = useConvexPreload();

  const userData = usePreloadedQuery(preloadedUserData);

  const userId = userData?.userId ?? "guest";
  const user = userData?.user || null;
  const userPref = userData?.userPref ?? null;
  const role = user?.role;

  const subData = usePreloadedQuery(preloadedSubStatus);
  const subStatus = subData?.subStatus ?? "none";
  useEffect(() => {
    if (!user) {
      router.replace("/auth/sign-in");
    }
  }, [user, router]);

  return (
    <DashboardProvider>
      <DashboardTopNav
        user={user}
        subStatus={subStatus}
        userId={userId}
        userPref={userPref}
      />

      <div className="flex flex-1">
        <DashboardSideBar
          user={user}
          subStatus={subStatus}
          role={role}
          userPref={userPref}
        />
        <main
          className={cn(
            "scrollable dark:bg-tab-a0 max-h-[calc(100dvh-5rem)] flex-1 bg-dashboardBgLt white:bg-stone-100",
            isMobile && "mini darkbar",
          )}
        >
          {children}
        </main>
      </div>
    </DashboardProvider>
  );
}
