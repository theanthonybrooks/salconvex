"use client";

import { dashboardNavItems } from "@/constants/links";
import {
  landingPageNavbarMenuLinksAbout as aboutItems,
  landingPageNavbarLinks,
  landingPageNavbarMenuLinksResources as resources,
  theListNavbarMenuLinks as thelistitems,
} from "@/constants/navbarsLinks";

import type { Variants } from "framer-motion";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useIsMobile } from "@/hooks/use-media-query";
import { useViewportHeight } from "@/hooks/use-viewPort-Height";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useTheme } from "next-themes";

import FullPageNav from "@/components/full-page-nav";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/custom-link";
import { NotificationsDropdown } from "@/components/ui/navbar/notifications-dropdown";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Separator } from "@/components/ui/separator";
import { UserProfile } from "@/components/ui/user-profile";
import { Search } from "@/features/Sidebar/Search";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { NavbarSigninSection } from "@/features/wrapper-elements/navigation/components/navbar-signin-section";
import { cn } from "@/helpers/utilsFns";

import { AccountTypeBase } from "~/convex/schema";
import { usePreloadedQuery } from "convex/react";
import logoRound from "/public/logotransparency.png";
import logoText from "/public/saltext.png";

export default function NavBar() {
  const isMobile = useIsMobile();
  const { theme } = useTheme();
  const darkMode = theme === "dark";
  const viewportHeight = useViewportHeight();
  const { preloadedUserData, preloadedSubStatus } = useConvexPreload();
  const userData = usePreloadedQuery(preloadedUserData);
  const subData = usePreloadedQuery(preloadedSubStatus);
  const { user, userPref } = userData ?? {};
  const userType = user?.accountType ?? [];

  // const fontSize = userPref?.fontSize === "large" ? "text-base" : "text-sm";
  const { subStatus, hasActiveSubscription } = subData ?? {};
  const isAdmin = user?.role?.includes("admin");
  const isOrganizer = user?.accountType?.includes("organizer");
  const pathname = usePathname();
  const { scrollY } = useScroll();
  // useMotionValueEvent(scrollY, "change", (latest) => {
  //   console.log("Page scroll: ", latest)
  // })
  const homePage = pathname === "/";
  const currentPage = pathname.split("/")[1];

  const [isScrolled, setIsScrolled] = useState(false);
  // const [navBgScroll, setNavBgScroll] = useState(false);
  const [bgColor, setBgColor] = useState("hsl(var(--background))");

  useEffect(() => {
    if (!homePage) return;
    const updateColor = () => {
      const root = getComputedStyle(document.documentElement);
      const background = root.getPropertyValue("--background");
      setBgColor(`hsl(${background.trim()})`);
    };

    const id = requestAnimationFrame(updateColor);
    return () => cancelAnimationFrame(id);
  }, [theme, homePage]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const scrollThreshold = isMobile ? 50 : 150;
    const bgScrollThreshold = viewportHeight ? viewportHeight - 80 : 500;
    if (homePage && !isMobile) {
      // setNavBgScroll(latest > bgScrollThreshold);
      setIsScrolled(latest > bgScrollThreshold);
    } else {
      setIsScrolled(latest > scrollThreshold);
    }
  });

  const statusKey = subStatus ? subStatus : "none";

  const filteredNavbarLinks = landingPageNavbarLinks.filter((link) => {
    const isPublic =
      link.sub.includes("public") &&
      (statusKey === "none" || statusKey === "canceled");
    const organizerLink = link.userType?.includes("organizer") && isOrganizer;
    const userTypeMatch = link.userType?.some((type) =>
      userType.includes(type as AccountTypeBase),
    );
    const userTypeExcluded =
      link.excluded?.some((excluded) =>
        userType.includes(excluded as AccountTypeBase),
      ) && !userTypeMatch;
    const isMatch =
      (link.sub.includes(statusKey) ||
        link.sub.includes("all") ||
        organizerLink ||
        isPublic) &&
      !userTypeExcluded;

    return isMatch;
  });

  const filteredNavbarMenuResources = resources.filter(
    (link) => link.sub.includes(statusKey) || link.sub.includes("all"),
  );
  const filteredNavbarMenuAbout = aboutItems.filter(
    (link) => link.sub.includes(statusKey) || link.sub.includes("all"),
  );
  const filteredNavbarMenuTheList = thelistitems.filter(
    (link) => link.sub.includes(statusKey) || link.sub.includes("all"),
  );

  const isActiveTheList = filteredNavbarMenuTheList.some(
    (component) => component.href.includes(currentPage) && currentPage !== "",
  );
  const isActiveResources = filteredNavbarMenuResources.some(
    (component) => component.href.includes(currentPage) && currentPage !== "",
  );
  const isActiveAbout = filteredNavbarMenuAbout.some(
    (component) => component.href.includes(currentPage) && currentPage !== "",
  );

  const activeMainItemClasses =
    "border-foreground/50   hover:border-foreground/70 data-[state=open]:border-foreground/70 data-[state=open]:text-primary";

  const getNavBarVariants = (
    scrolled: boolean | undefined,
    homePage: boolean,
  ): Variants => {
    const homePageHiddenNav = homePage && !scrolled && !isMobile;

    return {
      visible: {
        height: scrolled || homePage ? "80px" : "100px",
        backgroundColor: bgColor,

        boxShadow: "var(--nav-shadow)",
        transition: {
          backgroundColor: {
            duration: 0,
          },
          duration: 0.3,
          ease: "easeInOut",
        },
      },
      hidden: {
        height: homePage ? "80px" : "100px",
        backgroundColor: !homePageHiddenNav ? bgColor : "rgba(0, 0, 0, 0)",
        boxShadow: "none",
        transition: {
          backgroundColor: {
            duration: 0,
          },
          duration: 0.3,
          ease: "easeInOut",
        },
      },
    };
  };

  return (
    <>
      {/* ------ Desktop & Mobile: Main Navbar ----- */}

      <motion.nav
        id="navbar"
        key="navbar"
        variants={getNavBarVariants(isScrolled, homePage)}
        initial="hidden"
        animate={isScrolled ? "visible" : "hidden"}
        className={cn(
          "fixed left-0 right-0 top-0 z-20 h-25 w-screen [@media(max-w-1024px)]:!bg-background",
          // (isMobile || !homePage) && "bg-background",
        )}
      >
        <div className="relative mx-auto flex h-full w-screen items-center justify-between px-8 lg:grid lg:grid-cols-[300px_auto_auto]">
          {/* Mobile Logo and Navigation */}
          <motion.div
            initial={{ boxShadow: "none", height: 90, width: 90 }}
            animate={{
              boxShadow: isScrolled ? "var(--nav-shadow)" : "none",
              height: isScrolled ? 70 : 90,
              width: isScrolled ? 70 : 90,
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={cn(
              "absolute bottom-0 left-1/2 z-0 flex -translate-x-1/2 translate-y-[24px] items-center justify-center rounded-full bg-background lg:hidden",
            )}
          />
          <motion.div
            initial={{ backgroundColor: "rgba(0, 0, 0, 0)" }}
            animate={{
              backgroundColor:
                isScrolled || !homePage
                  ? "hsl(var(--background))"
                  : "rgba(0, 0, 0, 0)",
            }}
            className="absolute bottom-0 left-1/2 h-full w-25 -translate-x-1/2 lg:hidden"
          />
          <div className="flex items-center gap-2 lg:hidden">
            <motion.div
              id="logo-background-front"
              initial={{
                backgroundColor: "rgba(255, 255, 255, 1)",
              }}
              animate={{
                backgroundColor:
                  isScrolled && !darkMode
                    ? "rgba(255, 255, 255, 0)"
                    : "rgba(255, 255, 255, 1)",
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="absolute bottom-0 left-1/2 z-10 -translate-x-1/2 translate-y-[14px] rounded-full"
            >
              <Link href="/" prefetch={true}>
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
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  src="/logotransparency.png"
                  alt="The Street Art List"
                />
              </Link>
            </motion.div>
            <motion.div
              initial={{ height: 90, width: 90 }}
              animate={{
                height: isScrolled ? 70 : 90,
                width: isScrolled ? 70 : 90,
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={cn(
                "absolute bottom-0 left-1/2 z-0 flex h-[90px] w-[90px] -translate-x-1/2 translate-y-[24px] items-center justify-center rounded-full bg-background",
              )}
            />
          </div>

          {!isMobile && (
            <>
              {/* Desktop Logo & Text */}
              <motion.div
                id="logo-text-container"
                className="box-border hidden h-15 items-center gap-2 overflow-hidden rounded-full border-2 border-foreground p-[5px] lg:flex"
                initial={{
                  width: 60,
                  backgroundColor: "rgba(255, 255, 255, 1)",
                }}
                animate={{
                  width: isScrolled ? 60 : 250,
                  backgroundColor:
                    isScrolled && !darkMode
                      ? "rgba(255, 255, 255, 0) "
                      : "rgba(255, 255, 255, 1)",
                }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                <Link
                  href="/"
                  className="flex items-center gap-2 overflow-hidden"
                >
                  <Image
                    src={logoRound}
                    alt="The Street Art List"
                    width={46}
                    height={46}
                    priority={true}
                    className="shrink-0"
                  />

                  <motion.div
                    initial={{ x: 0, opacity: 1 }}
                    animate={{
                      x: isScrolled ? "-100%" : "0%",
                      opacity: isScrolled ? 0 : 1,
                    }}
                    transition={{
                      opacity: {
                        duration: 0.01,
                        ease: "linear",
                        delay: isScrolled ? 0 : 0.3,
                      },
                      x: {
                        duration: 0.3,
                        ease: "linear",
                      },
                    }}
                    className="shrink-0 whitespace-nowrap"
                  >
                    <Image
                      src={logoText}
                      alt="The Street Art List"
                      width={0}
                      height={0}
                      className="mt-1 h-auto w-44"
                      priority
                    />
                  </motion.div>
                </Link>
              </motion.div>

              {/* Desktop Navigation */}
              <motion.div
                initial={{
                  backgroundColor: homePage ? "hsl(var(--card))" : "",
                  padding: homePage ? "0.25em 1.25em" : "0",
                  // height: homePage ? "60px" : "",
                  border: homePage ? "2px solid hsl(var(--foreground))" : "",
                }}
                animate={{
                  backgroundColor:
                    homePage && !isScrolled ? "hsl(var(--card))" : "",
                  // padding: homePage && !isScrolled ? "0.25em 1.25em" : "0",
                  // height: homePage && !isScrolled ? "60px" : "",
                  border:
                    homePage && !isScrolled
                      ? "2px solid hsl(var(--foreground))"
                      : "",
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={cn(
                  "z-0 hidden items-center justify-center gap-2 rounded-full lg:flex",
                  homePage && "h-15 px-5",
                )}
              >
                <NavigationMenu delayDuration={Infinity}>
                  <NavigationMenuList className="gap-2">
                    <NavigationMenuItem>
                      <NavigationMenuTrigger
                        isCurrent={isActiveResources}
                        className={cn(
                          "hidden border-2 border-transparent bg-transparent hover:border-foreground/70 data-[state=open]:border-foreground xl:flex",
                          // homePage && "bg-transparent",
                          isActiveResources && activeMainItemClasses,
                        )}
                        onPointerMove={(event) => event.preventDefault()}
                        onPointerLeave={(event) => event.preventDefault()}
                      >
                        Resources
                      </NavigationMenuTrigger>
                      <NavigationMenuContent
                        onPointerEnter={(event) => event.preventDefault()}
                        onPointerLeave={(event) => event.preventDefault()}
                      >
                        <div className="flex w-[400px] flex-col gap-1 p-3 lg:w-max xl:max-w-[700px]">
                          {filteredNavbarMenuResources.map((component) => {
                            const activeLink =
                              component.href.includes(currentPage) &&
                              pathname === component.href;
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
                <NavigationMenu delayDuration={Infinity}>
                  <NavigationMenuList className="gap-2">
                    <NavigationMenuItem>
                      <NavigationMenuTrigger
                        isCurrent={isActiveTheList}
                        className={cn(
                          "border-2 border-transparent bg-transparent hover:border-foreground/70 data-[state=open]:border-foreground",
                          // homePage && "bg-transparent",
                          isActiveTheList && activeMainItemClasses,
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
                          <Separator thickness={2} className="" />
                          <p className="m-0 text-center text-foreground/50">
                            Old Site
                          </p>
                          <Separator thickness={2} className="" />
                          {filteredNavbarMenuTheList
                            .filter((component) =>
                              component.title.includes("Old Site"),
                            )
                            .map((component) => {
                              const activeLink =
                                component.href.includes(currentPage) &&
                                currentPage !== "";
                              return (
                                <ListItem
                                  key={component.title}
                                  title={component.title.replace(
                                    "- (Old Site)",
                                    "",
                                  )}
                                  activeItem={activeLink}
                                  href={component.href}
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
                <NavigationMenu delayDuration={Infinity}>
                  <NavigationMenuList className="gap-2">
                    <NavigationMenuItem>
                      <NavigationMenuTrigger
                        isCurrent={isActiveAbout}
                        className={cn(
                          "hidden border-2 border-transparent bg-transparent hover:border-foreground/70 data-[state=open]:border-foreground xl:flex",
                          // homePage && "bg-transparent",
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

                {filteredNavbarLinks.map((link) => {
                  const activeLink =
                    link.href.includes(currentPage) && currentPage !== "";
                  return (
                    <Button
                      asChild
                      key={link.title}
                      className={cn(
                        "border-2 border-transparent bg-transparent font-semibold text-foreground hover:border-foreground/70 hover:bg-card/20",
                        activeLink &&
                          "border-foreground/50 hover:border-foreground/70",
                      )}
                      variant={link.isIcon ? "icon" : "default"}
                      size={link.isIcon ? "icon" : "default"}
                    >
                      <Link
                        href={link.href}
                        prefetch={true}
                        className="!text-base"
                        variant="standard"
                      >
                        {link.isIcon ? link.icon : link.title}
                      </Link>
                    </Button>
                  );
                })}
              </motion.div>

              {!user && (
                <motion.div
                  className="h-15 rounded-full px-1.5"
                  initial={{
                    backgroundColor: homePage ? "hsl(var(--card))" : "",

                    border: homePage ? "2px solid hsl(var(--foreground))" : "",
                  }}
                  animate={{
                    backgroundColor:
                      homePage && !isScrolled ? "hsl(var(--card))" : "",
                    border:
                      homePage && !isScrolled
                        ? "2px solid hsl(var(--foreground))"
                        : "2px solid rgba(0, 0, 0, 0)",
                  }}
                  transition={{
                    border: { duration: 0.5, ease: "easeInOut" },
                  }}
                >
                  <NavbarSigninSection className={cn("h-full")} />
                </motion.div>
              )}

              {user && (
                <motion.div
                  initial={{
                    backgroundColor: homePage ? "hsl(var(--card))" : "",

                    borderColor: homePage
                      ? "hsl(var(--foreground))"
                      : "rgba(0, 0, 0, 0)",
                  }}
                  animate={{
                    backgroundColor:
                      homePage && !isScrolled ? "hsl(var(--card))" : "",

                    borderColor:
                      homePage && !isScrolled
                        ? "hsl(var(--foreground))"
                        : "rgba(0, 0, 0, 0)",
                  }}
                  className={cn(
                    "hidden h-15 w-fit items-center gap-4 justify-self-end rounded-full border-2 py-1 pl-2 pr-5 lg:flex",
                    isAdmin && "pl-5",
                  )}
                >
                  <UserProfile className="size-10" />

                  <FullPageNav
                    user={user}
                    subStatus={subStatus}
                    userPref={userPref ?? null}
                  />
                  {(hasActiveSubscription || isAdmin) && (
                    <Search
                      // invisible
                      title={"Search"}
                      source={dashboardNavItems}
                      className="lg:hidden"
                      placeholder="Search..."
                    />
                  )}
                </motion.div>
              )}
            </>
          )}

          {/* ------ Mobile Right side ------ */}

          <div className="z-20 flex w-full items-center justify-end gap-2 lg:hidden">
            {user && (
              <NotificationsDropdown
                setTooltipDisabled={() => {}}
                tooltipDisabled={true}
                className=""
                user={user}
                userPref={userPref}
              />
            )}
            <FullPageNav
              // userId={userId}
              isMobile={isMobile}
              isScrolled={isScrolled}
              user={user}
              userPref={userPref ?? null}
              subStatus={subStatus}
            />
          </div>
        </div>
      </motion.nav>
    </>
  );
}

export const ListItem = React.forwardRef<
  React.ComponentRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { href: string } & {
    activeItem?: boolean;
  }
>(({ className, title, href, activeItem, ...props }, ref) => {
  return (
    <div
      className={cn(
        "rounded-md p-2 font-bold decoration-2 underline-offset-4 transition-colors hover:underline active:underline-offset-2",
        activeItem && "pointer-events-none bg-background white:bg-salPinkLt",
        className,
      )}
    >
      {" "}
      <NavigationMenuLink asChild>
        <Link
          href={href}
          ref={ref}
          className={cn(
            "outline-hidden block select-none space-y-1 leading-none no-underline hover:no-underline",
          )}
          {...props}
        >
          <div className="dark:text-foregroundLt text-base font-medium leading-none">
            {title}
          </div>
        </Link>
      </NavigationMenuLink>
    </div>
  );
});
ListItem.displayName = "ListItem";
