// app/components/ThemedProvider.tsx
"use client";

import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { UserPref } from "@/types/user";
import { usePreloadedQuery } from "convex/react";
import { ThemeProvider } from "next-themes";
import { usePathname } from "next/navigation";
import React from "react";

interface ThemedProviderProps {
  children: React.ReactNode;
  userPref?: UserPref;
}

export function ThemedProvider({ children }: ThemedProviderProps) {
  const { preloadedUserData } = useConvexPreload();
  const userData = usePreloadedQuery(preloadedUserData);
  const userTheme = userData?.userPref?.theme;
  // const userTheme = userPref?.theme
  const pathname = usePathname();
  const forcedTheme = pathname.startsWith("/auth") ? "default" : undefined;
  // const { theme, setTheme } = useTheme()

  // useEffect(() => {
  //   if (userTheme && theme !== userTheme) {
  //     setTheme(userTheme)
  //   }
  // }, [theme, userTheme, setTheme])

  // console.log("userTheme", userTheme)
  // console.log("theme", theme)

  return (
    <ThemeProvider
      themes={["light", "dark", "default", "white", "system"]}
      attribute="class"
      defaultTheme={userTheme ? userTheme : "default"}
      enableSystem
      disableTransitionOnChange
      storageKey="theme"
      forcedTheme={forcedTheme}
    >
      {children}
    </ThemeProvider>
  );
}
