import SettingsPage from "@/features/dashboard/settings";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";
import { api } from "~/convex/_generated/api";

export default async function AccountPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug: slugs } = await params;

  const slug = slugs ?? [];

  const token = await convexAuthNextjsToken();

  const userData = await fetchQuery(api.users.getCurrentUser, {}, { token });
  const user = userData?.user;

  console.log(slug);

  if (!user) {
    redirect("/auth/sign-in");
  }

  // switch (slug[0]) {
  // case "settings":
  return <SettingsPage />;
  //   default:
  //     redirect("/dashboard/settings");
  // }
}
