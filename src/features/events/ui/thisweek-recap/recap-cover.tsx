/* eslint-disable @next/next/no-img-element */

import { forwardRef } from "react";

import { cn } from "@/helpers/utilsFns";

interface RecapPgBaseProps {
  id: string;
}
interface RecapCoverProps extends RecapPgBaseProps {
  dateRange: string;
  fontSize: number | null;
}

interface RecapCallCountProps extends RecapPgBaseProps {
  openCallCount: number;
}

export const RecapCover = forwardRef<HTMLDivElement, RecapCoverProps>(
  ({ id, dateRange, fontSize }, ref) => {
    const rangeLength = dateRange.trim().length;
    return (
      <div
        id={id}
        ref={ref}
        className="relative flex h-[625px] w-[500px] bg-[#feee1f] bg-cover bg-center"
      >
        <img
          className="m-auto max-h-full max-w-full"
          src="/branding/weeklybgsalupdate.png"
          alt="Open Calls Ending this Week Background"
          height={400}
          width={400}
          crossOrigin="anonymous"
        />
        <section className="absolute bottom-1/2 flex w-full translate-y-[12.3em] flex-col">
          <section className="filler">
            <h2
              className={cn(
                "text-center font-tanker lowercase",
                rangeLength > 12
                  ? "text-[2.3em] leading-[1.75em]"
                  : "text-[2.8em]",
              )}
              style={
                fontSize !== null
                  ? { fontSize: `${fontSize}em`, lineHeight: "1.75em" }
                  : undefined
              }
            >
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

export const RecapEndCover = forwardRef<HTMLDivElement, RecapPgBaseProps>(
  ({ id }, ref) => {
    return (
      <div
        id={id}
        ref={ref}
        className="relative flex h-[625px] w-[500px] bg-[#feee1f] bg-cover bg-center"
      >
        <img
          className="m-auto max-h-full max-w-full"
          src="/branding/weekly-end-cover.png"
          alt="Open Calls Ending this Week Background"
          height={400}
          width={400}
          crossOrigin="anonymous"
        />

        <section className="absolute bottom-0 flex w-full -translate-y-8 flex-col text-center font-bold">
          ( Link In Bio )
        </section>
      </div>
    );
  },
);
export const RecapCallCount = forwardRef<HTMLDivElement, RecapCallCountProps>(
  ({ openCallCount, id }, ref) => {
    return (
      <div
        id={id}
        ref={ref}
        className="relative flex aspect-square h-[625px] w-[500px] flex-col items-center justify-center bg-[#feee1f] bg-cover bg-center"
      >
        <section className="m-auto max-h-full max-w-full">
          <span className={cn("text-center font-tanker lowercase", "text-4xl")}>
            <p className="text-[4em] leading-[1em]">+{openCallCount} </p>
            <p>more open calls</p>{" "}
          </span>
        </section>
        <section className="absolute bottom-0 flex w-full -translate-y-8 flex-col text-center font-bold">
          TheStreetArtList.com
        </section>
      </div>
    );
  },
);
export const RecapSubmitCTA = forwardRef<HTMLDivElement, RecapPgBaseProps>(
  ({ id }, ref) => {
    return (
      <div
        id={id}
        ref={ref}
        className="relative flex h-[625px] w-[500px] bg-[#feee1f] bg-cover bg-center"
      >
        <img
          className="m-auto max-h-full max-w-full"
          src="/branding/submit-cta.png"
          alt="Open Calls Ending this Week CTA"
          height={400}
          width={400}
          crossOrigin="anonymous"
        />

        <section className="absolute bottom-0 flex w-full -translate-y-8 flex-col text-center font-bold">
          TheStreetArtList.com
        </section>
      </div>
    );
  },
);

RecapSubmitCTA.displayName = "RecapSubmitCTA";
RecapEndCover.displayName = "RecapEndCover";
RecapCover.displayName = "RecapCover";
RecapCallCount.displayName = "RecapCallCount";
