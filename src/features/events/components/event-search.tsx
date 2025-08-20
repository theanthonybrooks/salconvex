"use client";

import { Input } from "@/components/ui/input";

import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { FaRemoveFormat } from "react-icons/fa";
import { titleCase } from "title-case";

interface EventNameSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  tabIndex?: number;
  isExisting?: boolean;
  isAdmin?: boolean;
}

export function EventNameSearch({
  value,
  onChange,
  placeholder = "Search or enter new",
  className,
  tabIndex,
  isExisting,
  isAdmin,
}: EventNameSearchProps) {
  const textFormatted = useRef(false);
  const [localValue, setLocalValue] = useState(value);
  const debouncedValue = useDebounce(localValue, 300);
  // const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    onChange(debouncedValue);
  }, [debouncedValue, onChange]);

  return (
    <div className="relative w-full">
      <Input
        type="text"
        value={localValue}
        onChange={(e) => {
          setLocalValue(e.target.value);
          textFormatted.current = false;
        }}
        className={cn(
          "h-12 border-foreground text-base",
          className,
          isExisting && "border-red-600 ring-red-600",
          isAdmin && "pr-10",
        )}
        placeholder={placeholder}
        tabIndex={tabIndex}
      />
      {isAdmin && localValue?.length > 3 && !textFormatted.current && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground">
          <FaRemoveFormat
            onClick={() => {
              setLocalValue((prev) => titleCase(prev.toLowerCase()));
              textFormatted.current = true;
            }}
            className="size-4 cursor-pointer hover:scale-105 active:scale-95"
          />
        </div>
      )}
    </div>
  );
}
