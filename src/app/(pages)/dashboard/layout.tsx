import { DashboardWrapper } from "@/app/(pages)/dashboard/_components/dashboard-wrapper";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { api } from "~/convex/_generated/api";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {



  const token = await convexAuthNextjsToken();

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
  // if (subStatus?.subStatus === "cancelled") {
  //   redirect("/pricing#plans")
  // }

  return <DashboardWrapper>{children}</DashboardWrapper>;
}
