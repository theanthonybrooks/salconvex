import { ReactNode } from "react";
import { notFound, redirect } from "next/navigation";

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
  const isAdmin = await fetchQuery(api.users.isAdmin, {}, { token });

  const subscription = await fetchQuery(
    api.subscriptions.getUserSubscription,
    {},
    { token },
  );

  const subStatus = subscription?.status;

  if (!isAdmin) {
    if (!subStatus || subStatus === "canceled") {
      notFound();
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
