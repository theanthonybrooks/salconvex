import {
  DEFAULT_DESCRIPTION,
  DEFAULT_ICON,
  DEFAULT_IMAGES,
  getPageMeta,
} from "@/constants/pageTitles";
import { siteUrl } from "@/constants/siteInfo";
import Footer from "@/features/wrapper-elements/navigation/components/footer";
import { NavbarWrapper } from "@/features/wrapper-elements/navigation/components/navbar-wrapper";
import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname");
  const meta = getPageMeta(pathname);

  return {
    title: meta.title || "The Street Art List",
    description: meta.description || DEFAULT_DESCRIPTION,
    openGraph: {
      title: meta.externalTitle || meta.title || "The Street Art List",
      description: meta.description || DEFAULT_DESCRIPTION,
      url: meta.openGraph?.url || siteUrl[0],
      type: meta.openGraph?.type || "website",
      images: meta.images || DEFAULT_IMAGES,
    },
    twitter: {
      card: meta.twitter?.card || "summary_large_image",
      title: meta.externalTitle || meta.title || "The Street Art List",
      description: meta.description || DEFAULT_DESCRIPTION,
      images: meta.images || DEFAULT_IMAGES,
    },
    icons: DEFAULT_ICON,
  };
}

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname");

  if (pathname === "/map") {
    redirect("https://thestreetartlist.helioho.st/map");
  }
  if (pathname === "/archive") {
    redirect("https://thestreetartlist.helioho.st/archive");
  }

  return (
    // <ClientAuthWrapper>
    <>
      <NavbarWrapper type="public" />
      {/* <div className="flex h-full flex-col"> */}
      <main className="flex flex-1 flex-col px-4 pt-36 lg:pt-25">
        {children}
      </main>

      <Footer className="mt-10" />
      {/* </div> */}
    </>
    // </ClientAuthWrapper>
  );
}
