import { DEFAULT_ICON } from "@/constants/pageTitles";

import type { ParamsProps } from "@/types/nextTypes";
import type { Metadata } from "next";

import { notFound, redirect } from "next/navigation";
import { capitalize } from "lodash";

import AdminScreen from "@/features/admin/components/admin-page";

import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from "~/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";

export async function generateMetadata({
  params,
}: ParamsProps): Promise<Metadata> {
  const { slug } = await params;
  const slugValue = Array.isArray(slug) ? slug[0] : slug;

  let titleBase: string;

  switch (slugValue) {
    case "thisweek":
      titleBase = "This Week Post";
      break;
    case "nextweek":
      titleBase = "Next Week Post";
      break;
    case "map":
      titleBase = "Map";
      break;
    case "applications":
      titleBase = "Applications";
      break;
    default:
      titleBase = capitalize(slug);
  }

  return {
    title: `${titleBase} - Admin Page`,
    icons: DEFAULT_ICON,
  };
}

const AdminPage = async () => {
  const token = await convexAuthNextjsToken();
  if (!token) redirect("/auth/sign-in");
  const isAdmin = await fetchQuery(api.users.isAdmin, {}, { token });
  if (!isAdmin) notFound();
  return <AdminScreen />;
};

export default AdminPage;
