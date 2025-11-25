import { Fragment, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";

import { ChevronDown, ChevronUp } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { cn } from "@/helpers/utilsFns";

interface ScrollableTimeListProps {
  timeOptions: string[];
  timeStr: string;
  handleTimeSelect: (time: string) => void;
  date?: Date;
  minDate?: number;
}

export function ScrollableTimeList({
  timeOptions,
  timeStr,
  handleTimeSelect,
  date,
  minDate,
}: ScrollableTimeListProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const { scrollYProgress } = useScroll({ container: ref });
  const isScrollable =
    ref.current && ref.current.scrollHeight > ref.current.clientHeight;

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setCanScrollUp(latest > 0.02);
    setCanScrollDown(latest < 0.98);
  });

  return (
    <div className="relative h-80 w-fit overflow-hidden rounded-xl border-1.5">
      {canScrollUp && isScrollable && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none absolute left-0 right-0 top-0 flex h-6 items-center justify-center bg-card"
        >
          <ChevronUp className="size-4" />
        </motion.div>
      )}
      <motion.div
        ref={ref}
        className="scrollable mini invis flex h-full max-h-[inherit] w-fit flex-col items-center p-3 text-sm"
      >
        {timeOptions.map((t, i) => {
          const isFirst = i === 0;
          const isSelected = t === timeStr;
          let isDisabled = false;

          if (minDate && date) {
            const min = new Date(minDate);
            const sameDay =
              date.getFullYear() === min.getFullYear() &&
              date.getMonth() === min.getMonth() &&
              date.getDate() === min.getDate();

            if (sameDay) {
              const [hourStr, minuteStr, period] = t.split(/[:\s]/);
              let hour = parseInt(hourStr);
              const minute = parseInt(minuteStr);
              if (period === "PM" && hour < 12) hour += 12;
              if (period === "AM" && hour === 12) hour = 0;

              const candidate = new Date(date);
              candidate.setHours(hour);
              candidate.setMinutes(minute);
              if (candidate.getTime() < min.getTime()) {
                isDisabled = true;
              }
            }
          }

          return (
            <Fragment key={t}>
              <button
                key={t}
                onClick={() => !isDisabled && handleTimeSelect(t)}
                disabled={isDisabled}
                className={cn(
                  "rounded-lg border-1.5 border-transparent p-1 px-2 text-foreground transition-colors",
                  isSelected
                    ? "selected-time border-1.5 border-foreground bg-salPinkLt font-medium"
                    : "hover:bg-salPinkLtHover",
                  isDisabled && "pointer-events-none hidden opacity-20",
                )}
              >
                {t}
              </button>
              {isFirst && <Separator thickness={1} className={cn("my-1")} />}
            </Fragment>
          );
        })}
      </motion.div>
      {canScrollDown && isScrollable && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none absolute bottom-0 left-0 right-0 flex h-6 items-center justify-center bg-card"
        >
          <ChevronDown className="size-4" />
        </motion.div>
      )}
    </div>
  );
}
