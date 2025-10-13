"use client";

import FullPageNav from "@/components/full-page-nav";
import { Button } from "@/components/ui/button";
import { UserProfile } from "@/components/ui/user-profile";
import { dashboardNavItems } from "@/constants/links";
import { Search } from "@/features/Sidebar/Search";
import { useDevice } from "@/providers/device-provider";
import { User, UserPref } from "@/types/user";
import { Unauthenticated } from "convex/react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface NavBarProps {
  userId: string | undefined;
  user: User | undefined | null;
  userPref: UserPref | null;
  subStatus: string | undefined;
}

export default function NavBar({
  userId,
  subStatus,
  userPref,
  user,
}: NavBarProps) {
  const { scrollY } = useScroll();
  const { isMobile } = useDevice();

  const [isScrolled, setIsScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 150);
  });

  return (
    <>
      {/* ------ Desktop & Mobile: Main Navbar ----- */}
      <div className="h-20 border-b border-foreground bg-background">
        <div className="relative z-20 mx-auto flex h-full w-screen items-center justify-between pl-6 pr-8 lg:py-4">
          <Search
            iconOnly
            isMobile={isMobile}
            title={"Search"}
            source={dashboardNavItems}
            // groupName={"Heading"}
            className="lg:hidden"
            placeholder="Search..."
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
                  <UserProfile className="h-[40px] w-[40px]" />
                )}
                <FullPageNav
                  user={user}
                  subStatus={subStatus}
                  userPref={userPref}
                />
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
              {/* <Bell className="size-7 w-fit" /> */}

              <FullPageNav
                // userId={userId}
                isScrolled={isScrolled}
                user={user}
                isDashboard={true}
                userPref={userPref}
                subStatus={subStatus}
              />
            </>
          </div>
        </div>
      </div>
    </>
  );
}
