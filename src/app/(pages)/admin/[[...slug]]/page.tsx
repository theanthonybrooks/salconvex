// import { AuthScreen } from "@/features/auth/components/auth-screen"
import { DEFAULT_ICON } from "@/constants/pageTitles";

import type { Metadata } from "next";

import { capitalize } from "lodash";

import AdminScreen from "@/features/admin/components/admin-page";

type AuthPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: AuthPageProps): Promise<Metadata> {
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

const AdminPage = () => {
  return <AdminScreen />;
};

export default AdminPage;
