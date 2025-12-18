import { redirect } from "next/navigation";

import { NewsletterTableWrapper } from "@/features/admin/dashboard/newsletter-table-wrapper";

import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from "~/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";

export default async function NewsletterPage() {
  const token = await convexAuthNextjsToken();
  if (!token) redirect("/auth/sign-in");
  const isAdmin = await fetchQuery(api.users.isAdmin, {}, { token });
  if (!isAdmin) redirect("/dashboard");

  return <NewsletterTableWrapper page="audience" />;
}
