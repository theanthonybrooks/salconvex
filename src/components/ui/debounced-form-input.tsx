import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { debounce } from "lodash";
import { useEffect, useRef, useState } from "react";
import { ControllerRenderProps, FieldValues, Path } from "react-hook-form";

interface DebouncedControllerInputProps<
  TFieldValues extends FieldValues,
  TName extends Path<TFieldValues>,
> {
  field: ControllerRenderProps<TFieldValues, TName>;
  debounceMs?: number;
  transform?: (value: string) => string;
  [key: string]: unknown;
}

export function DebouncedControllerInput<
  TFieldValues extends FieldValues,
  TName extends Path<TFieldValues>,
>({
  field,
  debounceMs = 500,
  transform,
  ...inputProps
}: DebouncedControllerInputProps<TFieldValues, TName>) {
  const [localValue, setLocalValue] = useState(field.value ?? "");

  const debouncedOnChange = useRef(
    debounce((val: string) => {
      const transformed = transform ? transform(val) : val;
      field.onChange(transformed);
      setLocalValue(transformed);
    }, debounceMs),
  ).current;

  useEffect(() => {
    setLocalValue(field.value ?? "");
  }, [field.value]);

  useEffect(() => {
    return () => {
      debouncedOnChange.cancel();
    };
  }, [debouncedOnChange]);

  return (
    <Input
      {...inputProps}
      className={cn(
        "text-base placeholder:text-sm placeholder:text-foreground/50 sm:text-sm",
        typeof inputProps.className === "string"
          ? inputProps.className
          : undefined,
      )}
      value={localValue}
      onChange={(e) => {
        const val = e.target.value;
        setLocalValue(val);
        debouncedOnChange(val);
      }}
      onPaste={(e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text");
        const transformed = transform ? transform(pasted) : pasted;
        setLocalValue(transformed);
        field.onChange(transformed);
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
