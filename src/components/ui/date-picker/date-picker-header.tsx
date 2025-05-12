"use client";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { format, getMonth, getYear } from "date-fns";
import { ChevronDown } from "lucide-react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";

interface DatePickerHeaderProps {
  date: Date;
  decreaseMonth: () => void;
  increaseMonth: () => void;
  decreaseYear: () => void;
  increaseYear: () => void;
  changeMonth: (value: number) => void;
  changeYear: (value: number) => void;
  prevMonthButtonDisabled: boolean;
  nextMonthButtonDisabled: boolean;
  pickerType: string;
}

export const DatePickerHeader = ({
  date,
  changeYear,
  changeMonth,
  decreaseMonth,
  increaseMonth,
  increaseYear,
  decreaseYear,
  prevMonthButtonDisabled,
  nextMonthButtonDisabled,
  pickerType,
}: DatePickerHeaderProps) => {
  const years = Array.from({ length: 10 }, (_, i) => i + 2020);
  const months = Array.from({ length: 12 }, (_, i) =>
    format(new Date(2000, i), "MMMM"),
  );
  const isMonth = pickerType === "month";
  const isYear = pickerType === "year";
  const isDate = pickerType === "dates";
  const isSeason = pickerType === "season";
  //   const isStartDate = pickerType === "start";
  //   const isEndDate = pickerType === "end";
  const yearActions = isYear || isMonth || isSeason;
  const hasDropDown = isDate || isMonth;

  return (
    <div className="flex items-center justify-between px-4 py-2">
      {!isYear && (
        <Button
          variant="icon"
          type="button"
          onClick={yearActions ? decreaseYear : decreaseMonth}
          disabled={prevMonthButtonDisabled}
          className="hover:text-foreground, text-muted-foreground disabled:invisible"
        >
          <FaChevronLeft className="size-4 hover:scale-110 active:scale-95" />
        </Button>
      )}

      <div className="flex flex-1 flex-col items-center gap-y-2">
        {!isDate && !isMonth && (
          <span className="text-base font-bold">
            {yearActions ? format(date, "yyyy") : format(date, "MMMM yyyy")}
          </span>
        )}

        {hasDropDown && (
          <div className="flex items-center gap-2">
            {isDate && (
              <Listbox
                value={getMonth(date)}
                onChange={(val) => changeMonth(val)}
              >
                <div className="relative w-[120px]">
                  <ListboxButton className="flex w-full cursor-pointer items-center justify-center gap-1 py-1 text-center text-lg font-bold hover:scale-110 active:scale-95">
                    {months[getMonth(date)]} <ChevronDown className="size-4" />
                  </ListboxButton>
                  <ListboxOptions className="scrollable mini darkbar absolute z-10 mt-1 max-h-40 w-full rounded-md border bg-white shadow-lg">
                    {months.map((month, index) => (
                      <ListboxOption
                        key={month}
                        value={index}
                        className={({ focus, selected }) =>
                          `cursor-pointer px-2 py-1 text-foreground ${focus && "bg-salPinkLt/40"} ${selected && "bg-background/50"}`
                        }
                      >
                        {month}
                      </ListboxOption>
                    ))}
                  </ListboxOptions>
                </div>
              </Listbox>
            )}
            {hasDropDown && (
              <Listbox
                value={getYear(date)}
                onChange={(val) => changeYear(val)}
              >
                <div className="relative w-[100px]">
                  <ListboxButton className="flex w-full cursor-pointer items-center justify-center gap-1 py-1 text-center text-lg font-bold hover:scale-110 active:scale-95">
                    {getYear(date)} <ChevronDown className="size-4" />
                  </ListboxButton>
                  <ListboxOptions className="scrollable mini darkbar absolute z-10 mt-1 max-h-40 w-full rounded-md border bg-white shadow-lg">
                    {years.map((year) => (
                      <ListboxOption
                        key={year}
                        value={year}
                        className={({ focus, selected }) =>
                          `cursor-pointer px-2 py-1 text-foreground ${focus && "bg-salPinkLt/40"} ${selected && "bg-background/50"}`
                        }
                      >
                        {year}
                      </ListboxOption>
                    ))}
                  </ListboxOptions>
                </div>
              </Listbox>
            )}
          </div>
        )}
      </div>

      {!isYear && (
        <Button
          variant="icon"
          type="button"
          onClick={yearActions ? increaseYear : increaseMonth}
          disabled={nextMonthButtonDisabled}
          className={cn(
            "text-muted-foreground hover:text-foreground disabled:invisible",
          )}
        >
          <FaChevronRight className="size-4 hover:scale-110 active:scale-95" />
        </Button>
      )}
    </div>
  );
};
