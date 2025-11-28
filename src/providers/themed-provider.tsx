// app/components/ThemedProvider.tsx
"use client";

import { roleThemeMap, ThemeOptions } from "@/constants/themeConsts";

import type {
  ThemeType,
  ThemeTypeOptions,
  UserRoles,
} from "@/types/themeTypes";
import type { User } from "@/types/user";

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

export const getThemeOptionsForRole = (role: UserRoles): ThemeTypeOptions[] => {
  const allowed = roleThemeMap[role];
  return ThemeOptions.filter((opt) => allowed.includes(opt.value));
};

export const getUserThemeOptions = (user: User | undefined): ThemeType[] => {
  let userRoleType = "guest";
  if (user) {
    if (user.role.includes("admin")) {
      userRoleType = "admin";
    } else {
      userRoleType = "user";
    }
  }
  return getThemeOptionsForRole(userRoleType as UserRoles).map(
    (opt) => opt.value,
  );
};
export const getUserThemeOptionsFull = (
  user: User | undefined,
): ThemeTypeOptions[] => {
  let userRoleType = "guest";
  if (user) {
    if (user.role.includes("admin")) {
      userRoleType = "admin";
    } else {
      userRoleType = "user";
    }
  }
  return getThemeOptionsForRole(userRoleType as UserRoles);
};

export const PendingThemeContext = createContext<{
  pendingTheme: string | null;
  setPendingTheme: (t: string | null) => void;
}>({ pendingTheme: null, setPendingTheme: () => {} });

export function ThemedProvider({ children }: ThemedProviderProps) {
  const { preloadedUserData } = useConvexPreload();
  const userData = usePreloadedQuery(preloadedUserData);
  const user = userData?.user;
  const userThemeOptions = getUserThemeOptions(user);

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
      themes={userThemeOptions}
      attribute="class"
      storageKey="theme"
      forcedTheme={forcedTheme}
      defaultTheme="default"
      enableSystem={false} //? todo: Re-enable dark and system modes once it's actually set up
      // disableTransitionOnChange
    >
      {!isMounted && user ? <FullPageLoading /> : children}
    </ThemeProvider>
  );
}
