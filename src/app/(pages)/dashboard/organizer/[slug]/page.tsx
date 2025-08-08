import { AdminEventForm } from "@/features/events/submission-form/admin-organizer-form";
import { OrganizerDashboardTableWrapper } from "@/features/organizer/dashboard/org-dashboard-table-wrapper";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";

import { redirect } from "next/navigation";
import { api } from "~/convex/_generated/api";

export default async function OrganizerPage({
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

  if (
    !user?.role.includes("admin") &&
    !user?.accountType?.includes("organizer")
  ) {
    if (!subStatus || subStatus === "canceled") {
      redirect("/pricing");
    }
    redirect("/thelist");
  }
  const orgEventsData = await fetchQuery(
    api.events.event.getUserEvents,
    {},
    {
      token,
    },
  );

  // console.log(orgEventsData);

  switch (slug) {
    case "update-event":
      return <AdminEventForm user={user} />; // case "bookmarks":
    //   return <OrganizerDashboardTableWrapper page="bookmarks" />;
    // case "hidden":
    //   return <OrganizerDashboardTableWrapper page="hidden" />;

    default:
      //   redirect("/dashboard/admin");
      return <OrganizerDashboardTableWrapper orgEventsData={orgEventsData} />;
  }
}
