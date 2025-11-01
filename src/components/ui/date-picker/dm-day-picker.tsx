import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

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

  const formattedDisplay = date ? format(date, "MMM d, yyyy @ h:mm a") : "";

  return (
    <Dialog>
      <DialogHeader>
        <DialogTitle className="sr-only">Select Date and Time</DialogTitle>
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
        className="bg-card sm:max-w-[420px]"
        showCloseButton={false}
      >
        <DialogDescription className="sr-only">
          Date and time selection dialog
        </DialogDescription>

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
        />

        {/* Time List */}
    <div className="flex flex-col gap-1 mt-2">
  <label className="text-sm font-medium">Time:</label>
  <div className="max-h-56 overflow-y-auto rounded-md border border-input bg-background p-1 text-sm">
    {timeOptions.map((t) => {
      const isSelected = t === timeStr;
      return (
        <button
          key={t}
          onClick={() => handleTimeSelect(t)}
          className={`w-full rounded-md p-1 transition-colors
            ${isSelected ? "bg-primary text-primary-foreground font-medium" : "hover:bg-accent"}
          `}
        >
          {t}
        </button>
      );
    })}
  </div>
</div>

      </DialogContent>
    </Dialog>
  );
}
