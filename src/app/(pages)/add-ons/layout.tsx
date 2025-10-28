import Footer from "@/features/wrapper-elements/navigation/components/footer";
import { NavbarWrapper } from "@/features/wrapper-elements/navigation/components/navbar-wrapper";

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
