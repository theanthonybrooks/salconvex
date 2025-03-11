"use client"

import FullPageNav from "@/components/full-page-nav"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { UserProfile } from "@/components/ui/user-profile"
import {
  landingPageNavbarMenuLinks as components,
  landingPageNavbarLinks,
} from "@/constants/navbars"
import { cn } from "@/lib/utils"
import { Unauthenticated } from "convex/react"
// import { useQuery } from "convex-helpers/react/cache"
import { motion, useMotionValueEvent, useScroll } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import React, { useEffect, useState } from "react"

interface NavBarProps {
  userId: string | undefined
  user: User | undefined | null
  // userPref: UserPref | null
  subStatus: string | undefined
}

export default function NavBar({
  userId,
  user,
  subStatus,
}: // userPref,
NavBarProps) {
  const { scrollY } = useScroll()
  const [isMobile, setIsMobile] = useState(false)
  // useMotionValueEvent(scrollY, "change", (latest) => {
  //   console.log("Page scroll: ", latest)
  // })

  const [isScrolled, setIsScrolled] = useState(false)

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 150)
  })
  // const { subStatus } =
  //   useQuery(api.subscriptions.getUserSubscriptionStatus) || {}

  const statusKey = subStatus ? subStatus : "none"
  const filteredNavbarLinks = landingPageNavbarLinks.filter(
    (link) => link.sub.includes(statusKey) || link.sub.includes("all")
  )
  const filteredNavbarMenu = components.filter(
    (link) => link.sub.includes(statusKey) || link.sub.includes("all")
  )

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
      {/* ------ Mobile Only circle underlay ----- */}
      {isMobile && (
        <motion.div
          initial={{ boxShadow: "none" }}
          animate={{
            height: isScrolled ? "80px" : "100px",
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className='fixed left-0 right-0 top-0 z-[19] h-25  '>
          <div className='mx-auto flex w-screen items-center justify-between h-full lg:py-4 px-8 relative lg:hidden'>
            <motion.div
              initial={{ boxShadow: "none", height: 90, width: 90 }}
              animate={{
                boxShadow: isScrolled ? "var(--nav-shadow)" : "none",
                height: isScrolled ? 70 : 90,
                width: isScrolled ? 70 : 90,
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={cn(
                "z-0 absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[24px] flex items-center justify-center bg-background rounded-full lg:hidden "
              )}
            />
          </div>
        </motion.div>
      )}
      {/* ------ Desktop & Mobile: Main Navbar ----- */}
      <motion.div
        initial={{ boxShadow: "none" }}
        animate={{
          boxShadow: isScrolled && isMobile ? "var(--nav-shadow)" : "none",
          height: isScrolled && isMobile ? "80px" : "100px",
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className='fixed left-0 right-0 top-0 z-20 h-25  border-black  lg:bg-transparent bg-background '>
        <div className='mx-auto flex w-screen items-center justify-between h-full lg:py-4 px-8 relative'>
          {/* Mobile Logo and Navigation */}
          {isMobile && (
            <div className='lg:hidden items-center gap-2 flex'>
              <motion.div
                initial={{ translateX: "-50%" }}
                animate={{
                  translateX: isScrolled ? "-50%" : "-50%",
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className='absolute bottom-0 left-1/2 translate-y-[13px] z-10'
                style={{ transform: "translateX(-50%)" }}>
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
                    src='/sitelogo.svg'
                    alt='The Street Art List'

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
                  "z-0 absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[24px] h-[90px] w-[90px] flex items-center justify-center bg-background rounded-full "
                )}
              />
            </div>
          )}

          {!isMobile && (
            <>
              {/* Desktop Logo & Navigation */}
              <motion.div
                className='hidden lg:flex h-15 items-center gap-2 bg-white rounded-full border-2 border-black p-1 overflow-hidden'
                animate={{
                  width: isScrolled ? "60px" : "250px",
                }}
                transition={{ duration: 0.4, ease: "easeInOut" }}>
                <Link
                  href='/'
                  className='flex items-center gap-2 overflow-hidden'>
                  <Image
                    src='/sitelogo.svg'
                    alt='The Street Art List'
                    width={50}
                    height={50}
                    priority={true}
                    className='z-10 shrink-0'
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
                    className='shrink-0 whitespace-nowrap'>
                    <Image
                      src='/saltext.png'
                      alt='The Street Art List'
                      width={175}
                      height={80}
                    />
                  </motion.div>
                </Link>
              </motion.div>

              {/* Desktop Navigation */}
              <div className='hidden items-center gap-6 lg:flex'>
                <NavigationMenu>
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className='grid w-[400px] gap-3 p-4 lg:w-[500px] lg:grid-cols-2 '>
                          {filteredNavbarMenu.map((component) => (
                            <ListItem
                              key={component.title}
                              title={component.title}
                              href={component.href}>
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
                      <Button variant='ghost'>{link.title}</Button>
                    ) : (
                      <Button variant='ghost' size='icon'>
                        {link.icon}
                      </Button>
                    )}
                  </Link>
                ))}
              </div>

              {/* Right Side */}
              <div className='hidden lg:flex items-center h-15 w-fit bg-white rounded-full p-1 pr-5 border-2 border-black'>
                <div className='flex items-center gap-4'>
                  <Unauthenticated>
                    <Link href='/auth/sign-in' prefetch={true}>
                      <Button
                        variant='salWithShadowHidden'
                        className='font-bold hidden lg:block ml-2 my-1 rounded-full '>
                        Sign in
                      </Button>
                    </Link>
                  </Unauthenticated>
                  {userId !== "guest" && user && <UserProfile user={user} />}
                  <FullPageNav user={user} />
                </div>
              </div>
            </>
          )}

          {/* ------ Mobile Right side ------ */}
          {isMobile && (
            <div className='flex items-center justify-end w-full  lg:hidden'>
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
                isScrolled={isScrolled}
                user={user}
                // userPref={userPref}
                // subStatus={subStatus}
              />
            </div>
          )}
        </div>
      </motion.div>
    </>
  )
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
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}>
          <div className='text-sm font-medium leading-none'>{title}</div>
          <p className='line-clamp-2 text-sm leading-snug text-muted-foreground'>
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"
