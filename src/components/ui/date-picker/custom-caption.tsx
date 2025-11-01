import { useDayPicker } from "react-day-picker";

import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/helpers/utilsFns";

export function CustomDropdownNav() {
  const { goToMonth, months, nextMonth, previousMonth, dayPickerProps } =
    useDayPicker();

  const { startMonth, endMonth } = dayPickerProps;
  // Get the first displayed month
  const displayMonth = months[0]?.date ?? new Date();
  const year = displayMonth.getFullYear();
  const month = displayMonth.getMonth();

  const monthNames = Array.from({ length: 12 }, (_, i) =>
    new Date(0, i).toLocaleString("default", { month: "long" }),
  );
  const yearRange = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - 1 + i,
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

  return (
    <div className="richard my-5 flex w-full items-center justify-between gap-2 px-3 py-2">
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
        >
          <SelectTrigger className="w-[110px] text-base sm:text-sm">
            <SelectValue>{monthNames[month]}</SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {monthNames
              .map((m, i) => ({ name: m, index: i }))
              .filter(({ index }) => !isMonthDisabled(year, index))
              .map(({ name, index }) => (
                <SelectItem key={index} value={index.toString()}>
                  {name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        <Select
          value={year.toString()}
          onValueChange={(val) => goToMonth(new Date(parseInt(val, 10), month))}
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
