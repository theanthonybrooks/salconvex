import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from "~/convex/_generated/api";
import { fetchQuery, preloadQuery } from "convex/nextjs";

import { AdminPreloadContextProvider } from "@/features/admin/admin-preload-context";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const token = await convexAuthNextjsToken();
  if (!token) redirect("/auth/sign-in");
  const userData = await fetchQuery(api.users.getCurrentUser, {}, { token });

  const subscription = await fetchQuery(
    api.subscriptions.getUserSubscription,
    {},
    { token },
  );

  const user = userData?.user;
  if (!user) {
    redirect("/auth/sign-in");
  }
  const subStatus = subscription?.status;
  const isAdmin = user?.role.includes("admin");

  if (!isAdmin) {
    if (!subStatus || subStatus === "canceled") {
      redirect("/dashboard/settings");
    }

    redirect("/dashboard");
  }

  const preloadedEventData = await preloadQuery(
    api.events.event.getAllEvents,
    {},
    { token },
  );

  const preloadedSubmissionData = await preloadQuery(
    api.events.event.getSubmittedEvents,
    {},
    { token },
  );
  // const preloadedSubmissionData = isAdmin ? await preloadQuery(
  //   api.events.event.getSubmittedEvents,
  //   {},
  //   { token },
  // ) : null;

  // const userSub = subStatus?.subStatus;
  // const userType = user?.user?.accountType;

  // if (subStatus?.subStatus === "canceled") {
  //   redirect("/pricing#plans")
  // }

  return (
    <AdminPreloadContextProvider
      preloadedEventData={preloadedEventData}
      preloadedSubmissionData={preloadedSubmissionData}
    >
      {children}
    </AdminPreloadContextProvider>
  );
}
