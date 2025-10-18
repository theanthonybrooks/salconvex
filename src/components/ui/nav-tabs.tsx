"use client";

import { cn } from "@/helpers/utilsFns";
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
  fontSize?: "text-sm" | "text-base";
}

export default function NavTabs({
  tabs,
  children,
  className,
  defaultTab,
  activeTab: controlledTab,
  setActiveTab: setControlledTab,
  fontSize = "text-sm",
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
                    ? "active bg-card-secondary px-2 py-2 font-bold before:bg-card-secondary after:bg-card-secondary"
                    : "translate-y-1 bg-background px-2 py-1 leading-[0.5] text-foreground before:bg-background after:bg-background",
                )}
                onClick={() => setActiveTab(tab.id)}
              >
                <div className="bg-card-secondary">
                  <span className="py-2">{tab.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="content z-[5] rounded-2xl bg-card-secondary p-4 shadow-sm">
          {tabContent && <>{tabContent}</>}
        </div>
      </div>
    </div>
  );
}
