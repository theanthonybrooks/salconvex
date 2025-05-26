"use client";

import { Preloaded } from "convex/react";
import { createContext, ReactNode, useContext } from "react";
import { api } from "~/convex/_generated/api";

type ConvexPreloadContextType = {
  preloadedUserData: Preloaded<typeof api.users.getCurrentUser>;
  preloadedSubStatus: Preloaded<
    typeof api.subscriptions.getUserSubscriptionStatus
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
}: ConvexPreloadContextProviderProps) {
  return (
    <ConvexPreloadContext.Provider
      value={{ preloadedUserData, preloadedSubStatus }}
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
