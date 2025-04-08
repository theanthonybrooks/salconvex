import { KanbanBoard } from "@/components/ui/kanban-board";
import AnalyticsPage from "@/features/dashboard/posthog-analytics";
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
    if (!subStatus || subStatus === "cancelled") {
      redirect("/dashboard/account/settings");
    }

    redirect("/dashboard");
  }

  switch (slug) {
    case "analytics":
      return <AnalyticsPage />;
    case "todos":
      return <KanbanBoard userRole={user.role?.[0]} />;
    default:
      redirect("/dashboard/admin/todos");
  }
}
