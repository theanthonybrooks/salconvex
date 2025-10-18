//TODO: Replace with react-day-picker. Link: https://daypicker.dev/guides/timepicker
import { DatePickerHeader } from "@/components/ui/date-picker/date-picker-header";
import { getTimezoneFormat, toDate } from "@/helpers/dateFns";
import { cn } from "@/helpers/utilsFns";
import { isValid, parseISO } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { DateTime } from "luxon";
import { forwardRef, useRef } from "react";
import DatePicker from "react-datepicker";

type OcPickerType = "start" | "end";

export interface OcCustomDatePickerProps {
  value?: string | null;
  onChange: (date: string | null) => void; // Now ISO string output
  pickerType: OcPickerType;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  minDate?: string | null;
  maxDate?: Date | string;
  tabIndex?: number;
  isAdmin: boolean;
  ocEnd?: string | null;
  orgTimezone: string;
  disabled?: boolean;
  showTimeZone?: boolean;
}

interface DateInputProps extends React.ComponentPropsWithoutRef<"input"> {
  rawValue?: string;
  onClick?: () => void;
  pickerType?: OcPickerType;
  ocEnd?: string | null;
  timeZone: string;
  showTimeZone?: boolean;
}

const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  (
    {
      rawValue,

      onClick,
      className,
      pickerType,
      ocEnd,
      timeZone,
      showTimeZone,
      ...rest
    },
    ref,
  ) => {
    const endDate = ocEnd ?? new Date().toISOString();

    // const display =
    //   pickerType === "start" ? "Select start date" : "Select deadline";
    let formattedValue = "";
    if (rawValue) {
      const date = parseISO(rawValue);
      if (isValid(date)) {
        // console.log(date, "valid");
        formattedValue =
          pickerType === "start"
            ? formatInTimeZone(date, timeZone, "MMM d, yyyy")
            : formatInTimeZone(date, timeZone, "MMM d, yyyy @ h:mm a");
      } else {
        formattedValue = rawValue; // fallback
        // console.log(formattedValue, "invalid");
      }
    }
    // console.log("endDate", endDate, ocEnd);
    // console.log("timeZone", timeZone);
    // console.log("formattedValue", formattedValue);
    const displayValue =
      formattedValue +
      (showTimeZone ? ` (${getTimezoneFormat(endDate, timeZone)})` : "");
    const hasValue = !!formattedValue;

    return (
      <input
        ref={ref}
        onClick={onClick}
        className={cn(
          "w-full cursor-pointer rounded-lg border bg-card text-center text-base font-normal sm:text-sm",
          className,
        )}
        readOnly
        {...rest}
        value={hasValue ? displayValue : ""}
        type="text"
        // {formattedValue || display}
        // {timeZone && showTimeZone && (
        //   // <p className="text-sm xl:hidden">
        //   <p className="text-sm">({getTimezoneFormat(endDate, timeZone)})</p>
        // )}
      />
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
  showTimeZone = true,
  orgTimezone,
  disabled,
}: OcCustomDatePickerProps) => {
  const dateFormat = "MMM d, yyyy @ h:mm a";
  const tz = orgTimezone;
  const minToDate = minDate ? toDate(minDate) : null;
  const maxToDate = maxDate ? toDate(maxDate) : null;

  const selected = value ? toDate(value) : null;
  const orgSelected = value
    ? DateTime.fromISO(value, { zone: "utc" }).setZone(tz)
    : null;
  const selectedForPicker = orgSelected
    ? orgSelected.setZone("local", { keepLocalTime: true }).toJSDate()
    : null;
  const timeNow = DateTime.now();
  const nowOrg = timeNow.setZone(tz);
  const orgTodayStart = nowOrg.startOf("day");
  const UTCTodayStart = orgTodayStart.toUTC().startOf("day");
  const openToDate = selected ? selected : (minToDate ?? nowOrg.toJSDate());

  const baseLocal = DateTime.fromJSDate(selected ?? new Date());
  const baseOrg = baseLocal.setZone(tz);
  const isBaseOrgToday = baseOrg.hasSame(nowOrg, "day");

  const computedMinDate = isAdmin
    ? DateTime.fromISO("2010-01-01", { zone: tz }).toJSDate()
    : pickerType === "start"
      ? DateTime.local().startOf("year").toJSDate()
      : (minToDate ?? UTCTodayStart.toJSDate());

  let minTimeForEnd: Date | undefined;
  let maxTimeForEnd: Date | undefined;

  if (pickerType === "end") {
    const dayStartLocal = baseLocal.startOf("day");
    const dayEndLocal = baseLocal.endOf("day");

    const minLocal = isBaseOrgToday
      ? dayStartLocal.set({
          hour: nowOrg.hour + 1,
          minute: nowOrg.minute,
          second: 0,
          millisecond: 0,
        })
      : dayStartLocal;

    minTimeForEnd = minLocal.toJSDate();
    maxTimeForEnd = dayEndLocal.toJSDate();
  }

  const lastSelectedRef = useRef<Date | null>(selected);

  const onPickerChange = (date: Date | null) => {
    if (!date) return onChange(null);

    const pickedLocal = DateTime.fromJSDate(date);
    // const pickedUTC = pickedLocal.toUTC();
    // const prevLocal = lastSelectedRef.current
    //   ? DateTime.fromJSDate(lastSelectedRef.current)
    //   : null;

    // const pickedOrg = pickedLocal.setZone(tz, { keepLocalTime: true });
    // const prevOrg = prevLocal
    //   ? prevLocal.setZone(tz, { keepLocalTime: true })
    //   : null;

    // const dayChanged = !prevOrg || !pickedOrg.hasSame(prevOrg, "day");
    let finalLocal = pickedLocal;

    if (pickerType === "end") {
      // if (dayChanged) {
      //   const isPickedOrgToday = pickedOrg.hasSame(nowOrg, "day");
      //   console.log(isPickedOrgToday);
      //   if (isPickedOrgToday) {
      //     let targetOrg = nowOrg
      //       .plus({ hours: 1 })
      //       .set({ second: 0, millisecond: 0 });
      //     if (!targetOrg.hasSame(pickedOrg, "day")) {
      //       targetOrg = pickedOrg.endOf("day");
      //     }
      //     finalLocal = pickedLocal.set({
      //       hour: targetOrg.hour,
      //       minute: targetOrg.minute,
      //       second: 0,
      //       millisecond: 0,
      //     });
      //   } else {
      //     finalLocal = pickedLocal.set({
      //       hour: 15,
      //       minute: 1,
      //       second: 0,
      //       millisecond: 0,
      //     });
      //   }
      // }
      // lastSelectedRef.current = pickedOrg.toJSDate();
    } else if (pickerType === "start") {
      finalLocal = pickedLocal.set({
        hour: 12,
        minute: 1,
        second: 0,
        millisecond: 0,
      });
    }

    const finalOrg = finalLocal.setZone(tz, { keepLocalTime: true });
    onChange(finalOrg.toUTC().toISO());
  };

  const injectedTime = selected
    ? DateTime.fromJSDate(selected)
        .endOf("day")
        .set({ second: 0, millisecond: 0 })
        .toJSDate()
    : undefined;

  return (
    <DatePicker
      disabled={disabled}
      selected={selectedForPicker}
      onCalendarOpen={() => {
        lastSelectedRef.current = selected;
      }}
      onChange={onPickerChange}
      dateFormat={dateFormat}
      openToDate={openToDate}
      withPortal={true}
      showTimeSelect={pickerType === "end"}
      shouldCloseOnSelect={true}
      injectTimes={injectedTime ? [injectedTime] : []}
      minDate={computedMinDate}
      maxDate={maxToDate ?? new Date(2099, 11, 31)}
      minTime={pickerType === "end" && !isAdmin ? minTimeForEnd : undefined}
      maxTime={pickerType === "end" && !isAdmin ? maxTimeForEnd : undefined}
      placeholderText={
        placeholder ??
        (pickerType === "start" ? "Select start date" : "Select deadline")
      }
      customInput={
        <DateInput
          rawValue={value ?? undefined}
          className={inputClassName}
          pickerType={pickerType}
          ocEnd={ocEnd}
          timeZone={tz}
          showTimeZone={showTimeZone}
        />
      }
      className={cn(
        className,
        "rounded",
        disabled && "pointer-events-none border-foreground/20 opacity-50",
      )}
      tabIndex={tabIndex}
      renderCustomHeader={(props) => (
        <DatePickerHeader {...props} pickerType={pickerType} />
      )}
    />
  );
};
