import { AdminEventForm } from "@/features/events/submission-form/admin-organizer-form";
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
    if (!subStatus || subStatus === "cancelled") {
      redirect("/thelist");
    }
    redirect("/thelist");
  }

  switch (slug) {
    // case "events":
    //   return <OrganizerDashboardTableWrapper page="applications" />;
    // case "bookmarks":
    //   return <OrganizerDashboardTableWrapper page="bookmarks" />;
    // case "hidden":
    //   return <OrganizerDashboardTableWrapper page="hidden" />;

    default:
      //   redirect("/dashboard/admin");
      return <AdminEventForm user={user} />;
  }
}
