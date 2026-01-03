/* eslint-disable @next/next/no-img-element */

"use client";

export default function FullPageLoading() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6 bg-background text-foreground">
      <div className="relative size-40 rounded-full dark:bg-salYellow">
        <img
          src="/branding/loading/loading-border.svg"
          alt="Loading border"
          className="absolute inset-0 m-auto size-full animate-spin-slow"
        />

        <img
          src="/branding/loading/loading-inner.svg"
          alt="Loading inner"
          className="absolute inset-0 m-auto size-full animate-spin-reverse"
        />
      </div>
      <span className="align-center ml-4 flex text-3xl font-bold dark:text-salYellow">
        Loading…
      </span>
    </div>
  );
}
