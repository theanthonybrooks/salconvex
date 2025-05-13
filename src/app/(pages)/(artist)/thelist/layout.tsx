import { ArtistPreloadContextProvider } from "@/features/wrapper-elements/artist-preload-context";
import Footer from "@/features/wrapper-elements/navigation/components/footer";
import { NavbarWrapper } from "@/features/wrapper-elements/navigation/components/navbar-wrapper";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { preloadQuery } from "convex/nextjs";
import { api } from "~/convex/_generated/api";

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await convexAuthNextjsToken();
  const preloadedArtistData = await preloadQuery(
    api.artists.getArtistEventMetadata.getArtistEventMetadata,
    {},
    { token },
  );

  return (
    //<ClientAuthWrapper>
    <ArtistPreloadContextProvider preloadedArtistData={preloadedArtistData}>
      <NavbarWrapper type="thelist" />
      <div className="flex flex-col pt-32">
        <main className="flex w-full flex-1 flex-col items-center px-4">
          {children}
        </main>

        <Footer />
      </div>
    </ArtistPreloadContextProvider>
    // </ClientAuthWrapper>
  );
}
