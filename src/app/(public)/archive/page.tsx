"use client";

import Pricing from "@/features/homepage/pricing";

export default function Archive() {
  return (
    <>
      <>
        <div className="container mx-auto px-4">
          <div className="mt-8 flex h-full w-full flex-col items-center justify-center">
            <h1 className="font-tanker text-[5rem] lowercase tracking-wide">
              Archive
            </h1>
            <p className="text-center text-lg text-foreground">Coming soon!</p>
          </div>
          <div className="py-8">
            <Pricing />
          </div>
        </div>
      </>
    </>
  );
}
