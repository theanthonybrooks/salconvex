import Footer from "@/features/wrapper-elements/navigation/components/footer";
import { NavbarWrapper } from "@/features/wrapper-elements/navigation/components/navbar-wrapper";

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    //<ClientAuthWrapper>
    <>
      <NavbarWrapper type="thelist" />
      <div className="flex flex-col pt-32">
        <main className="flex w-full flex-1 flex-col items-center px-4">
          {children}
        </main>

        <Footer />
      </div>
    </>
    // </ClientAuthWrapper>
  );
}
