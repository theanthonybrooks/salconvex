import BillingPage from "@/features/dashboard/billing";
import SettingsPage from "@/features/dashboard/settings";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";
import { api } from "~/convex/_generated/api";

interface Props {
  params: {
    slug: string;
  };
}

export default async function AccountPage({ params }: Props) {
  const { slug } = await params;

  // Auth + sub gating (can use helper)
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
  if (!subStatus || subStatus === "cancelled") {
    return <SettingsPage />;
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
