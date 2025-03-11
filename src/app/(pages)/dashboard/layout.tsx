import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server"
import { fetchQuery } from "convex/nextjs"
import { ReactNode } from "react"
import { api } from "~/convex/_generated/api"
import DashboardSideBar from "./_components/dashboard-sidebar"
import DashboardTopNav from "./_components/dashbord-top-nav"

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
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
      <DashboardTopNav />
      <div className='flex h-screen overflow-hidden'>
        <DashboardSideBar subStatus={subStatus?.subStatus} role={role} />
        <main className='flex-1 overflow-y-auto scrollable'>{children}</main>
      </div>
    </>
  )
}
