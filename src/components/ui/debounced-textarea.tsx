import { cn } from "@/lib/utils";
import { debounce } from "lodash";
import { useEffect, useMemo, useState } from "react";

type DebouncedTextareaProps = {
  value: string;
  onChange: (value: string) => void;
  delay?: number;
  className?: string;
};

export const DebouncedTextarea = ({
  value,
  onChange,
  delay = 500,
  className,
}: DebouncedTextareaProps) => {
  const [inputVal, setInputVal] = useState(value);

  useEffect(() => {
    setInputVal(value);
  }, [value]);

  const debouncedOnChange = useMemo(
    () => debounce(onChange, delay),
    [onChange, delay],
  );

  useEffect(() => {
    return () => {
      debouncedOnChange.cancel();
    };
  }, [debouncedOnChange]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    setInputVal(newVal);
    debouncedOnChange(newVal);
  };

  return (
    <textarea
      value={inputVal}
      onChange={handleChange}
      className={cn("scrollable mini darkbar rounded-lg p-2", className)}
    />
  );
};
