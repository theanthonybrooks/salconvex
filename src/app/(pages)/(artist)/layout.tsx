//TODO: Add a provider for cookies popup, for other site notification popups

import { ArtistPreloadContextProvider } from "@/features/wrapper-elements/artist-preload-context";
import Footer from "@/features/wrapper-elements/navigation/components/footer";
import { NavbarWrapper } from "@/features/wrapper-elements/navigation/components/navbar-wrapper";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery, preloadQuery } from "convex/nextjs";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { api } from "~/convex/_generated/api";

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname");
  // console.log(pathname);
  const token = await convexAuthNextjsToken();
  const preloadedArtistData = await preloadQuery(
    api.artists.getArtistEventMetadata.getArtistEventMetadata,
    {},
    { token },
  );
  const userData = await fetchQuery(api.users.getCurrentUser, {}, { token });

  const subscription = await fetchQuery(
    api.subscriptions.getUserSubscriptionStatus,
    {},
    { token },
  );
  let owner = false;
  const user = userData?.user;
  // const isArtist = user?.accountType.includes("artist");
  const isOrganizer = user?.accountType.includes("organizer");
  const hasSub = subscription?.hasActiveSubscription;
  const onlyOrganizer = isOrganizer && !hasSub;
  const isAdmin = user?.role.includes("admin");
  const ocPage = pathname?.endsWith("/call");

  const pathnameParts = pathname?.split("/") ?? [];
  const eventIndex = pathnameParts.indexOf("event");

  const eventSlug = pathnameParts[eventIndex + 1];
  const editionRaw = pathnameParts[eventIndex + 2];
  const edition = parseInt(editionRaw, 10);

  if (!isAdmin) {
    if (onlyOrganizer) {
      const isOwner = await fetchQuery(
        api.organizer.organizations.checkIfOrgOwner,
        { eventSlug, edition },
        { token },
      );
      owner = isOwner;
    }
    if ((!user || !hasSub) && ocPage && !owner) {
      const redirectPath = pathname?.replace(/\/call\/?$/, "");
      redirect(redirectPath ?? "/thelist");
    }
  }

  return (
    //<ClientAuthWrapper>
    <ArtistPreloadContextProvider preloadedArtistData={preloadedArtistData}>
      <NavbarWrapper type="thelist" />
      <main className="flex w-full flex-1 flex-col items-center px-4 pt-32">
        {children}
      </main>
      <Footer />
    </ArtistPreloadContextProvider>
    // </ClientAuthWrapper>
  );
}
