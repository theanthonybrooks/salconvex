"use client"

import MenuToggle from "@/components/ui/hamburger-icon"
import { Separator } from "@/components/ui/separator"
import SocialsRow from "@/components/ui/socials"
import ThemeToggle from "@/components/ui/theme-toggle"
import { mainMenuItems } from "@/constants/menu"
import { footerCRText } from "@/constants/text"
import SignOutBtn from "@/features/auth/components/sign-out-btn"
import { cn } from "@/lib/utils"
import { User } from "@/types/user"
import { Authenticated, Unauthenticated } from "convex/react"
import { AnimatePresence, motion } from "framer-motion"
import { CheckCircle, XCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

interface FullPageNavProps {
  // userId?: string | undefined
  isScrolled?: boolean
  user?: User | null
  // userPref?: UserPref | null
  // subStatus?: string | undefined
}

const menuVariants = {
  open: {
    width: [0, "100vw", "100vw", "100vw"],
    height: [60, 80, "50vw", "100vh"],
    top: [17, 0, 0, 0],
    right: [41, 0, 0, 0],
    borderRadius: [40, 40, 20, 0],
    transition: {
      duration: 0.75,
      ease: [0.1, 0, 0.36, 1],
      times: [0, 0.2, 0.6, 1],
    },
    opacity: [0, 1, 1, 1],
  },
  // closed: {
  //   width: ["100vw", "100vw", 0],
  //   height: ["100vh", 40, 40],
  //   top: [0, 17, 17],
  //   right: [0, 0, 41],
  //   borderRadius: [0, 20, 40],
  //   // transition: { duration: 0.75, ease: [0.83, 0, 0.1, 1] },
  //   transition: {
  //     duration: 0.75,
  //     ease: [0.68, -0.55, 0.27, 1.55],
  //     // ease: [0.1, 0, 0.36, 1],
  //     times: [0, 0.2, 1],
  //   },

  //   opacity: [1, 1, 0],
  // },
  closed: {
    width: ["100vw", "100vw", "100vw", 0, 0], // Shrinks width last
    height: ["100vh", "100vh", 60, 60, 60], // Shrinks height first
    top: [0, 0, 17, 17, 17],
    right: [0, 0, 0, 41, 41],
    borderRadius: [0, 20, 40, 40, 40],

    transition: {
      duration: 0.75,
      ease: [0.68, -0.55, 0.27, 1.55],
      times: [0, 0.2, 0.4, 0.9, 1], // Keeps width large longer before snapping shut
    },

    // ✨ Keep opacity at 1 until the last moment ✨
    opacity: [1, 1, 1, 1, 0], // Only fades at the very end
  },

  initial: {
    width: [0],
    height: [0],
    top: [17],
    right: [35],
    borderRadius: [40],
    transition: { duration: 0, ease: [0.76, 0, 0.24, 1] },
    opacity: [0],
  },
}

const getMobileMenuVariants = (isScrolled: boolean | undefined) => ({
  open: {
    width: ["4em", "100vw", "100vw", "100vw"],
    height: isScrolled
      ? ["40px", "80px", "80px", "100vh"]
      : ["40px", "100px", "100px", "100vh"],
    top: isScrolled ? [17, 0, 0, 0] : [20, 0, 0, 0],
    right: [41, 0, 0, 0],
    borderRadius: [40, 40, 20, 0],
    transition: {
      duration: 1,
      ease: [0.5, 1, 0.56, 0.81],
      times: [0, 0.2, 0.4, 1],
    },
    opacity: [1, 1, 1, 1],
  },
  closed: {
    width: "100vw",
    height: 0,
    top: 0,
    right: 0,
    borderRadius: 0,
    opacity: 1,
    transition: {
      duration: 0.75,
      ease: [0.6, 0.05, 0.1, 1],
      type: "spring",
      stiffness: 120,
      damping: 20,
    },
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
})

// const mobileMenuVariants = {
//   open: {
//     width: ["4em", "100vw", "100vw", "100vw"],
//     // height: [40, 100, 100, 100, "100vh"],
//     height: ["40px", "100px", "100px", "100vh"],
//     // transform: ["translateX(0)"],
//     top: [17, 0, 0, 0],
//     right: [41, 0, 0, 0],
//     borderRadius: [40, 40, 20, 0],
//     transition: {
//       duration: 1,
//       ease: [0.5, 1, 0.56, 0.81],
//       times: [0, 0.2, 0.4, 1],
//     },
//     opacity: [1, 1, 1, 1],
//   },
//   // closed: {
//   //   width: ["100vw", "99vw", "98vw", "4em"],
//   //   height: ["100vh", 40, 40, 39],
//   //   top: [0, 17, 17, 17],
//   //   right: [0, 0, 41, 41],
//   //   borderRadius: [0, 20, 40, 40],
//   //   // transition: { duration: 0.75, ease: [0.83, 0, 0.1, 1] },
//   //   transition: { duration: 0.75, ease: [0.68, -0.55, 0.27, 1.55] },

//   //   opacity: [1, 1, 1, 1],
//   // },
//   // closed: {
//   //   width: ["100vw", "100vw", "100vw", "100vw", "4em"],
//   //   height: ["100vh", "75vh", "50vh", "25vh", "40px"], // More gradual reduction
//   //   top: [0, 0, 0, 0, 17],
//   //   right: [0, 0, 0, 0, 41],
//   //   borderRadius: [0, 0, 20, 40, 40],
//   //   opacity: [1, 1, 1, 1, 1],

//   //   transition: { duration: 1.25, ease: [0.6, 0.05, 0.1, 1] }, // Smoother curve
//   // },

//   closed: {
//     width: "100vw",
//     height: 0,
//     top: 0,
//     right: 0,
//     borderRadius: 0,
//     opacity: 1,
//     transition: {
//       duration: 0.75,
//       ease: [0.6, 0.05, 0.1, 1],
//       type: "spring",
//       stiffness: 120, // Adjust this for bounciness
//       damping: 20, // Smooths the stop at the final height
//     },
//   },

//   // closed: {
//   //   width: ["100vw"],
//   //   height: ["100px"],
//   //   top: [0],
//   //   right: [0],
//   //   // transform: ["translateX(-50%)"],
//   //   borderRadius: [0],
//   //   opacity: [1],

//   //   // transition: { duration: 0.75, ease: [0.83, 0, 0.1, 1] },
//   //   transition: { duration: 1.25, ease: [0.5, 1, 0.56, 0.81] },
//   // },
//   mobileInitial: {
//     width: [0],
//     height: [0],
//     top: [20],
//     right: [35],
//     borderRadius: [40],
//     transition: { duration: 0, ease: [0.76, 0, 0.24, 1] },
//     opacity: [0],
//   },
// }
const mobileTextVariants = {
  open: {
    opacity: 1,

    height: "100%",
    transition: {
      delay: 0.4,
      duration: 0.6,
      ease: "easeInOut",
    },
  },
  closed: {
    opacity: 0,

    height: 0,
    transition: {
      duration: 0.4,
      ease: "easeInOut",
    },
  },
}

const mobileImageVariants = {
  open: {
    display: "block",

    transition: { duration: 0.75, ease: "easeInOut" },
  },
  closed: {
    display: "none",

    transition: { duration: 0.3, ease: "easeInOut" },
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
    transition: { duration: 1.15, ease: [0.68, -0.55, 0.27, 1.55] },
  },
}

const FullPageNav = ({ user, isScrolled }: FullPageNavProps) => {
  const footerText = footerCRText()
  // const { theme } = useTheme()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState("initial")
  const [freshOpen, setFreshOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(
    mainMenuItems.find((section) =>
      section.items.some((item) => item.path === pathname)
    )?.title || "The List"
  )
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
          className='absolute w-screen h-dvh z-[10] backdrop-blur-md bg-foreground/20 right-0 top-0 origin-top-right'
        />
      </AnimatePresence>

      <div className='z-[100]'>
        {/* Menu Button + Theme Toggle*/}
        <div className='flex flex-row gap-x-2  items-center justify-between relative w-full z-20'>
          {/* <ThemeToggle userPref={themePref} /> */}

          {/* //NOTE: Add sliding up animation later; will require making a button
          lookalike with two divs/spans inside that move up and down and have an
          overflow of hidden */}

          {isOpen === "open" && <ThemeToggle />}
          <MenuToggle
            menuState={isOpen === "initial" ? "closed" : isOpen}
            setState={setIsOpen}
          />
          {/* <Button
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
          </Button> */}
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
            id='mobile-menu'
            key='mobile-menu'
            className={cn(
              "xl:hidden top-5 right-5 w-full h-full  fixed  box-border bg-background"
            )}
            variants={getMobileMenuVariants(isScrolled)}
            animate={isOpen}
            initial='mobileInitial'
            exit='mobileInitial'
            // initial={{ width: "4em", height: 30 }}
          >
            <motion.div
              initial={{ display: "none" }}
              animate={
                isOpen === "open" ? { display: "grid" } : { display: "none" }
              }
              transition={{
                delay: 0.2,
                duration: 0.75,
                ease: [0.83, 0, 0.1, 1],
              }}
              className={cn(
                "grid  grid-cols-1 h-dvh w-screen ",
                isScrolled ? "grid-rows-[80px_auto]" : "grid-rows-[100px_auto]"
              )}>
              <motion.section
                initial={{ display: "none" }}
                variants={mobileImageVariants}
                animate={isOpen}
                transition={{ duration: 0.25, ease: [0.83, 0, 0.1, 1] }}
                className='w-full border-b-2 border-foreground'>
                <Image
                  src='/sitelogo.svg'
                  alt='The Street Art List'
                  width={isScrolled ? 40 : 60}
                  height={isScrolled ? 40 : 60}
                  className='absolute left-5 top-5'
                  priority={true}
                />
              </motion.section>
              <motion.div
                className='flex flex-col justify-start scrollable invis  h-full w-full '
                initial={{ opacity: 0, height: 0 }}
                variants={mobileTextVariants}
                animate={isOpen}
                // exit={{
                //   opacity: 0,
                //   y: 20,
                //   height: 0,
                // }}
              >
                <ul
                  className={cn(
                    "font-foreground m-x-auto w-full text-[4rem] font-tanker tracking-wide lowercase"
                  )}>
                  {mainMenuItems.map((section) => {
                    const isExpanded =
                      activeCategory === section.title && !freshOpen
                    const filteredItems = section.items.filter((item) => {
                      const itemUserType = item?.userType
                      const isPublic = itemUserType?.includes("public")
                      const typeMatch = user?.accountType?.some((type) =>
                        itemUserType?.some(
                          (userType) =>
                            userType.toLowerCase() === type.toLowerCase()
                        )
                      )

                      return isPublic || typeMatch
                    })

                    if (filteredItems.length === 0) return null

                    return (
                      <li
                        key={`${section.title}-mobileCat`}
                        className='border-b-2 border-foreground  w-full'>
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
                              "bg-foreground text-background unstroked"
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
                                          "underline underline-offset-4 decoration-6 text-foreground"
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
                <Unauthenticated>
                  <div
                    className={cn(
                      "pl-8 py-5 font-foreground m-x-auto w-full text-[4rem] border-b-2 border-foreground font-tanker tracking-wide lowercase"
                    )}>
                    <Link onClick={onHandleLinkClick} href={"/pricing"}>
                      Pricing
                    </Link>
                  </div>
                  <div
                    className={cn(
                      "pl-8 pt-6 font-foreground m-x-auto w-full text-[3rem] border-b-2 border-foreground font-tanker tracking-wide lowercase"
                    )}>
                    <Link onClick={onHandleLinkClick} href={"/auth/sign-in"}>
                      Login | Register
                    </Link>
                  </div>
                </Unauthenticated>
                <Authenticated>
                  <SignOutBtn>
                    <div
                      onClick={() => {
                        setTimeout(() => setIsOpen("closed"), 1000)
                      }}
                      className={cn(
                        "pl-8 py-6 font-foreground m-x-auto w-full text-[3rem] font-tanker tracking-wide lowercase"
                      )}>
                      log out
                    </div>
                  </SignOutBtn>
                </Authenticated>
                <motion.div
                  // className=' h-[55px] flex flex-col col-span-3 border-t-1.5 border-foreground text-foreground w-full'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1, duration: 0.4 }}
                  className='flex flex-col space-y-5 py-6  items-center justify-center'>
                  <SocialsRow />
                  <div className='flex space-x-2 text-sm items-center'>
                    <p>Made with ❤️ by</p>
                    <Link
                      href='https://theanthonybrooks.com'
                      target='_blank'
                      className=' decoration-foreground focus:underline focus:decoration-foreground focus:decoration-2 m-0 p-0 focus-visible:underline-offset-2 hover:underline-offset-2 hover:underline cursor-pointer'>
                      Anthony Brooks
                    </Link>
                  </div>
                  {footerText.text}
                </motion.div>
              </motion.div>
              {/* Fixed Bottom Row */}
            </motion.div>
          </motion.div>

          {/* *
           *
           *
           *
           * */}
          {/* //---------------------- Grid (Desktop) Layout ---------------------- */}
          {/* *
           *
           *
           *
           * */}
          <motion.div
            key='desktop-menu'
            className={cn(
              "hidden xl:block top-5 right-5 w-full h-dvh fixed  box-border bg-background",
              isOpen === "open" || isOpen === "closed"
                ? "bg-background"
                : "bg-none",
              "bg-background"
            )}
            variants={menuVariants}
            initial='initial'
            // initial={{ width: "4em", height: 30 }}
            animate={isOpen}
            exit='initial'>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "100%" }}
              transition={{ duration: 0.4, ease: "easeInOut", delay: 0.6 }}
              className='w-full h-full hidden md:grid grid-row-1 md:grid-rows-[auto_70px] '>
              {isOpen === "open" && (
                <>
                  <div className='grid grid-cols-1 md:grid-cols-3 divide-x-1.5 divide-solid row-span-1 w-screen px-5 divide-foreground overflow-hidden'>
                    {/* Column 1 - Main Titles */}
                    <motion.div
                      className='p-4 py-8 flex items-start justify-center scrollable mini darkbar'
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7, duration: 0.4 }}>
                      <ul
                        className={cn(
                          "font-foreground m-auto text-[3rem] lg:text-[4.5rem] space-y-3 ",
                          "font-tanker tracking-wide  lowercase select-none"
                        )}>
                        {mainMenuItems.map((section) => {
                          const filteredItems = section.items.filter((item) => {
                            const itemUserType = item?.userType
                            const isPublic = itemUserType?.includes("public")
                            const typeMatch = user?.accountType?.some((type) =>
                              itemUserType?.some(
                                (userType) =>
                                  userType.toLowerCase() === type.toLowerCase()
                              )
                            )

                            return isPublic || typeMatch
                          })

                          if (filteredItems.length === 0) return null

                          return (
                            <li
                              key={`${section.title}-desktopCat`}
                              className='cursor-pointer'>
                              <div
                                onClick={() => setActiveCategory(section.title)}
                                className={cn(
                                  "cursor-pointer hover:translate-x-3 transition-transform ease-in-out duration-300",
                                  activeCategory === section.title &&
                                    "stroked wshadow text-white"
                                  // activeCategory === section.title &&
                                  //   theme === "default" &&
                                  //   "text-white",
                                  // activeCategory === section.title &&
                                  //   theme === "light" &&
                                  //   "text-white"
                                )}>
                                {/* {activeCategory === section.title && (
                                      <GoDotFill className='text-foreground size-8 md:size-14' />
                                    )} */}
                                {section.title}
                              </div>
                            </li>
                          )
                        })}
                        {!user && (
                          <Link onClick={onHandleLinkClick} href={"/pricing"}>
                            Pricing
                          </Link>
                        )}
                      </ul>
                    </motion.div>

                    {/* Column 2 - Secondary Titles */}
                    <motion.div
                      className='p-4 py-8 flex items-start justify-center scrollable mini darkbar '
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9, duration: 0.4 }}>
                      <ul className='font-foreground m-auto text-[1.2rem] lg:text-[3rem] space-y-3 select-none font-tanker tracking-wide  lowercase'>
                        {activeMenuItems?.items
                          .filter((item) => {
                            const itemUserType = item?.userType
                            const isPublic = itemUserType?.includes("public")
                            const typeMatch = user?.accountType?.some((type) =>
                              itemUserType?.some(
                                (userType) =>
                                  userType.toLowerCase() === type.toLowerCase()
                              )
                            )

                            return isPublic || typeMatch
                          })
                          .map((item) => (
                            <li
                              key={`${item.title}-${item.category}-desktopItem`}>
                              <div
                                className={cn(
                                  " cursor-pointer transition-all duration-100 ease-in-out hover:translate-x-2 ",
                                  pathname === item.path && "text-background"
                                  // item.path.includes("dashboard") &&
                                  //   "text-salPink"
                                )}>
                                <Link
                                  onClick={onHandleLinkClick}
                                  href={item.path}
                                  className={cn(
                                    "cursor-pointer  ",
                                    pathname === item.path &&
                                      "underline underline-offset-4 decoration-6 text-foreground translate-x-2"
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
                      <div className='h-[30%] w-[80%] flex flex-col  border-foreground border-1.5 border-dotted rounded-lg p-8 scrollable mini'>
                        <p>User Notifications</p>
                        <Separator />
                        <p className='italic text-sm'>
                          Nothing to see here yet
                        </p>
                      </div>
                      <div className='h-[50%] w-[80%] flex flex-col  border-foreground border-1.5 border-dotted rounded-lg p-8'>
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
                            <span className='text-sm flex gap-x-2'>
                              1-8-2025
                            </span>
                          </li>
                          <li className='flex gap-x-4 text-red-500'>
                            <p className=' text-sm'>Blah Event</p> -{" "}
                            <span className='text-sm flex gap-x-2'>
                              <XCircle />
                              Rejected
                            </span>
                            <span className='text-sm flex gap-x-2'>
                              1-2-2025
                            </span>
                          </li>
                        </ol>
                      </div>
                    </motion.div>
                  </div>

                  {/* Fixed Bottom Row */}
                  <motion.div
                    className=' col-span-3 row-span-1 border-t-1.5 border-foreground text-foreground flex items-center justify-between px-8'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9, duration: 0.4 }}>
                    <div className='flex space-x-2 items-center'>
                      <p className='text-sm'>Links:</p>

                      <SocialsRow size={7} />
                    </div>
                    <div className='flex space-x-2 text-sm items-center'>
                      <p>Made with ❤️ by</p>
                      <Link
                        href='https://theanthonybrooks.com'
                        target='_blank'
                        className=' decoration-foreground focus:underline focus:decoration-foreground focus:decoration-2  focus-visible:underline-offset-2 hover:underline-offset-2 hover:underline cursor-pointer'>
                        Anthony Brooks
                      </Link>
                    </div>
                    <div className='flex gap-x-2 items-center text-center text-sm text-gray-600 dark:text-gray-400'>
                      {footerText.text}
                      <Image
                        src='/sitelogo.svg'
                        alt='The Street Art List'
                        width={40}
                        height={40}
                        className=''
                        priority={true}
                      />
                    </div>
                  </motion.div>
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
