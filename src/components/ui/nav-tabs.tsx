"use client";

import type { ThemeType } from "@/types/themeTypes";

import {
  Children,
  isValidElement,
  ReactElement,
  ReactNode,
  useState,
} from "react";
import { useTheme } from "next-themes";

import { cn } from "@/helpers/utilsFns";

export interface NavTab {
  id: string;
  label: string;
}

export interface NavTabsProps {
  className?: string;
  tabs: NavTab[];
  children: ReactNode;
  defaultTab?: string;
  activeTab?: string;
  setActiveTab?: (tabId: string) => void;
  fontSize?: string;
  variant?: BgVariant;
}

type BgVariant = "card" | "neutral";
type BgTheme = Extract<ThemeType, "default" | "dark">;

// const bgMap: Record<BgVariant, { active: string; inactive: string }> = {
//   card: { active: "bg-card", inactive: "bg-background" },
//   neutral: { active: "bg-card-secondary", inactive: "bg-background" },
// };

const bgMap: Record<
  BgVariant,
  Record<
    BgTheme,
    { active: string; activeTab: string; inactive: string; inactiveTab: string }
  >
> = {
  card: {
    default: {
      active: "bg-card",
      activeTab: "before:bg-card after:bg-card",
      inactive: "bg-background ",
      inactiveTab: "before:bg-background after:bg-background",
    },
    dark: {
      active: "bg-card-dark",
      activeTab: "before:bg-card-dark after:bg-card-dark",
      inactive: "bg-background-dark ",
      inactiveTab: "before:bg-background-dark after:bg-background-dark",
    },
  },
  neutral: {
    default: {
      active: "bg-card-secondary",
      activeTab: "before:bg-card-secondary after:bg-card-secondary",
      inactive: "bg-background ",
      inactiveTab: "before:bg-background after:bg-background",
    },
    dark: {
      active: "bg-tab-a40 text-foreground",
      activeTab: "before:bg-tab-a40 after:bg-tab-a40",
      inactive: "bg-tab-a30 ",
      inactiveTab: "before:bg-tab-a30 after:bg-tab-a30",
    },
  },
};

export default function NavTabs({
  tabs,
  children,
  className,
  defaultTab,
  activeTab: controlledTab,
  setActiveTab: setControlledTab,
  fontSize = "text-sm",
  variant = "neutral",
}: NavTabsProps) {
  const { theme } = useTheme();
  const {
    active: activeClass,
    inactive: inactiveClass,
    activeTab: activeTabClass,
    inactiveTab: inactiveTabClass,
  } = bgMap[variant][theme === "dark" ? "dark" : "default"];

  const internalTab = useState(defaultTab ?? tabs[0]?.id);
  const activeTab = controlledTab ?? internalTab[0];
  const setActiveTab = setControlledTab ?? internalTab[1];

  const tabContent = Children.toArray(children).find((child) => {
    if (!isValidElement(child)) return false;
    const el = child as ReactElement<{ id: string }>;
    return el.props.id === activeTab;
  }) as ReactElement<{ id: string }> | undefined;

  return (
    <div className={cn("folder-container w-full", className)}>
      <div className="folder">
        <div className="tabs">
          {tabs.map((tab, index) => {
            const isActive = activeTab === tab.id;
            const tabZIndex = isActive ? 11 : tabs.length - index; // Higher for earlier tabs

            return (
              <button
                type="button"
                key={tab.id}
                style={{ zIndex: tabZIndex, position: "relative" }}
                className={cn(
                  "tab transition-transform",
                  fontSize,
                  isActive
                    ? `active px-2 py-2 font-bold ${activeTabClass} ${activeClass} `
                    : `translate-y-1 ${inactiveClass}${inactiveTabClass} px-2 py-1 leading-[0.5]`,
                )}
                onClick={() => setActiveTab(tab.id)}
              >
                <div className={cn(isActive ? activeClass : inactiveClass)}>
                  <span className="py-2">{tab.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div
          className={cn("content z-[5] rounded-2xl p-4 shadow-sm", activeClass)}
        >
          {tabContent && <>{tabContent}</>}
        </div>
      </div>
    </div>
  );
}
