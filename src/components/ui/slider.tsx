"use client"

import { cn } from "@/lib/utils"
import Box from "@mui/material/Box"
import Slider from "@mui/material/Slider"

type DiscreteSliderProps = {
  value: number
  onChange: (value: number) => void
  marks: { value: number; label: string }[]
  prefix?: string
  suffix?: string
  width?: number
  labelFormatter?: (value: number) => string
  label?: string
  labelDisplay?: "auto" | "on" | "off"
  className?: string
  disabled?: boolean
}

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
}: DiscreteSliderProps) {
  const formatValue = (val: number) =>
    labelFormatter?.(val) ?? `${prefix}${val}${suffix}`

  return (
    <Box className={cn("w-full", className)}>
      <Slider
        sx={{
          color: "#f4a9f6",
          "& .MuiSlider-thumb": {
            border: "2px solid #db8ade",
          },
          "& .MuiSlider-track": {
            height: 6,
            backgroundColor: "#db8ade",
            border: "none",
          },

          "& .MuiSlider-rail": {
            color: "#f4a9f6",
            opacity: 0.8,
            height: 4,
          },
          "& .MuiSlider-mark": {
            backgroundColor: "#db8ade",
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
        step={null}
        marks={marks}
        disabled={disabled}
      />
    </Box>
  )
}
