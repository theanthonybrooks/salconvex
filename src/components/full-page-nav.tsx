"use client"

import { Button } from "@/components/ui/button"
import ThemeToggle from "@/components/ui/theme-toggle"
import { mainMenuItems } from "@/constants/menu"
import { footerCRText } from "@/constants/text"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { FaRegEnvelope } from "react-icons/fa"
import { FaFacebookF, FaInstagram, FaThreads } from "react-icons/fa6"
import { GoDotFill } from "react-icons/go"

interface FullPageNavProps {
  userId?: string | undefined
  user?: Record<string, any> | null
  userPref?: Record<string, any> | null
  subStatus?: string | undefined
}

const menuVariants = {
  open: {
    width: ["4em", "100vw", "100vw", "100vw"],
    height: [30, 80, "50vw", "100vh"],
    top: [20, 0, 0, 0],
    right: [35, 0, 0, 0],
    borderRadius: [40, 40, 20, 0],
    transition: { duration: 0.75, ease: [0.76, 0, 0.24, 1] },
  },
  closed: {
    width: ["100vw", "99vw", "97vw", "4em"],
    height: ["100vh", "5vh", 30, 30],
    top: [0, 20, 20, 20],
    right: [0, 35, 35, 35],
    borderRadius: [0, 20, 40, 40],
    transition: { duration: 0.75, ease: [0.76, 0, 0.24, 1] },
  },
}

const FullPageNav = ({
  userId,
  user,
  subStatus,
  userPref,
}: FullPageNavProps) => {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState(
    mainMenuItems.find((section) =>
      section.items.some((item) => item.path === pathname)
    )?.title || "General"
  )
  const [isActive, setIsActive] = useState(pathname)
  const footerText = footerCRText()

  console.log("isActive: ", isActive)
  console.log("activeCategory: ", activeCategory)
  const activeMenuItems = mainMenuItems.find(
    (section) => section.title === activeCategory
  )

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("no-scroll")
    } else {
      document.body.classList.remove("no-scroll")
    }
    return () => {
      document.body.classList.remove("no-scroll")
    }
  }, [isOpen])

  return (
    <div className='z-[100]'>
      {/* Menu Button */}
      <div className='flex flex-row gap-x-4 items-center relative z-20'>
        {/* <ThemeToggle userPref={themePref} /> */}
        {/* //NOTE: Add sliding up animation later; will require making a button
        lookalike with two divs/spans inside that move up and down and have an
        overflow of hidden */}
        {isOpen && <ThemeToggle userPref={userPref?.theme} />}
        <Button
          variant='salWithShadowHidden'
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-[6em] bg-background font-bold",
            isOpen ? "bg-salYellow" : "bg-background"
          )}>
          {isOpen ? "CLOSE" : "MENU"}
        </Button>
      </div>

      {/* /~ Fullscreen Menu Overlay ~/ */}
      <AnimatePresence>
        <motion.div
          className='top-5 right-5 w-full h-full fixed flex flex-col bg-background box-border'
          variants={menuVariants}
          initial='closed'
          animate={isOpen ? "open" : "closed"}
          // exit='closed'
          transition={{ duration: 0.4, ease: "easeInOut" }}>
          {/* Expanding content */}
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "100%" }}
            transition={{ duration: 0.4, ease: "easeInOut", delay: 0.6 }}
            className='w-full h-full flex flex-col'>
            {/* Grid Layout */}
            {isOpen && (
              <>
                <div className='flex-1 grid grid-cols-3 gap-4 divide-x-1.5 divide-solid divide-black'>
                  {/* Column 1 - Main Titles */}
                  <motion.div
                    className='p-4 ml-20 flex items-center justify-start'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9, duration: 0.4 }}>
                    <ul className='font-black text-[3rem] lg:text-[4.5rem] space-y-3 font-tanker lowercase'>
                      {mainMenuItems.map((section) => (
                        <li
                          key={section.title}
                          className={cn(
                            "cursor-pointer"
                            // activeCategory === section.title
                            //   ? "text-[4.5rem]"
                            //   : "text-[3.5rem]"
                          )}
                          onClick={() => setActiveCategory(section.title)}>
                          {activeCategory === section.title ? (
                            <div className='flex items-center gap-1'>
                              <GoDotFill className='text-black size-8 md:size-14' />
                              {section.title}
                            </div>
                          ) : (
                            section.title
                          )}
                        </li>
                      ))}
                    </ul>
                  </motion.div>

                  {/* Column 2 - Secondary Titles */}
                  <motion.div
                    className='p-4 flex items-start pt-[100px] justify-center'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1, duration: 0.4 }}>
                    <ul className='font-black text-[1.2rem] lg:text-[2rem] space-y-4 font-tanker lowercase'>
                      {activeMenuItems?.items.map((item) => (
                        <li key={item.title}>
                          <Link
                            href={item.path}
                            className={cn(
                              "cursor-pointer",
                              pathname === item.path &&
                                "underline underline-offset-2",
                              item.path.includes("dashboard") && "text-salPink"
                            )}>
                            {item.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </motion.div>

                  {/* Column 3 */}
                  <motion.div
                    className='p-4 flex flex-col gap-y-4 items-center justify-center'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.3, duration: 0.4 }}>
                    <div className='h-[30%] w-[80%] border-black border-1.5 border-dotted rounded-lg p-8'>
                      <p>(User Settings Section)</p>
                    </div>
                    <div className='h-[40%] w-[80%] border-black border-1.5 border-dotted rounded-lg p-8'>
                      <p>(Undecided Section)</p>
                    </div>
                  </motion.div>
                </div>

                {/* Fixed Bottom Row */}
                <motion.div
                  className='h-[55px]  border-t-1.5 border-black text-foreground flex items-center justify-between px-8'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.3, duration: 0.4 }}>
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
