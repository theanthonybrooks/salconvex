/* eslint-disable @next/next/no-img-element */

"use client";

export default function FullPageLoading() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6 bg-background text-foreground">
      <div className="relative size-40">
        <img
          src="/branding/loading/loading-border.svg"
          alt="Loading border"
          className="animate-spin-slow absolute inset-0 m-auto size-full"
        />

        <img
          src="/branding/loading/loading-inner.svg"
          alt="Loading inner"
          className="animate-spin-reverse absolute inset-0 m-auto size-full"
        />
      </div>
      <span className="align-center ml-4 flex text-3xl font-bold">
        Loading…
      </span>
    </div>
  );
}
