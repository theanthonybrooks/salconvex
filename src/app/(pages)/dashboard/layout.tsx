import { ReactNode } from "react"
import DashboardSideBar from "./_components/dashboard-sidebar"
import DashboardTopNav from "./_components/dashbord-top-nav"

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className='flex h-screen w-full overflow-hidden'>
      <DashboardSideBar />
      <main className='flex-1 overflow-y-auto'>
        <DashboardTopNav>{children}</DashboardTopNav>
      </main>
    </div>
  )
}
