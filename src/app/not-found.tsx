import Image from "next/image";

import Force404Url from "@/components/force404url";
import ClientAuthWrapper from "@/features/auth/wrappers/auth-wrapper";
import Footer from "@/features/wrapper-elements/navigation/components/footer";
import { NavbarWrapper } from "@/features/wrapper-elements/navigation/components/navbar-wrapper";

export async function generateMetadata() {
  return { title: "Page Not Found" };
}

export default async function NotFound() {
  return (
    <ClientAuthWrapper>
      <Force404Url />
      <div className="h-full min-h-screen">
        <NavbarWrapper type="public" />
        <div className="scrollable mini darkbar flex min-h-screen flex-col justify-between">
          <main className="flex h-full min-w-screen flex-grow flex-col items-center justify-center px-4 pt-[135px] lg:pt-[100px]">
            <Image
              src="/error-page.gif"
              alt="404 Error"
              width={300}
              height={300}
              className="mx-auto mb-4 max-w-[90vw] rounded-full border-2"
            />
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-center font-tanker text-[9.5rem] leading-none md:leading-[9.5rem]">
                404
              </h1>
              <h2 className="w-min text-center font-tanker text-[2.6rem] leading-10 md:w-max md:max-w-min">
                Page Not Found
              </h2>
            </div>
            {/* <p className="text-center text-3xl font-bold text-foreground">
              At least, not yet 😘
            </p> */}
          </main>
          <Footer className="mt-10" />
        </div>
      </div>
    </ClientAuthWrapper>
  );
}
