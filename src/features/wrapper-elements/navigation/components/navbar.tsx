"use client";

import FullPageNav from "@/components/full-page-nav";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/custom-link";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { UserProfile } from "@/components/ui/user-profile";
import {
  landingPageNavbarLinks,
  landingPageNavbarMenuLinksResources as resources,
  theListNavbarMenuLinks as thelistitems,
} from "@/constants/navbars";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { User } from "@/types/user";
import { Unauthenticated } from "convex/react";
// import { useQuery } from "convex-helpers/react/cache"
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

interface NavBarProps {
  userId: string | undefined;
  user: User | undefined | null;
  // userPref: UserPref | null
  subStatus: string | undefined;
}

export default function NavBar({
  user,
  subStatus,
}: // userPref,
NavBarProps) {
  const isAdmin = user?.role?.includes("admin");
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const isMobile = useMediaQuery("(max-width: 768px)");
  // useMotionValueEvent(scrollY, "change", (latest) => {
  //   console.log("Page scroll: ", latest)
  // })
  const fullPagePath = pathname;
  const currentPage = pathname.split("/")[1];

  const [isScrolled, setIsScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const scrollThreshold = isMobile ? 50 : 150;
    setIsScrolled(latest > scrollThreshold);
  });

  const statusKey = subStatus ? subStatus : "none";
  const filteredNavbarLinks = landingPageNavbarLinks.filter(
    (link) =>
      link.sub.includes(statusKey) ||
      link.sub.includes("all") ||
      (link.sub.includes("public") &&
        (subStatus === "none" || subStatus === "cancelled")),
  );
  const filteredNavbarMenuResources = resources.filter(
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

  return (
    <>
      {/* ------ Desktop & Mobile: Main Navbar ----- */}
      <motion.nav
        id="navbar"
        initial={{ boxShadow: "none" }}
        animate={{
          boxShadow: isScrolled ? "var(--nav-shadow)" : "none",
          height: isScrolled ? "80px" : "100px",
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed left-0 right-0 top-0 z-20 h-25 w-screen bg-background"
      >
        <div className="relative mx-auto flex h-full w-screen items-center justify-between px-8 lg:grid lg:grid-cols-[300px_auto_200px]">
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
          <div className="absolute bottom-0 left-1/2 h-full w-25 -translate-x-1/2 bg-background" />
          <div className="flex items-center gap-2 lg:hidden">
            <motion.div
              id="logo-background-front"
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
              className="absolute bottom-0 left-1/2 z-10 rounded-full"
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
              {/* Desktop Logo & Navigation */}
              <motion.div
                id="logo-text-container"
                className="box-border hidden h-15 items-center gap-2 overflow-hidden rounded-full border-2 border-foreground p-[5px] lg:flex"
                initial={{
                  width: 60,
                  backgroundColor: "rgba(255, 255, 255, 1)",
                }}
                animate={{
                  width: isScrolled ? 60 : 250,
                  backgroundColor: isScrolled
                    ? "rgba(255, 255, 255, 0)"
                    : "rgba(255, 255, 255, 1)",
                }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                <Link
                  href="/"
                  className="flex items-center gap-2 overflow-hidden"
                >
                  <Image
                    src="/logotransparency.png"
                    alt="The Street Art List"
                    width={48}
                    height={48}
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
                      src="/saltext.png"
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
                // animate={{ opacity: isScrolled ? 0 : 1 }}
                // transition={{ duration: 0.3, ease: "easeOut" }}
                className="z-0 hidden items-center justify-center gap-2 lg:flex"
              >
                <NavigationMenu delayDuration={Infinity}>
                  <NavigationMenuList className="gap-2">
                    {isAdmin && (
                      <NavigationMenuItem>
                        <NavigationMenuTrigger
                          isCurrent={isActiveResources}
                          className={cn(
                            "border-2 border-transparent hover:border-foreground hover:bg-background data-[state=open]:border-foreground data-[state=open]:bg-background",
                            isActiveResources &&
                              "border-foreground/20 bg-backgroundDark/30 hover:border-foreground/40 hover:bg-backgroundDark/50",
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
                          <ul className="grid w-[400px] gap-2 p-4 lg:w-[500px] lg:grid-cols-2">
                            {filteredNavbarMenuResources.map((component) => (
                              <ListItem
                                key={component.title}
                                title={component.title}
                                href={component.href}
                                className={cn(
                                  "cursor-pointer text-balance transition-colors duration-200 ease-in-out",
                                  component.href.includes(currentPage) &&
                                    fullPagePath === component.href &&
                                    "bg-background",
                                )}
                              >
                                {component.description}
                              </ListItem>
                            ))}
                          </ul>
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                    )}
                    <NavigationMenuItem>
                      <NavigationMenuTrigger
                        isCurrent={isActiveTheList}
                        className={cn(
                          "border-2 border-transparent hover:border-foreground hover:bg-background data-[state=open]:border-foreground data-[state=open]:bg-background",
                          isActiveTheList &&
                            "border-foreground/20 bg-backgroundDark/30 hover:border-foreground/40 hover:bg-backgroundDark/50",
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
                        <ul className="grid w-[400px] gap-2 p-4 lg:w-max lg:grid-cols-3 xl:w-[700px]">
                          {filteredNavbarMenuTheList.map((component) => (
                            <ListItem
                              key={component.title}
                              title={component.title}
                              href={component.href}
                              className={cn(
                                "cursor-pointer text-balance transition-colors duration-200 ease-in-out",
                                component.href.includes(currentPage) &&
                                  currentPage !== "" &&
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

                {filteredNavbarLinks.map((link) => (
                  <Link key={link.title} href={link.href} prefetch={true}>
                    {!link.isIcon ? (
                      <Button className="h-9 border-2 border-transparent bg-background text-foreground hover:border-foreground hover:bg-background">
                        {link.title}
                      </Button>
                    ) : (
                      <Button
                        variant="icon"
                        className="bg-background text-foreground hover:scale-110 hover:bg-background"
                        size="icon"
                      >
                        {link.icon}
                      </Button>
                    )}
                  </Link>
                ))}
              </motion.div>

              {/* Right Side */}
              <Unauthenticated>
                <div className="hidden h-15 w-fit items-center justify-self-end lg:flex">
                  <div className="flex items-center gap-4">
                    <Link href="/auth/sign-in" prefetch={true}>
                      <Button
                        variant="link"
                        className="hidden rounded-full font-bold lg:block"
                      >
                        Sign in
                      </Button>
                    </Link>
                    <Link href="/auth/register" prefetch={true}>
                      <Button
                        variant="salWithShadowHiddenBg"
                        className="hidden rounded-full font-bold lg:block"
                      >
                        Sign up
                      </Button>
                    </Link>
                  </div>
                </div>
              </Unauthenticated>
              {user && (
                <div className="hidden h-15 w-fit items-center gap-4 justify-self-end pr-5 lg:flex">
                  <UserProfile className="size-10" subscription={subStatus} />

                  <FullPageNav user={user} subStatus={subStatus} />
                </div>
              )}
            </>
          )}

          {/* ------ Mobile Right side ------ */}

          <div className="z-20 flex w-full items-center justify-end lg:hidden">
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
            <FullPageNav
              // userId={userId}
              isMobile={isMobile}
              isScrolled={isScrolled}
              user={user}
              // userPref={userPref}
              subStatus={subStatus}
            />
          </div>
        </div>
      </motion.nav>
    </>
  );
}

export const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { href: string }
>(({ className, title, children, href, ...props }, ref) => {
  return (
    <li
      className={cn(
        "rounded-md transition-colors hover:bg-salPink/50",
        className,
      )}
    >
      <NavigationMenuLink asChild>
        <Link
          href={href}
          ref={ref}
          className={cn(
            "outline-hidden block select-none space-y-1 p-3 leading-none no-underline hover:no-underline",
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
