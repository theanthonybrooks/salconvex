import {
  countryToContinentMap,
  countryToCurrencyMap,
  countryToDemonymMap,
  fetchMapboxSuggestions,
  fetchMapboxSuggestionsFull,
  MapboxSuggestion,
  stateToRegionMap,
} from "@/lib/locations";
import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";

interface MapboxInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onSelect: (location: {
    city: string;
    state: string;
    stateAbbr: string;
    country: string;
    countryAbbr: string;
    coordinates: number[];
    full: string;
  }) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  tabIndex?: number;
  reset?: boolean;
  disabled?: boolean;
}

export const MapboxInput = ({
  id,
  // reset,
  value,
  // onChange,
  onSelect,
  placeholder = "Enter a location",
  className,
  inputClassName,
  tabIndex,
  disabled,
}: MapboxInputProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<MapboxSuggestion[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [inputValue, setInputValue] = useState(value || "");

  const newValue = value && value !== inputValue && !isFocused;

  const listRef = useRef<HTMLUListElement>(null);

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
      handleSelect(suggestions[highlightedIndex]);
    }
  };

  const handleSelect = (s: MapboxSuggestion) => {
    const context = s.context || [];
    const findContext = (type: string) =>
      context.find((c) => c.id.startsWith(type));

    const stateContext = findContext("region");
    const countryContext = findContext("country");

    const locationData = {
      city: s.text,
      state: stateContext?.text || "",
      stateAbbr: stateContext?.short_code?.split("-")[1] || "",
      country: countryContext?.text || "",
      countryAbbr: countryContext?.short_code?.toUpperCase() || "",
      coordinates: s.center,
      full: s.place_name,
    };

    onSelect(locationData);

    setInputValue(locationData.full);
    setSuggestions([]);
  };

  // useEffect(() => {
  //   if (reset) {
  //     setSuggestions([]);
  //     setInputValue("");
  //     setHighlightedIndex(0);
  //     onChange("");
  //   }
  // }, [reset, onChange]);

  useEffect(() => {
    if (suggestions.length > 0 && listRef.current) {
      setTimeout(() => {
        listRef?.current?.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }, 100);
    }
  }, [suggestions]);

  useEffect(() => {
    if (!isFocused) return;
    const timeout = setTimeout(async () => {
      if (!inputValue.trim()) {
        setSuggestions([]);
        return;
      }

      const results = await fetchMapboxSuggestions(inputValue);
      setSuggestions(results);
      setHighlightedIndex(0);
    }, 500);

    return () => clearTimeout(timeout);
  }, [inputValue, isFocused]);

  useEffect(() => {
    if (newValue) {
      setInputValue(value);
    }
  }, [newValue, value]);

  // useEffect(() => {
  //   onChange(inputValue);
  // }, [inputValue, onChange]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setSuggestions([]);
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <input
        id={id}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 150)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        tabIndex={tabIndex}
        disabled={disabled}
        className={cn(
          "w-full rounded border border-foreground/30 p-3 text-base placeholder-foreground/50 placeholder-shown:bg-card focus:outline-none focus:ring-1 focus:ring-foreground",
          inputClassName,
        )}
      />
      {isFocused && suggestions.length > 0 && (
        <ul
          ref={listRef}
          className="scrollable mini absolute z-50 mt-1 w-full rounded-md border-1.5 bg-white shadow"
        >
          {suggestions.map((s, i) => (
            <li
              key={s.id}
              className={`cursor-pointer p-2 text-sm ${
                i === highlightedIndex
                  ? "bg-salPinkLt"
                  : "hover:bg-salYellow/70"
              }`}
              onMouseDown={() => handleSelect(s)}
            >
              {s.place_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

//NOTE: This is the full version of the mapbox input that passes the full location object rather than just the full string/value.
export interface FullLocation {
  full: string;
  locale?: string;
  city?: string;
  state?: string;
  stateAbbr?: string;
  region?: string;
  country: string;
  countryAbbr?: string;
  continent?: string;
  coordinates?: { latitude: number; longitude: number };
  currency?: { code: string; name: string; symbol: string };
  demonym?: string;
  sameAsOrganizer?: boolean;
}

interface MapboxInputFullProps {
  id: string;
  value: FullLocation | null;
  onChange: (location: FullLocation | null) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  tabIndex?: number;
  reset: boolean;
  disabled?: boolean;
  isEvent?: boolean;
}

export const MapboxInputFull = ({
  id,
  // reset,
  value,
  onChange,
  // onSelect,
  placeholder = "Enter a location",
  className,
  inputClassName,
  tabIndex,
  disabled,
  isEvent,
}: MapboxInputFullProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState(value?.full ?? "");
  const [suggestions, setSuggestions] = useState<MapboxSuggestion[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  const listRef = useRef<HTMLUListElement>(null);
  const clickedSuggestionRef = useRef(false);

  const fullLocation = value?.full ?? null;
  const newLocation = value?.full !== inputValue && !isFocused;

  const emptyObject: FullLocation = {
    full: inputValue,
    city: "",
    state: "",
    stateAbbr: "",
    country: "",
    countryAbbr: "",
    coordinates: { latitude: 0, longitude: 0 },
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
      setIsFocused(false);
      handleSelect(suggestions[highlightedIndex]);
      if (!suggestions) {
        onChange(emptyObject);
      }
    } else if (
      e.key.length === 1 ||
      e.key === "Backspace" ||
      e.key === "Delete"
    ) {
      setIsFocused(true);
    }
  };

  const handleSelect = (s: MapboxSuggestion) => {
    // console.log(s);
    const context = s.context || [];
    const findContext = (type: string) =>
      context.find((c) => c.id.startsWith(type));
    const placeType = s.place_type;
    const placeContext = findContext("place");
    const localityContext = findContext("locality");
    const stateContext = findContext("region");
    const countryContext = findContext("country");
    const USAddressFormatCountries = [
      "United States",
      "Canada",
      "Mexico",
      "United Kingdom",
      "Australia",
      "Ireland",
      "New Zealand",
      "South Africa",
      "Philippines",
      "India",
      "Israel",
    ];

    //TODO: Add postal code context for the places that require it in order to know where to go.
    // const postalContext = findContext("postcode");
    let locale = localityContext?.text || "";
    let city = s.text;
    let state = stateContext?.text || "";
    let stateAbbr = stateContext?.short_code?.split("-")[1] || "";
    let region = "";
    let country = countryContext?.text || "";
    let countryAbbr = countryContext?.short_code?.toUpperCase() || "";
    let continent = "";
    let currency = { code: "", name: "", symbol: "" };
    let demonym = "";
    let full = s.place_name;

    //TODO: Add state context for all places with states/regions that are important for the region. Also postal codes.

    // if (placeType.includes("address")) {
    //   const parts = [];

    //   if (USAddressFormatCountries.includes(country)) {
    //     if (s.address) parts.push(s.address);
    //     parts.push(s.text);
    //   } else {
    //     parts.push(s.text);
    //     if (s.address) parts.push(s.address);
    //   }

    //   if (locale) parts.push(locale);
    //   if (placeContext?.text) parts.push(placeContext.text);
    //   if (stateContext?.text) parts.push(stateAbbr);
    //   parts.push(countryAbbr === "US" ? countryAbbr : country);

    //   full = parts.join(", ");
    //   city = placeContext?.text || "";
    //   locale = localityContext?.text || "";
    // }

    if (placeType.includes("address")) {
      let addressStreet = "";

      if (USAddressFormatCountries.includes(country)) {
        // U.S.-style: number before street
        if (s.address && s.text) {
          addressStreet = `${s.address} ${s.text}`;
        } else {
          addressStreet = s.text || s.address || "";
        }
      } else {
        // Non-U.S.-style: street before number
        if (s.text && s.address) {
          addressStreet = `${s.text} ${s.address}`;
        } else {
          addressStreet = s.text || s.address || "";
        }
      }

      const parts = [addressStreet];

      if (locale) parts.push(locale);
      if (placeContext?.text) parts.push(placeContext.text);
      if (stateContext?.text) parts.push(stateAbbr);
      parts.push(countryAbbr === "US" ? countryAbbr : country);

      full = parts.filter(Boolean).join(", ");
      city = placeContext?.text || "";
      locale = localityContext?.text || "";
    }

    if (placeType.includes("locality") || placeType.includes("neighborhood")) {
      city = placeContext?.text || "";
      locale = s.text;
    }
    if (placeType.includes("region")) {
      state = s.text;
      stateAbbr = s.properties?.short_code?.split("-")[1] || "";
      city = "";
    }

    if (placeType.includes("place") && placeType.includes("region")) {
      city = s.text;
      state = "";
      stateAbbr = "";
    }

    if (placeType.includes("country")) {
      country = s.text;
      city = "";
      countryAbbr = s.properties?.short_code?.toUpperCase() || "";
    }

    region = countryAbbr === "US" ? (stateToRegionMap[stateAbbr] ?? "") : "";
    continent = countryToContinentMap[countryAbbr] ?? "";
    currency = countryToCurrencyMap[countryAbbr] ?? {
      code: "",
      name: "",
      symbol: "",
    };
    demonym = countryToDemonymMap[countryAbbr] ?? "";

    const locationData: FullLocation = {
      full,
      locale,
      city,
      state,
      stateAbbr,
      region,
      country,
      countryAbbr,
      continent,
      coordinates: {
        latitude: s.center[1],
        longitude: s.center[0],
      },
      currency,
      demonym,
    };
    const locationDataEvent: FullLocation = {
      full,
      locale,
      city,
      state,
      stateAbbr,
      region,
      country,
      countryAbbr,
      continent,
      coordinates: {
        latitude: s.center[1],
        longitude: s.center[0],
      },
      currency,
      demonym,
      sameAsOrganizer: isEvent ? false : true,
    };

    onChange(isEvent ? locationDataEvent : locationData);
    setIsFocused(false);
    setInputValue(locationData.full);
    setSuggestions([]);
  };

  const handleBlur = () => {
    if (inputValue.trim() !== "") {
      // console.log(inputValue.trim(), suggestions.length, isFocused);
    }
    if (value?.full !== inputValue.trim() && !clickedSuggestionRef.current) {
      onChange(emptyObject);
      // console.log("outside", clickedSuggestionRef.current);
    }
    clickedSuggestionRef.current = false;

    setTimeout(() => {
      setIsFocused(false);
    }, 150);
  };

  // useEffect(() => {
  //   if (reset) {
  //     setInputValue("");
  //     setSuggestions([]);
  //     setHighlightedIndex(0);
  //     onChange(null);
  //   }
  // }, [reset, onChange]);

  useEffect(() => {
    if (suggestions.length > 0 && listRef.current) {
      setTimeout(() => {
        listRef?.current?.scrollIntoView({
          behavior: "smooth",
          block: "end", // or "nearest", depending on how it’s being cut off
        });
      }, 100);
    }
  }, [suggestions]);

  useEffect(() => {
    if (!isFocused) return;
    const timeout = setTimeout(async () => {
      if (!inputValue.trim()) {
        setSuggestions([]);
        return;
      }

      const results = await fetchMapboxSuggestionsFull(
        inputValue,
        isEvent ? true : false,
      );
      setSuggestions(results);
      setHighlightedIndex(0);
    }, 500);

    return () => clearTimeout(timeout);
  }, [inputValue, isEvent, isFocused]);

  useEffect(() => {
    if (fullLocation && newLocation) {
      setInputValue(fullLocation);
    }
  }, [fullLocation, value, newLocation]);

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <input
        id={id}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onClick={() => setIsFocused(true)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        tabIndex={tabIndex}
        disabled={disabled}
        className={cn(
          "w-full rounded border border-foreground/30 p-3 text-base placeholder-foreground/50 placeholder-shown:bg-card focus:outline-none focus:ring-1 focus:ring-foreground",
          inputClassName,
        )}
      />
      {isFocused && suggestions.length > 0 && (
        <ul
          ref={listRef}
          className="scrollable mini absolute z-50 mt-1 w-full rounded-md border-1.5 bg-white shadow"
        >
          {suggestions.map((s, i) => (
            <li
              key={s.id}
              className={`cursor-pointer p-2 text-sm ${
                i === highlightedIndex
                  ? "bg-salPinkLt"
                  : "hover:bg-salYellow/70"
              }`}
              onMouseDown={() => {
                clickedSuggestionRef.current = true;
                handleSelect(s);
              }}
            >
              {s.place_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
