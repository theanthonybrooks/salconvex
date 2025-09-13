import BillingPage from "@/features/dashboard/billing";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";
import { api } from "~/convex/_generated/api";

export default async function AccountPage() {
  const token = await convexAuthNextjsToken();

  const userData = await fetchQuery(api.users.getCurrentUser, {}, { token });
  const user = userData?.user;

  if (!user) {
    redirect("/auth/sign-in");
  }

  return <BillingPage />;
}
