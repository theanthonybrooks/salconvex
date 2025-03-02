// app/components/ThemedProvider.tsx
"use client"

import { ThemeProvider } from "next-themes"
import { usePathname } from "next/navigation"
import React from "react"

interface ThemedProviderProps {
  children: React.ReactNode
}

export function ThemedProvider({ children }: ThemedProviderProps) {
  const pathname = usePathname()
  // If the pathname starts with /auth, force the 'sal' theme.
  const forcedTheme = pathname.startsWith("/auth") ? "saltheme" : undefined

  return (
    <ThemeProvider
      themes={["light", "dark", "saltheme", "system"]}
      attribute='class'
      defaultTheme='saltheme'
      enableSystem
      disableTransitionOnChange
      storageKey='theme'
      forcedTheme={forcedTheme}>
      {children}
    </ThemeProvider>
  )
}
