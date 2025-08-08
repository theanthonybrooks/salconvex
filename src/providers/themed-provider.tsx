// app/components/ThemedProvider.tsx
"use client";

import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { UserPref } from "@/types/user";
import { usePreloadedQuery } from "convex/react";
import { ThemeProvider, useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect } from "react";

interface ThemedProviderProps {
  children: ReactNode;
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
  const user = userData?.user;

  return (
    <ThemeProvider
      // themes={["light", "dark", "default", "white", "system"]} //TODO: Re-enable dark and system modes once it's actually set up
      themes={
        isAdmin
          ? ["light", "dark", "default", "white", "system"]
          : ["light", "default", "white"]
      }
      attribute="class"
      defaultTheme={userTheme ? userTheme : "default"}
      enableSystem
      disableTransitionOnChange
      storageKey="theme"
      forcedTheme={forcedTheme}
    >
      <ThemeSync userTheme={userTheme} hasUser={!!user}>
        {children}
      </ThemeSync>
    </ThemeProvider>
  );
}

function ThemeSync({
  hasUser,
  userTheme,
  children,
}: {
  hasUser?: boolean;
  userTheme?: string;
  children: ReactNode;
}) {
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (!hasUser) {
      setTheme("default");
      return;
    } else if (userTheme && theme !== userTheme) {
      setTheme(userTheme);
    }
  }, [theme, userTheme, setTheme, hasUser]);

  return <>{children}</>;
}
