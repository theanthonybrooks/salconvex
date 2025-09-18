import { KanbanBoard } from "@/components/ui/kanban-board";
import { AdminDashboardTableWrapper } from "@/features/admin/dashboard/admin-dashboard-table-wrapper";
import AnalyticsPage from "@/features/dashboard/posthog-analytics";
import { AdminEventForm } from "@/features/events/submission-form/admin-organizer-form";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";
import { api } from "~/convex/_generated/api";

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
      return <KanbanBoard userRole={user.role?.[0]} purpose="todo" />;
    case "design":
      return <KanbanBoard userRole={user.role?.[0]} purpose="design" />;
    case "submissions":
      return <AdminDashboardTableWrapper page="events" />;

    case "users":
      return <AdminDashboardTableWrapper page="users" />;
    case "event":
      return <AdminEventForm user={user} />;
    case "applications":
      return <AdminDashboardTableWrapper page="applications" />;
    case "newsletter":
      return <AdminDashboardTableWrapper page="newsletter" />;
    default:
      redirect("/dashboard/admin");
  }
}
