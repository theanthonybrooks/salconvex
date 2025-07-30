"use client";

import { useDashboard } from "@/app/(pages)/dashboard/_components/dashboard-context";
import { Separator } from "@/components/ui/separator";
import { TooltipSimple } from "@/components/ui/tooltip";
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
import React, { useEffect, useMemo } from "react";
import { RiExpandLeftRightLine } from "react-icons/ri";

import { api } from "~/convex/_generated/api";

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
  const {
    setSidebarCollapsed: setCollapsedSidebar,
    isSidebarCollapsed: collapsedSidebar,
    openSection,
    setOpenSection,
    activeSection,
    setActiveSection,
  } = useDashboard();

  const statusKey = subStatus ? subStatus : "none";
  const hasAdminRole = role?.includes("admin");
  const userType = user?.accountType;
  const useQueryWithStatus = makeUseQueryWithStatus(useQueries);
  const { data: submittedEventsData } = useQueryWithStatus(
    api.events.event.getSubmittedEventCount,
    hasAdminRole ? {} : "skip",
  );
  const { data: submittedOpenCallsData } = useQueryWithStatus(
    api.openCalls.openCall.getSubmittedOpenCallCount,
    hasAdminRole ? {} : "skip",
  );
  const pendingOpenCalls = submittedOpenCallsData ?? 0;
  const pendingEvents = submittedEventsData ?? 0;
  const totalPending = pendingOpenCalls + pendingEvents;
  // console.log(pendingEvents);
  const helpNavItems = navItems.filter((item) => item.label.includes("Help"));
  const filteredNavItems = useMemo(() => {
    return navItems.filter((item) => {
      const isAllowedBySub = item.sub.includes(statusKey);
      const isAdmin = hasAdminRole && !item.label.includes("Help");
      const hasSharedType = userType?.some((type) =>
        item.userType?.includes(type),
      );

      const isGeneralItem =
        hasSharedType &&
        item.sub.includes("all") &&
        !item.label.includes("Help");
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
    const matchingSection = filteredNavItems.find(
      (item) => item.href === pathname,
    )?.sectionCat;

    if (matchingSection) {
      setOpenSection(matchingSection);
      setActiveSection(matchingSection);
    }
  }, [pathname, filteredNavItems, setOpenSection, setActiveSection]);

  const handleSectionToggle = (sectionCat: string | null) => {
    setOpenSection((prev) => {
      if (collapsedSidebar) {
        setTimeout(() => setCollapsedSidebar(false), 0);
      }
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
      <TooltipSimple
        content={collapsedSidebar ? "Expand sidebar" : "Collapse sidebar"}
        side="top"
        align="center"
      >
        <div
          className="absolute right-0 top-[11%] z-10 translate-x-1/2 rounded-full border border-foreground bg-background p-0.5 hover:scale-105 hover:cursor-pointer active:scale-95"
          onClick={handleCollapseSidebar}
        >
          <RiExpandLeftRightLine className="size-4" />
        </div>
      </TooltipSimple>

      <nav className="grid h-full max-h-[calc(100vh-55px)] grid-rows-[60px_1fr_65px] space-y-1 overflow-hidden pt-4">
        <Search
          title={"Search"}
          source={dashboardNavItems}
          user={user}
          className={cn("mb-5", collapsedSidebar ? "mx-auto" : "mx-4")}
          placeholder="Search..."
          iconOnly={collapsedSidebar}
          pageType="dashboard"
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
                <TooltipSimple
                  content={item.label}
                  side="top"
                  align="start"
                  alignOffset={3}
                  disabled={!collapsedSidebar}
                >
                  <Link
                    prefetch={true}
                    href={item.href}
                    className={clsx(
                      "flex items-center gap-2 px-3 py-5 text-sm transition-colors",
                      pathname === item.href
                        ? "bg-primary/10 font-bold text-primary hover:bg-primary/20"
                        : "text-primary hover:bg-primary/10 hover:text-foreground",
                      !collapsedSidebar ? "pl-5" : "justify-center",
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
                </TooltipSimple>
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
                    <TooltipSimple
                      content={section.heading}
                      side="top"
                      align="start"
                      alignOffset={3}
                      disabled={!collapsedSidebar}
                    >
                      <div
                        className={cn(
                          "flex flex-col gap-2 py-4 text-sm transition-colors",
                          pathname.includes(section.href)
                            ? "font-bold"
                            : "text-primary hover:bg-primary/10 hover:text-foreground",
                          activeSection === section.sectionCat
                            ? "cursor-default font-bold"
                            : "cursor-pointer",
                          collapsedSidebar && "cursor-pointer px-3",
                          activeSection === section.sectionCat &&
                            collapsedSidebar &&
                            "bg-primary/10",
                          !collapsedSidebar && "pl-5 pr-3",
                        )}
                        onClick={() => handleSectionToggle(section.sectionCat!)}
                      >
                        <div
                          className={cn(
                            "space-between flex justify-between gap-2",
                            collapsedSidebar && "px-3",
                          )}
                        >
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

                            {section.heading === "Events" && (
                              <>
                                {pendingEvents > 0 && !collapsedSidebar && (
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
                                {pendingOpenCalls > 0 && !collapsedSidebar && (
                                  <span
                                    className={cn(
                                      "ml-1 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold",
                                      collapsedSidebar &&
                                        "absolute -right-[10px] -top-2 ml-0 border-1.5 border-foreground bg-background px-[7px] py-0 text-2xs",
                                    )}
                                  >
                                    {pendingOpenCalls}
                                  </span>
                                )}
                                {totalPending > 0 && collapsedSidebar && (
                                  <span
                                    className={cn(
                                      "absolute -right-[10px] -top-2 inline-flex items-center justify-center rounded-full border-1.5 border-foreground bg-background px-[7px] py-0.5 text-2xs text-xs font-semibold",
                                    )}
                                  >
                                    {totalPending}
                                  </span>
                                )}
                              </>
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
                    </TooltipSimple>
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
                                    totalPending > 0 && (
                                      <span className="ml-1 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold">
                                        {totalPending}
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
              <TooltipSimple
                content={item.label}
                side="top"
                align="start"
                alignOffset={3}
                disabled={!collapsedSidebar}
              >
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
              </TooltipSimple>
            </React.Fragment>
          ))}
        </div>
      </nav>
      {/* </div> */}
    </div>
  );
}
