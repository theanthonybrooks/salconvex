import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { Check, CircleCheck, CircleX, Search } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { api } from "~/convex/_generated/api";
import { Doc } from "~/convex/_generated/dataModel";

interface OrgSearchProps {
  value: string | null;
  onChange: (
    value:
      | string
      | {
          organizationName: string;
        }
      | null,
  ) => void;
  placeholder?: string;
  className?: string;
  isValid: boolean;
  validationError: boolean;
  onReset: () => void;
  onLoadClick: (org: Doc<"organizations"> | null) => void;
}

export const OrgSearch = ({
  value,
  onChange,
  placeholder,
  className,
  isValid,
  validationError: invalid,
  onReset,
  onLoadClick,
}: OrgSearchProps) => {
  const [inputValue, setInputValue] = useState(value || "");
  const [focused, setFocused] = useState(false);
  const [clearHovered, setClearHovered] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const [selectedVal, setSelectedVal] = useState<string>("");
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const orgInputRef = useRef<HTMLInputElement>(null);
  const trimmedQuery = inputValue.trim();
  const [debouncedQuery, setDebouncedQuery] = useState(trimmedQuery);

  const results = useQuery(
    api.organizer.organizations.getUserOrganizations,
    hasUserInteracted ? { query: debouncedQuery || "" } : "skip",
  );

  // useEffect(() => {
  //   console.log("debouncedQuery", debouncedQuery);
  //   console.log("results", results);
  //   console.log(focused);
  // }, [debouncedQuery, results, focused]);

  const showSuggestions = focused && results && results.length > 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setInputValue(newVal);
  };

  const handleSelect = (org: Doc<"organizations">) => {
    onChange(org.name);
    setInputValue(org.name);
    setSelectedVal(org.name);
    setSelectedIndex(-1);
    onLoadClick(org);
    setFocused(false);
    orgInputRef.current?.blur();
  };

  const handleReset = () => {
    setInputValue("");
    setSelectedVal("");
    onLoadClick(null);
    // onChange(null);
    onReset();

    orgInputRef.current?.focus();
  };

  // console.log(selectedIndex);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!results || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (showSuggestions) {
        setSelectedIndex((prev) => (prev + 1) % results.length);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (showSuggestions) {
        setSelectedIndex((prev) =>
          prev === -1
            ? results.length - 1
            : (prev - 1 + results.length) % results.length,
        );
      }
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
      setSelectedIndex(-1);
      // setSelectedVal(results[selectedIndex].organizationName)
    } else if (e.key === "Escape") {
      setFocused(false);
      setSelectedIndex(-1);
    } else if (
      e.key.length === 1 ||
      e.key === "Backspace" ||
      e.key === "Delete"
    ) {
      setSelectedVal("");
      onLoadClick(null);
    }
  };

  // useEffect(() => {
  //   if (
  //     typeof value === "object" &&
  //     value !== null &&
  //     "organizationName" in value &&
  //     inputValue !== value.organizationName
  //   ) {
  //     setInputValue(value.organizationName);
  //   }
  // }, [value, inputValue]);

  useEffect(() => {
    const selectedEl = itemRefs.current[selectedIndex];
    if (selectedEl) {
      selectedEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [selectedIndex]);

  useEffect(() => {
    if (showSuggestions) {
      setSelectedIndex(0);
    } else {
      setSelectedIndex(-1);
    }
  }, [showSuggestions]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(trimmedQuery);
      if (hasUserInteracted) {
        onChange(trimmedQuery);
        // onLoadClick(null);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [trimmedQuery, hasUserInteracted, onChange, onLoadClick]);

  useEffect(() => {
    if (!showSuggestions || !listRef.current) return;

    setTimeout(() => {
      listRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 100);
  }, [showSuggestions]);

  return (
    <div
      className="relative mx-auto w-full max-w-sm lg:min-w-[400px] lg:max-w-md"
      ref={containerRef}
    >
      <section className="relative z-[2]">
        <input
          ref={orgInputRef}
          value={inputValue}
          onChange={handleInputChange}
          autoFocus={false}
          onFocus={() => {
            if (!hasUserInteracted) setHasUserInteracted(true);
            setFocused(true);
          }}
          onBlur={() => setTimeout(() => setFocused(false), 100)}
          onKeyDown={(e) => {
            if (!hasUserInteracted) setHasUserInteracted(true);
            handleKeyDown(e);
          }}
          placeholder={placeholder}
          maxLength={35}
          className={cn(
            "w-full rounded border p-2 pl-8 pr-10 lg:pl-14 lg:pr-14",
            className,
            invalid && "italic text-red-500 ring-2 ring-red-500 ring-offset-1",
            clearHovered && "italic text-red-500 line-through",
          )}
        />
        <Search
          onMouseDown={(e) => {
            e.preventDefault();
            containerRef.current?.querySelector("input")?.focus();
          }}
          className="absolute left-2 top-1/2 size-4 -translate-y-1/2 transform cursor-pointer text-foreground/50 hover:text-foreground/100 lg:ml-2 lg:size-7"
        />
        {/* {focused && inputValue === "" && (
          <span className='absolute left-10 top-1/2 -translate-y-1/2 h-10 w-[2px] bg-foreground animate-caret-blink pointer-events-none' />
        )} */}
        {isValid && !clearHovered && (
          <CircleCheck
            onMouseEnter={() => setClearHovered(true)}
            onMouseLeave={() => setClearHovered(false)}
            className="absolute right-[9px] top-1/2 size-6 -translate-y-1/2 cursor-pointer font-bold text-emerald-600 lg:right-4 lg:size-7"
          />
        )}
        {(invalid || (clearHovered && isValid === true)) && (
          <CircleX
            onMouseEnter={() => setClearHovered(true)}
            onMouseLeave={() => setClearHovered(false)}
            onClick={handleReset}
            className={cn(
              "absolute right-[9px] top-1/2 size-6 -translate-y-1/2 cursor-pointer font-bold text-red-600 lg:right-4 lg:size-7",
              clearHovered && "scale-110 font-semibold spin-in-90",
            )}
          />
        )}
      </section>

      {showSuggestions && (
        <ul
          ref={listRef}
          className="scrollable mini absolute z-50 mt-1 w-full rounded-md border-1.5 bg-white shadow"
        >
          {results.map((org, idx) => (
            <li
              key={org._id}
              ref={(el) => {
                itemRefs.current[idx] = el;
              }}
              onMouseDown={() => handleSelect(org)}
              className={cn(
                "relative flex cursor-pointer items-center gap-x-4 py-3 pl-4 pr-2",
                selectedIndex === idx
                  ? "bg-salYellow/50"
                  : "hover:bg-salYellow/40",
              )}
            >
              {org.logo && (
                <Image
                  src={org.logo}
                  alt={org.name}
                  width={35}
                  height={35}
                  className="rounded-full"
                />
              )}
              {org.name}
              {org.name.toLowerCase() === selectedVal.toLowerCase() && (
                <Check className="absolute right-6 top-1/2 -translate-y-1/2 font-bold text-foreground" />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
