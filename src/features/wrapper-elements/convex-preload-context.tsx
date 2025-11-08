"use client";

import { createContext, ReactNode, useContext } from "react";



import { api } from "~/convex/_generated/api";
import { Preloaded } from "convex/react";

type ConvexPreloadContextType = {
  preloadedUserData: Preloaded<typeof api.users.getCurrentUser>;
  preloadedSubStatus: Preloaded<
    typeof api.subscriptions.getUserSubscriptionStatus
  >;
  preloadedOrganizerData: Preloaded<
    typeof api.organizer.organizations.getUserOrgEvents
  >;
};

const ConvexPreloadContext = createContext<ConvexPreloadContextType | null>(
  null,
);

type ConvexPreloadContextProviderProps = ConvexPreloadContextType & {
  children: ReactNode;
};

export function ConvexPreloadContextProvider({
  children,
  preloadedUserData,
  preloadedSubStatus,
  preloadedOrganizerData,
}: ConvexPreloadContextProviderProps) {
  return (
    <ConvexPreloadContext.Provider
      value={{
        preloadedUserData,
        preloadedSubStatus,
        preloadedOrganizerData,
      }}
    >
      {children}
    </ConvexPreloadContext.Provider>
  );
}

export function useConvexPreload() {
  const context = useContext(ConvexPreloadContext);
  if (!context)
    throw new Error(
      "useConvexPreload must be inside of ConvexPreloadContextProvider",
    );
  return context;
}
