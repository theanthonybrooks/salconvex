// app/(pages)/dashboard/_components/dashboard-context.tsx
"use client";

import React, { createContext, useContext, useState } from "react";

type DashboardContextType = {
  isSidebarCollapsed: boolean;
  setSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
};

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined,
);

export const DashboardProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <DashboardContext.Provider
      value={{ isSidebarCollapsed, setSidebarCollapsed }}
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
