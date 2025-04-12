import { useEffect, useState } from "react";

/**
 * Delays updating the returned value until after the user has stopped typing.
 *
 * @param value - The value to debounce
 * @param delay - Delay time in milliseconds (default: 300ms)
 * @returns Debounced value
 */
export function useDebounce<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
