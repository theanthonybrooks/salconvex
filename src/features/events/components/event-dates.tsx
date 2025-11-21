import { EventData } from "@/types/eventTypes";

import { formatEventDates } from "@/helpers/dateFns";
import { cn } from "@/helpers/utilsFns";

type MinimalEventWithDates = Pick<EventData, "dates">;

interface EventDatesProps {
  event: MinimalEventWithDates;
  limit?: number;
  format: "desktop" | "mobile";
  preview?: boolean;
  className?: string;
  itemClassName?: string;
  moreCountClassName?: string;
  type?: "event" | "production";
}

const EventDates = ({
  event,
  limit,
  format,
  preview = false,
  className,
  itemClassName,
  moreCountClassName,
  type = "event",
}: EventDatesProps) => {
  const isMobile = format === "mobile";
  const { dates } = event;
  const mappedEventDates =
    dates?.eventDates?.map(({ start, end }) => ({
      start,
      end,
    })) ?? [];
  const mappedProdDates =
    dates?.prodDates?.map(({ start, end }) => ({
      start,
      end,
    })) ?? [];

  const eventSliceLimit = limit === 0 ? mappedEventDates?.length : (limit ?? 3);
  const prodSliceLimit = limit === 0 ? mappedProdDates?.length : (limit ?? 3);
  const showProdInstead =
    (preview || isMobile) &&
    type === "event" &&
    dates?.eventFormat === "noEvent";

  const forEvent = type === "event" && !showProdInstead;
  const forProd = type === "production" || showProdInstead;

  const isOngoing = dates?.eventFormat === "ongoing";

  if (forEvent) {
    if (isOngoing) {
      return <span>Ongoing</span>;
    } else if (dates?.eventFormat === "noEvent") {
      if (!preview) {
        return <span>No Event Dates</span>;
      }
    }
  }
  if (forProd && dates?.prodFormat === "sameAsEvent") {
    return <span>Same as Event Dates</span>;
  }

  // if (forProd && !mappedProdDates) {
  //   return;
  // }

  return (
    <>
      {forEvent && (
        <div className={cn("flex flex-col gap-y-1", className)}>
          {mappedEventDates
            ?.slice(0, eventSliceLimit)
            .map(({ start, end }, index) => {
              const isLastVisible =
                index ===
                Math.min(mappedEventDates?.length, eventSliceLimit) - 1;
              const shouldShowPlus =
                isLastVisible && mappedEventDates?.length > eventSliceLimit;

              return (
                <span
                  key={index}
                  className={cn("flex flex-col gap-1", itemClassName)}
                >
                  {formatEventDates(
                    start || "",
                    end || "",
                    dates?.eventFormat ?? null,
                    format,
                    preview,
                  )}

                  {shouldShowPlus && (
                    <p
                      className={cn(
                        "text-sm italic text-foreground",
                        moreCountClassName,
                      )}
                    >
                      {shouldShowPlus &&
                        `+${mappedEventDates?.length - eventSliceLimit} more date${mappedEventDates?.length - eventSliceLimit > 1 ? "s" : ""}`}
                    </p>
                  )}
                </span>
              );
            })}
        </div>
      )}
      {forProd && mappedProdDates && (
        <div className={cn("flex flex-col gap-y-1", className)}>
          {mappedProdDates
            ?.slice(0, prodSliceLimit)
            .map(({ start, end }, index) => {
              return (
                <span key={index} className="flex flex-col gap-1">
                  {formatEventDates(
                    start || "",
                    end || "",
                    dates?.eventFormat ?? null,
                    format,
                    preview,
                  )}
                </span>
              );
            })}
        </div>
      )}
    </>
  );
};

export default EventDates;
