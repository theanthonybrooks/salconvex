"use client";

import { createContext, useContext, ReactNode } from "react";
import { Preloaded } from "convex/react";
import { api } from "~/convex/_generated/api";

// Define the shape of the context
type ConvexPreloadContextType = {
  preloadedUserData: Preloaded<typeof api.users.getCurrentUser>;
  preloadedSubStatus: Preloaded<typeof api.subscriptions.getUserSubscriptionStatus>;
};

// Create the context with an explicit null default
const ConvexPreloadContext = createContext<ConvexPreloadContextType | null>(null);

// Typed provider props
type ConvexPreloadContextProviderProps = ConvexPreloadContextType & {
  children: ReactNode;
};

// Provider implementation
export function ConvexPreloadContextProvider({
  children,
  preloadedUserData,
  preloadedSubStatus,
}: ConvexPreloadContextProviderProps) {
  return (
    <ConvexPreloadContext.Provider value={{ preloadedUserData, preloadedSubStatus }}>
      {children}
    </ConvexPreloadContext.Provider>
  );
}

// Hook to access the context
export function useConvexPreload() {
  const context = useContext(ConvexPreloadContext);
  if (!context) throw new Error("useConvexPreload must be used inside ConvexPreloadContextProvider");
  return context;
}
