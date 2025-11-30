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
  countMode?: "char" | "word";
}

export function DebouncedTextarea({
  value,
  setValue,
  maxLength = 200,
  placeholder = "Start typing…",
  className,
  contClassName,
  delay = 300,
  countMode = "char",
}: DebouncedTextareaProps) {
  const [localValue, setLocalValue] = useState(value ?? "");
  const [dynamicMax, setDynamicMax] = useState(maxLength);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;

    if (countMode === "word") {
      const words = val.trim().split(/\s+/).filter(Boolean);

      if (words.length > maxLength) {
        // limit reached → freeze typing
        setDynamicMax(val.length - 1);
        return;
      }

      // not at limit yet → allow typing normally
      setDynamicMax(Infinity); // or a large constant (safe because user won't reach it)
    }

    setLocalValue(val);
    debouncedOnChange(val);
  };

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

  const count = useMemo(() => {
    if (countMode === "word") {
      return localValue.trim() === ""
        ? 0
        : localValue.trim().split(/\s+/).length;
    }

    return localValue.length;
  }, [localValue, countMode]);

  return (
    <div className={cn("relative h-max", contClassName)}>
      <textarea
        ref={textareaRef}
        value={localValue}
        onChange={handleChange}
        maxLength={dynamicMax}
        placeholder={placeholder}
        className={cn(
          "scrollable justy mini w-full resize-none rounded-lg border border-foreground bg-card p-3 pb-6 text-base placeholder:italic focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm",
          className,
        )}
      />
      <p
        className={cn(
          "absolute bottom-3 right-3 rounded-tl-lg bg-white px-2 py-1 text-xs text-gray-400",
          count > maxLength && "text-red-600",
        )}
      >
        {count}/{maxLength}
      </p>
    </div>
  );
}
