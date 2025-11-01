import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";

import { CustomDropdownNav } from "@/components/ui/date-picker/custom-caption";
import { ScrollableTimeList } from "@/components/ui/date-picker/scrollable-time-list";
import { MobileTimePicker } from "@/components/ui/date-picker/scrollable-time-list-mobile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useDevice } from "@/providers/device-provider";

type DayPickerProps = {
  value?: number;
  onChange: (date: number | undefined) => void;
  label?: string;
  minDate?: number;
};

// --- Helper to generate time list (every 30 min + 11:59 PM) ---
function generateTimeOptions(): string[] {
  const times: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hour12 = ((h + 11) % 12) + 1;
      const suffix = h < 12 ? "AM" : "PM";
      const minuteStr = m.toString().padStart(2, "0");
      times.push(`${hour12}:${minuteStr} ${suffix}`);
    }
  }
  times.push("11:59 PM");
  return times;
}

export function DateTimePickerField({
  value: initialValue,
  onChange,
  label = "Select date and time",
  minDate,
}: DayPickerProps) {
  const { isMobile } = useDevice();
  const [open, setOpen] = useState(false);

  const initialDate = initialValue ? new Date(initialValue) : undefined;
  const [date, setDate] = useState<Date | undefined>(initialDate);
  const [timeStr, setTimeStr] = useState<string>(() => {
    if (!initialDate) return "12:00 AM";
    let h = initialDate.getHours();
    const m = initialDate.getMinutes();
    const suffix = h < 12 ? "AM" : "PM";
    h = ((h + 11) % 12) + 1;
    return `${h}:${m.toString().padStart(2, "0")} ${suffix}`;
  });

  const timeOptions = useMemo(() => generateTimeOptions(), []);
  const startMonth = minDate ? new Date(minDate) : new Date();
  const thisYear = new Date().getFullYear();
  const inFiveYears = thisYear + 5;

  // --- Handle date selection ---
  const handleDateSelect = (d: Date | undefined) => {
    setDate(d);
    if (d) {
      const match = timeStr.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
      if (!match) return;
      const [hourStr, minuteStr, period] = match;
      let h = parseInt(hourStr, 10);
      const m = parseInt(minuteStr, 10);
      if (period.toUpperCase() === "PM" && h < 12) h += 12;
      if (period.toUpperCase() === "AM" && h === 12) h = 0;

      const updated = new Date(d);
      updated.setHours(h);
      updated.setMinutes(m);
      onChange(updated.getTime());
    } else {
      onChange(undefined);
    }
  };

  // --- Handle time selection from list ---
  const handleTimeSelect = (time: string) => {
    if (!date) return;

    const [hourStr, minuteStr, period] = time.split(/[:\s]/);
    let hour = parseInt(hourStr);
    const minute = parseInt(minuteStr);
    if (period === "PM" && hour < 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;

    const updated = new Date(date);
    updated.setHours(hour);
    updated.setMinutes(minute);

    // enforce minDate (same logic you already had)
    if (minDate) {
      const min = new Date(minDate);
      const sameDay =
        updated.getFullYear() === min.getFullYear() &&
        updated.getMonth() === min.getMonth() &&
        updated.getDate() === min.getDate();
      if (sameDay && updated.getTime() < min.getTime()) return;
    }

    setTimeStr(time);
    onChange(updated.getTime());
  };

  // --- Sync external initial value ---
  useEffect(() => {
    if (initialValue) {
      const newDate = new Date(initialValue);
      setDate(newDate);
      let h = newDate.getHours();
      const m = newDate.getMinutes();
      const suffix = h < 12 ? "AM" : "PM";
      h = ((h + 11) % 12) + 1;
      setTimeStr(`${h}:${m.toString().padStart(2, "0")} ${suffix}`);
    }
  }, [initialValue]);

  const formattedDisplay = date ? format(date, "MMM d, yy @ h:mm a") : "";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogHeader className="sr-only">
        <DialogTitle>Select Date and Time</DialogTitle>
      </DialogHeader>

      <DialogTrigger asChild>
        <div className="relative w-full">
          <Input
            readOnly
            value={formattedDisplay}
            placeholder={label}
            className="cursor-pointer"
          />
        </div>
      </DialogTrigger>

      <DialogContent
        zIndex="z-[33]"
        className="flex flex-col items-center justify-center gap-6 bg-card px-4 pt-10 sm:max-w-lg md:flex-row md:items-end md:pt-5"
        onOpenAutoFocus={() => {
          // delay one frame so layout is ready
          requestAnimationFrame(() => {
            const selectedButton = document.querySelector(
              "button.selected-time",
            ) as HTMLElement | null;
            if (selectedButton) {
              selectedButton.scrollIntoView({
                block: "center",
                behavior: "instant",
              });
            }
          });
        }}
      >
        {/* Date Picker */}
        <DayPicker
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          defaultMonth={date ?? new Date()}
          captionLayout="dropdown"
          startMonth={startMonth}
          endMonth={new Date(inFiveYears, 0)}
          disabled={{ before: new Date(minDate ?? 0) }}
          required
          hideNavigation
          components={{
            DropdownNav: CustomDropdownNav,
          }}
        />

        {/* //note-to-self: has a timeZone prop. */}

        {/* Time List */}
        {!isMobile && (
          <ScrollableTimeList
            timeOptions={timeOptions}
            timeStr={timeStr}
            handleTimeSelect={handleTimeSelect}
            date={date}
            minDate={minDate}
          />
        )}

        {isMobile && (
          <MobileTimePicker
            date={date}
            minDate={minDate}
            onChange={(newDate) => {
              if (!newDate) {
                onChange(undefined);
                return;
              }

              // enforce minDate
              if (minDate && newDate.getTime() < minDate) return;

              setDate(newDate);
              onChange(newDate.getTime());
            }}
          />
        )}

        {/* <div className="relative w-full">
          {canScrollUp && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute left-0 right-0 top-0 flex h-6 justify-center bg-gradient-to-b from-background/90 to-transparent"
            >
              <ChevronUp className="h-3 w-3 text-muted-foreground opacity-60" />
            </motion.div>
          )}

          <motion.div
            ref={timeListRef}
            className="scrollable mini invis mt-5 flex max-h-80 w-fit flex-col items-center rounded-xl border-1.5 p-1 px-4 text-sm"
          >
            {timeOptions.map((t) => {
              const isSelected = t === timeStr;
              let isDisabled = false;

              if (minDate && date) {
                const min = new Date(minDate);
                const sameDay =
                  date.getFullYear() === min.getFullYear() &&
                  date.getMonth() === min.getMonth() &&
                  date.getDate() === min.getDate();

                if (sameDay) {
                  // Convert the candidate time string ("4:30 PM") to a comparable Date
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
                <button
                  key={t}
                  onClick={() => !isDisabled && handleTimeSelect(t)}
                  disabled={isDisabled}
                  className={cn(
                    "rounded-lg border-1.5 border-transparent p-1 px-2 text-foreground transition-colors",
                    isSelected
                      ? "selected-time border-1.5 border-foreground bg-salPinkLt font-medium"
                      : "hover:bg-salPinkLtHover",
                    isDisabled && "pointer-events-none opacity-40",
                  )}
                >
                  {t}
                </button>
              );
            })}
          </motion.div>
          {canScrollDown && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute bottom-0 left-0 right-0 flex h-6 justify-center bg-gradient-to-t from-background/90 to-transparent"
            >
              <ChevronDown className="h-3 w-3 text-muted-foreground opacity-60" />
            </motion.div>
          )}
        </div> */}
      </DialogContent>
    </Dialog>
  );
}
