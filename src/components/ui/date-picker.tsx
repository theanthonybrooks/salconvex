import { fromSeason, toDate } from "@/lib/dateFns";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import DatePicker from "react-datepicker";
import { Button } from "./button";

type PickerType = "month" | "year" | "season" | "dates";

export interface CustomDatePickerProps {
  value?: string;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  minDate?: Date | string;
  maxDate?: Date | string;
  tabIndex?: number;
  pickerType: PickerType;
  isAdmin?: boolean;
}

const getSeasonLabel = (val: string): string => {
  const match = val.match(/^Q([1-4])\s(\d{4})$/);
  if (!match) return val;

  const [, quarterStr, year] = match;
  const quarter = parseInt(quarterStr, 10);

  const seasonMap: Record<number, string> = {
    1: "Spring",
    2: "Summer",
    3: "Fall",
    4: "Winter",
  };

  return `${seasonMap[quarter]} ${year}`;
};

interface DateInputProps extends React.ComponentPropsWithoutRef<"button"> {
  value?: string;
  onClick?: () => void;
  pickerType?: PickerType;
}

const DateInput = forwardRef<HTMLButtonElement, DateInputProps>(
  ({ value, onClick, className, pickerType, ...rest }, ref) => {
    const seasonLabel = getSeasonLabel(value ?? "");
    const display =
      pickerType === "month"
        ? "Select month"
        : pickerType === "year"
          ? "Select year"
          : pickerType === "season"
            ? "Select season"
            : "Select date";

    return (
      <Button
        ref={ref}
        onClick={onClick}
        type="button"
        className={cn(
          "w-full cursor-pointer rounded-lg border text-base font-normal",
          className,
        )}
        {...rest}
      >
        {seasonLabel || value || display}
      </Button>
    );
  },
);

DateInput.displayName = "DateInput";

export const CustomDatePicker = ({
  value,
  onChange,
  placeholder,
  className,
  inputClassName,
  minDate,
  maxDate,
  tabIndex,
  pickerType,
  isAdmin,
}: CustomDatePickerProps) => {
  const parsedDate =
    pickerType === "season" ? fromSeason(value ?? "") : toDate(value);

  const minToDate = minDate ? toDate(minDate) : null;
  const maxToDate = maxDate ? toDate(maxDate) : null;

  const today = new Date();

  const isValidSelected =
    parsedDate &&
    (!minToDate || parsedDate >= minToDate) &&
    (!maxToDate || parsedDate <= maxToDate);

  const openToDate =
    isValidSelected && parsedDate ? parsedDate : (minToDate ?? today);

  //   console.log(minToDate, maxToDate);
  //   console.log(parsedDate);

  const dateFormat =
    pickerType === "year"
      ? "yyyy"
      : pickerType === "season"
        ? "QQQ yyyy"
        : pickerType === "dates"
          ? "MMMM d, yyyy"
          : "MMMM yyyy";

  //   console.log(parsedDate, value);

  return (
    <DatePicker
      selected={parsedDate}
      onChange={onChange}
      dateFormat={dateFormat}
      openToDate={openToDate}
      showYearDropdown={pickerType === "dates"}
      showMonthDropdown={pickerType === "dates"}
      showYearPicker={pickerType === "year"}
      showMonthYearPicker={pickerType === "month"}
      showQuarterYearPicker={pickerType === "season"}
      withPortal={true}
      // popperContainer={CalendarPortal}
      //   popperPlacement="bottom"
      //   portalId="react-datepicker-portal"
      minDate={
        isAdmin
          ? new Date(2010, 0, 1)
          : pickerType === "season"
            ? new Date(new Date().getFullYear(), 0, 1)
            : (minToDate ?? new Date())
      }
      maxDate={maxToDate ?? new Date(2099, 11, 31)}
      placeholderText={
        placeholder ??
        (pickerType === "year"
          ? "Select year"
          : pickerType === "month"
            ? "Select month"
            : pickerType === "season"
              ? "Select season"
              : "Select date")
      }
      customInput={
        <DateInput className={inputClassName} pickerType={pickerType} />
      }
      className={className}
      tabIndex={tabIndex}
    />
  );
};
