import { AdminDashboardTableWrapper } from "@/features/admin/dashboard/admin-dashboard-table-wrapper";

export default async function AdminPage() {
  // redirect("/dashboard/admin/todos");

  return <AdminDashboardTableWrapper page="events" />;
}
