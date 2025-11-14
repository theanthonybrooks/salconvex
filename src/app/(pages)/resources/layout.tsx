import { DEFAULT_ICON, DEFAULT_IMAGES } from "@/constants/pageTitles";
import { siteUrl } from "@/constants/siteInfo";

import type { Metadata } from "next";

import Footer from "@/features/wrapper-elements/navigation/components/footer";
import { NavbarWrapper } from "@/features/wrapper-elements/navigation/components/navbar-wrapper";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Resources | The Street Art List";
  const description =
    "Resources compiled for artists and organizers - Online events, workshops & more";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${siteUrl[0]}/resources`,
      type: "website",
      images: DEFAULT_IMAGES,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: DEFAULT_IMAGES,
    },
    icons: DEFAULT_ICON,
  };
}

export default async function AddOnsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavbarWrapper type="public" />
      <main className="flex w-full flex-1 flex-col items-center px-4 pt-32">
        {children}
      </main>
      <Footer />
    </>
  );
}
