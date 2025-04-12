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
  const debouncedValue = useDebounce(localValue, 300);

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
          "text-base",
          className,
          isExisting && "border-red-600 ring-red-600",
        )}
        placeholder={placeholder}
        tabIndex={tabIndex}
      />
      {/* {isExisting && (
        <p className="space-x-1 text-center text-sm text-red-600">
          {isEvent ? "An" : "A"} {getEventCategoryLabel(category)} with this
          name already exists.
        </p>
      )} */}
    </div>
  );
}
