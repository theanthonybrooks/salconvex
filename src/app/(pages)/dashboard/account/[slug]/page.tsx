import BillingPage from "@/features/dashboard/billing";
import SettingsPage from "@/features/dashboard/settings";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";
import { api } from "~/convex/_generated/api";

export default async function AccountPage({
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
  if (!subStatus || subStatus === "canceled") {
    if (slug === "billing" && subStatus === "canceled") {
      return <BillingPage />;
    } else {
      return <SettingsPage />;
    }
  }

  switch (slug) {
    case "billing":
      return <BillingPage />;
    case "settings":
      return <SettingsPage />;
    default:
      redirect("/dashboard/account/settings");
  }
}
