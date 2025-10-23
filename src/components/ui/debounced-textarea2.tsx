import { useEffect, useMemo, useRef, useState } from "react";
import debounce from "lodash/debounce";

import { cn } from "@/helpers/utilsFns";

interface DebouncedTextareaProps {
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  maxLength?: number;
  placeholder?: string;
  className?: string;
  contClassName?: string;
  delay?: number;
}

export function DebouncedTextarea({
  value,
  setValue,
  maxLength = 200,
  placeholder = "Start typing…",
  className,
  contClassName,
  delay = 300,
}: DebouncedTextareaProps) {
  const [localValue, setLocalValue] = useState(value ?? "");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const debouncedOnChange = useMemo(
    () =>
      debounce((val: string) => {
        setValue(val);
      }, delay),
    [setValue, delay],
  );

  useEffect(() => {
    setLocalValue(value ?? "");
  }, [value]);

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
    <div className={cn("relative h-max", contClassName)}>
      <textarea
        ref={textareaRef}
        value={localValue}
        onChange={(e) => {
          const val = e.target.value;
          setLocalValue(val);
          debouncedOnChange(val);
        }}
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
