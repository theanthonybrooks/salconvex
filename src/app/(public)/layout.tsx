import { siteUrl } from "@/constants/siteInfo";
import Footer from "@/features/wrapper-elements/navigation/components/footer";
import { NavbarWrapper } from "@/features/wrapper-elements/navigation/components/navbar-wrapper";
import { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl[0]),
  // viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  title: {
    default: "The Street Art List",
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

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
