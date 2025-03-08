import {
  bebasNeue,
  libreFranklin,
  spaceGrotesk,
  spaceMono,
  tankerReg,
} from "@/assets/fonts"
import { ConvexClientProvider } from "@/components/convex-client-provider"
import { cn } from "@/lib/utils"
import { ThemedProvider } from "@/providers/themed-provider"
import {
  ConvexAuthNextjsServerProvider,
  convexAuthNextjsToken,
} from "@convex-dev/auth/nextjs/server"
import { ConvexQueryCacheProvider } from "convex-helpers/react/cache/provider"
import { fetchQuery } from "convex/nextjs"
import { GeistSans } from "geist/font/sans"
import type { Metadata } from "next"
import { ToastContainer } from "react-toastify"
import { api } from "~/convex/_generated/api"
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL("https://nextstarter.xyz/"),
  title: {
    default: "The Street Art List",
    template: `%s | The Street Art List`,
  },
  description:
    "The Ultimate Nextjs 15 Starter Kit for quickly building your SaaS, giving you time to focus on what really matters",
  openGraph: {
    description:
      "The Ultimate Nextjs 15 Starter Kit for quickly building your SaaS, giving you time to focus on what really matters",
    images: [
      "https://dwdwn8b5ye.ufs.sh/f/MD2AM9SEY8GucGJl7b5qyE7FjNDKYduLOG2QHWh3f5RgSi0c",
    ],
    url: "https://thestreetartlist.com/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nextjs Starter Kit",
    description:
      "The Ultimate Nextjs 15 Starter Kit for quickly building your SaaS, giving you time to focus on what really matters",
    siteId: "",
    creator: "@imanthonybrooks",
    creatorId: "",
    images: [
      "https://dwdwn8b5ye.ufs.sh/f/MD2AM9SEY8GucGJl7b5qyE7FjNDKYduLOG2QHWh3f5RgSi0c",
    ],
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const token = await convexAuthNextjsToken()

  // if (token !== null) {
  const userData = await fetchQuery(api.users.getCurrentUser, {}, { token })
  const userPref = userData?.userPref ?? null
  // }

  return (
    <ConvexAuthNextjsServerProvider>
      <html lang='en' suppressHydrationWarning>
        <body
          className={cn(
            GeistSans.className,
            " scrollable invis darkbar antialiased",
            tankerReg.variable,
            spaceMono.variable,
            libreFranklin.variable,
            spaceGrotesk.variable,
            bebasNeue.variable
          )}>
          <ConvexClientProvider>
            <ConvexQueryCacheProvider>
              <ThemedProvider user={userPref}>
                {children}
                <ToastContainer
                  position='top-right'
                  autoClose={5000}
                  hideProgressBar={false}
                  newestOnTop={false}
                  closeOnClick={false}
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                  theme='light'
                />
              </ThemedProvider>
            </ConvexQueryCacheProvider>
          </ConvexClientProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  )
}
