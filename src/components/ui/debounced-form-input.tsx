import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { debounce } from "lodash";
import { useEffect, useRef, useState } from "react";
import {
  ControllerRenderProps,
  FieldValues,
  Path,
  useFormContext,
} from "react-hook-form";

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
  const { setValue } = useFormContext();
  const [localValue, setLocalValue] = useState(field.value ?? "");

  const latestTransform = useRef(transform);
  useEffect(() => {
    latestTransform.current = transform;
  }, [transform]);

  const debouncedOnChange = useRef(
    debounce((val: string) => {
      const transformed = latestTransform.current
        ? latestTransform.current(val)
        : val;
      setValue(field.name, transformed as TFieldValues[TName], {
        shouldValidate: true,
        shouldDirty: true,
      });
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
      name={field.name}
      className={cn(
        "bg-card text-base placeholder:text-sm placeholder:text-foreground/50 sm:text-sm",
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
        // field.onChange(transformed);
        setValue(field.name, transformed as TFieldValues[TName], {
          shouldValidate: true,
          shouldDirty: true,
        });
        // requestAnimationFrame(() => {
        //   field.onBlur();
        // });
        // trigger(field.name);
        e.currentTarget.blur();
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
