"use client";

import FullPageNav from "@/components/full-page-nav";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/custom-link";
import { UserProfile } from "@/components/ui/user-profile";
import { dashboardNavItems } from "@/constants/links";
import { Search } from "@/features/Sidebar/Search";
import { cn } from "@/lib/utils";
import { User } from "@/types/user";
import { Authenticated, Unauthenticated } from "convex/react";
// import { useQuery } from "convex-helpers/react/cache"
import { motion, useMotionValueEvent, useScroll } from "framer-motion";

import { useEffect, useState } from "react";

interface TheListNavBarProps {
  userId: string | undefined;
  user: User | undefined | null;
  // userPref: UserPref | null
  subStatus: string | undefined;
}

export default function TheListNavBar({
  userId,
  user,
  subStatus,
}: //   subStatus,
// userPref,
TheListNavBarProps) {
  const { scrollY } = useScroll();
  const [isMobile, setIsMobile] = useState(false);
  // useMotionValueEvent(scrollY, "change", (latest) => {
  //   console.log("Page scroll: ", latest)
  // })

  const [isScrolled, setIsScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const scrollThreshold = 50;
    setIsScrolled(latest > scrollThreshold);
  });

  // const { subStatus } =
  //   useQuery(api.subscriptions.getUserSubscriptionStatus) || {}

  //   const statusKey = subStatus ? subStatus : "none"

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1024px)");
    setIsMobile(mediaQuery.matches);

    let timeoutId: NodeJS.Timeout;
    const handleChange = (e: MediaQueryListEvent) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setIsMobile(e.matches), 150);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <>
      <motion.div
        initial={{ boxShadow: "none" }}
        animate={{
          boxShadow: isScrolled ? "var(--nav-shadow)" : "none",
          height: isScrolled ? "80px" : "100px",
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed left-0 right-0 top-0 z-20 h-25 w-screen border-foreground bg-background"
      >
        <div className="relative mx-auto flex h-full w-screen items-center justify-between px-8">
          <motion.div
            initial={{ height: 90, width: 90 }}
            animate={{
              boxShadow: isScrolled ? "var(--nav-shadow)" : "none",
              height: isScrolled ? 70 : 90,
              width: isScrolled ? 70 : 90,
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={cn(
              "absolute bottom-0 left-1/2 flex -translate-x-1/2 translate-y-[24px] items-center justify-center rounded-full bg-background",
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
              "absolute bottom-0 left-1/2 flex h-[90px] w-[90px] -translate-x-1/2 translate-y-[24px] items-center justify-center rounded-full bg-background",
            )}
          />
          <div className="absolute bottom-0 left-1/2 h-full w-25 -translate-x-1/2 bg-background" />
          <motion.div
            initial={{ translateX: "-50%", translateY: 14 }}
            animate={{ translateX: "-50%", translateY: 14 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute bottom-0 left-1/2"
          >
            {/* <div className='bg-background h-[80px] w-[80px] rounded-full absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2' /> */}

            <Link href="/" prefetch={true}>
              {/* <span className='font-semibold'>The Street Art List</span> */}

              <motion.img
                initial={{ height: 70, width: 70 }}
                animate={{
                  height: isScrolled ? 50 : 70,
                  width: isScrolled ? 50 : 70,
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                src="/logotransparency.png"
                alt="The Street Art List"
                className="transition-transform duration-300 ease-in-out active:rotate-180 lg:hover:rotate-180 lg:active:rotate-0"

                // className='z-10'
              />
            </Link>
          </motion.div>
          {!user && (
            <>
              <Link
                href="/pricing#plans"
                prefetch={true}
                className="hidden px-8 font-bold lg:flex"
              >
                View Pricing
              </Link>
            </>
          )}
          {/* NOTE: Limit/hide search for users who don't have a subscription or those who aren't signed in */}
          {user && (
            <>
              <Search
                title={"Search"}
                source={dashboardNavItems}
                className="hidden lg:flex"
                // groupName={"Heading"}

                placeholder="Search..."
                user={user}
              />
              <Search
                iconOnly
                isMobile={isMobile}
                title={"Search"}
                source={dashboardNavItems}
                // groupName={"Heading"}
                className="lg:hidden"
                placeholder="Search..."
                user={user}
              />
            </>
          )}

          {!isMobile && (
            <>
              {/* Right Side */}
              <Unauthenticated>
                <div className="hidden h-15 w-fit items-center justify-self-end lg:flex">
                  <div className="flex items-center gap-4">
                    <Link
                      href="/auth/sign-in"
                      prefetch={true}
                      className="font-bold"
                    >
                      Sign in
                    </Link>
                    <Link href="/auth/register" prefetch={true}>
                      <Button
                        variant="salWithShadowHiddenYlw"
                        className="hidden rounded-full font-bold lg:block"
                      >
                        Sign up
                      </Button>
                    </Link>
                  </div>
                </div>
              </Unauthenticated>
              <Authenticated>
                <div className="hidden h-15 w-fit items-center justify-self-end pr-5 lg:flex">
                  <div className="flex items-center gap-4">
                    {userId !== "guest" && user && (
                      <UserProfile
                        user={user}
                        className="size-10"
                        subscription={subStatus}
                      />
                    )}
                    <FullPageNav user={user} />
                  </div>
                </div>
              </Authenticated>
            </>
          )}

          {/* ------ Mobile Right side ------ */}

          <div className="z-20 flex w-full items-center justify-end lg:hidden">
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
  );
}
