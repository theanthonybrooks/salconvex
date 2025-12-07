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
  min?: number;
  max?: number;
  [key: string]: unknown;
}

const formatWithCommas = (val: number): string => {
  return val.toLocaleString("en-US");
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
  min,
  max,
  ...inputProps
}: DebouncedControllerNumInputProps<TFieldValues, TName>) {
  const [localValue, setLocalValue] = useState(() => {
    if (typeof value === "number") {
      return value === 0
        ? ""
        : formatNumber
          ? formatWithCommas(value)
          : String(value);
    }
    return "";
  });

  const debouncedOnChange = useMemo(
    () =>
      debounce((val: string) => {
        const numeric = parseFloat(val.replace(/,/g, ""));
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
            ? formatWithCommas(value)
            : String(value),
      );
    } else {
      setLocalValue("");
    }
  }, [value, formatNumber]);

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
      pattern="[0-9,]*"
      className={cn(
        "bg-card text-base placeholder:text-sm placeholder:text-foreground/50 sm:text-sm",
        typeof inputProps.className === "string"
          ? inputProps.className
          : undefined,
      )}
      value={localValue}
      onChange={(e) => {
        const raw = e.target.value.replace(/[^\d.,]/g, "");
        const numeric = raw.replace(/,/g, "");
        const display =
          formatNumber && numeric ? formatWithCommas(parseFloat(numeric)) : raw;

        setLocalValue(display);
        debouncedOnChange(raw);
      }}
      onPaste={(e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/[^\d.]/g, "");
        const num = parseFloat(pasted);
        if (!isNaN(num)) {
          const display = formatNumber ? formatWithCommas(num) : String(num);
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
