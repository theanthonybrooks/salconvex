"use client";

import { createContext, ReactNode, useContext } from "react";

export type DeviceInfo = {
  deviceType: string | null;
  osName: string | null;
  browserName: string | null;
  deviceVendor: string | null;
  deviceModel: string | null;
  isMobile: boolean;
};

const DeviceContext = createContext<DeviceInfo | undefined>(undefined);

export function DeviceProvider({
  value,
  children,
}: {
  value: DeviceInfo;
  children: ReactNode;
}) {
  return (
    <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>
  );
}

export function useDevice() {
  const ctx = useContext(DeviceContext);
  if (!ctx) {
    throw new Error("useDevice must be used within a DeviceProvider");
  }
  return ctx;
}
