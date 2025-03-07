"use client"

import { Button } from "@/components/ui/button"
import ThemeToggle from "@/components/ui/theme-toggle"
import { mainMenuItems } from "@/constants/menu"
import { footerCRText } from "@/constants/text"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import { useTheme } from "next-themes"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { FaRegEnvelope } from "react-icons/fa"
import { FaFacebookF, FaInstagram, FaThreads } from "react-icons/fa6"

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
    transition: { duration: 0.75, ease: [0.1, 0, 0.36, 1] },
    opacity: [1, 1, 1, 1],
  },
  closed: {
    width: ["100vw", "99vw", "98vw", "4em"],
    height: ["100vh", 40, 40, 39],
    top: [0, 17, 17, 17],
    right: [0, 0, 41, 41],
    borderRadius: [0, 20, 40, 40],
    // transition: { duration: 0.75, ease: [0.83, 0, 0.1, 1] },
    transition: { duration: 0.75, ease: [0.68, -0.55, 0.27, 1.55] },

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
const mobileMenuVariants = {
  open: {
    width: ["4em", "100vw", "100vw", "100vw", "100vw"],
    height: [40, 100, 100, 100, 100, 1000],
    top: [17, 0, 0, 0],
    right: [41, 0, 0, 0],
    borderRadius: [40, 40, 20, 0],
    transition: { duration: 1.25, ease: [0.5, 1, 0.56, 0.81] },
    opacity: [1, 1, 1],
  },
  // closed: {
  //   width: ["100vw", "99vw", "98vw", "4em"],
  //   height: ["100vh", 40, 40, 39],
  //   top: [0, 17, 17, 17],
  //   right: [0, 0, 41, 41],
  //   borderRadius: [0, 20, 40, 40],
  //   // transition: { duration: 0.75, ease: [0.83, 0, 0.1, 1] },
  //   transition: { duration: 0.75, ease: [0.68, -0.55, 0.27, 1.55] },

  //   opacity: [1, 1, 1, 1],
  // },
  closed: {
    width: [0],
    height: [0],
    top: [0],
    right: [0],
    borderRadius: [0],

    // transition: { duration: 0.75, ease: [0.83, 0, 0.1, 1] },
    transition: { duration: 0.75, ease: [0.68, -0.55, 0.27, 1.55] },

    opacity: [1],
  },
  mobileInitial: {
    width: [0],
    height: [0],
    top: [20],
    right: [35],
    borderRadius: [40],
    transition: { duration: 0, ease: [0.76, 0, 0.24, 1] },
    opacity: [0],
  },
}

const screenOverlayVariants = {
  overlayInitial: {
    display: "none",
    opacity: 0,
    height: "100vh",
    width: "100vw",
  },
  open: {
    display: ["block", "block", "block"],
    opacity: [1, 1, 1],
    height: ["100vh", "100vh", "100vh"],
    width: ["100vw", "100vw", "100vw"],
    transition: { duration: 0.75, ease: [0.83, 0, 0.1, 1] },
  },
  closed: {
    display: ["block", "block", "none"],
    opacity: [1, 1, 0],
    height: ["100vh", "100vh", "100vh"],
    width: ["100vw", "100vw", "100vw"],
    transition: { duration: 1.55, ease: [0.68, -0.55, 0.27, 1.55] },
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
  const [freshOpen, setFreshOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(
    mainMenuItems.find((section) =>
      section.items.some((item) => item.path === pathname)
    )?.title || "The List"
  )

  const footerText = footerCRText()

  const activeMenuItems = mainMenuItems.find(
    (section) => section.title === activeCategory
  )

  useEffect(() => {
    if (isOpen === "open") {
      setFreshOpen(true)
      document.body.classList.add("no-scroll")
      setActiveCategory(
        () =>
          mainMenuItems.find((section) =>
            section.items.some((item) => item.path === pathname)
          )?.title || "The List"
      )
    } else {
      document.body.classList.remove("no-scroll")
      setActiveCategory("")
      setFreshOpen(false)
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
    <>
      <AnimatePresence>
        <motion.div
          initial='overlayInitial'
          variants={screenOverlayVariants}
          animate={isOpen}
          className='absolute w-screen h-screen z-[1] backdrop-blur-md bg-black/20 right-0 top-0 origin-top-right'
        />
      </AnimatePresence>

      <div className='z-[100]'>
        {/* Menu Button */}
        <div className='flex flex-row gap-x-4  items-center justify-between relative w-full z-20'>
          {/* <ThemeToggle userPref={themePref} /> */}

          {/* //NOTE: Add sliding up animation later; will require making a button
          lookalike with two divs/spans inside that move up and down and have an
          overflow of hidden */}

          <div className='mt-3 md:mt-0 flex items-center justify-center gap-x-4 md:gap-x-2'>
            {isOpen === "open" && !pathname.includes("/dashboard") && (
              <ThemeToggle userPref={userPref?.theme} />
            )}
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
          {/* Expanding content */}
          {/* *
           *
           *
           *
           * */}
          {/* //---------------------- Block/Flex? (Mobile) Layout ---------------------- */}
          {/* *
           *
           *
           *
           * */}
          <motion.div
            key='mobile-menu'
            className={cn(
              "xl:hidden top-5 right-5 w-full h-full  fixed  box-border bg-background"
            )}
            variants={mobileMenuVariants}
            initial='mobileInitial'
            // initial={{ width: "4em", height: 30 }}
            animate={isOpen}
            // exit='closed'
          >
            <motion.div
              // initial={{ height: 0 }}
              // animate={{ height: "100%" }}
              // transition={{ duration: 0.4, ease: "easeInOut", delay: 0.6 }}
              className='w-full h-full  '>
              {isOpen === "open" && (
                <>
                  {/* Column 1 - Main Titles */}

                  <div className='grid grid-rows-[100px_auto_100px] grid-cols-1 h-screen w-screen '>
                    <section className='w-full border-b-2 border-black'>
                      <Image
                        src='/sitelogo.svg'
                        alt='The Street Art List'
                        width={60}
                        height={60}
                        className='absolute left-5 top-5'
                        priority={true}
                      />
                    </section>
                    <motion.div
                      className='flex justify-center scrollable invis  h-full w-full '
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7, duration: 0.4 }}>
                      <ul
                        className={cn(
                          "font-black m-x-auto w-full text-[4rem]",
                          "font-tanker tracking-wide lowercase"
                        )}>
                        {mainMenuItems.map((section, index) => {
                          const isExpanded =
                            activeCategory === section.title && !freshOpen
                          const filteredItems = section.items.filter((item) => {
                            const itemCategory = item.category.toLowerCase()
                            return (
                              item.view !== "dashboard" &&
                              (item.public === true ||
                                itemCategory === "thelist" ||
                                user?.accountType?.some(
                                  (type: any) =>
                                    type.toLowerCase() === itemCategory
                                ))
                            )
                          })

                          if (filteredItems.length === 0) return null

                          return (
                            <li
                              key={`${section.title}-mobileCat`}
                              className='border-b-2 border-black last:border-b-0 w-full'>
                              <div
                                onClick={() => {
                                  return (
                                    setFreshOpen(false),
                                    setActiveCategory(
                                      isExpanded ? null : section.title
                                    )
                                  )
                                }}
                                className={cn(
                                  "cursor-pointer flex justify-start px-9 py-4",
                                  activeCategory === section.title &&
                                    "bg-black text-background unstroked"
                                  // activeCategory === section.title &&
                                  //   theme === "default" &&
                                  //   "text-white",
                                  // activeCategory === section.title &&
                                  //   theme === "light" &&
                                  //   "text-salYellow"
                                )}>
                                {section.title}
                              </div>

                              {/* Animate the dropdown items */}
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{
                                      duration: 0.4,
                                      ease: "easeInOut",
                                    }}
                                    className='overflow-hidden pl-6 text-[2.5rem]'>
                                    <ul>
                                      {filteredItems.map((item) => (
                                        <li
                                          key={`${item.title}-${item.category}-mobileItem`}
                                          className=' pl-4 '>
                                          <Link
                                            href={item.path}
                                            onClick={onHandleLinkClick}
                                            className={cn(
                                              "cursor-pointer block py-2 transition-all duration-200 ease-in-out",
                                              pathname === item.path &&
                                                "underline underline-offset-4 decoration-6 text-black"
                                              // item.path.includes("dashboard") &&
                                              //   "text-salPink"
                                            )}>
                                            {item.title}
                                          </Link>
                                        </li>
                                      ))}
                                    </ul>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </li>
                          )
                        })}
                      </ul>
                    </motion.div>
                    {/* Fixed Bottom Row */}
                    <motion.div
                      // className=' h-[55px] flex flex-col col-span-3 border-t-1.5 border-black text-foreground w-full'
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.1, duration: 0.4 }}
                      className='flex space-x-5 items-center justify-center'>
                      <Link
                        href='https://facebook.com/thestreetartlist'
                        target='_blank'>
                        <Button variant='ghost' size='icon'>
                          <FaFacebookF size={22} />
                        </Button>
                      </Link>
                      <Link
                        href='https://instagram.com/thestreetartlist'
                        target='_blank'>
                        <Button variant='ghost' size='icon'>
                          <FaInstagram size={22} />
                        </Button>
                      </Link>
                      <Link
                        href='https://threads.net/thestreetartlist'
                        target='_blank'>
                        <Button variant='ghost' size='icon'>
                          <FaThreads size={22} />
                        </Button>
                      </Link>

                      <Link
                        href='mailto:info@thestreetartlist.com'
                        target='_blank'>
                        <Button variant='ghost' size='icon'>
                          <FaRegEnvelope size={22} />
                        </Button>
                      </Link>
                    </motion.div>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  )
}

export default FullPageNav
