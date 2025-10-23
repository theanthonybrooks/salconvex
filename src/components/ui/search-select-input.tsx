import React, { useState } from "react";

import { cn } from "@/helpers/utilsFns";

export interface SuggestionItem<T = unknown> {
  id: string;
  label: string;
  value: T;
}

interface SearchSelectInputProps<T> {
  value: string;
  onChange: (val: string) => void;
  onSelect: (item: SuggestionItem<T>) => void;
  searchFunction: (query: string) => Promise<SuggestionItem<T>[]>;
  placeholder?: string;
  className?: string;
  tabIndex?: number;
}

export function SearchSelectInput<T>({
  value,
  onChange,
  onSelect,
  searchFunction,
  placeholder = "Search...",
  className,
  tabIndex,
}: SearchSelectInputProps<T>) {
  const [suggestions, setSuggestions] = useState<SuggestionItem<T>[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    if (!val.trim()) return setSuggestions([]);
    const results = await searchFunction(val);
    setSuggestions(results);
    setHighlightedIndex(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev === 0 ? suggestions.length - 1 : prev - 1,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = suggestions[highlightedIndex];
      if (selected) {
        onSelect(selected);
        setSuggestions([]);
      }
    }
  };

  return (
    <div className="relative">
      <input
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        tabIndex={tabIndex}
        className={cn(
          "w-full rounded border border-foreground/30 p-3 text-base placeholder-foreground/50 placeholder-shown:bg-card focus:outline-none focus:ring-1 focus:ring-foreground",
          className,
        )}
      />
      {suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full rounded-md bg-white shadow">
          {suggestions.map((s, i) => (
            <li
              key={s.id}
              className={`cursor-pointer p-2 text-sm ${
                i === highlightedIndex
                  ? "bg-salPinkLt"
                  : "hover:bg-salYellow/70"
              }`}
              onMouseDown={() => {
                onSelect(s);
                setSuggestions([]);
              }}
            >
              {s.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
