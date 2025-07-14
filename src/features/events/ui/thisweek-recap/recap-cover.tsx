/* eslint-disable @next/next/no-img-element */

import { forwardRef } from "react";

interface RecapCoverProps {
  dateRange: string;
}

export const RecapCover = forwardRef<HTMLDivElement, RecapCoverProps>(
  ({ dateRange }, ref) => {
    return (
      <div
        ref={ref}
        className="relative w-[500px] bg-[#feee1f] bg-cover bg-center"
      >
        <section className="post-header">
          <img
            className="-z-1 h-full w-full p-10 pl-12"
            src="/branding/weeklybgsalupdate.png"
            alt="Open Calls Ending this Week Background"
            height={400}
            width={400}
            crossOrigin="anonymous"
          />
        </section>
        <section className="absolute bottom-1/2 flex w-full translate-y-[12.3em] flex-col">
          <section className="filler">
            <h2 className="text-center font-tanker text-[2.8em] lowercase">
              {dateRange}
            </h2>
            <div className="translate-y-6 text-center text-lg">
              <p> See &quot;Open calls ending this week&quot;</p>{" "}
              <p>in bio for links</p>
            </div>
          </section>
        </section>
      </div>
    );
  },
);

export const RecapEndCover = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div
      ref={ref}
      className="relative w-[500px] bg-[#feee1f] bg-cover bg-center"
    >
      <section className="post-header">
        <img
          className="-z-1 h-full w-full -translate-y-6 p-10 pl-12"
          src="/branding/weekly-back-cover2.png"
          alt="Open Calls Ending this Week Background"
          height={400}
          width={400}
          crossOrigin="anonymous"
        />
      </section>
      <section className="absolute bottom-0 flex w-full -translate-y-8 flex-col text-center font-bold">
        TheStreetArtList.com
      </section>
    </div>
  );
});

RecapEndCover.displayName = "RecapEndCover";
RecapCover.displayName = "RecapCover";
