import { DatePickerHeader } from "@/components/ui/date-picker/date-picker-header";
import { getTimezoneFormat, toDate } from "@/lib/dateFns";
import { cn } from "@/lib/utils";
import { format, setHours, setMinutes, setSeconds } from "date-fns";
import { forwardRef } from "react";
import DatePicker from "react-datepicker";
import { Button } from "../button";

type OcPickerType = "start" | "end";

export interface OcCustomDatePickerProps {
  value?: string | null;
  onChange: (date: string | null) => void; // Now ISO string output
  pickerType: OcPickerType;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  minDate?: Date | string;
  maxDate?: Date | string;
  tabIndex?: number;
  isAdmin?: boolean;
  ocEnd?: string | null;
  orgTimezone?: string;
}

interface DateInputProps extends React.ComponentPropsWithoutRef<"button"> {
  value?: string;
  onClick?: () => void;
  pickerType?: OcPickerType;
  ocEnd?: string | null;
  orgTimezone?: string;
}

const DateInput = forwardRef<HTMLButtonElement, DateInputProps>(
  (
    { value, onClick, className, pickerType, ocEnd, orgTimezone, ...rest },
    ref,
  ) => {
    const endDate = ocEnd ?? new Date().toISOString();
    const timeZone = orgTimezone ?? "Europe/Berlin";
    const display =
      pickerType === "start" ? "Select start date" : "Select deadline";
    let formattedValue = "";
    if (value) {
      try {
        const date = new Date(value);
        formattedValue =
          pickerType === "start"
            ? format(date, "MMM d, yyyy")
            : format(date, "MMM d, yyyy @ h:mm a");
      } catch {
        formattedValue = value; // fallback
      }
    }
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
        <span className="flex items-center gap-2">
          {formattedValue || display}
          {orgTimezone && (
            <p className="text-sm xl:hidden">
              ({getTimezoneFormat(endDate, timeZone)})
            </p>
          )}
        </span>
      </Button>
    );
  },
);

DateInput.displayName = "DateInput";

export const OcCustomDatePicker = ({
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
  ocEnd,
  orgTimezone,
}: OcCustomDatePickerProps) => {
  const parsedDate = value ? toDate(value) : null;
  const minToDate = minDate ? toDate(minDate) : null;
  const maxToDate = maxDate ? toDate(maxDate) : null;
  const today = new Date();

  const isValidSelected =
    parsedDate &&
    (!minToDate || parsedDate >= minToDate) &&
    (!maxToDate || parsedDate <= maxToDate);

  const openToDate =
    isValidSelected && parsedDate ? parsedDate : (minToDate ?? today);

  const dateFormat =
    pickerType === "start" ? "MMM d, yyyy" : "MMM d, yyyy @ h:mm a";

  //   console.log(parsedDate, value);

  return (
    <DatePicker
      selected={parsedDate}
      onChange={(date) => {
        onChange(date ? date.toISOString() : null);
      }}
      dateFormat={dateFormat}
      openToDate={openToDate}
      withPortal={true}
      showTimeSelect={pickerType === "end"}
      injectTimes={[setHours(setMinutes(setSeconds(new Date(), 59), 59), 23)]}
      minDate={
        isAdmin
          ? new Date(2010, 0, 1)
          : pickerType === "start"
            ? new Date(new Date().getFullYear(), 0, 1)
            : (minToDate ?? new Date())
      }
      maxDate={maxToDate ?? new Date(2099, 11, 31)}
      placeholderText={
        placeholder ??
        (pickerType === "start" ? "Select start date" : "Select deadline")
      }
      customInput={
        <DateInput
          className={inputClassName}
          pickerType={pickerType}
          ocEnd={ocEnd}
          orgTimezone={orgTimezone}
        />
      }
      className={cn(className, "rounded")}
      tabIndex={tabIndex}
      renderCustomHeader={(props) => (
        <DatePickerHeader {...props} pickerType={pickerType} />
      )}
    />
  );
};
