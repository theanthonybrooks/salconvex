import type { InputHTMLAttributes } from "react";

import { useEffect, useRef, useState } from "react";
import { debounce } from "lodash";
import { ControllerRenderProps, FieldValues, Path } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { cn } from "@/helpers/utilsFns";

type DefaultInputProps = InputHTMLAttributes<HTMLInputElement>;

interface DebouncedControllerInputProps<
  TFieldValues extends FieldValues,
  TName extends Path<TFieldValues>,
> extends Omit<DefaultInputProps, "onChange" | "value" | "defaultValue"> {
  field: ControllerRenderProps<TFieldValues, TName>;
  debounceMs?: number;
  transform?: (value: string) => string | undefined;
  onSchemaCheck?: () => void;
  fontSize?: string;
}

export function DebouncedControllerInput<
  TFieldValues extends FieldValues,
  TName extends Path<TFieldValues>,
>({
  field,
  debounceMs = 500,
  transform,
  onSchemaCheck,
  className,
  fontSize,
  ...inputProps
}: DebouncedControllerInputProps<TFieldValues, TName>) {
  // const { setValue } = useFormContext();
  const [localValue, setLocalValue] = useState<string | undefined>(
    field.value ?? "",
  );

  const latestTransform = useRef(transform);
  useEffect(() => {
    latestTransform.current = transform;
  }, [transform]);

  const debouncedOnChange = useRef(
    debounce((val: string) => {
      const transformed = latestTransform.current
        ? latestTransform.current(val)
        : val;
      // setValue(field.name, transformed as TFieldValues[TName], {
      //   shouldValidate: true,
      //   shouldDirty: true,
      // });
      // const normalized = transformed ?? undefined;
      const normalized = transformed ?? "";

      field.onChange(normalized);
      setLocalValue(transformed ?? "");
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

  // console.log(field);

  return (
    <Input
      {...field}
      {...inputProps}
      className={cn(
        "bg-card text-base placeholder:text-sm placeholder:text-foreground/50 sm:text-sm",
        className,
        fontSize,
      )}
      value={localValue ?? ""}
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
        // debouncedOnChange(transformed);
        onSchemaCheck?.();
        // setValue(field.name, transformed as TFieldValues[TName], {
        //   shouldValidate: true,
        //   shouldDirty: true,
        // });

        requestAnimationFrame(() => {
          field.onBlur();
        });
      }}
      onBlur={() => {
        field.onBlur();
        onSchemaCheck?.();
      }}
    />
  );
}
