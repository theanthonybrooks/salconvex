"use client";

import FullPageNav from "@/components/full-page-nav";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/custom-link";
import {
  NavigationMenu,
  NavigationMenuContent,
  // NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { UserProfile } from "@/components/ui/user-profile";
import { dashboardNavItems } from "@/constants/links";
import { theListNavbarMenuLinks as thelistitems } from "@/constants/navbarsLinks";
import { Search } from "@/features/Sidebar/Search";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { ListItem } from "@/features/wrapper-elements/navigation/components/navbar";
import { NavbarSigninSection } from "@/features/wrapper-elements/navigation/components/navbar-signin-section";
import { cn } from "@/lib/utils";
import { useDevice } from "@/providers/device-provider";
import { User } from "@/types/user";
import { usePreloadedQuery } from "convex/react";

// import { useQuery } from "convex-helpers/react/cache"
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { ArrowUpIcon } from "lucide-react";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface TheListNavBarProps {
  userId?: string | undefined;
  user?: User | undefined | null;
  // userPref: UserPref | null
  subStatus?: string | undefined;
}

export default function TheListNavBar(
  {
    // user,
    // subStatus,
  }: //   subStatus,
  // userPref,
  TheListNavBarProps,
) {
  const { isMobile } = useDevice();
  const { preloadedUserData, preloadedSubStatus } = useConvexPreload();
  const userData = usePreloadedQuery(preloadedUserData);
  const subData = usePreloadedQuery(preloadedSubStatus);
  const user = userData?.user ?? null;
  const userPref = userData?.userPref ?? null;
  const { subStatus } = subData ?? {};
  const pathname = usePathname();
  const { scrollY, scrollYProgress } = useScroll();
  const [canGoToTop, setCanGoToTop] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  // useMotionValueEvent(scrollY, "change", (latest) => {
  //   console.log("Page scroll: ", latest)
  // })
  // const isAdmin = user?.role?.includes("admin");
  const fullPagePath = pathname;
  const currentPage = pathname.split("/")[1];

  const [isScrolled, setIsScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const scrollThreshold = 50;
    setIsScrolled(latest > scrollThreshold);
  });
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // console.log("scroll progress: ", latest);
    setCanGoToTop(latest > 0.25);
  });

  const statusKey = subStatus ? subStatus : "none";

  const filteredNavbarMenuTheList = thelistitems.filter(
    (link) => link.sub.includes(statusKey) || link.sub.includes("all"),
  );

  const isActiveTheList = filteredNavbarMenuTheList.some(
    (component) => component.href.includes(currentPage) && currentPage !== "",
  );

  const onGoToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "instant",
    });
  };

  useEffect(() => {
    if (canGoToTop) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setCanGoToTop(false);
        timeoutRef.current = null;
      }, 5000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [canGoToTop]);

  return (
    <>
      {canGoToTop && (
        <div
          onClick={onGoToTop}
          className="fixed bottom-7 right-7 z-20 rounded-full border-2 bg-background p-1 hover:scale-110 hover:cursor-pointer active:scale-95"
        >
          <ArrowUpIcon className="size-8 sm:size-6" />
        </div>
      )}
      <motion.nav
        initial={{ boxShadow: "none" }}
        animate={{
          boxShadow: isScrolled ? "var(--nav-shadow)" : "none",
          height: isScrolled ? "80px" : "100px",
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed left-0 right-0 top-0 z-20 h-25 w-screen bg-background"
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
            initial={{
              translateX: "-50%",
              translateY: 14,
              backgroundColor: "rgba(255, 255, 255, 1)",
            }}
            animate={{
              translateX: "-50%",
              translateY: 14,
              backgroundColor: isScrolled
                ? "rgba(255, 255, 255, 0)"
                : "rgba(255, 255, 255, 1)",
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute bottom-0 left-1/2 rounded-full"
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
                whileTap={{
                  rotate: 180,
                  transition: {
                    type: "spring",
                    stiffness: 120,
                    damping: 5,
                    mass: 1.2,
                  },
                }}
                whileHover={{
                  rotate: 180,
                  transition: {
                    type: "spring",
                    stiffness: 80,
                    damping: 5,
                    mass: 1.2,
                  },
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                src="/logotransparency.png"
                alt="The Street Art List"
              />
            </Link>
          </motion.div>
          {user === null && (
            <>
              <Link
                href="/pricing#plans"
                prefetch={true}
                className="hidden px-8 font-bold lg:flex"
              >
                <Button className="h-9 border-2 border-transparent bg-background text-base font-bold text-foreground hover:border-foreground hover:bg-background active:scale-95 sm:text-base">
                  View Pricing
                </Button>
              </Link>
            </>
          )}
          {user && (
            <>
              <Search
                iconOnly
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
            <div className="flex items-center gap-2">
              <Link href="/submit">
                <Button className="hidden h-9 border-2 border-transparent bg-background font-semibold text-foreground hover:border-foreground hover:bg-background active:scale-95 sm:text-base lg:inline-flex">
                  Submit
                </Button>
              </Link>
              <div className="hidden items-center gap-8 pr-5 lg:flex">
                <NavigationMenu
                  delayDuration={Infinity}
                  className="z-0"
                  align="right"
                >
                  <NavigationMenuList className="gap-2">
                    <NavigationMenuItem>
                      <NavigationMenuTrigger
                        isCurrent={isActiveTheList}
                        className={cn(
                          "z-0 border-2 border-transparent hover:border-foreground hover:bg-background data-[state=open]:border-foreground data-[state=open]:bg-background",
                        )}
                        onPointerMove={(event) => event.preventDefault()}
                        onPointerLeave={(event) => event.preventDefault()}
                      >
                        The List
                      </NavigationMenuTrigger>

                      <NavigationMenuContent
                        onPointerEnter={(event) => event.preventDefault()}
                        onPointerLeave={(event) => event.preventDefault()}
                      >
                        {/* TODO: put this back to xl:grid-cols-3 when I add more menu items */}
                        <ul className="grid w-[400px] gap-2 p-4 lg:w-max lg:max-w-[700px] lg:grid-cols-3 xl:grid-cols-3">
                          {filteredNavbarMenuTheList.map((component) => (
                            <ListItem
                              key={component.title}
                              title={component.title}
                              href={component.href}
                              className={cn(
                                "cursor-pointer text-balance transition-colors duration-200 ease-in-out [&_a]:hover:no-underline",
                                component.href === fullPagePath &&
                                  "bg-background",
                              )}
                            >
                              {component.description}
                            </ListItem>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
                {/* Right Side */}
                {!user && <NavbarSigninSection />}

                {user && (
                  <div className="flex items-center gap-4">
                    <UserProfile className="size-10" />
                    <FullPageNav
                      user={user}
                      subStatus={subStatus}
                      userPref={userPref}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ------ Mobile Right side ------ */}

          <div className="z-20 flex w-full items-center justify-end lg:hidden">
            <FullPageNav
              isMobile={isMobile}
              isScrolled={isScrolled}
              user={user}
              userPref={userPref}
              subStatus={subStatus}
            />
          </div>
        </div>
      </motion.nav>

      {/* ------ Desktop & Mobile: Main Navbar ----- */}
    </>
  );
}
