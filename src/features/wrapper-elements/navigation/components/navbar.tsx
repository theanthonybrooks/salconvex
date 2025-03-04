"use client"

import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import {
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import ThemeToggle from "@/components/ui/theme-toggle"
import { UserProfile } from "@/components/ui/user-profile"
import { landingPageLogo } from "@/constants/logos"
import {
  landingPageNavbarMenuLinks as components,
  landingPageNavbarLinks,
} from "@/constants/navbars"
import { cn } from "@/lib/utils"
import { Dialog } from "@radix-ui/react-dialog"
// import { useQuery } from "convex-helpers/react/cache"
import { Unauthenticated } from "convex/react"
import { motion } from "framer-motion"
import { Menu, Sparkles } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import React from "react"
import { FaGithub, FaTwitter, FaYoutube } from "react-icons/fa"

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
      initial={{ y: 0, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className='fixed left-0 right-0 top-0 z-50 border-b-2 border-black bg-background backdrop-blur-md dark:bg-background'>
      <div className='mx-auto flex w-screen items-center justify-between p-4 px-8'>
        {/* Mobile Logo and Navigation */}
        <div className='flex items-center gap-2 lg:hidden'>
          <Dialog>
            <SheetTrigger asChild>
              <Button variant='ghost' size='icon' className='lg:hidden'>
                <Menu className='h-5 w-5' />
              </Button>
            </SheetTrigger>
            <SheetContent side='left' className='w-[300px]'>
              <SheetHeader className='border-b pb-6'>
                <SheetTitle className='flex items-center gap-2'>
                  <Sparkles className='h-5 w-5 text-blue-600' />
                  {/* <span>The Street Art List</span> */}
                  <Image
                    src='/saltext.png'
                    alt='The Street Art List'
                    width={100}
                    height={40}
                  />
                </SheetTitle>
              </SheetHeader>
              <div className='mt-6 flex flex-col gap-1'>
                <div className='px-2 pb-4'>
                  <h2 className='mb-2 text-sm font-medium text-muted-foreground'>
                    Navigation
                  </h2>
                  {filteredNavbarMenu.map((item) => (
                    <Link key={item.href} href={item.href} prefetch={true}>
                      <Button
                        variant='ghost'
                        className='mb-2 h-11 w-full justify-start border border-muted/40 text-base font-normal transition-colors hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/50 dark:hover:text-blue-400'>
                        {item.title}
                      </Button>
                    </Link>
                  ))}
                </div>
                <div className='border-t px-2 py-4'>
                  <h2 className='mb-2 text-sm font-medium text-muted-foreground'>
                    Links
                  </h2>
                  <Link
                    href='https://github.com/michaelshimeles/nextjs14-starter-template'
                    target='_blank'
                    prefetch={true}>
                    <Button
                      variant='ghost'
                      className='mb-2 h-11 w-full justify-start border border-muted/40 text-base font-normal transition-colors hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/50 dark:hover:text-blue-400'>
                      <FaGithub className='mr-2 h-4 w-4' />
                      GitHub
                    </Button>
                  </Link>
                  <Link
                    href='https://twitter.com/rasmickyy'
                    target='_blank'
                    prefetch={true}>
                    <Button
                      variant='ghost'
                      className='mb-2 h-11 w-full justify-start border border-muted/40 text-base font-normal transition-colors hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/50 dark:hover:text-blue-400'>
                      <FaTwitter className='mr-2 h-4 w-4' />X (Twitter)
                    </Button>
                  </Link>
                  <Link
                    href='https://youtube.com/@rasmickyy'
                    target='_blank'
                    prefetch={true}>
                    <Button
                      variant='ghost'
                      className='h-11 w-full justify-start border border-muted/40 text-base font-normal transition-colors hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/50 dark:hover:text-blue-400'>
                      <FaYoutube className='mr-2 h-4 w-4' />
                      YouTube
                    </Button>
                  </Link>
                </div>
                {/* < Unauthenticated> */}
                {userId === "guest" && (
                  <Link href='/auth/sign-in' prefetch={true}>
                    <Button className='font-bold' variant='salWithShadowHidden'>
                      Sign in
                    </Button>
                  </Link>
                )}
                {/* </Unauthenticated> */}
              </div>
            </SheetContent>
          </Dialog>
          <Link href='/' prefetch={true} className='flex items-center gap-2'>
            <Sparkles className='h-5 w-5 text-blue-600' />
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

        {/* Desktop Navigation */}
        <div className='hidden items-center gap-6 lg:flex'>
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

        {/* Right Side */}
        <div className='flex items-center gap-2'>
          {/* <h1>{user?.image}</h1> */}
          {/* <ModeToggle /> */}
          <ThemeToggle userPref={userPref} />
          {/* <Switch darkMode={true} /> */}
          <Unauthenticated>
            <Link href='/auth/sign-in' prefetch={true}>
              <Button className='font-bold' variant='salWithShadowHidden'>
                Sign in
              </Button>
              {/* <motion.button
                className='font-bold rounded-md px-4 py-2 text-center text-sm border-black border-2 bg-white text-black'
                initial={{
                  boxShadow: "0px 0px 0px rgba(0, 0, 0, 0)",
                  x: 0,
                  y: 0,
                }}
                animate={{ boxShadow: "0px 0px 0px rgba(0, 0, 0, 0)" }}
                whileHover={{
                  boxShadow: [
                    "0px 0px 0px rgba(0, 0, 0, 0)",
                    "-5px 5px 0px rgba(0, 0, 0, 1)",
                  ],
                  x: 3,
                  y: -3,
                }}
                whileTap={{
                  boxShadow: "0px 0px 0px rgba(0, 0, 0, 1)",
                  x: 0,
                  y: 0,
                }}
                transition={{
                  boxShadow: {
                    type: "keyframes",
                    duration: 0.3,
                    ease: "linear",
                  },
                }}>
                Sign in
              </motion.button> */}
            </Link>
          </Unauthenticated>

          {userId !== "guest" && <UserProfile user={user} />}
          {/* {isLoading && <LucideLoaderCircle className='h-6 w-6 animate-spin' />} */}
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
