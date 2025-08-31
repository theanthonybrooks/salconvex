import { DashboardWrapper } from "@/app/(pages)/dashboard/_components/dashboard-wrapper";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { api } from "~/convex/_generated/api";

interface DashboardLayoutProps {
  children: ReactNode;
}

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "View your account information, track your applications, bookmarks, and events/open calls, and manage your membership.",
  openGraph: {
    title: "Dashboard | The Street Art List",
    description:
      "View your account information, track your applications, bookmarks, and events/open calls, and manage your membership.",
    url: "https://thestreetartlist.com/dashboard",
    type: "website",
    images: [
      {
        url: "/public/saltext.png",
        width: 1200,
        height: 630,
        alt: "Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dashboard | The Street Art List",
    description:
      "View your account information, track your applications, bookmarks, and events/open calls, and manage your membership.",
    images: ["/public/saltext.png"],
  },
};

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const token = await convexAuthNextjsToken();
  if (!token) redirect("/auth/sign-in");

  const subStatus = await fetchQuery(
    api.subscriptions.getUserSubscriptionStatus,
    {},
    { token },
  );
  const user = await fetchQuery(api.users.getCurrentUser, {}, { token });

  // const userSub = subStatus?.subStatus;
  // const userType = user?.user?.accountType;

  if (!user) redirect("/auth/sign-in");
  if (!subStatus) redirect("/pricing#plans");
  // if (subStatus?.subStatus === "canceled") {
  //   redirect("/pricing#plans")
  // }

  return <DashboardWrapper>{children}</DashboardWrapper>;
}
