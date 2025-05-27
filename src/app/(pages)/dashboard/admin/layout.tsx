import { AdminPreloadContextProvider } from "@/features/admin/admin-preload-context";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery, preloadQuery } from "convex/nextjs";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { api } from "~/convex/_generated/api";

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
    if (!subStatus || subStatus === "cancelled") {
      redirect("/dashboard/account/settings");
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

  // if (subStatus?.subStatus === "cancelled") {
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
