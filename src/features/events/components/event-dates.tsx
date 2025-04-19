import { formatEventDates } from "@/lib/dateFns";
import { cn } from "@/lib/utils";
import { EventData } from "@/types/event";

interface EventDatesProps {
  event: EventData;
  limit?: number;
  format: "desktop" | "mobile";
  preview?: boolean;
  className?: string;
}

const EventDates = ({
  event,
  limit,
  format,
  preview = false,
  className,
}: EventDatesProps) => {
  const { dates } = event;
  const mappedDates = dates.eventDates.map(({ start, end }) => ({
    start,
    end,
  }));
  const sliceLimit = limit === 0 ? mappedDates.length : (limit ?? 3);

  return (
    <div className={cn("flex flex-col gap-y-1", className)}>
      {mappedDates.slice(0, sliceLimit).map(({ start, end }, index) => {
        const isLastVisible =
          index === Math.min(mappedDates.length, sliceLimit) - 1;
        const shouldShowPlus = isLastVisible && mappedDates.length > sliceLimit;

        return (
          <span key={index} className="flex flex-col gap-1">
            {dates?.eventFormat !== "noEvent"
              ? formatEventDates(
                  start || "",
                  end || "",
                  dates.ongoing,
                  format,
                  preview,
                )
              : "No Event"}
            {shouldShowPlus && (
              <p className="text-sm italic text-foreground">
                {shouldShowPlus &&
                  `+${mappedDates.length - sliceLimit} more date${mappedDates.length - sliceLimit > 1 ? "s" : ""}`}
              </p>
            )}
          </span>
        );
      })}
    </div>
  );
};

export default EventDates;
