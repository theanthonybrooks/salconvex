import type { TextareaHTMLAttributes } from "react";

import { useEffect, useMemo, useRef, useState } from "react";
import debounce from "lodash/debounce";
import { ControllerRenderProps, FieldPath, FieldValues } from "react-hook-form";

import { cn } from "@/helpers/utilsFns";

type DefaultTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;
interface DebouncedTextareaProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> extends Omit<DefaultTextareaProps, "onChange" | "value" | "defaultValue"> {
  field: ControllerRenderProps<TFieldValues, TName>;

  maxLength: number;
  placeholder?: string;
  className?: string;
  containerClassName?: string;
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
  containerClassName,
  delay = 300,
  tabIndex = 0,
  disabled,
  required,
  ...textareaProps
}: DebouncedTextareaProps<TFieldValues, TName>) {
  const [localValue, setLocalValue] = useState(field.value ?? "");
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emptyRequired = required && localValue.trim().length === 0;

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

    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [localValue]);

  return (
    <div
      className={cn(
        "relative w-full rounded-lg border border-foreground bg-card focus-within:ring-1 focus-within:ring-ring",
        isFocused && "pb-5",
        disabled && "cursor-not-allowed opacity-50",
        emptyRequired && "invalid-field",
        containerClassName,
      )}
    >
      <textarea
        {...field}
        {...textareaProps}
        disabled={disabled}
        ref={textareaRef}
        value={localValue}
        onChange={(e) => {
          const val = e.target.value;
          setLocalValue(val);
          debouncedOnChange(val);
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        tabIndex={tabIndex}
        maxLength={maxLength}
        placeholder={placeholder}
        className={cn(
          "scrollable justy mini w-full resize-none bg-transparent p-3 text-base placeholder:italic focus:outline-none sm:text-sm",
          className,
        )}
      />
      {!disabled && isFocused && (
        <p className="absolute bottom-3 right-3 bg-card/90 text-xs text-gray-400">
          {localValue.length}/{maxLength}
        </p>
      )}
    </div>
  );
}
