import { useEffect, useMemo, useState } from "react";
import { useIsMobile } from "@/hooks/use-media-query";
import {
  addYears,
  endOfYear,
  format,
  isBefore,
  isSameDay,
  startOfDay,
  subHours,
} from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
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
import { sameDate } from "@/helpers/dateFns";
import { cn } from "@/helpers/utilsFns";

type DayPickerProps = {
  value?: number;
  onChange: (date: number | undefined) => void;
  label?: string;
  minDate?: number;
  maxDate?: number;
  withTime?: boolean;
  inputClassName?: string;
  triggerClassName?: string;
  disabled?: boolean;
  timeZone?: string;
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
  label,
  minDate,
  maxDate,
  withTime = true,
  inputClassName,
  triggerClassName,
  disabled,
  timeZone,
}: DayPickerProps) {
  const isMobile = useIsMobile();
  const isTablet = useIsMobile(1080);
  const [open, setOpen] = useState(false);

  const [hasChanges, setHasChanges] = useState(false);
  const [pending, setPending] = useState(false);

  const initialDate = initialValue ? new Date(initialValue) : undefined;
  const initialTime = getInitialTime(initialDate);
  const [date, setDate] = useState<Date | undefined>(initialDate);
  const [timeStr, setTimeStr] = useState<string>(initialTime);

  const timeOptions = useMemo(() => generateTimeOptions(), []);
  const startMonth = minDate ? new Date(minDate) : subHours(new Date(), 1);

  const endMonth = maxDate
    ? new Date(maxDate)
    : addYears(endOfYear(new Date()), 5);

  //
  //
  //
  //
  // #region ------------- Handlers --------------

  const handleDateSelect = (d: Date | undefined) => {
    if (!d) {
      setDate(undefined);
      return;
    }

    setDate(startOfDay(d));
    setHasChanges(true);
  };

  const handleTimeSelect = (time: string) => {
    if (!date) return;
    setTimeStr(time);
    setHasChanges(true);
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
    const timeString = getInitialTime(initialDate);
    setTimeStr(timeString);
    handleClose();
  };

  const handleConfirm = () => {
    setPending(true);
    try {
      if (!date) throw new Error("Date is required");
      const [hourStr, minuteStr, period] = timeStr.split(/[:\s]/);
      let h = parseInt(hourStr);
      const m = parseInt(minuteStr);
      if (period === "PM" && h < 12) h += 12;
      if (period === "AM" && h === 12) h = 0;

      const updated = new Date(date);
      if (withTime) {
        updated.setHours(h, m, 0, 0);
      } else {
        updated.setHours(0, 0, 0, 0);
      }

      if (minDate) {
        const min = new Date(minDate);

        const selected = startOfDay(updated);
        const minDay = startOfDay(min);
        if (isBefore(selected, minDay))
          throw new Error("Choose a later date (cannot be in the past)");
        if (isSameDay(updated, min) && updated < min) {
          throw new Error("Choose a later time");
        }
      } else if (maxDate) {
        const max = new Date(maxDate);
        const sameDay = sameDate(updated, max);
        if (sameDay && updated.getTime() > max.getTime())
          throw new Error("Choose a date before the max date");
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

  // #endregion

  useEffect(() => {
    if (!open) return;

    if (initialTime) {
      setTimeStr(initialTime);
    }
  }, [initialTime, open]);

  const formattedDisplay = initialDate
    ? withTime
      ? timeZone
        ? isTablet
          ? formatInTimeZone(initialDate, timeZone, "MMM d, yy @ h:mm a")
          : formatInTimeZone(initialDate, timeZone, "MMM d, yy @ h:mm a (zzz)")
        : format(initialDate, "MMM d, yy @ h:mm a ")
      : timeZone
        ? formatInTimeZone(initialDate, timeZone, "MMM d, yyyy")
        : format(initialDate, "MMM d, yyyy")
    : "";

  function getInitialTime(initialDate: Date | undefined): string {
    if (!initialDate) return "12:00 AM";
    if (!timeZone) {
      let h = initialDate.getHours();
      const m = initialDate.getMinutes();
      const suffix = h < 12 ? "AM" : "PM";
      h = ((h + 11) % 12) + 1;

      return `${h}:${m.toString().padStart(2, "0")} ${suffix}`;
    } else {
      return formatInTimeZone(initialDate, timeZone, "h:mm a");
    }
  }

  const outputLabel =
    (label ?? withTime) ? "Select date and time" : "Select date";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogHeader className="sr-only">
        <DialogTitle>Select Date and Time</DialogTitle>
      </DialogHeader>

      <DialogTrigger asChild role="button">
        <div className={cn("relative w-full", triggerClassName)}>
          <Input
            disabled={disabled}
            readOnly
            value={open ? "Selecting..." : formattedDisplay}
            placeholder={outputLabel}
            className={cn(
              "cursor-pointer border-gray-300 bg-card text-center",
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
          withTime && "lg:max-w-lg",
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
        <div className="flex flex-col items-center justify-center gap-6 pt-5 sm:max-w-sm lg:max-w-lg lg:flex-row lg:items-end">
          <DayPicker
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            defaultMonth={date ?? new Date()}
            captionLayout="dropdown"
            startMonth={startMonth}
            endMonth={endMonth}
            disabled={{
              before: startMonth,
              after: endMonth,
            }}
            timeZone={timeZone}
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
                  maxDate={maxDate}
                  disabled={
                    Boolean(minDate && date && date < new Date(minDate)) ||
                    Boolean(maxDate && date && date > new Date(maxDate))
                  }
                />
              )}

              {isMobile && (
                <MobileTimePicker
                  date={date}
                  timeStr={timeStr}
                  minDate={minDate}
                  maxDate={maxDate}
                  onChange={handleTimeSelect}
                />
              )}
            </>
          )}
        </div>
        <DialogFooter className="flex w-full flex-row gap-3 px-4 pt-3 sm:max-w-sm sm:justify-center lg:max-w-lg lg:items-end">
          <Button
            disabled={pending}
            variant="salWithShadowHidden"
            type="button"
            onClick={handleCancel}
            className="w-40 lg:w-40"
          >
            Cancel
          </Button>
          <Button
            disabled={!hasChanges || pending}
            variant={hasChanges ? "salWithShadowYlw" : "salWithShadowHiddenYlw"}
            type="button"
            onClick={handleConfirm}
            className="w-full"
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
