// app/(pages)/dashboard/_components/dashboard-context.tsx
"use client";

import React, { createContext, useContext, useState } from "react";
import { useSearchParams } from "next/navigation";

type DashboardContextType = {
  isSidebarCollapsed: boolean;
  setSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  openSection: string | null;
  setOpenSection: React.Dispatch<React.SetStateAction<string | null>>;
  activeSection: string | null;
  setActiveSection: React.Dispatch<React.SetStateAction<string | null>>;
};

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined,
);

export const DashboardProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const searchParams = useSearchParams();
  const collapsedParam = searchParams.get("sidebar");
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(
    collapsedParam === "false",
  );
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  return (
    <DashboardContext.Provider
      value={{
        isSidebarCollapsed,
        setSidebarCollapsed,
        openSection,
        setOpenSection,
        activeSection,
        setActiveSection,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};
