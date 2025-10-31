import { useEffect, useState } from "react";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import "react-day-picker/style.css";

type DayPickerProps = {
  value?: number;
  onChange: (date: number | undefined) => void;
  label?: string;
  minDate?: number;
};

export function DateTimePickerField({
  value: initialValue,
  onChange,
  label = "Select date and time",
  minDate,
}: DayPickerProps) {
  const initialDate = initialValue ? new Date(initialValue) : undefined;
  const [date, setDate] = useState<Date | undefined>(initialDate);
  const [timeStr, setTimeStr] = useState<string>(
    initialDate
      ? `${initialDate.getHours().toString().padStart(2, "0")}:${initialDate
          .getMinutes()
          .toString()
          .padStart(2, "0")}`
      : "00:00",
  );
  const startMonth = minDate ? new Date(minDate) : new Date();
  const minTime = (() => {
    if (!minDate || !date) return undefined;
    const min = startMonth;
    const sameDay =
      date.getFullYear() === min.getFullYear() &&
      date.getMonth() === min.getMonth() &&
      date.getDate() === min.getDate();

    return sameDay
      ? `${min.getHours().toString().padStart(2, "0")}:${min
          .getMinutes()
          .toString()
          .padStart(2, "0")}`
      : undefined;
  })();

  const formattedDisplay = date
    ? format(date, "MMM d, yy @ HH:mm a") // e.g. "Oct 30, 14:45"
    : "";

  const handleDateSelect = (d: Date | undefined) => {
    setDate(d);
    if (d) {
      const [h, m] = timeStr.split(":").map(Number);
      const updated = new Date(d);
      updated.setHours(h);
      updated.setMinutes(m);
      onChange(updated.getTime());
    } else {
      onChange(undefined);
    }
  };

  //   const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //     const newTime = e.target.value;
  //     setTimeStr(newTime);
  //     if (date) {
  //       const [h, m] = newTime.split(":").map(Number);
  //       const updated = new Date(date);
  //       updated.setHours(h);
  //       updated.setMinutes(m);
  //       onChange(updated.getTime());
  //     }
  //   };
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    const [h, m] = newTime.split(":").map(Number);

    if (!date) return;

    const updated = new Date(date);
    updated.setHours(h);
    updated.setMinutes(m);

    // Prevent selecting a time earlier than minDate (same day only)
    if (minDate) {
      const min = startMonth;
      const sameDay =
        updated.getFullYear() === min.getFullYear() &&
        updated.getMonth() === min.getMonth() &&
        updated.getDate() === min.getDate();

      if (sameDay && updated.getTime() < min.getTime()) {
        // Clamp to minimum valid time
        setTimeStr(
          `${min.getHours().toString().padStart(2, "0")}:${min
            .getMinutes()
            .toString()
            .padStart(2, "0")}`,
        );
        onChange(min.getTime());
        return;
      }
    }

    setTimeStr(newTime);
    onChange(updated.getTime());
  };

  useEffect(() => {
    if (initialValue) {
      const newDate = new Date(initialValue);
      setDate(newDate);
      setTimeStr(
        `${newDate.getHours().toString().padStart(2, "0")}:${newDate
          .getMinutes()
          .toString()
          .padStart(2, "0")}`,
      );
    }
  }, [initialValue]);

  // <>
  //   <DayPicker mode="single" selected={date} onSelect={handleDateSelect} />
  //   <input type="time" value={timeStr} onChange={handleTimeChange} />
  // </>
  const thisYear = new Date().getFullYear();
  const inFiveYears = thisYear + 5;

  return (
    <Dialog>
      <DialogTitle className="sr-only">Select Date and Time</DialogTitle>
      <DialogTrigger asChild>
        <div className="relative w-full">
          <Input
            readOnly
            value={formattedDisplay}
            placeholder={label || "Select date and time"}
            className="cursor-pointer"
          />
        </div>
      </DialogTrigger>

      <DialogContent className="space-y-4 sm:max-w-[400px]">
        <DayPicker
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          defaultMonth={date ?? new Date()}
          captionLayout="dropdown"
          startMonth={startMonth}
          endMonth={new Date(inFiveYears, 0)}
          disabled={{ before: new Date(minDate ?? 0) }}
        />
        <div className="flex items-center gap-2">
          <label htmlFor="time" className="text-sm font-medium">
            Time:
          </label>
          <input
            id="time"
            type="time"
            min={minTime}
            value={timeStr}
            onChange={handleTimeChange}
            className="rounded-md border border-input bg-background p-2 text-sm"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
