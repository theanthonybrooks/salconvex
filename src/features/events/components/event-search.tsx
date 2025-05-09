"use client";

import { Input } from "@/components/ui/input";

import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface EventNameSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  tabIndex?: number;
  isExisting?: boolean;
}

export function EventNameSearch({
  value,
  onChange,
  placeholder = "Search or enter event name",
  className,
  tabIndex,
  isExisting,
}: EventNameSearchProps) {
  const [localValue, setLocalValue] = useState(value);
  const debouncedValue = useDebounce(localValue, 500);

  useEffect(() => {
    onChange(debouncedValue);
  }, [debouncedValue, onChange]);

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <Input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        className={cn(
          "h-12 border-foreground text-base",
          className,
          isExisting && "border-red-600 ring-red-600",
        )}
        placeholder={placeholder}
        tabIndex={tabIndex}
      />
    </div>
  );
}
