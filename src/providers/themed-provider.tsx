// app/components/ThemedProvider.tsx
"use client";

import { createContext, ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ThemeProvider } from "next-themes";

import FullPageLoading from "@/components/ui/loading-screen";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";

import { UserPrefsType } from "~/convex/schema";
import { usePreloadedQuery } from "convex/react";

interface ThemedProviderProps {
  children: ReactNode;
  userPref?: UserPrefsType;
}

export const PendingThemeContext = createContext<{
  pendingTheme: string | null;
  setPendingTheme: (t: string | null) => void;
}>({ pendingTheme: null, setPendingTheme: () => {} });

export function ThemedProvider({ children }: ThemedProviderProps) {
  const { preloadedUserData } = useConvexPreload();
  // const [pendingTheme, setPendingTheme] = useState<string | null>(null);
  const userData = usePreloadedQuery(preloadedUserData);
  const user = userData?.user;
  // const userTheme = userData?.userPref?.theme;
  const isAdmin = userData?.user?.role?.includes("admin");
  const pathname = usePathname();
  const whiteRoutes = ["/render/post", "/call/social"];
  const isWhiteRoute = whiteRoutes.some((route) => pathname.includes(route));

  const forcedTheme = isWhiteRoute
    ? "white"
    : !pathname.startsWith("/auth") && user
      ? undefined
      : "default";

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  return (
    <ThemeProvider
      themes={
        isAdmin
          ? ["light", "dark", "default", "white", "system"]
          : user
            ? ["light", "default", "white"]
            : ["default"]
      }
      attribute="class"
      storageKey="theme"
      forcedTheme={forcedTheme}
      //? themes={["light", "dark", "default", "white", "system"]} //todo: Re-enable dark and system modes once it's actually set up
      defaultTheme="default"
      enableSystem={false} //? todo: Re-enable dark and system modes once it's actually set up
      // disableTransitionOnChange
    >
      {!isMounted && user ? <FullPageLoading /> : children}
    </ThemeProvider>
  );
}
