import { useEffect, useMemo, useRef, useState } from "react";
import debounce from "lodash/debounce";
import { ControllerRenderProps, FieldPath, FieldValues } from "react-hook-form";

import { cn } from "@/helpers/utilsFns";

interface DebouncedTextareaProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> {
  field: ControllerRenderProps<TFieldValues, TName>;
  maxLength: number;
  placeholder?: string;
  className?: string;
  delay?: number;
  tabIndex?: number;
}

export function DebouncedFormTextarea<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  field,
  maxLength,
  placeholder,
  className,
  delay = 300,
  tabIndex = 0,
}: DebouncedTextareaProps<TFieldValues, TName>) {
  const [localValue, setLocalValue] = useState(field.value ?? "");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const debouncedOnChange = useMemo(
    () =>
      debounce((val: string) => {
        field.onChange(val);
      }, delay),
    [field, delay],
  );

  useEffect(() => {
    setLocalValue(field.value ?? "");
  }, [field.value]);

  useEffect(() => {
    return () => {
      debouncedOnChange.cancel();
    };
  }, [debouncedOnChange]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "auto"; // reset to shrink
    el.style.height = `${el.scrollHeight}px`;
  }, [localValue]);

  return (
    <div className={cn("relative")}>
      <textarea
        {...field}
        ref={textareaRef}
        value={localValue}
        onChange={(e) => {
          const val = e.target.value;
          setLocalValue(val);
          debouncedOnChange(val);
        }}
        tabIndex={tabIndex}
        maxLength={maxLength}
        placeholder={placeholder}
        className={cn(
          "scrollable justy mini w-full resize-none rounded-lg border border-foreground bg-card p-3 pb-6 text-base placeholder:italic focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm",
          className,
        )}
      />
      <p className="absolute bottom-3 right-3 text-xs text-gray-400">
        {localValue.length}/{maxLength}
      </p>
    </div>
  );
}
