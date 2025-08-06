// app/components/ThemedProvider.tsx
"use client";

import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { UserPref } from "@/types/user";
import { usePreloadedQuery } from "convex/react";
import { ThemeProvider, useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import React, { useEffect } from "react";

interface ThemedProviderProps {
  children: React.ReactNode;
  userPref?: UserPref;
}

export function ThemedProvider({ children }: ThemedProviderProps) {
  const { preloadedUserData } = useConvexPreload();
  const userData = usePreloadedQuery(preloadedUserData);
  const userTheme = userData?.userPref?.theme;
  const isAdmin = userData?.user?.role?.includes("admin");
  // const userTheme = userPref?.theme
  const pathname = usePathname();
  const forcedTheme = pathname.startsWith("/auth") ? "default" : undefined;

  return (
    <ThemeProvider
      // themes={["light", "dark", "default", "white", "system"]} //TODO: Re-enable dark and system modes once it's actually set up
      themes={["light", "default", "white"]}
      attribute="class"
      defaultTheme={userTheme ? userTheme : "default"}
      enableSystem
      disableTransitionOnChange
      storageKey="theme"
      forcedTheme={forcedTheme}
    >
      <ThemeSync userTheme={userTheme} isAdmin={isAdmin}>
        {children}
      </ThemeSync>
    </ThemeProvider>
  );
}

function ThemeSync({
  userTheme,
  isAdmin,
  children,
}: {
  userTheme?: string;
  isAdmin: boolean | undefined;
  children: React.ReactNode;
}) {
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (!isAdmin) return;
    console.log("userTheme", userTheme);
    console.log("theme", theme);
    if (userTheme && theme !== userTheme) {
      console.log("setting theme");
      setTheme(userTheme);
    }
  }, [theme, userTheme, setTheme, isAdmin]);

  return <>{children}</>;
}
