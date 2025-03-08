"use client"

import { Separator } from "@/components/ui/separator"
import {
  dashboardNavItems,
  dashboardNavItems as navItems,
} from "@/constants/links"
import { landingPageLogo, landingPageLogoText } from "@/constants/logos"
import { Search } from "@/features/Sidebar/Search"
import clsx from "clsx"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown, ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import React, { useEffect, useMemo, useState } from "react"

// const sectionVariants = {
//   hidden: { opacity: 0, y: -15 }, // starts slightly to the left
//   visible: {
//     opacity: 1,
//     y: 0,
//     transition: {
//       type: "spring",
//       stiffness: 260,
//       damping: 20,
//       // You can tweak these numbers to adjust the 'wind back' and spring effect
//     },
//   },
//   exit: { opacity: 0, y: -15, transition: { type: "linear", duration: 0.1 } },
// }

const sectionVariants = {
  collapsed: {
    height: 0,
    opacity: 0,
    overflow: "hidden",
    transition: { duration: 0.5, ease: "easeInOut" },
  },
  expanded: {
    height: "auto",
    opacity: 1,
    overflow: "hidden",
    transition: { duration: 0.3, ease: "easeInOut" },
  },
}

interface DashboardSideBarProps {
  subStatus: string | undefined
  role: string[] | undefined
}

export default function DashboardSideBar({
  subStatus,
  role,
}: DashboardSideBarProps) {
  const pathname = usePathname()
  const [openSection, setOpenSection] = useState<string | null>(null)
  const { image, alt, width, height } = landingPageLogo[0]
  const {
    image: image2,
    alt: alt2,
    width: width2,
    height: height2,
  } = landingPageLogoText[0]
  const statusKey = subStatus ? subStatus : "none"
  const hasAdminRole = role?.includes("admin")
  // const filteredNavItems = navItems.filter(
  //   (item) =>
  //     item.sub.includes(statusKey) ||
  //     (item.sub.includes("admin") && hasAdminRole) ||
  //     (item.sub.includes("all") && !item.label.includes("Help"))
  // )
  const helpNavItems = navItems.filter((item) => item.label.includes("Help"))

  const filteredNavItems = useMemo(() => {
    return navItems.filter(
      (item) =>
        item.sub.includes(statusKey) ||
        (item.sub.includes("admin") && hasAdminRole) ||
        (item.sub.includes("all") && !item.label.includes("Help"))
    )
  }, [statusKey, hasAdminRole]) // Dependencies to prevent unnecessary recalculations

  useEffect(() => {
    const matchingSection = filteredNavItems.find(
      (item) =>
        item.sectionCat && pathname.includes(`dashboard/${item.sectionCat}`)
    )?.sectionCat

    if (matchingSection) {
      setOpenSection(matchingSection)
    }
  }, [pathname, filteredNavItems])

  useEffect(() => {
    if (!openSection) {
      const matchingSection = filteredNavItems.find(
        (item) =>
          item.sectionCat && pathname.includes(`dashboard/${item.sectionCat}`)
      )?.sectionCat
      if (matchingSection) {
        setOpenSection(matchingSection)
      }
    }
  }, [openSection, pathname, filteredNavItems])

  // const handleSectionToggle = (sectionCat: string) => {
  //   setOpenSection((prev) => {
  //     if (prev === sectionCat) {
  //       return null // Allow closing the section
  //     }
  //     return sectionCat // Open the new section
  //   })
  // }

  const handleSectionToggle = (sectionCat: string) => {
    setOpenSection((prev) => (prev === sectionCat ? null : sectionCat))
  }

  return (
    <div className='hidden w-64 border-r bg-background min-[1024px]:block'>
      <div className='flex h-full flex-col justify-between'>
        <div className='flex min-h-[72px] flex-shrink-0 items-center border-b px-4'>
          <Link
            prefetch={true}
            className='flex items-center gap-2 font-semibold hover:cursor-pointer'
            href='/'>
            <Image src={image} alt={alt} width={width} height={height} />
            <Image src={image2} alt={alt2} width={width2} height={height2} />
          </Link>
        </div>

        <nav
          className='grid max-h-[calc(100vh-55px)]
 h-full overflow-hidden grid-rows-[60px_1fr_80px] space-y-1 px-4 pt-4'>
          <Search
            title={"Search"}
            source={dashboardNavItems}
            groupName={"Heading"}
            className='mb-5'
            placeholder="Find what you're looking for!"
          />
          <div className='overflow-y-auto scrollable mini '>
            {/* Render main navigation items (excluding sections) */}
            {filteredNavItems
              .filter((item) => !item.sectionCat)
              .map((item) => (
                <React.Fragment key={item.href}>
                  <Link
                    prefetch={true}
                    href={item.href}
                    className={clsx(
                      "flex items-center gap-2 rounded-lg px-3 py-5 pl-5 text-sm transition-colors",
                      pathname === item.href
                        ? "bg-primary/10 font-bold text-primary hover:bg-primary/20"
                        : "text-muted-foreground hover:bg-primary/10 hover:text-foreground"
                    )}>
                    <item.icon className='h-4 w-4' />
                    {item.label}
                  </Link>
                  {pathname !== item.href && (
                    <Separator thickness={2} className='border-black/20' />
                  )}
                </React.Fragment>
              ))}

            {/* Render sections */}
            {filteredNavItems
              .filter((item) => item.sectionHead)
              .map((section) => (
                <div key={section.sectionCat}>
                  {/* Section header */}
                  <section className='py-2'>
                    <div
                      className={clsx(
                        "flex flex-col gap-2 rounded-lg px-3 py-2 pl-5 text-sm transition-colors",
                        pathname.includes("dashboard/" + section.sectionCat)
                          ? "font-bold"
                          : "text-muted-foreground hover:bg-primary/10 hover:text-foreground",
                        openSection === section.sectionCat &&
                          pathname.includes("dashboard/" + section.sectionCat)
                          ? "cursor-default"
                          : "cursor-pointer"
                      )}
                      onClick={
                        openSection === section.sectionCat &&
                        pathname.includes("dashboard/" + section.sectionCat)
                          ? () => {}
                          : () => handleSectionToggle(section.sectionCat!)
                      }>
                      <div className='space-between flex justify-between gap-2'>
                        <div className='inline-flex gap-2'>
                          {section?.sectionIcon && (
                            <section.sectionIcon className='h-4 w-4' />
                          )}

                          {section.heading}
                        </div>

                        {openSection === section.sectionCat ? (
                          <ChevronDown className='h-4 w-4 ' />
                        ) : (
                          <ChevronRight className='h-4 w-4' />
                        )}
                      </div>
                    </div>
                    <Separator thickness={2} className='w-full' />
                  </section>

                  <AnimatePresence>
                    {openSection === section.sectionCat && (
                      <motion.div
                        initial='collapsed'
                        animate='expanded'
                        exit='collapsed'
                        variants={sectionVariants}>
                        {filteredNavItems
                          .filter(
                            (navItem) =>
                              navItem.sectionCat === section.sectionCat
                          )
                          .map((sectionItem, index, arr) => (
                            <div key={sectionItem.href} className='pl-4'>
                              <Link
                                prefetch={true}
                                href={sectionItem.href}
                                className={clsx(
                                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                                  pathname === sectionItem.href
                                    ? "bg-primary/10 pl-3 text-primary hover:bg-primary/20"
                                    : "pl-3 text-muted-foreground hover:bg-primary/10 hover:text-foreground"
                                )}>
                                <sectionItem.icon className='h-4 w-4' />
                                {sectionItem.label}
                              </Link>
                              {index === arr.length - 1 && (
                                <Separator thickness={2} className='w-full' />
                              )}
                            </div>
                          ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
          </div>

          {/* Help Items */}
          <div>
            {helpNavItems.map((item) => (
              <React.Fragment key={item.href}>
                <Separator thickness={2} className='w-full' />
                <Link
                  prefetch={true}
                  href={item.href}
                  className={clsx(
                    "flex items-center gap-2 rounded-lg px-3 py-5 text-center text-sm transition-colors",
                    pathname === item.href
                      ? "bg-primary/10 text-primary hover:bg-primary/20"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}>
                  <item.icon className='h-4 w-4' />
                  {item.label}
                </Link>
              </React.Fragment>
            ))}
          </div>
        </nav>
      </div>
    </div>
  )
}
