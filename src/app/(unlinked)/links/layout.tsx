import type { Metadata } from "next";

import { cn } from "@/helpers/utilsFns";

export const metadata: Metadata = {
  title: "Links | The Street Art List",
  description: "Social media links for The Street Art List",
  openGraph: {
    title: "Links | The Street Art List",
    description: "Social media links for The Street Art List",
    url: "https://thestreetartlist.com/links",
    siteName: "The Street Art List",
    images: [
      {
        url: "/saltext.png",
        width: 1200,
        height: 630,
        alt: "The Street Art List Links Page",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Links | The Street Art List",
    description: "Social media links for The Street Art List",
    images: "/saltext.png",
  },
};

export default function LinksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main
      className={cn(
        "scrollable [@media(max-width:640px)]:mini relative flex h-full w-full flex-1 flex-col items-center gap-3 px-6 py-10",
      )}
    >
      {children}
    </main>
  );
}
