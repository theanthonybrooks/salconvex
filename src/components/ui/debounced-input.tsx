import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { debounce } from "lodash";
import { useEffect, useRef, useState } from "react";

interface DebouncedInputProps extends React.ComponentPropsWithoutRef<"input"> {
  value?: string;

  debounceMs?: number;
  transform?: (value: string) => string;
  [key: string]: unknown;
}

export function DebouncedInput({
  value,
  debounceMs = 500,
  transform,
  ...inputProps
}: DebouncedInputProps) {
  const [localValue, setLocalValue] = useState(value ?? "");

  const debouncedOnChange = useRef(
    debounce((val: string) => {
      const transformed = transform ? transform(val) : val;
      setLocalValue(transformed);
    }, debounceMs),
  ).current;

  useEffect(() => {
    return () => {
      debouncedOnChange.cancel();
    };
  }, [debouncedOnChange]);

  useEffect(() => {
    setLocalValue(value ?? "");
  }, [value]);

  return (
    <Input
      {...inputProps}
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
        debouncedOnChange(transformed);
      }}
    />
  );
}
