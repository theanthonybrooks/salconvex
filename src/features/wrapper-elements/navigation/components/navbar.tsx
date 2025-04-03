"use client";

import FullPageNav from "@/components/full-page-nav";
import { Button } from "@/components/ui/button";
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
  landingPageNavbarMenuLinksTheList as thelistitems,
} from "@/constants/navbars";
import { cn } from "@/lib/utils";
import { User } from "@/types/user";
import { Authenticated, Unauthenticated } from "convex/react";
// import { useQuery } from "convex-helpers/react/cache"
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

interface NavBarProps {
  userId: string | undefined;
  user: User | undefined | null;
  // userPref: UserPref | null
  subStatus: string | undefined;
}

export default function NavBar({
  userId,
  user,
  subStatus,
}: // userPref,
NavBarProps) {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [isMobile, setIsMobile] = useState(false);
  // useMotionValueEvent(scrollY, "change", (latest) => {
  //   console.log("Page scroll: ", latest)
  // })

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
      {/* ------ Mobile Only circle underlay ----- */}

      <motion.div
        animate={{
          height: isScrolled ? "80px" : "100px",
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed left-0 right-0 top-0 z-[19] h-25"
      >
        <div className="relative mx-auto flex h-full w-screen items-center justify-between px-8 lg:hidden lg:py-4">
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
        </div>
      </motion.div>

      {/* ------ Desktop & Mobile: Main Navbar ----- */}
      <motion.div
        initial={{ boxShadow: "none" }}
        animate={{
          boxShadow: isScrolled ? "var(--nav-shadow)" : "none",
          height: isScrolled ? "80px" : "100px",
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed left-0 right-0 top-0 z-[51] h-25 border-foreground bg-background"
      >
        <div className="mx-auto flex h-full w-screen items-center px-8 md:grid md:grid-cols-[300px_auto_200px]">
          {/* Mobile Logo and Navigation */}

          <div className="flex items-center gap-2 lg:hidden">
            <motion.div
              initial={{ translateX: "-50%", translateY: 14 }}
              animate={{ translateX: "-50%", translateY: 14 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="absolute bottom-0 left-1/2 z-10"
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

                  // className='z-10'
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
                className="box-border hidden h-15 items-center gap-2 overflow-hidden rounded-full border-2 border-foreground p-[5px] lg:flex"
                animate={{
                  width: isScrolled ? "60px" : "250px",
                  backgroundColor: isScrolled ? "var(--background)" : "white",
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
                      width={175}
                      height={80}
                      className="mt-1"
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
                    <NavigationMenuItem>
                      <NavigationMenuTrigger
                        isCurrent={isActiveResources}
                        className={cn(
                          "border-2 border-transparent hover:border-foreground hover:bg-background data-[state=open]:border-foreground data-[state=open]:bg-white",
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
                    <NavigationMenuItem>
                      <NavigationMenuTrigger
                        isCurrent={isActiveTheList}
                        className={cn(
                          "border-2 border-transparent hover:border-foreground hover:bg-background data-[state=open]:border-foreground data-[state=open]:bg-white",
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
                        <ul className="grid w-[400px] gap-2 p-4 lg:w-[500px] lg:grid-cols-2">
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
              // subStatus={subStatus}
            />
          </div>
        </div>
      </motion.div>
    </>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { href: string }
>(({ className, title, children, href, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          href={href}
          ref={ref}
          className={cn(
            "outline-hidden block select-none space-y-1 rounded-md p-3 leading-none no-underline transition-colors hover:bg-salPink/50 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className,
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
