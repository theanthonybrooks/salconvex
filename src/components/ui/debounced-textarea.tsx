import { cn } from "@/lib/utils";
import { debounce } from "lodash";
import { useEffect, useMemo, useRef, useState } from "react";

type DebouncedTextareaProps = {
  value: string;
  onChange: (value: string) => void;
  delay?: number;
  maxlength?: number;
  maxHeight?: number;
  className?: string;
  placeholder?: string;
};

export const DebouncedTextarea = ({
  value,
  onChange,
  delay = 500,
  maxlength = 200,
  maxHeight = 300,
  className,
  placeholder,
}: DebouncedTextareaProps) => {
  const [inputVal, setInputVal] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    setInputVal(newVal);
    debouncedOnChange(newVal);
    adjustHeight();
  };

  return (
    <textarea
      ref={textareaRef}
      value={inputVal}
      onChange={handleChange}
      placeholder={placeholder}
      maxLength={maxlength}
      className={cn(
        "scrollable mini darkbar rounded-lg p-3",
        "border border-foreground",
        "max-h-72 min-h-24 resize-none",
        className,
      )}
    />
  );
};
