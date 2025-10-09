// app/components/ThemedProvider.tsx
"use client";

import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { UserPref } from "@/types/user";
import { usePreloadedQuery } from "convex/react";
import { ThemeProvider } from "next-themes";
import { usePathname } from "next/navigation";
import { createContext, ReactNode } from "react";

interface ThemedProviderProps {
  children: ReactNode;
  userPref?: UserPref;
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
    // <PendingThemeContext.Provider value={{ pendingTheme, setPendingTheme }}>
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
      {/* <ThemeSync userTheme={userTheme} hasUser={!!user}> */}
      {children}
      {/* </ThemeSync> */}
    </ThemeProvider>
    // </PendingThemeContext.Provider>
  );
}

{
  /*function ThemeSync({
  hasUser,
  userTheme,
  children,
}: {
  hasUser?: boolean;
  userTheme?: string;
  children: ReactNode;
}) {
  const { theme, setTheme } = useTheme();
  const { pendingTheme, setPendingTheme } = useContext(PendingThemeContext);

  // useEffect(() => {
  //   if (pendingTheme && userTheme === pendingTheme) setPendingTheme(null);
  // }, [pendingTheme, userTheme, setPendingTheme]);

  // useEffect(() => {
  //   if (pendingTheme) return;

  //   if (!hasUser) setTheme("default");
  //   else if (userTheme && theme !== userTheme) {
  //     setTheme(userTheme);
  //   }
  // }, [theme, userTheme, setTheme, hasUser, pendingTheme]);

  return <>{children}</>;
}
*/
}
