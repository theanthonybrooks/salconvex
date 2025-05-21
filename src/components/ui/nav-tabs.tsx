"use client";

import { cn } from "@/lib/utils";
import {
  Children,
  ReactElement,
  ReactNode,
  isValidElement,
  useState,
} from "react";

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
}

export default function NavTabs({
  tabs,
  children,
  className,
  defaultTab,
  activeTab: controlledTab,
  setActiveTab: setControlledTab,
}: NavTabsProps) {
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
          {/*     {tabs.map((tab) => (
            <button
              key={tab.id}
              className={cn(
                "tab transition-transform",
                activeTab === tab.id
                  ? "active bg-salYellowLtHover px-2 py-2 before:bg-salYellowLtHover after:bg-salYellowLtHover"
                  : "tab translate-y-2 bg-[#f3de73] px-2 py-2 before:bg-[#f3de73] after:bg-[#f3de73]",
              )}
              onClick={() => setActiveTab(tab.id)}
            >
              <div className="bg-salYellowLtHover">
                <span className="py-2">{tab.label}</span>
              </div>
            </button>
          ))}*/}
          {tabs.map((tab, index) => {
            const isActive = activeTab === tab.id;
            const tabZIndex = isActive ? 11 : tabs.length - index; // Higher for earlier tabs

            return (
              <button
                type="button"
                key={tab.id}
                style={{ zIndex: tabZIndex, position: "relative" }}
                className={cn(
                  "tab text-sm transition-transform",
                  isActive
                    ? "active bg-[#fef9dd] px-2 py-2 font-bold before:bg-[#fef9dd] after:bg-[#fef9dd]"
                    : "translate-y-1 bg-background px-2 py-1 leading-[0.5] text-foreground before:bg-background after:bg-background",
                )}
                onClick={() => setActiveTab(tab.id)}
              >
                <div className="bg-[#fef9dd]">
                  <span className="py-2">{tab.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="content z-[5] rounded-2xl bg-[#fef9dd] p-4 shadow-sm">
          {tabContent && <>{tabContent}</>}
        </div>
      </div>
    </div>
  );
}
