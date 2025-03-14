import DashboardContent from "@/features/dashboard/dashboard-content"
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server"
import { fetchQuery } from "convex/nextjs"
import { ReactNode } from "react"
import { api } from "~/convex/_generated/api"
import DashboardSideBar from "./_components/dashboard-sidebar"
import DashboardTopNav from "./_components/dashbord-top-nav"

interface DashboardLayoutProps {
  children: ReactNode
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const token = await convexAuthNextjsToken()
  const subStatus = await fetchQuery(
    api.subscriptions.getUserSubscriptionStatus,
    {},
    { token }
  )
  const user = await fetchQuery(api.users.getCurrentUser, {}, { token })
  const role = user?.user?.role

  return (
    <>
      <DashboardTopNav
        user={user?.user}
        subStatus={subStatus?.subStatus}
        userId={user?.userId}
      />
      <div className='flex max-h-dvh max-w-screen overflow-hidden pt-20'>
        <DashboardSideBar subStatus={subStatus?.subStatus} role={role} />
        <DashboardContent>{children}</DashboardContent>
      </div>
    </>
  )
}
