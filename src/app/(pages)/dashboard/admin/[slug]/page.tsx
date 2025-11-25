import { redirect } from "next/navigation";

import { KanbanBoard } from "@/components/ui/kanban/kanban-board";
import { AdminDashboardTableWrapper } from "@/features/admin/dashboard/admin-dashboard-table-wrapper";
import AnalyticsPage from "@/features/dashboard/posthog-analytics";
import { AdminEventForm } from "@/features/events/submission-form/admin-organizer-form";

import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from "~/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";

export default async function AdminPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const token = await convexAuthNextjsToken();
  if (!token) redirect("/auth/sign-in");
  const subscription = await fetchQuery(
    api.subscriptions.getUserSubscription,
    {},
    { token },
  );
  const userData = await fetchQuery(api.users.getCurrentUser, {}, { token });
  const user = userData?.user;
  const subStatus = subscription?.status;
  const isDesigner = user?.role?.includes("designer");

  if (!user) {
    redirect("/auth/sign-in");
  }

  if (!user?.role.includes("admin")) {
    if (!subStatus || subStatus === "canceled") {
      redirect("/dashboard/settings");
    }

    redirect("/dashboard");
  }

  switch (slug) {
    case "analytics":
      return <AnalyticsPage />;
    case "todos":
      return <KanbanBoard purpose={isDesigner ? "design" : "todo"} />;
    case "submissions":
      return <AdminDashboardTableWrapper page="events" />;
    case "event":
      return <AdminEventForm user={user} />;

    case "users":
    case "socials":
    case "artists":
    case "applications":
    case "newsletter":
    case "resources":
      return <AdminDashboardTableWrapper page={slug} />;

    default:
      redirect("/dashboard/admin");
  }
}
