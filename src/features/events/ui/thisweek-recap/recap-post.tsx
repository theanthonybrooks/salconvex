import EventDates from "@/features/events/components/event-dates";
import { EligibilityLabel } from "@/features/events/open-calls/components/eligibility-label";
import { formatOpenCallDeadline } from "@/lib/dateFns";
import { formatCurrency } from "@/lib/eventFns";
import { getFormattedLocationString } from "@/lib/locations";
import { cn } from "@/lib/utils";
import { PublicEventPreviewData } from "@/types/event";
import Image from "next/image";
import { forwardRef } from "react";
import { TiMinus } from "react-icons/ti";

interface RecapPostProps {
  event: PublicEventPreviewData;
  index: number;
}

const RecapPost = forwardRef<HTMLDivElement, RecapPostProps>((props, ref) => {
  const { event, index } = props;
  const { openCall } = event;
  const eligibility = event.hasActiveOpenCall
    ? openCall?.eligibility
    : undefined;

  const compensation = openCall?.compensation;
  const hasBudget =
    typeof compensation?.budget?.min === "number" &&
    compensation?.budget?.min > 0;

  return (
    <div
      ref={ref}
      className="relative h-[500px] w-[500px] bg-[#feee1f] bg-cover bg-center"
    >
      <section className="post-header">
        <p className="absolute -left-9 top-24 -rotate-90 text-base font-black">
          @TheStreetArtList
        </p>
        <Image
          className="absolute right-[4.4em] top-[4.5em]"
          src="/logotransparency.png"
          alt={event?.name}
          height={90}
          width={90}
        />
        <h1 className="absolute left-[15%] top-[5.5%] font-tanker text-[7.5rem]">
          {index + 1}.
        </h1>
      </section>
      <section className="absolute left-[15%] top-[40%] flex flex-col gap-6">
        <h2 className="max-w-[24ch] text-wrap text-2xl font-black capitalize">
          {event?.name}
        </h2>
        <section className="post-details">
          <ul className="flex flex-col gap-y-2">
            <li>
              <span className="flex items-center gap-1 text-lg">
                <TiMinus className="size-4" />
                <b>Deadline:</b>{" "}
                {formatOpenCallDeadline(
                  openCall?.basicInfo.dates?.ocEnd || "",
                  openCall?.basicInfo.dates?.timezone || "Europe/Berlin",
                  openCall?.basicInfo.callType || "Fixed",
                  false,
                  true,
                )}
              </span>
            </li>

            <li>
              <span className="flex items-center gap-1 text-lg">
                <TiMinus className="size-4" />
                <span className="flex items-start gap-1">
                  <b> When:</b>
                  <EventDates
                    event={event}
                    format="desktop"
                    limit={1}
                    preview={true}
                    type="event"
                  />
                </span>
              </span>
            </li>
            <li>
              <span className="flex items-center gap-1 text-lg">
                <TiMinus className="size-4" />
                <b>Where:</b> {getFormattedLocationString(event?.location)}
              </span>
            </li>
            <li>
              <span className="flex items-center gap-1 text-lg">
                <TiMinus className="size-4" />
                <b>Open to:</b>
                <span
                  className={cn(
                    !eligibility?.type?.includes("International") &&
                      "italic text-red-600",
                  )}
                >
                  {
                    <EligibilityLabel
                      type={eligibility?.type || null}
                      whom={eligibility?.whom || []}
                      format="desktop"
                      preview={true}
                      publicView={true}
                    />
                  }
                </span>
              </span>
            </li>
            <li>
              <span className="flex items-center gap-1 text-lg">
                <TiMinus className="size-4" />
                <b>Paid:</b> {hasBudget ? "Yes" : "No Info"}
                {hasBudget &&
                  "; " +
                    formatCurrency(
                      compensation?.budget?.min,
                      compensation?.budget?.max,
                      compensation?.budget?.currency,
                      true,
                      compensation?.budget?.allInclusive,
                      // userCurrency !== currency ? userCurrency : undefined
                    )}
              </span>
            </li>
          </ul>
        </section>
      </section>
    </div>
  );
});

RecapPost.displayName = "RecapPost";

export default RecapPost;
