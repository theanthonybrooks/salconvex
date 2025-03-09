"use client"

// import ThemeToggle from "@/components/ui/theme-toggle"
// import { useAction, useQuery } from "convex/react";
import FullPageNav from "@/components/full-page-nav"
import { UserProfile } from "@/components/ui/user-profile"
import { useQuery } from "convex/react"
import { api } from "../../../../../convex/_generated/api"

export default function DashboardTopNav({
  children,
}: {
  children: React.ReactNode
}) {
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
        {/*        <Dialog>
          <DialogTitle className='sr-only'>Dashboard Menu</DialogTitle>
          <SheetTrigger className='p-2 transition min-[1024px]:hidden'>
            <HamburgerMenuIcon />
            <Link href='/dashboard'>
              <span className='sr-only'>Home</span>
            </Link>
          </SheetTrigger>
          <SheetContent side='left'>
            <SheetHeader>
              <Link href='/'>
                /~ <SheetTitle>The Street Art List</SheetTitle> ~/
                <Image src='/saltext.png' alt='sal' width={100} height={40} />
              </Link>
            </SheetHeader>
            <div className='mt-[1rem] flex flex-col space-y-3'>
              <DialogClose asChild>
                <Link href='/dashboard'>
                  <Button variant='outline' className='w-full'>
                    <HomeIcon className='mr-2 h-4 w-4' />
                    Home
                  </Button>
                </Link>
              </DialogClose>
              <DialogClose asChild>
                <Link href='/dashboard/account'>
                  <Button variant='outline' className='w-full'>
                    <Banknote className='mr-2 h-4 w-4' />
                    Account
                  </Button>
                </Link>
              </DialogClose>
              <Separator className='my-3' />
              <DialogClose asChild>
                <Link href='/dashboard/account/settings'>
                  <Button variant='outline' className='w-full'>
                    <Settings className='mr-2 h-4 w-4' />
                    Settings
                  </Button>
                </Link>
              </DialogClose>
            </div>
          </SheetContent>
        </Dialog>*/}
        <div className='ml-auto flex items-center justify-center gap-2'>
          {/* <Button variant={"outline"} onClick={handleManageSubscription}>
            Manage Subscription
          </Button> */}

          {/* <ThemeToggle /> */}
          <UserProfile user={user ?? null} />
          <FullPageNav user={user} />
        </div>
      </header>
      {children}
    </div>
  )
}
