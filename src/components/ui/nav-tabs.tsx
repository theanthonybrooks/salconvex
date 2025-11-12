"use client";

import {
  Children,
  isValidElement,
  ReactElement,
  ReactNode,
  useState,
} from "react";

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

// const bgMap: Record<BgVariant, { active: string; inactive: string }> = {
//   card: { active: "bg-card", inactive: "bg-background" },
//   neutral: { active: "bg-card-secondary", inactive: "bg-background" },
// };

const bgMap: Record<
  BgVariant,
  { active: string; activeTab: string; inactive: string }
> = {
  card: {
    active: "bg-card",
    activeTab: "before:bg-card after:bg-card",
    inactive: "bg-background before:bg-background after:bg-background",
  },
  neutral: {
    active: "bg-card-secondary",
    activeTab: "before:bg-card-secondary after:bg-card-secondary",
    inactive: "bg-background before:bg-background after:bg-background",
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
  const {
    active: activeClass,
    inactive: inactiveClass,
    activeTab: activeTabClass,
  } = bgMap[variant];

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
                    : `translate-y-1 ${inactiveClass} px-2 py-1 leading-[0.5] text-foreground`,
                )}
                onClick={() => setActiveTab(tab.id)}
              >
                <div className={cn(activeClass)}>
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
