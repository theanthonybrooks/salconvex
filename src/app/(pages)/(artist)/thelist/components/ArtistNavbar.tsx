"use client";

import { dashboardNavItems } from "@/constants/links";
import {
  landingPageNavbarMenuLinksAbout as aboutItems,
  theListNavbarMenuLinks as thelistitems,
} from "@/constants/navbarsLinks";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useIsMobile } from "@/hooks/use-media-query";
// import { useQuery } from "convex-helpers/react/cache"
import { motion, useMotionValueEvent, useScroll } from "framer-motion";

import { ArrowUpIcon } from "lucide-react";

import FullPageNav from "@/components/full-page-nav";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/custom-link";
import { NotificationsDropdown } from "@/components/ui/navbar/notifications-dropdown";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Separator } from "@/components/ui/separator";
import { UserProfile } from "@/components/ui/user-profile";
import { Search } from "@/features/Sidebar/Search";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { ListItem } from "@/features/wrapper-elements/navigation/components/navbar";
import { NavbarSigninSection } from "@/features/wrapper-elements/navigation/components/navbar-signin-section";
import { cn } from "@/helpers/utilsFns";

import { usePreloadedQuery } from "convex/react";

export default function TheListNavBar() {
  const isMobile = useIsMobile();
  const { preloadedUserData, preloadedSubStatus } = useConvexPreload();
  const userData = usePreloadedQuery(preloadedUserData);
  const subData = usePreloadedQuery(preloadedSubStatus);
  const { user, userPref } = userData ?? {};
  const { subStatus } = subData ?? {};
  const pathname = usePathname();
  const { scrollY, scrollYProgress } = useScroll();
  const [canGoToTop, setCanGoToTop] = useState(false);

  const isAdmin = user?.role?.includes("admin");
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
  const filteredNavbarMenuAbout = aboutItems.filter(
    (link) => link.sub.includes(statusKey) || link.sub.includes("all"),
  );
  const filteredNavbarMenuTheList = thelistitems.filter(
    (link) => link.sub.includes(statusKey) || link.sub.includes("all"),
  );

  const isActiveTheList = filteredNavbarMenuTheList.some(
    (component) => component.href.includes(currentPage) && currentPage !== "",
  );

  const isActiveAbout = filteredNavbarMenuAbout.some(
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

  const activeMainItemClasses =
    "border-foreground/50   hover:border-foreground/70 data-[state=open]:border-foreground/70";

  return (
    <>
      {canGoToTop && (
        <div
          onClick={onGoToTop}
          className="fixed bottom-7 right-7 z-20 rounded-full border-2 bg-background p-1 hover:scale-105 hover:cursor-pointer active:scale-975"
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
                  rotate: isMobile ? 0 : 180,
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
                href="/pricing?type=artist"
                prefetch={true}
                className="hidden px-8 font-bold lg:flex"
              >
                <Button variant="hiddenOutline" className="h-9 sm:text-base">
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
              />
              <Search
                iconOnly
                isMobile={isMobile}
                title={"Search"}
                source={dashboardNavItems}
                // groupName={"Heading"}
                className="lg:hidden"
                placeholder="Search..."
              />
            </>
          )}

          {!isMobile && (
            <div className="flex w-full items-center justify-between gap-2">
              <Link href="/submit">
                <Button variant="hiddenOutline" className="h-9 sm:text-base">
                  Submit
                </Button>
              </Link>
              <div
                className={cn(
                  "hidden items-center gap-8 pr-5 lg:flex",
                  isAdmin && "gap-4",
                )}
              >
                <div className="z-0 flex items-center gap-2">
                  <NavigationMenu delayDuration={Infinity} align="right">
                    <NavigationMenuList className="gap-2">
                      <NavigationMenuItem>
                        <NavigationMenuTrigger
                          isCurrent={isActiveTheList}
                          className={cn(
                            "z-0 border-2 border-transparent hover:border-foreground data-[state=open]:border-foreground",
                            isActiveTheList && activeMainItemClasses,
                          )}
                          onPointerMove={(event) => event.preventDefault()}
                          onPointerLeave={(event) => event.preventDefault()}
                        >
                          The List
                        </NavigationMenuTrigger>

                        <NavigationMenuContent
                          align="right"
                          onPointerEnter={(event) => event.preventDefault()}
                          onPointerLeave={(event) => event.preventDefault()}
                        >
                          <div className="flex w-[400px] flex-col gap-1 p-3 lg:w-max xl:max-w-[700px]">
                            {filteredNavbarMenuTheList
                              .filter(
                                (component) =>
                                  !component.title.includes("Old Site"),
                              )
                              .map((component) => {
                                const activeLink =
                                  component.href.includes(currentPage) &&
                                  currentPage !== "";
                                const subPage = fullPagePath.startsWith(
                                  component.href + "/",
                                );

                                return (
                                  <ListItem
                                    key={component.title}
                                    title={component.title}
                                    href={component.href}
                                    className={cn(
                                      "cursor-pointer text-balance transition-colors duration-200 ease-in-out",
                                      subPage &&
                                        "pointer-events-auto hover:bg-salPinkLt/70 hover:no-underline",
                                      // component.href.includes(currentPage) &&
                                      //   currentPage !== "" &&
                                      //   "pointer-events-none bg-background",
                                    )}
                                    activeItem={activeLink}
                                  >
                                    {/* {component.description} */}
                                  </ListItem>
                                );
                              })}
                            <Separator thickness={2} className="" />
                            <p className="m-0 text-center text-foreground/50">
                              Old Site
                            </p>
                            <Separator thickness={2} className="" />
                            {filteredNavbarMenuTheList
                              .filter((component) =>
                                component.title.includes("Old Site"),
                              )
                              .map((component) => (
                                <ListItem
                                  key={component.title}
                                  title={component.title.replace(
                                    "- (Old Site)",
                                    "",
                                  )}
                                  href={component.href}
                                  className={cn(
                                    "cursor-pointer text-balance transition-colors duration-200 ease-in-out",
                                    component.href.includes(currentPage) &&
                                      currentPage !== "" &&
                                      "bg-background",
                                  )}
                                >
                                  {/* {component.description} */}
                                </ListItem>
                              ))}
                          </div>
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                    </NavigationMenuList>
                  </NavigationMenu>
                  <NavigationMenu
                    delayDuration={Infinity}
                    className="hidden xl:flex"
                  >
                    <NavigationMenuList className="gap-2">
                      <NavigationMenuItem>
                        <NavigationMenuTrigger
                          isCurrent={isActiveAbout}
                          className={cn(
                            "border-2 border-transparent hover:border-foreground/70 data-[state=open]:border-foreground/50",
                            isActiveAbout && activeMainItemClasses,
                          )}
                          onPointerMove={(event) => event.preventDefault()}
                          onPointerLeave={(event) => event.preventDefault()}
                        >
                          About
                        </NavigationMenuTrigger>
                        <NavigationMenuContent
                          onPointerEnter={(event) => event.preventDefault()}
                          onPointerLeave={(event) => event.preventDefault()}
                        >
                          {/* <ul className="grid w-[400px] gap-2 p-4 lg:w-max lg:grid-cols-2 xl:max-w-[700px] xl:grid-cols-3"> */}
                          <div className="flex w-[400px] flex-col gap-1 p-3 lg:w-max xl:max-w-[700px]">
                            {filteredNavbarMenuAbout.map((component) => {
                              const activeLink =
                                component.href.includes(currentPage) &&
                                currentPage !== "";
                              return (
                                <ListItem
                                  key={component.title}
                                  title={component.title}
                                  href={component.href}
                                  activeItem={activeLink}
                                  className={cn(
                                    "cursor-pointer text-balance transition-colors duration-200 ease-in-out",
                                  )}
                                >
                                  {/* {component.description} */}
                                </ListItem>
                              );
                            })}
                          </div>
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                    </NavigationMenuList>
                  </NavigationMenu>
                </div>
                {/* Right Side */}
                {!user && <NavbarSigninSection />}

                {user && (
                  <div className="flex items-center gap-4">
                    <UserProfile className="size-10" />
                    <FullPageNav
                      user={user}
                      subStatus={subStatus}
                      userPref={userPref ?? null}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ------ Mobile Right side ------ */}

          <div className="z-20 flex w-full items-center justify-end gap-2 lg:hidden">
            {user && (
              <NotificationsDropdown
                // open={notificationsOpen}
                // setOpen={setNotificationsOpen}
                setTooltipDisabled={() => {}}
                tooltipDisabled={true}
                className=""
                user={user}
                userPref={userPref}
              />
            )}
            <FullPageNav
              isMobile={isMobile}
              isScrolled={isScrolled}
              user={user}
              userPref={userPref ?? null}
              subStatus={subStatus}
            />
          </div>
        </div>
      </motion.nav>

      {/* ------ Desktop & Mobile: Main Navbar ----- */}
    </>
  );
}
