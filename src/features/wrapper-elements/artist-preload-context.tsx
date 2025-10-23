"use client";

import { createContext, ReactNode, useContext } from "react";
import { api } from "~/convex/_generated/api";
import { Preloaded } from "convex/react";

// Define the shape of the context
type ArtistPreloadContextType = {
  preloadedArtistData: Preloaded<
    typeof api.artists.getArtistEventMetadata.getArtistEventMetadata
  >;
};

// Create the context with an explicit null default
const ArtistPreloadContext = createContext<ArtistPreloadContextType | null>(
  null,
);

// Typed provider props
type ArtistPreloadContextProviderProps = ArtistPreloadContextType & {
  children: ReactNode;
};

// Provider implementation
export function ArtistPreloadContextProvider({
  children,
  preloadedArtistData,
}: ArtistPreloadContextProviderProps) {
  return (
    <ArtistPreloadContext.Provider value={{ preloadedArtistData }}>
      {children}
    </ArtistPreloadContext.Provider>
  );
}

// Hook to access the context
export function useArtistPreload() {
  const context = useContext(ArtistPreloadContext);
  if (!context)
    throw new Error(
      "useConvexPreload must be used inside ConvexPreloadContextProvider",
    );
  return context;
}
