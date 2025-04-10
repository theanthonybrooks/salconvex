"use client";

import { cn } from "@/lib/utils";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";

type DiscreteSliderProps = {
  value: number;
  onChange: (value: number) => void;
  marks?: { value: number; label: string }[];
  min?: number;
  max?: number;
  prefix?: string;
  suffix?: string;
  width?: number;
  labelFormatter?: (value: number) => string;
  label?: string;
  labelDisplay?: "auto" | "on" | "off";
  className?: string;
  disabled?: boolean;
  step?: number | null;
};

export default function DiscreteSlider({
  value,
  onChange,
  marks,
  prefix = "",
  suffix = "",
  labelFormatter,
  labelDisplay = "auto",
  label = "slider",
  className,
  disabled,
  step = null,
  min = 1,
  max = 100,
}: DiscreteSliderProps) {
  const formatValue = (val: number) =>
    labelFormatter?.(val) ?? `${prefix}${val}${suffix}`;

  return (
    <Box className={cn("w-full", className)}>
      <Slider
        sx={{
          color: "rgb(244, 169, 246)",
          "& .MuiSlider-thumb": {
            border: "2px solid rgb(219, 138, 222)",
          },
          "& .MuiSlider-track": {
            height: 6,
            backgroundColor: "rgb(219, 138, 222)",
            border: "none",
          },

          "& .MuiSlider-rail": {
            color: "rgb(244, 169, 246)",
            opacity: 0.8,
            height: 4,
          },
          "& .MuiSlider-mark": {
            backgroundColor: "rgb(219, 138, 222)",
            height: 8,
            width: 3,
            borderRadius: 1,
          },
        }}
        aria-label={label}
        value={value}
        onChange={(_, newValue) => onChange(newValue as number)}
        getAriaValueText={formatValue}
        valueLabelDisplay={labelDisplay}
        step={step}
        marks={marks}
        min={min}
        max={max}
        disabled={disabled}
      />
    </Box>
  );
}
