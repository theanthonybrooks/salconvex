"use client";

import { Separator } from "@/components/ui/separator";
import {
  dashboardNavItems,
  dashboardNavItems as navItems,
} from "@/constants/links";
import { Search } from "@/features/Sidebar/Search";
import { cn } from "@/lib/utils";
import { User } from "@/types/user";
import clsx from "clsx";
import { makeUseQueryWithStatus } from "convex-helpers/react";
import { useQueries } from "convex-helpers/react/cache";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { RiExpandLeftRightLine } from "react-icons/ri";

import { api } from "~/convex/_generated/api";

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
  collapsedSidebar: {
    height: 0,
    opacity: 0,
    overflow: "hidden",
    transition: { duration: 0 },
  },
  expanded: {
    height: "auto",
    opacity: 1,
    overflow: "hidden",
    transition: { duration: 0.3, ease: "easeInOut" },
  },
};

interface DashboardSideBarProps {
  subStatus: string | undefined;
  role: string[] | undefined;
  user: User | null;
}

export default function DashboardSideBar({
  subStatus,
  role,
  user,
}: DashboardSideBarProps) {
  const pathname = usePathname();
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [collapsedSidebar, setCollapsedSidebar] = useState(false);

  const statusKey = subStatus ? subStatus : "none";
  const hasAdminRole = role?.includes("admin");
  const userType = user?.accountType;
  const useQueryWithStatus = makeUseQueryWithStatus(useQueries);
  const { data: submittedEventsData } = useQueryWithStatus(
    api.events.event.getSubmittedEvents,
    hasAdminRole ? {} : "skip",
  );
  const pendingEvents = submittedEventsData?.length ?? 0;
  // console.log(pendingEvents);
  const helpNavItems = navItems.filter((item) => item.label.includes("Help"));
  const filteredNavItems = useMemo(() => {
    return navItems.filter((item) => {
      const isAllowedBySub = item.sub.includes(statusKey);
      const isAdmin = hasAdminRole && !item.label.includes("Help");
      const isGeneralItem =
        item.sub.includes("all") && !item.label.includes("Help");
      const hasSharedType = userType?.some((type) =>
        item.userType?.includes(type),
      );
      const isPublic =
        item.userType?.includes("public") && !item.label.includes("Help");

      return (
        (isAllowedBySub && hasSharedType) ||
        isAdmin ||
        isGeneralItem ||
        isPublic
      );
    });
  }, [statusKey, hasAdminRole, userType]);

  useEffect(() => {
    // const matchingSection = filteredNavItems.find(
    //   (item) => item.href && pathname.includes(item.href),
    // )?.sectionCat;
    const matchingSection = filteredNavItems.find(
      (item) => item.href === pathname,
    )?.sectionCat;

    if (matchingSection) {
      setOpenSection(matchingSection);
      setActiveSection(matchingSection);
    }
  }, [pathname, filteredNavItems]);

  const handleSectionToggle = (sectionCat: string | null) => {
    setOpenSection((prev) => {
      if (collapsedSidebar && prev !== sectionCat) setCollapsedSidebar(false);
      return prev === sectionCat ? null : sectionCat;
    });
  };

  const handleCollapseSidebar = () => {
    setCollapsedSidebar((prev) => !prev);
    setOpenSection(null);
  };

  return (
    <div
      className={cn(
        "relative hidden h-screen max-h-[calc(100vh-80px)] w-64 border-r bg-background min-[1024px]:block",
        collapsedSidebar && "w-fit",
      )}
    >
      <div
        className="absolute right-0 top-[11%] z-10 translate-x-1/2 rounded-full border border-foreground bg-background p-0.5 hover:scale-105 hover:cursor-pointer active:scale-95"
        onClick={handleCollapseSidebar}
      >
        <RiExpandLeftRightLine className="size-4" />
      </div>

      <nav className="grid h-full max-h-[calc(100vh-55px)] grid-rows-[60px_1fr_65px] space-y-1 overflow-hidden pt-4">
        <Search
          title={"Search"}
          source={dashboardNavItems}
          user={user}
          className="mx-4 mb-5"
          placeholder="Find what you're looking for!"
          iconOnly={collapsedSidebar}
        />
        <div
          className={cn(
            "scrollable mini invis overflow-y-auto",
            !collapsedSidebar && "px-4",
          )}
        >
          {/* Render main navigation items (excluding sections) */}
          {filteredNavItems
            .filter((item) => !item.sectionCat)
            .map((item) => (
              <React.Fragment key={item.href}>
                <Link
                  prefetch={true}
                  href={item.href}
                  className={clsx(
                    "flex items-center gap-2 px-3 py-5 pl-5 text-sm transition-colors",
                    pathname === item.href
                      ? "bg-primary/10 font-bold text-primary hover:bg-primary/20"
                      : "text-primary hover:bg-primary/10 hover:text-foreground",
                  )}
                  onClick={() => {
                    handleSectionToggle(null);
                    setActiveSection(null);
                  }}
                >
                  <item.icon
                    className={cn("size-4", collapsedSidebar && "size-5")}
                  />
                  {!collapsedSidebar && <> {item.label}</>}
                </Link>
                {pathname !== item.href && (
                  <Separator thickness={2} className="border-foreground/20" />
                )}
              </React.Fragment>
            ))}

          {/* Render sections */}
          {filteredNavItems
            .filter((item) => item.sectionHead)
            .map((section, index, arr) => {
              return (
                <div key={section.sectionCat} className="space-y-2">
                  {/* Section header */}
                  <section
                    className={cn(
                      pathname.includes(section.href) && "hover:bg-primary/10",
                    )}
                  >
                    <div
                      className={cn(
                        "flex flex-col gap-2 py-4 pl-5 pr-3 text-sm transition-colors",
                        pathname.includes(section.href)
                          ? "font-bold"
                          : "text-primary hover:bg-primary/10 hover:text-foreground",
                        activeSection === section.sectionCat
                          ? "cursor-default font-bold"
                          : "cursor-pointer",
                        activeSection === section.sectionCat &&
                          collapsedSidebar &&
                          "bg-primary/10",
                      )}
                      onClick={
                        // openSection === section.sectionCat &&
                        // pathname.includes("dashboard/" + section.sectionCat)
                        //   ? () => {}
                        //   : () => handleSectionToggle(section.sectionCat!)
                        () => handleSectionToggle(section.sectionCat!)
                      }
                    >
                      <div className="space-between flex justify-between gap-2">
                        <div className="relative flex items-center justify-between gap-2">
                          <span className="flex items-center gap-2">
                            {section?.sectionIcon && (
                              <section.sectionIcon
                                className={cn(
                                  "size-4",
                                  collapsedSidebar && "size-5",
                                )}
                              />
                            )}

                            {!collapsedSidebar && <> {section.heading}</>}
                          </span>

                          {section.heading === "Events" &&
                            pendingEvents > 0 && (
                              <span
                                className={cn(
                                  "ml-1 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold",
                                  collapsedSidebar &&
                                    "absolute -right-[10px] -top-2 ml-0 border-1.5 border-foreground bg-background px-[7px] py-0 text-2xs",
                                )}
                              >
                                {pendingEvents}
                              </span>
                            )}
                        </div>

                        {!collapsedSidebar && (
                          <>
                            {openSection === section.sectionCat ? (
                              <ChevronDown className="size-4" />
                            ) : (
                              <ChevronRight className="size-4" />
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    {index !== arr.length - 1 && (
                      <Separator thickness={2} className="w-full" />
                    )}
                  </section>

                  {!collapsedSidebar && (
                    <AnimatePresence>
                      {openSection === section.sectionCat && (
                        <motion.div
                          initial={collapsedSidebar ? false : "collapsed"}
                          animate={collapsedSidebar ? false : "expanded"}
                          exit={
                            collapsedSidebar ? "collapsedSidebar" : "collapsed"
                          }
                          variants={sectionVariants}
                        >
                          {filteredNavItems
                            .filter(
                              (navItem) =>
                                navItem.sectionCat === section.sectionCat,
                            )
                            .map((sectionItem, index, arr) => (
                              <div key={sectionItem.href} className="pl-4">
                                <Link
                                  prefetch={true}
                                  href={sectionItem.href}
                                  className={clsx(
                                    "flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                                    pathname === sectionItem.href
                                      ? "bg-primary/10 pl-3 text-primary hover:bg-primary/20"
                                      : "pl-3 text-primary hover:bg-primary/10 hover:text-foreground",
                                  )}
                                >
                                  <span className="flex items-center gap-2">
                                    <sectionItem.icon
                                      className={cn(
                                        "size-4",
                                        collapsedSidebar && "size-5",
                                      )}
                                    />

                                    {!collapsedSidebar && (
                                      <> {sectionItem.label}</>
                                    )}
                                  </span>
                                  {sectionItem.label === "Submissions" &&
                                    pendingEvents > 0 && (
                                      <span className="ml-1 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold">
                                        {pendingEvents}
                                      </span>
                                    )}
                                </Link>

                                {index === arr.length - 1 &&
                                  filteredNavItems.length > 2 && (
                                    <Separator
                                      thickness={2}
                                      className="w-full"
                                    />
                                  )}
                              </div>
                            ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              );
            })}
        </div>

        {/* Help Items */}
        <div>
          {helpNavItems.map((item) => (
            <React.Fragment key={item.href}>
              <Separator thickness={2} className="w-full" />
              <Link
                prefetch={true}
                href={item.href}
                className={clsx(
                  "flex items-center justify-center gap-2 py-5 text-center text-sm transition-colors",
                  pathname === item.href
                    ? "bg-primary/10 text-primary hover:bg-primary/20"
                    : "text-primary hover:bg-primary/10 hover:text-foreground",
                  // collapsedSidebar && "pl-0",
                )}
              >
                <item.icon
                  className={cn("size-4", collapsedSidebar && "size-5")}
                />
                {!collapsedSidebar && <> {item.label}</>}
              </Link>
            </React.Fragment>
          ))}
        </div>
      </nav>
      {/* </div> */}
    </div>
  );
}
