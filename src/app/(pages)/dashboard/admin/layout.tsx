import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AdminPreloadContextProvider } from "@/features/admin/admin-preload-context";

import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from "~/convex/_generated/api";
import { fetchQuery, preloadQuery } from "convex/nextjs";

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

  return (
    <AdminPreloadContextProvider preloadedEventData={preloadedEventData}>
      {children}
    </AdminPreloadContextProvider>
  );
}
