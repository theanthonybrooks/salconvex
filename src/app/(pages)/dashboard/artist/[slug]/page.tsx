import { ArtistDashboardTableWrapper } from "@/features/artists/dashboard/artist-dashboard-wrapper";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";
import { api } from "~/convex/_generated/api";

export default async function ArtistPage({
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

  if (!user?.role.includes("admin") && !user?.accountType?.includes("artist")) {
    if (!subStatus || subStatus === "cancelled") {
      redirect("/thelist");
    }
    redirect("/thelist");
  }

  switch (slug) {
    case "apps":
      return <ArtistDashboardTableWrapper page="applications" />;
    // case "bookmarks":
    //   return <p>Bookmarks</p>;
    // case "hidden":
    //   return <p>Hidden</p>;
    default:
      //   redirect("/dashboard/admin");
      return <ArtistDashboardTableWrapper page="applications" />;
  }
}
