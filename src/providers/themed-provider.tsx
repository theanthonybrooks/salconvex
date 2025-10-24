// app/components/ThemedProvider.tsx
"use client";

import { createContext, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { ThemeProvider } from "next-themes";

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
  const forcedTheme =
    pathname.startsWith("/auth") || !user ? "default" : undefined;

  return (
    <ThemeProvider
      // themes={["light", "dark", "default", "white", "system"]} //TODO: Re-enable dark and system modes once it's actually set up
      themes={
        isAdmin
          ? ["light", "dark", "default", "white", "system"]
          : user
            ? ["light", "default", "white"]
            : ["default"]
      }
      attribute="class"
      // defaultTheme="default"
      enableSystem={false} //TODO: Re-enable dark and system modes once it's actually set up
      // disableTransitionOnChange
      storageKey="theme"
      forcedTheme={forcedTheme}
    >
      {children}
    </ThemeProvider>
  );
}
