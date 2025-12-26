import {
  DEFAULT_DESCRIPTION,
  DEFAULT_ICON,
  DEFAULT_IMAGES,
  getPageMeta,
} from "@/constants/pageTitles";
import { siteUrl } from "@/constants/siteInfo";

import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import Footer from "@/features/wrapper-elements/navigation/components/footer";
import { NavbarWrapper } from "@/features/wrapper-elements/navigation/components/navbar-wrapper";
import { cn } from "@/helpers/utilsFns";

import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from "~/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";

const INDEXABLE_ROUTES = new Set([
  "/",
  "/about",
  "/pricing",
  "/submit",
  "/about",
  // "/map",
  // "/calendar",
  "/faq",
]);

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname");
  const isIndexable = INDEXABLE_ROUTES.has(pathname ?? "");

  const meta = getPageMeta(pathname);

  let title = meta.title || "The Street Art List";
  let description = meta.description || DEFAULT_DESCRIPTION;

  // Override for home page only
  if (pathname === "/" || pathname === "/home") {
    title = "Street Art & Mural Open Calls | The Street Art List";
    description =
      "Discover global mural and street art open calls, public art RFQs, RFPs, and EOIs. The Street Art List connects artists and organizers worldwide.";
  }

  if (pathname === "/submit") {
    title = "Submit a Call | The Street Art List";
    description =
      "Submit a call to the global community of street artists, muralists, graffiti artists, and more. Ensure that your call reaches the right people and isn't lost in a sea of unrelated art calls.";
  }

  return {
    title,
    description,
    robots: isIndexable ? "index, follow" : "noindex, follow",
    openGraph: {
      title: meta.externalTitle || meta.title || "The Street Art List",
      description: description || meta.description || DEFAULT_DESCRIPTION,
      url: meta.openGraph?.url || siteUrl[0],
      type: meta.openGraph?.type || "website",
      images: meta.images || DEFAULT_IMAGES,
    },
    twitter: {
      card: meta.twitter?.card || "summary_large_image",
      title: meta.externalTitle || meta.title || "The Street Art List",
      description: description || meta.description || DEFAULT_DESCRIPTION,
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
  const token = await convexAuthNextjsToken();
  const headersList = await headers();
  const pathname = headersList.get("x-pathname");
  const userData = await fetchQuery(api.users.getCurrentUser, {}, { token });
  const { user } = userData ?? {};
  const isAdmin = user?.role?.includes("admin");

  if (pathname === "/map" && !isAdmin) {
    redirect("https://archive.thestreetartlist.com/map");
  }
  if (pathname === "/archive" && !isAdmin) {
    redirect("https://archive.thestreetartlist.com/archive");
  }

  return (
    // <ClientAuthWrapper>
    <>
      <NavbarWrapper type="public" />
      {/* <div className="flex h-full flex-col"> */}
      <main
        className={cn(
          "public-content relative flex flex-1 flex-col",
          // notHomePage && "pt-36 lg:pt-25",
        )}
      >
        {children}
      </main>

      <Footer className="mt-10" />
      {/* </div> */}
    </>
    // </ClientAuthWrapper>
  );
}
