import Footer from "@/features/wrapper-elements/navigation/components/footer";
import { NavbarWrapper } from "@/features/wrapper-elements/navigation/components/navbar-wrapper";

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // <ClientAuthWrapper>
    <>
      <NavbarWrapper type="public" />
      <div className="flex h-full flex-col pt-36 lg:pt-25">
        <main className="flex flex-1 flex-col px-4">{children}</main>

        <Footer className="mt-10" />
      </div>
    </>
    // </ClientAuthWrapper>
  );
}
