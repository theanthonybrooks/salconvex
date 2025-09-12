import {
  bebasNeue,
  libreFranklin,
  spaceGrotesk,
  spaceMono,
  tankerReg,
} from "@/assets/fonts";
import { ConvexClientProvider } from "@/components/convex-client-provider";
import { siteUrl } from "@/constants/siteInfo";
import { CookieBanner } from "@/features/auth/components/cookie-banner";
import { ConvexPreloadContextProvider } from "@/features/wrapper-elements/convex-preload-context";
import { isAppleUA } from "@/lib/appleFns";
import { cn } from "@/lib/utils";
import { DeviceProvider } from "@/providers/device-provider";
import { PostHogProvider } from "@/providers/posthog-provider";
import { ThemedProvider } from "@/providers/themed-provider";
import { CookiePref } from "@/types/user";
import {
  ConvexAuthNextjsServerProvider,
  convexAuthNextjsToken,
} from "@convex-dev/auth/nextjs/server";
import { ConvexQueryCacheProvider } from "convex-helpers/react/cache/provider";
import { preloadQuery } from "convex/nextjs";
import { GeistSans } from "geist/font/sans";
import "leaflet/dist/leaflet.css";
import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { ReactNode } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { ToastContainer } from "react-toastify";
import { api } from "~/convex/_generated/api";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl[0]),
  // viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  title: {
    default: "Home",
    template: `%s | The Street Art List`,
  },
  description:
    "List of street art, graffiti, & mural projects. Open calls, event calendar, and global map. Created, maintained, and shared by @anthonybrooksart",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    // apple: "/apple-touch-icon.png",
  },
  openGraph: {
    description:
      "List of street art, graffiti, & mural projects. Open calls, event calendar, and global map. Created, maintained, and shared by @anthonybrooksart",
    images: [`${siteUrl[0]}/The-Street-Art-List.png`],
    url: new URL(siteUrl[0]),
  },
  twitter: {
    card: "summary_large_image",
    title: "The Street Art List",
    description:
      "List of street art, graffiti, & mural projects. Open calls, event calendar, and global map. Created, maintained, and shared by @anthonybrooksart",
    siteId: "",
    creator: "@imanthonybrooks",
    creatorId: "",
    images: [`${siteUrl[0]}/The-Street-Art-List.png`],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const h = await headers();
  const ua = h.get("user-agent") ?? "";
  const appleClass = isAppleUA(ua) ? "apple-webkit-fix" : "";
  const deviceType = h.get("x-device-type");
  const osName = h.get("x-os-name");
  const browserName = h.get("x-browser-name");
  const deviceVendor = h.get("x-device-vendor");
  const deviceModel = h.get("x-device-model");

  const cookieStore = await cookies();
  const localCookiePrefs = cookieStore.get("cookie_preferences")?.value ?? null;

  const token = await convexAuthNextjsToken();
  const preloadedUserData = await preloadQuery(
    api.users.getCurrentUser,
    {},
    { token },
  );
  const preloadedSubStatus = await preloadQuery(
    api.subscriptions.getUserSubscriptionStatus,
    {},
    { token },
  );

  return (
    <ConvexAuthNextjsServerProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link
            rel="stylesheet"
            href="https://use.typekit.net/dck7qmb.css"
          ></link>
        </head>
        <body
          className={cn(
            GeistSans.className,
            "scrollable justy darkbar font-spaceGrotesk antialiased",
            // "white:font-sans",

            // "default:font-spaceGrotesk",

            // " scrollable invis darkbar antialiased",
            appleClass,
            tankerReg.variable,
            spaceMono.variable,
            libreFranklin.variable,
            spaceGrotesk.variable,
            bebasNeue.variable,
          )}
        >
          <ConvexClientProvider>
            <ConvexPreloadContextProvider
              preloadedUserData={preloadedUserData}
              preloadedSubStatus={preloadedSubStatus}
            >
              <ConvexQueryCacheProvider>
                <ThemedProvider>
                  <PostHogProvider
                    localCookiePrefs={localCookiePrefs as CookiePref}
                  >
                    <DeviceProvider
                      value={{
                        deviceType,
                        osName,
                        browserName,
                        deviceVendor,
                        deviceModel,
                        isMobile: deviceType === "mobile",
                      }}
                    >
                      <CookieBanner
                        localCookiePrefs={localCookiePrefs as CookiePref}
                      />
                      {children}
                    </DeviceProvider>
                  </PostHogProvider>
                  <ToastContainer
                    position="top-right"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick={true}
                    rtl={false}
                    pauseOnFocusLoss={false}
                    draggable
                    pauseOnHover
                    theme="light"
                    toastClassName="pointer-events-auto z-[9999] rounded  mx-auto md:top-2 md:right-1  max-w-[90dvw] border-2 z-top"
                  />
                </ThemedProvider>
              </ConvexQueryCacheProvider>
            </ConvexPreloadContextProvider>
          </ConvexClientProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
