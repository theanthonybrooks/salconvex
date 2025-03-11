"use client"

// import ThemeToggle from "@/components/ui/theme-toggle"
// import { useAction, useQuery } from "convex/react";
import FullPageNav from "@/components/full-page-nav"
import { UserProfile } from "@/components/ui/user-profile"
import { useQuery } from "convex/react"
import { Bell } from "lucide-react"
import { api } from "../../../../../convex/_generated/api"

export default function DashboardTopNav() {
  const userData = useQuery(api.users.getCurrentUser, {})
  const user = userData?.user ? (userData.user as User) : null

  // const user = userData?.user // This avoids destructuring null or undefined

  // const subscription = useQuery(api.subscriptions.getUserSubscription);
  // const getDashboardUrl = useAction(api.subscriptions.getStripeDashboardUrl);

  // const handleManageSubscription = async () => {
  //   try {
  //     const result = await getDashboardUrl({
  //       customerId: subscription?.customerId!,
  //     });
  //     if (result?.url) {
  //       window.location.href = result.url;
  //     }
  //   } catch (error) {
  //     console.error("Error getting dashboard URL:", error);
  //   }
  // };

  return (
    <div className='flex flex-col'>
      <header className='flex h-14 items-center gap-4 border-b px-3 lg:h-[72px]'>
        <div className='ml-auto flex items-center justify-center gap-2 px-3'>
          {/* <Button variant={"outline"} onClick={handleManageSubscription}>
            Manage Subscription
          </Button> */}
          <Bell />
          <UserProfile user={user ?? null} />
          <FullPageNav user={user} />
        </div>
      </header>
    </div>
  )
}
