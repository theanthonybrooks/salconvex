import { ConvexClientProvider } from "@/components/convex-client-provider"
import { ThemedProvider } from "@/providers/themed-provider"
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server"
import { ConvexQueryCacheProvider } from "convex-helpers/react/cache/provider"
import { GeistSans } from "geist/font/sans"
import type { Metadata } from "next"
import { ToastContainer } from "react-toastify"
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html lang='en' suppressHydrationWarning className='scrollable'>
        <body className={GeistSans.className}>
          <ConvexClientProvider>
            <ConvexQueryCacheProvider>
              <ThemedProvider>
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
