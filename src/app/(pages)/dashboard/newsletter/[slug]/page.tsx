import type { ParamsProps } from "@/types/nextTypes";

import { redirect } from "next/navigation";

import { NewsletterTableWrapper } from "@/features/admin/dashboard/newsletter-table-wrapper";

import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from "~/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";

export default async function AdminPage({ params }: ParamsProps) {
  const { slug } = await params;

  const token = await convexAuthNextjsToken();
  if (!token) redirect("/auth/sign-in");
  const subscription = await fetchQuery(
    api.subscriptions.getUserSubscription,
    {},
    { token },
  );
  const isAdmin = await fetchQuery(api.users.isAdmin, {}, { token });

  const subStatus = subscription?.status;
  // console.log(isAdmin);
  // if (!isAdmin) {
  //   if (!subStatus || subStatus === "canceled") {
  //     redirect("/dashboard/settings");
  //   }

  //   redirect("/dashboard");
  // }

  switch (slug) {
    case "audience":
    case "campaigns":
      return <NewsletterTableWrapper page={slug} />;

    default:
      redirect("/dashboard/newsletter");
  }
}
