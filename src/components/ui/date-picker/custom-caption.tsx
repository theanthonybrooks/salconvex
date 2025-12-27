import { addYears } from "date-fns";
import { useDayPicker } from "react-day-picker";

import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { CalendarClock } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TooltipSimple } from "@/components/ui/tooltip";
import { cn } from "@/helpers/utilsFns";

export function CustomDropdownNav({ minDate }: { minDate?: number }) {
  const { goToMonth, months, nextMonth, previousMonth, dayPickerProps } =
    useDayPicker();
  const min = minDate ? new Date(minDate) : null;

  const today = new Date();

  const thisYear = today.getFullYear();
  const thisMonth = today.getMonth();
  const minYear = min?.getFullYear() ?? new Date().getFullYear();
  const { startMonth, endMonth } = dayPickerProps;
  const displayMonth = months[0]?.date ?? new Date();
  const year = displayMonth.getFullYear();
  const endYear =
    endMonth?.getFullYear() ?? addYears(new Date(), 5).getFullYear();
  const month = displayMonth.getMonth();
  const todayDisabled =
    (startMonth && today < startMonth) || (endMonth && today > endMonth);
  const isToday = year === thisYear && month === thisMonth;

  const monthNames = Array.from({ length: 12 }, (_, i) =>
    new Date(0, i).toLocaleString("default", { month: "long" }),
  );
  const yearRange = Array.from(
    { length: endYear - minYear + 1 },
    (_, i) => minYear + i,
  );

  const isMonthDisabled = (y: number, m: number) => {
    const testDate = new Date(y, m);
    if (
      startMonth &&
      testDate < new Date(startMonth.getFullYear(), startMonth.getMonth())
    ) {
      return true;
    }
    if (
      endMonth &&
      testDate > new Date(endMonth.getFullYear(), endMonth.getMonth())
    ) {
      return true;
    }
    return false;
  };

  const availableMonths = monthNames
    .map((m, i) => ({ name: m, index: i }))
    .filter(({ index }) => !isMonthDisabled(year, index));

  return (
    <div className="richard my-5 flex w-full items-center justify-between gap-2 py-2">
      <Button
        variant="ghost"
        type="button"
        disabled={!previousMonth}
        onClick={() => goToMonth(new Date(year, month - 1))}
        className={cn("p-1 hover:text-foreground/80 disabled:opacity-20")}
      >
        <FaArrowLeft className="size-5" />
      </Button>

      <div className="flex items-center gap-2">
        <Select
          value={month.toString()}
          onValueChange={(val) => {
            const m = parseInt(val, 10);
            if (!isMonthDisabled(year, m)) goToMonth(new Date(year, m));
          }}
          disabled={availableMonths.length === 1}
        >
          <SelectTrigger className="w-[110px] text-base sm:text-sm">
            <SelectValue>{monthNames[month]}</SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {availableMonths.map(({ name, index }) => (
              <SelectItem key={index} value={index.toString()}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={year.toString()}
          onValueChange={(val) => goToMonth(new Date(parseInt(val, 10), month))}
          disabled={yearRange.length === 1}
        >
          <SelectTrigger className="w-[90px] text-base sm:text-sm">
            <SelectValue>{year}</SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {yearRange.map((y) => (
              <SelectItem key={y} value={y.toString()}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <TooltipSimple content="Go to today" side="top" disabled={isToday}>
        <Button
          variant="ghost"
          disabled={isToday || todayDisabled}
          type="button"
          onClick={() => goToMonth(today)}
          className={cn(
            "h-auto p-1 hover:text-foreground/80 disabled:opacity-20 sm:h-auto",
          )}
        >
          <CalendarClock className="size-5" />
        </Button>
      </TooltipSimple>
      <Button
        variant="ghost"
        disabled={!nextMonth}
        type="button"
        onClick={() => goToMonth(new Date(year, month + 1))}
        className={cn("p-1 hover:text-foreground/80 disabled:opacity-20")}
      >
        <FaArrowRight className="size-5" />
      </Button>
    </div>
  );
}
