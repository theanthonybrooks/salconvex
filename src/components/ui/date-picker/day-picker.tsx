import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import { toast } from "react-toastify";

import { LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CustomDropdownNav } from "@/components/ui/date-picker/custom-caption";
import { ScrollableTimeList } from "@/components/ui/date-picker/scrollable-time-list";
import { MobileTimePicker } from "@/components/ui/date-picker/scrollable-time-list-mobile";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/helpers/utilsFns";
import { useDevice } from "@/providers/device-provider";

type DayPickerProps = {
  value?: number;
  onChange: (date: number | undefined) => void;
  label?: string;
  minDate?: number;
  withTime?: boolean;
  inputClassName?: string;
};

function generateTimeOptions(): string[] {
  const times: string[] = [];
  times.push("11:59 PM");
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hour12 = ((h + 11) % 12) + 1;
      const suffix = h < 12 ? "AM" : "PM";
      const minuteStr = m.toString().padStart(2, "0");
      times.push(`${hour12}:${minuteStr} ${suffix}`);
    }
  }

  return times;
}

export function DateTimePickerField({
  value: initialValue,
  onChange,
  label = "Select date and time",
  minDate,
  withTime = true,
  inputClassName,
}: DayPickerProps) {
  const { isMobile } = useDevice();
  const [open, setOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [pending, setPending] = useState(false);

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
  const handleDateSelect = (d: Date | undefined) => {
    if (!d) {
      setDate(undefined);
      // onChange(undefined);
      return;
    }

    const match = timeStr.split(/[:\s]/);
    if (!match) return;
    const [hourStr, minuteStr, period] = match;
    let h = parseInt(hourStr, 10);
    const m = parseInt(minuteStr, 10);
    if (period.toUpperCase() === "PM" && h < 12) h += 12;
    if (period.toUpperCase() === "AM" && h === 12) h = 0;

    const updated = new Date(date ?? d);
    updated.setFullYear(d.getFullYear(), d.getMonth(), d.getDate());
    updated.setHours(h);
    updated.setMinutes(m);

    setDate(updated);
    // onChange(updated.getTime());
    setHasChanges(true);
  };

  const handleTimeSelect = (time: string) => {
    if (!date) return;
    setTimeStr(time);
    setHasChanges(true);
    // onChange(updated.getTime());
  };

  const handleClose = () => {
    setTimeout(() => {
      setPending(false);
      setOpen(false);
      setHasChanges(false);
    }, 200);
  };

  const handleCancel = () => {
    setDate(initialDate);
    let timeString = timeStr;
    if (initialDate) {
      let h = initialDate.getHours();
      const m = initialDate.getMinutes();
      const suffix = h < 12 ? "AM" : "PM";
      h = ((h + 11) % 12) + 1;
      timeString = `${h}:${m.toString().padStart(2, "0")} ${suffix}`;
    } else {
      timeString = "12:00 AM";
    }
    setTimeStr(timeString);
    handleClose();
  };

  const handleConfirm = () => {
    setPending(true);
    try {
      if (!date) throw new Error("Date is required");
      const [hourStr, minuteStr, period] = timeStr.split(/[:\s]/);
      let hour = parseInt(hourStr);
      const minute = parseInt(minuteStr);
      if (period === "PM" && hour < 12) hour += 12;
      if (period === "AM" && hour === 12) hour = 0;

      const updated = new Date(date);
      if (withTime) {
        updated.setHours(hour);
        updated.setMinutes(minute);
      } else {
        updated.setHours(0, 0, 0, 0);
      }

      if (minDate) {
        const min = new Date(minDate);
        const sameDay =
          updated.getFullYear() === min.getFullYear() &&
          updated.getMonth() === min.getMonth() &&
          updated.getDate() === min.getDate();
        if (sameDay && updated.getTime() < min.getTime())
          throw new Error("Choose a later date (cannot be in the past)");
      }
      onChange(updated.getTime());
      handleClose();
    } catch (err) {
      console.error(err);
      if (err instanceof Error) toast.error(err.message);
    } finally {
      setPending(false);
    }
  };

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

  const formattedDisplay = date
    ? withTime
      ? format(date, "MMM d, yy @ h:mm a")
      : format(date, "MMM d, yyyy")
    : "";

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
            className={cn(
              "cursor-pointer bg-transparent text-center",
              inputClassName,
            )}
          />
        </div>
      </DialogTrigger>

      <DialogContent
        showCloseButton={false}
        zIndex="z-[33]"
        className={cn(
          "flex flex-col items-center justify-center gap-6 bg-card px-4 pt-5 sm:max-w-sm",
          withTime && "sm:max-w-lg",
        )}
        onOpenAutoFocus={() => {
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
        <DialogDescription className="sr-only">
          Select date and time
        </DialogDescription>
        <div className="flex flex-col items-center justify-center gap-6 pt-5 sm:max-w-lg md:flex-row md:items-end">
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
              DropdownNav: () => <CustomDropdownNav minDate={minDate} />,
            }}
          />

          {/* //note-to-self: has a timeZone prop. */}

          {withTime && (
            <>
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
                  timeStr={timeStr}
                  minDate={minDate}
                  onChange={handleTimeSelect}
                />
              )}
            </>
          )}
        </div>
        <DialogFooter className="flex w-full flex-row gap-3 px-4 pt-3 sm:max-w-lg md:items-end">
          <Button
            disabled={pending}
            variant="salWithShadowHidden"
            type="button"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            disabled={!hasChanges || pending}
            variant={hasChanges ? "salWithShadowYlw" : "salWithShadowHiddenYlw"}
            type="button"
            onClick={handleConfirm}
            className="w-full md:max-w-40"
          >
            {pending ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              "Confirm"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
