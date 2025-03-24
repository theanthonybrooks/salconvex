"use client"

import FullPageNav from "@/components/full-page-nav"
import { Button } from "@/components/ui/button"
import { UserProfile } from "@/components/ui/user-profile"
import { dashboardNavItems } from "@/constants/links"
import { Search } from "@/features/Sidebar/Search"
import { cn } from "@/lib/utils"
import { User } from "@/types/user"
import { Authenticated, Unauthenticated } from "convex/react"
// import { useQuery } from "convex-helpers/react/cache"
import { motion, useMotionValueEvent, useScroll } from "framer-motion"
import Link from "next/link"
import { useEffect, useState } from "react"

interface TheListNavBarProps {
  userId: string | undefined
  user: User | undefined | null
  // userPref: UserPref | null
  subStatus: string | undefined
}

export default function TheListNavBar({
  userId,
  user,
}: //   subStatus,
// userPref,
TheListNavBarProps) {
  const { scrollY } = useScroll()
  const [isMobile, setIsMobile] = useState(false)
  // useMotionValueEvent(scrollY, "change", (latest) => {
  //   console.log("Page scroll: ", latest)
  // })

  const [isScrolled, setIsScrolled] = useState(false)

  useMotionValueEvent(scrollY, "change", (latest) => {
    const scrollThreshold = 50
    setIsScrolled(latest > scrollThreshold)
  })

  // const { subStatus } =
  //   useQuery(api.subscriptions.getUserSubscriptionStatus) || {}

  //   const statusKey = subStatus ? subStatus : "none"

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1024px)")
    setIsMobile(mediaQuery.matches)

    let timeoutId: NodeJS.Timeout
    const handleChange = (e: MediaQueryListEvent) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => setIsMobile(e.matches), 150)
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => {
      mediaQuery.removeEventListener("change", handleChange)
      clearTimeout(timeoutId)
    }
  }, [])

  return (
    <>
      <motion.div
        initial={{ boxShadow: "none" }}
        animate={{
          boxShadow: isScrolled ? "var(--nav-shadow)" : "none",
          height: isScrolled ? "80px" : "100px",
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className='fixed left-0 right-0 top-0 z-20 h-25 w-screen border-foreground bg-background'>
        <div className='mx-auto flex w-screen h-full justify-between items-center px-8 relative'>
          <motion.div
            initial={{ height: 90, width: 90 }}
            animate={{
              boxShadow: isScrolled ? "var(--nav-shadow)" : "none",
              height: isScrolled ? 70 : 90,
              width: isScrolled ? 70 : 90,
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={cn(
              "absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[24px] flex items-center justify-center bg-background rounded-full "
            )}
          />
          <motion.div
            initial={{ height: 90, width: 90 }}
            animate={{
              height: isScrolled ? 70 : 90,
              width: isScrolled ? 70 : 90,
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={cn(
              "absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[24px] h-[90px] w-[90px] flex items-center justify-center bg-background rounded-full "
            )}
          />
          <div className='h-full w-25 bg-background absolute bottom-0 left-1/2 -translate-x-1/2  ' />
          <motion.div
            initial={{ translateX: "-50%", translateY: 14 }}
            animate={{ translateX: "-50%", translateY: 14 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className='absolute bottom-0 left-1/2 '>
            {/* <div className='bg-background h-[80px] w-[80px] rounded-full absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2' /> */}

            <Link href='/' prefetch={true}>
              {/* <span className='font-semibold'>The Street Art List</span> */}

              <motion.img
                initial={{ height: 70, width: 70 }}
                animate={{
                  height: isScrolled ? 50 : 70,
                  width: isScrolled ? 50 : 70,
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                src='/logotransparency.png'
                alt='The Street Art List'
                className='lg:hover:rotate-180 transition-transform duration-300 ease-in-out'

                // className='z-10'
              />
            </Link>
          </motion.div>
          {/* NOTE: Limit/hide search for users who don't have a subscription or those who aren't signed in */}
          <Search
            title={"Search"}
            source={dashboardNavItems}
            className='hidden lg:flex'
            // groupName={"Heading"}

            placeholder='Search...'
            user={user}
          />
          <Search
            iconOnly
            isMobile={isMobile}
            title={"Search"}
            source={dashboardNavItems}
            // groupName={"Heading"}
            className=' lg:hidden'
            placeholder='Search...'
            user={user}
          />

          {!isMobile && (
            <>
              {/* Right Side */}
              <Unauthenticated>
                <div className='hidden lg:flex items-center justify-self-end h-15 w-fit'>
                  <div className='flex items-center gap-4'>
                    <Link href='/auth/sign-in' prefetch={true}>
                      <Button
                        variant='link'
                        className='font-bold hidden lg:block rounded-full '>
                        Sign in
                      </Button>
                    </Link>
                    <Link href='/auth/register' prefetch={true}>
                      <Button
                        variant='salWithShadowHiddenYlw'
                        className='font-bold hidden lg:block rounded-full '>
                        Sign up
                      </Button>
                    </Link>
                  </div>
                </div>
              </Unauthenticated>
              <Authenticated>
                <div className='hidden lg:flex items-center justify-self-end h-15 w-fit pr-5 '>
                  <div className='flex items-center gap-4'>
                    {userId !== "guest" && user && (
                      <UserProfile user={user} className='size-10' />
                    )}
                    <FullPageNav user={user} />
                  </div>
                </div>
              </Authenticated>
            </>
          )}

          {/* ------ Mobile Right side ------ */}

          <div className='flex items-center justify-end w-full  lg:hidden z-20'>
            <FullPageNav
              // userId={userId}
              isMobile={isMobile}
              isScrolled={isScrolled}
              user={user}
              // userPref={userPref}
              // subStatus={subStatus}
            />
          </div>
        </div>
      </motion.div>

      {/* ------ Desktop & Mobile: Main Navbar ----- */}
    </>
  )
}
