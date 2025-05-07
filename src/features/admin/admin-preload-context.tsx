"use client";

import { Preloaded } from "convex/react";
import { createContext, ReactNode, useContext } from "react";
import { api } from "~/convex/_generated/api";

// Define the shape of the context
type AdminPreloadContextType = {
  preloadedEventData: Preloaded<typeof api.events.event.getAllEvents>;
  preloadedSubmissionData: Preloaded<
    typeof api.events.event.getSubmittedEvents
  >;
};

// Create the context with an explicit null default
const AdminPreloadContext = createContext<AdminPreloadContextType | null>(null);

// Typed provider props
type AdminPreloadContextProviderProps = AdminPreloadContextType & {
  children: ReactNode;
};

// Provider implementation
export function AdminPreloadContextProvider({
  children,
  preloadedEventData,
  preloadedSubmissionData,
}: AdminPreloadContextProviderProps) {
  return (
    <AdminPreloadContext.Provider
      value={{ preloadedEventData, preloadedSubmissionData }}
    >
      {children}
    </AdminPreloadContext.Provider>
  );
}

// Hook to access the context
export function useAdminPreload() {
  const context = useContext(AdminPreloadContext);
  if (!context)
    throw new Error(
      "useConvexPreload must be used inside ConvexPreloadContextProvider",
    );
  return context;
}
