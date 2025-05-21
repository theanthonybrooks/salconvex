import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";
import { api } from "~/convex/_generated/api";

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ slug: string; subpage: string }>;
}) {
  const { slug, subpage } = await params;

  console.log(slug, subpage);

  const token = await convexAuthNextjsToken();
  if (!token) redirect("/auth/sign-in");
  const userData = await fetchQuery(api.users.getCurrentUser, {}, { token });
  const user = userData?.user;
  if (!user) {
    redirect("/auth/sign-in");
  }
  const subscription = await fetchQuery(
    api.subscriptions.getUserSubscription,
    {},
    { token },
  );
  const subStatus = subscription?.status;

  if (!user?.role.includes("admin") && !user?.accountType?.includes("artist")) {
    if (!subStatus || subStatus === "cancelled") {
      redirect("/thelist");
    }
    redirect("/thelist");
  }

  if (slug === "apps") {
    // if (subpage === "accepted") return <DataTable columns={columns} data={} />;
    if (subpage === "accepted") return <p>Accepted applications</p>;
    if (subpage === "rejected") return <p>Rejected applications</p>;
    if (subpage === "pending") return <p>Pending applications</p>;
    if (subpage === "submitted") return <p>Submitted applications</p>;
    if (subpage === "bookmarks") return <p>Bookmarked applications</p>;
    if (subpage === "hidden") return <p>Hidden applications</p>;
    return <p>All default applications</p>;
  }

  return <p>Default Artist Page</p>;
}

//pages are like "artist/apps/accepted" and "artist/apps/bookmarks"
