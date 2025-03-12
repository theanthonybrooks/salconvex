// app/components/ThemedProvider.tsx
"use client"

import { UserPref } from "@/types/user"
import { ThemeProvider } from "next-themes"
import { usePathname } from "next/navigation"
import React from "react"

interface ThemedProviderProps {
  children: React.ReactNode
  userPref?: UserPref
}

export function ThemedProvider({ children, userPref }: ThemedProviderProps) {
  const userTheme = userPref?.theme
  const pathname = usePathname()
  const forcedTheme = pathname.startsWith("/auth") ? "default" : undefined

  // useEffect(() => {
  //   if (userTheme && theme !== userTheme) {
  //     setTheme(userTheme)
  //   }
  // }, [theme, userTheme])

  // console.log("userTheme", userTheme)
  // console.log("theme", theme)

  return (
    <ThemeProvider
      themes={["light", "dark", "default", "system"]}
      attribute='class'
      defaultTheme={userTheme ? userTheme : "default"}
      enableSystem
      disableTransitionOnChange
      storageKey='theme'
      forcedTheme={forcedTheme}>
      {children}
    </ThemeProvider>
  )
}
