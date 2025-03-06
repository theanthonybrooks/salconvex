"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import ThemeToggle from "@/components/ui/theme-toggle"
import { mainMenuItems } from "@/constants/menu"
import { footerCRText } from "@/constants/text"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import { useTheme } from "next-themes"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { FaRegEnvelope } from "react-icons/fa"
import {
  FaFacebookF,
  FaInstagram,
  FaThreads,
  FaUserNinja,
} from "react-icons/fa6"

interface FullPageNavProps {
  userId?: string | undefined
  user?: Record<string, any> | null
  userPref?: Record<string, any> | null
  subStatus?: string | undefined
}

const menuVariants = {
  open: {
    width: ["4em", "100vw", "100vw", "100vw"],
    height: [40, 80, "50vw", "100vh"],
    top: [17, 0, 0, 0],
    right: [41, 0, 0, 0],
    borderRadius: [40, 40, 20, 0],
    transition: { duration: 0.75, ease: [0.76, 0, 0.24, 1] },
    opacity: [1, 1, 1, 1],
  },
  closed: {
    width: ["100vw", "99vw", "97vw", "4em"],
    height: ["100vh", "5.5vh", 40, 39],
    top: [0, 17, 17, 17],
    right: [0, 41, 41, 41],
    borderRadius: [0, 20, 40, 40],
    transition: { duration: 0.75, ease: [0.76, 0, 0.24, 1] },
    opacity: [1, 1, 1, 1],
  },
  initial: {
    width: [0],
    height: [0],
    top: [20],
    right: [35],
    borderRadius: [40],
    transition: { duration: 0, ease: [0.76, 0, 0.24, 1] },
    opacity: [0],
  },
}

const FullPageNav = ({
  userId,
  user,
  subStatus,
  userPref,
}: FullPageNavProps) => {
  const { theme } = useTheme()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState("initial")
  const [activeCategory, setActiveCategory] = useState(
    mainMenuItems.find((section) =>
      section.items.some((item) => item.path === pathname)
    )?.title || "General"
  )
  const [isActive, setIsActive] = useState(pathname)
  const footerText = footerCRText()

  const activeMenuItems = mainMenuItems.find(
    (section) => section.title === activeCategory
  )

  useEffect(() => {
    if (isOpen === "open") {
      document.body.classList.add("no-scroll")
      setActiveCategory(
        () =>
          mainMenuItems.find((section) =>
            section.items.some((item) => item.path === pathname)
          )?.title || "General"
      )
    } else {
      document.body.classList.remove("no-scroll")
      setActiveCategory("")
    }
    return () => {
      document.body.classList.remove("no-scroll")
    }
  }, [isOpen, pathname])

  const onHandleLinkClick = () => {
    setTimeout(() => {
      setIsOpen("closed")
    }, 750)
  }

  return (
    <div className='z-[100]'>
      {/* Menu Button */}
      <div className='flex flex-row gap-x-4 items-center justify-between relative w-full z-20'>
        {/* <ThemeToggle userPref={themePref} /> */}

        {/* //NOTE: Add sliding up animation later; will require making a button
        lookalike with two divs/spans inside that move up and down and have an
        overflow of hidden */}
        {isOpen === "open" && user && (
          <div className='flex flex-row items-center gap-2 mr-16'>
            <Avatar className='h-9 w-9 rounded-full border border-border '>
              <AvatarImage
                src={user?.image}
                alt={user?.name || "User Profile"}
              />

              <AvatarFallback
                className={cn(
                  "border-border border bg-userIcon  text-blue-900 font-bold dark:bg-blue-950 dark:text-blue-200"
                )}>
                {/* {user?.firstName?.[0]}
                {user?.lastName?.[0]} */}
                <FaUserNinja className='h-6 w-6' />
                {/* <FaRegFaceFlushed className='h-6 w-6' /> */}
              </AvatarFallback>
            </Avatar>

            <div className='flex flex-col space-y-1'>
              <p className='text-sm font-medium leading-none'>{user?.name}</p>
              <p className='text-xs leading-none text-muted-foreground'>
                {user?.email}
              </p>
            </div>
          </div>
        )}
        <div className='flex items-center justify-center'>
          {isOpen === "open" && <ThemeToggle userPref={userPref?.theme} />}
          <Button
            variant='salWithShadowHidden'
            onClick={() =>
              setIsOpen(
                isOpen === "initial"
                  ? "open"
                  : isOpen === "open"
                  ? "closed"
                  : "open"
              )
            }
            className={cn(
              "w-[6em] bg-background font-bold",
              isOpen === "open" ? "bg-salPink" : "bg-background"
            )}>
            {isOpen === "open" ? "CLOSE" : "MENU"}
          </Button>
        </div>
      </div>

      {/* /~ Fullscreen Menu Overlay ~/ */}
      <AnimatePresence>
        <motion.div
          className={cn(
            "top-5 right-5 w-full h-full fixed flex flex-col box-border bg-background",
            isOpen === "open" || isOpen === "closed"
              ? "bg-background"
              : "bg-none",
            "bg-background"
          )}
          variants={menuVariants}
          initial='initial'
          // initial={{ width: "4em", height: 30 }}
          animate={isOpen}
          // exit='closed'
          transition={{ duration: 0.4, ease: "easeInOut" }}>
          {/* Expanding content */}
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "100%" }}
            transition={{ duration: 0.4, ease: "easeInOut", delay: 0.6 }}
            className='w-full h-full flex flex-col'>
            {/* Grid Layout */}
            {isOpen === "open" && (
              <>
                <div className='flex-1 grid grid-cols-3 gap-4 divide-x-1.5 divide-solid divide-black overflow-hidden'>
                  {/* Column 1 - Main Titles */}
                  <motion.div
                    className='p-4 ml-20 flex items-center justify-start'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.4 }}>
                    <ul
                      className={cn(
                        "font-black text-[3rem] lg:text-[4.5rem] space-y-3",
                        "font-tanker lowercase"
                      )}>
                      {mainMenuItems.map((section) => {
                        const filteredItems = section.items.filter((item) => {
                          const itemCategory = item.category.toLowerCase()
                          return (
                            item.public === true ||
                            itemCategory === "thelist" ||
                            user?.accountType?.some(
                              (type: any) => type.toLowerCase() === itemCategory
                            )
                          )
                        })

                        if (filteredItems.length === 0) return null

                        return (
                          <li key={section.title} className='cursor-pointer'>
                            <div
                              onClick={() => setActiveCategory(section.title)}
                              className={cn(
                                "cursor-pointer flex items-center gap-1 hover:translate-x-3 transition-transform ease-in-out duration-300",
                                activeCategory === section.title &&
                                  "stroked wshadow ",
                                activeCategory === section.title &&
                                  theme === "default" &&
                                  "text-white",
                                activeCategory === section.title &&
                                  theme === "light" &&
                                  "text-salYellow"
                              )}>
                              {/* {activeCategory === section.title && (
                                <GoDotFill className='text-black size-8 md:size-14' />
                              )} */}
                              {section.title}
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  </motion.div>

                  {/* Column 2 - Secondary Titles */}
                  <motion.div
                    className='p-4 flex items-center justify-center scrollable mini max-h-screen'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9, duration: 0.4 }}>
                    <ul className='font-black text-[1.2rem] lg:text-[3rem] space-y-3 font-tanker lowercase'>
                      {activeMenuItems?.items
                        .filter((item) => {
                          const itemCategory = item.category.toLowerCase()
                          return (
                            item.public === true || // Always show public items
                            itemCategory === "thelist" || // Always show thelist items
                            user?.accountType?.some(
                              (type: any) => type.toLowerCase() === itemCategory // Show if user matches item category
                            )
                          )
                        })
                        .map((item) => (
                          <li key={item.title}>
                            <div
                              className={cn(
                                "cursor-pointer transition-all duration-100 ease-in-out hover:translate-x-2 ",
                                pathname === item.path &&
                                  "stroked text-background"
                                // item.path.includes("dashboard") &&
                                //   "text-salPink"
                              )}>
                              <Link
                                onClick={onHandleLinkClick}
                                href={item.path}
                                className={cn(
                                  "cursor-pointer  ",
                                  pathname === item.path &&
                                    "stroked text-background translate-x-2"
                                  // item.path.includes("dashboard") &&
                                  //   "text-salPink"
                                )}>
                                {item.title}
                              </Link>
                            </div>
                          </li>
                        ))}
                    </ul>
                  </motion.div>

                  {/* Column 3 */}
                  <motion.div
                    className='p-4 pb-8 flex flex-col gap-y-4 items-center justify-end'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1, duration: 0.4 }}>
                    {/* <div className='h-[30%] w-[80%] flex flex-col  border-black border-1.5 border-dotted rounded-lg p-8'>
                      <p>User Notifications</p>
                      <Separator />
                      <p className='italic text-sm'>Nothing to see here yet</p>
                    </div>
                    <div className='h-[50%] w-[80%] flex flex-col  border-black border-1.5 border-dotted rounded-lg p-8'>
                      <p>Applications</p>
                      <Separator className='mb-2' />
                      <ol className='flex flex-col gap-y-3'>
                        <li className='flex gap-x-4 text-emerald-500'>
                          <p className=' text-sm'>Blah Event</p> -{" "}
                          <span className='text-sm flex gap-x-2'>
                            <CheckCircle />
                            Accepted
                          </span>
                          <span className='text-sm flex gap-x-2'>
                            1-25-2025
                          </span>
                        </li>
                        <li className='flex gap-x-4 text-emerald-500'>
                          <p className=' text-sm'>Blah Event</p> -{" "}
                          <span className='text-sm flex gap-x-2'>
                            <CheckCircle />
                            Accepted
                          </span>
                          <span className='text-sm flex gap-x-2'>
                            1-16-2025
                          </span>
                        </li>
                        <li className='flex gap-x-4 text-red-500'>
                          <p className=' text-sm'>Blah Event</p> -{" "}
                          <span className='text-sm flex gap-x-2'>
                            <XCircle />
                            Rejected
                          </span>
                          <span className='text-sm flex gap-x-2'>1-8-2025</span>
                        </li>
                        <li className='flex gap-x-4 text-red-500'>
                          <p className=' text-sm'>Blah Event</p> -{" "}
                          <span className='text-sm flex gap-x-2'>
                            <XCircle />
                            Rejected
                          </span>
                          <span className='text-sm flex gap-x-2'>1-2-2025</span>
                        </li>
                      </ol>
                    </div> */}
                  </motion.div>
                </div>

                {/* Fixed Bottom Row */}
                <motion.div
                  className='h-[55px]  border-t-1.5 border-black text-foreground flex items-center justify-between px-8'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1, duration: 0.4 }}>
                  <div className='flex space-x-4'>
                    <Link
                      href='https://facebook.com/thestreetartlist'
                      target='_blank'>
                      <Button variant='ghost' size='icon'>
                        <FaFacebookF className='h-5 w-5' />
                      </Button>
                    </Link>
                    <Link
                      href='https://instagram.com/thestreetartlist'
                      target='_blank'>
                      <Button variant='ghost' size='icon'>
                        <FaInstagram className='h-5 w-5' />
                      </Button>
                    </Link>
                    <Link
                      href='https://threads.net/thestreetartlist'
                      target='_blank'>
                      <Button variant='ghost' size='icon'>
                        <FaThreads className='h-5 w-5' />
                      </Button>
                    </Link>
                    {/* <Link href='https://patreon.com/thestreetartlist' target='_blank'>
                <Button variant='ghost' size='icon'>
                  <FaPatreon className='h-5 w-5' />
                </Button>
              </Link> */}
                    <Link
                      href='mailto:info@thestreetartlist.com'
                      target='_blank'>
                      <Button variant='ghost' size='icon'>
                        <FaRegEnvelope className='h-5 w-5' />
                      </Button>
                    </Link>
                  </div>
                  <div className='flex space-x-2 text-sm items-center'>
                    <p>Made with ❤️ by</p>
                    <Link
                      href='https://theanthonybrooks.com'
                      target='_blank'
                      className=' decoration-black focus:underline focus:decoration-black focus:decoration-2  focus-visible:underline-offset-2 hover:underline-offset-2 hover:underline cursor-pointer'>
                      Anthony Brooks
                    </Link>
                  </div>
                  <div className='text-center text-sm text-gray-600 dark:text-gray-400'>
                    {footerText.text}
                  </div>
                </motion.div>
              </>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default FullPageNav
