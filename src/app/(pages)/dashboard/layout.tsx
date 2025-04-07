import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { api } from "~/convex/_generated/api";
import DashboardSideBar from "./_components/dashboard-sidebar";
import DashboardTopNav from "./_components/dashbord-top-nav";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const token = await convexAuthNextjsToken();
  const subStatus = await fetchQuery(
    api.subscriptions.getUserSubscriptionStatus,
    {},
    { token },
  );
  const user = await fetchQuery(api.users.getCurrentUser, {}, { token });
  const role = user?.user?.role;

  if (!user || !subStatus) redirect("/auth/sign-in");
  // if (subStatus?.subStatus === "cancelled") {
  //   redirect("/pricing#plans")
  // }

  return (
    <>
      <DashboardTopNav
        user={user?.user}
        subStatus={subStatus?.subStatus}
        userId={user?.userId}
      />
      <div className="flex flex-1 pt-20">
        <DashboardSideBar
          user={user?.user}
          subStatus={subStatus?.subStatus}
          role={role}
        />
        <main className="scrollable bg-dashboardBgLt max-h-[calc(100dvh-80px)] flex-1 white:bg-stone-200">
          {children}
        </main>
      </div>
    </>
  );
}
