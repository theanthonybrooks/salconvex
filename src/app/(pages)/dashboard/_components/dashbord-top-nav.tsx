"use client";

import FullPageNav from "@/components/full-page-nav";
import { Button } from "@/components/ui/button";
import { UserProfile } from "@/components/ui/user-profile";
import { dashboardNavItems } from "@/constants/links";
import { Search } from "@/features/Sidebar/Search";
import { User } from "@/types/user";
import { Unauthenticated } from "convex/react";
// import { useQuery } from "convex-helpers/react/cache"
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Bell } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface NavBarProps {
  userId: string | undefined;
  user: User | undefined | null;
  // userPref: UserPref | null
  subStatus: string | undefined;
}

export default function NavBar({
  userId,
  subStatus,
  // userPref,
  user,
}: NavBarProps) {
  const { scrollY } = useScroll();
  const [isMobile, setIsMobile] = useState(false);

  const [isScrolled, setIsScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    //   console.log("Page scroll: ", latest)
    setIsScrolled(latest > 150);
  });

  useEffect(() => {
    sessionStorage.removeItem("previousSalPage");

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
      {/* ------ Desktop & Mobile: Main Navbar ----- */}
      <div className="fixed left-0 right-0 top-0 z-20 h-20 border-b border-foreground bg-background">
        <div className="relative mx-auto flex h-full w-screen items-center justify-between pl-6 pr-8 lg:py-4">
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

          {!isMobile && (
            <>
              {/* Desktop Logo & Navigation */}
              <div className="hidden items-center justify-center gap-x-2 lg:flex">
                <Link
                  href="/"
                  className="flex items-center gap-2 overflow-hidden"
                >
                  <motion.div
                    className="hidden h-[50px] w-[50px] items-center gap-2 overflow-hidden rounded-full border-2 border-foreground bg-white p-1 lg:flex"
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  >
                    <Image
                      src="/sitelogo.svg"
                      alt="The Street Art List"
                      width={40}
                      height={40}
                      priority={true}
                      className="shrink-0"
                    />
                  </motion.div>
                  <Image
                    src="/saltext.png"
                    alt="The Street Art List"
                    width={175}
                    height={80}
                    className="mt-1"
                  />
                </Link>
              </div>

              {/* Right Side */}
              <div className="hidden items-center gap-x-4 lg:flex">
                {/* //TODO: Add notifications */}
                {/* <Bell className="size-6 w-full" /> */}

                <Unauthenticated>
                  <Link href="/auth/sign-in" prefetch={true}>
                    <Button
                      variant="salWithShadowHidden"
                      className="my-1 ml-2 hidden rounded-full font-bold lg:block"
                    >
                      Sign in
                    </Button>
                  </Link>
                </Unauthenticated>

                {userId !== "guest" && user && (
                  <UserProfile
                    className="h-[40px] w-[40px]"
                    subscription={subStatus}
                  />
                )}
                <FullPageNav user={user} />
              </div>
            </>
          )}

          {/* ------ Mobile Right side ------ */}

          <div className="flex w-full items-center justify-end gap-x-6 lg:hidden">
            {/* {userId !== "guest" && user && <UserProfile user={user} />} */}
            {/* <Unauthenticated>
              <Link href='/auth/sign-in' prefetch={true}>
                <Button
                  variant='salWithShadowHidden'
                  className='font-bold bg-background'
                  size='lg'>
                  Sign in
                </Button>
              </Link>
            </Unauthenticated> */}
            <>
              <Bell className="size-7 w-fit" />

              <FullPageNav
                // userId={userId}
                isScrolled={isScrolled}
                user={user}
                isDashboard={true}
                // userPref={userPref}
                // subStatus={subStatus}
              />
            </>
          </div>
        </div>
      </div>
    </>
  );
}
