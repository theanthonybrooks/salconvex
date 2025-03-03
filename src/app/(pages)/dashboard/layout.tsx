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
  return (
    <div className='flex h-screen w-screen overflow-hidden'>
      <DashboardSideBar subStatus={subStatus?.subStatus} />
      <main className='flex-1 overflow-y-auto'>
        <DashboardTopNav>{children}</DashboardTopNav>
      </main>
    </div>
  )
}
