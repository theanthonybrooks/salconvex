import { useEffect, useMemo, useState } from "react";
import { debounce } from "lodash";
import { ControllerRenderProps, FieldValues, Path } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { cn } from "@/helpers/utilsFns";

interface DebouncedControllerNumInputProps<
  TFieldValues extends FieldValues,
  TName extends Path<TFieldValues>,
> {
  field: ControllerRenderProps<TFieldValues, TName>;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  debounceMs?: number;
  formatNumber?: boolean;
  withDecimal?: boolean;
  min?: number;
  max?: number;
  [key: string]: unknown;
}

// const formatWithCommas = (val: number): string => {
//   return val.toLocaleString("en-US");
// };
const formatWithCommas = (val: number, decimals: number): string => {
  return val.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
};

export function DebouncedControllerNumInput<
  TFieldValues extends FieldValues,
  TName extends Path<TFieldValues>,
>({
  field,
  value,
  onChange,
  debounceMs = 500,
  formatNumber = false,
  withDecimal = false,
  min,
  max,
  ...inputProps
}: DebouncedControllerNumInputProps<TFieldValues, TName>) {
  const [localValue, setLocalValue] = useState(() => {
    if (typeof value === "number") {
      return value === 0
        ? ""
        : formatNumber
          ? formatWithCommas(value, withDecimal ? 2 : 0)
          : String(value);
    }
    return "";
  });

  const debouncedOnChange = useMemo(
    () =>
      debounce((val: string) => {
        const numericString = val.replace(/,/g, "");
        if (numericString.endsWith(".")) return;

        const numeric = parseFloat(numericString);
        if (!isNaN(numeric)) {
          if (typeof min === "number" && numeric < min) {
            onChange(min);
          } else if (typeof max === "number" && numeric > max) {
            onChange(max);
          } else {
            onChange(numeric);
          }
        } else {
          onChange(undefined);
        }
      }, debounceMs),
    [debounceMs, min, max, onChange],
  );

  useEffect(() => {
    if (typeof value === "number") {
      setLocalValue(
        value === 0
          ? ""
          : formatNumber
            ? formatWithCommas(value, withDecimal ? 2 : 0)
            : String(value),
      );
    } else {
      setLocalValue("");
    }
  }, [value, formatNumber, withDecimal]);

  useEffect(() => {
    return () => {
      debouncedOnChange.cancel();
    };
  }, [debouncedOnChange]);

  return (
    <Input
      {...inputProps}
      type="text"
      inputMode="numeric"
      pattern={withDecimal ? "[0-9.,]*" : "[0-9,]*"}
      className={cn(
        "bg-card text-base placeholder:text-sm placeholder:text-foreground/50 sm:text-sm",
        typeof inputProps.className === "string"
          ? inputProps.className
          : undefined,
      )}
      value={localValue}
      onChange={(e) => {
        let raw = e.target.value
          .replace(withDecimal ? /[^\d.,]/g : /[^\d,]/g, "")
          .replace(/(\..*)\./g, "$1");

        // enforce max 2 decimal digits at the RAW level
        if (withDecimal && raw.includes(".")) {
          raw = raw.replace(/(\.\d{2}).*/, "$1");
        }

        const numericString = raw.replace(/,/g, "");

        const display =
          formatNumber && numericString && !numericString.endsWith(".")
            ? formatWithCommas(parseFloat(numericString), withDecimal ? 2 : 0)
            : raw;

        setLocalValue(display);
        debouncedOnChange(raw);
      }}
      onPaste={(e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/[^\d.]/g, "");
        const num = parseFloat(pasted);
        if (!isNaN(num)) {
          const display = formatNumber
            ? formatWithCommas(num, withDecimal ? 2 : 0)
            : String(num);
          setLocalValue(display);
          onChange(num);
        }
      }}
      onBlur={(e) => {
        field.onBlur();
        if (typeof inputProps.onBlur === "function") {
          inputProps.onBlur(e);
        }
      }}
    />
  );
}
