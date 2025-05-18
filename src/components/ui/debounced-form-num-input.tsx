import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { debounce } from "lodash";
import { useEffect, useRef, useState } from "react";
import { ControllerRenderProps, FieldValues, Path } from "react-hook-form";

interface DebouncedControllerNumInputProps<
  TFieldValues extends FieldValues,
  TName extends Path<TFieldValues>,
> {
  field: ControllerRenderProps<TFieldValues, TName>;
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
  debounceMs = 500,
  formatNumber = false,
  min,
  max,
  ...inputProps
}: DebouncedControllerNumInputProps<TFieldValues, TName>) {
  // const [localValue, setLocalValue] = useState(() => {
  //   if (typeof field.value === "number" && formatNumber) {
  //     return formatWithCommas(field.value);
  //   }
  //   return field.value?.toString() ?? "";
  // });
  const [localValue, setLocalValue] = useState(() => {
    console.log(field.value, typeof field.value);
    if (typeof field.value === "number") {
      return field.value === 0
        ? ""
        : formatNumber
          ? formatWithCommas(field.value)
          : String(field.value);
    }
    return "";
  });

  const debouncedOnChange = useRef(
    debounce((val: string) => {
      const numeric = parseFloat(val.replace(/,/g, ""));
      if (!isNaN(numeric)) {
        if (typeof min === "number" && numeric < min) {
          field.onChange(min);
        } else if (typeof max === "number" && numeric > max) {
          field.onChange(max);
        } else {
          field.onChange(numeric);
        }
      } else {
        field.onChange(undefined);
      }
    }, debounceMs),
  ).current;

  useEffect(() => {
    // if (typeof field.value === "number") {
    //   setLocalValue(
    //     formatNumber ? formatWithCommas(field.value) : String(field.value),
    //   );
    // } else {
    //   setLocalValue("");
    // }
    if (typeof field.value === "number") {
      setLocalValue(
        field.value === 0
          ? ""
          : formatNumber
            ? formatWithCommas(field.value)
            : String(field.value),
      );
    } else {
      setLocalValue("");
    }
  }, [field.value, formatNumber]);

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
        "placeholder:text-sm placeholder:text-foreground/50",
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
          field.onChange(num);
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
