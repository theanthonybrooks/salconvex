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
import { landingPageLogo } from "@/constants/logos"
import {
  landingPageNavbarMenuLinks as components,
  landingPageNavbarLinks,
} from "@/constants/navbars"
import { cn } from "@/lib/utils"
import { Unauthenticated } from "convex/react"
// import { useQuery } from "convex-helpers/react/cache"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import React from "react"

interface NavBarProps {
  userId: string | undefined
  user: Record<string, any> | null
  userPref: Record<string, any> | null
  subStatus: string | undefined
}

export default function NavBar({
  userId,
  user,
  subStatus,
  userPref,
}: NavBarProps) {
  const { path } = landingPageLogo[0]
  // const { subStatus } =
  //   useQuery(api.subscriptions.getUserSubscriptionStatus) || {}

  const statusKey = subStatus ? subStatus : "none"
  const filteredNavbarLinks = landingPageNavbarLinks.filter(
    (link) => link.sub.includes(statusKey) || link.sub.includes("all")
  )
  const filteredNavbarMenu = components.filter(
    (link) => link.sub.includes(statusKey) || link.sub.includes("all")
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut", delay: 0.05 }}
      className='fixed left-0 right-0 top-0 z-50  border-black  sm:bg-transparent bg-background'>
      {/* add bg background for mobile */}

      <div className='mx-auto flex w-screen items-center justify-between pb-6 pt-8 sm:py-4 px-8'>
        {/* Mobile Logo and Navigation */}
        <div className='flex items-center gap-2 sm:hidden'>
          <div className='hidden mt-6 flex-col gap-1'></div>

          <Link
            href='/'
            prefetch={true}
            className='hidden sm:flex items-center gap-2'>
            {/* <span className='font-semibold'>The Street Art List</span> */}
            <Image
              src='/saltext.png'
              alt='The Street Art List'
              width={100}
              height={40}
            />
          </Link>
        </div>

        {/* Desktop Logo */}
        <div className='hidden items-center gap-2 lg:flex'>
          <Link href={path} prefetch={true} className='flex items-center gap-2'>
            {/* <Image src={image} alt={alt} width={width} height={height} /> */}
            {/* <span className='font-semibold'>{text}</span> */}
            <Image
              src='/saltext.png'
              alt='The Street Art List'
              width={175}
              height={80}
            />
          </Link>
        </div>

        {userId === "snail" && (
          <div className='hidden items-center gap-6 lg:flex'>
            {/* Desktop Navigation */}

            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className='grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]'>
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
        )}

        {/* Right Side */}
        <div className='flex items-center gap-4'>
          {/* <h1>{user?.image}</h1> */}
          {/* <ModeToggle /> */}

          {/* <Switch darkMode={true} /> */}

          {/* {isLoading && <LucideLoaderCircle className='h-6 w-6 animate-spin' />} */}
          {userId !== "guest" && user && <UserProfile user={user} />}
          <Unauthenticated>
            <Link
              href='/auth/sign-in'
              prefetch={true}
              className='hidden sm:block'>
              <Button className='font-bold' variant='salWithShadowHidden'>
                Sign in
              </Button>
            </Link>
          </Unauthenticated>
          <FullPageNav
            userId={userId}
            user={user}
            userPref={userPref}
            subStatus={subStatus}
          />
        </div>
      </div>
    </motion.div>
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
