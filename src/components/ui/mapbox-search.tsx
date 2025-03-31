import { fetchMapboxSuggestions, MapboxSuggestion } from "@/lib/locations"
import { cn } from "@/lib/utils"
import React, { useState } from "react"

interface MapboxInputProps {
  value: string
  onChange: (value: string) => void
  onSelect: (location: {
    city: string
    state: string
    stateAbbr: string
    country: string
    countryAbbr: string
    coordinates: number[]
    full: string
  }) => void
  placeholder?: string
  className?: string
  tabIndex?: number
}

export const MapboxInput = ({
  value,
  onChange,
  onSelect,
  placeholder = "Enter a location",
  className,
  tabIndex,
}: MapboxInputProps) => {
  const [suggestions, setSuggestions] = useState<MapboxSuggestion[]>([])
  const [highlightedIndex, setHighlightedIndex] = useState(0)

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    onChange(val)
    if (!val.trim()) return setSuggestions([])
    const results = await fetchMapboxSuggestions(val)
    setSuggestions(results)
    setHighlightedIndex(0)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (suggestions.length === 0) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev + 1) % suggestions.length)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlightedIndex((prev) =>
        prev === 0 ? suggestions.length - 1 : prev - 1
      )
    } else if (e.key === "Enter") {
      e.preventDefault()
      const selected = suggestions[highlightedIndex]
      if (selected) handleSelect(selected)
    }
  }

  const handleSelect = (s: MapboxSuggestion) => {
    const context = s.context || []
    const findContext = (type: string) =>
      context.find((c) => c.id.startsWith(type))

    const stateContext = findContext("region")
    const countryContext = findContext("country")

    const locationData = {
      city: s.text,
      state: stateContext?.text || "",
      stateAbbr: stateContext?.short_code?.split("-")[1] || "",
      country: countryContext?.text || "",
      countryAbbr: countryContext?.short_code?.toUpperCase() || "",
      coordinates: s.center,
      full: s.place_name,
    }

    onSelect(locationData)
    setSuggestions([])
  }

  return (
    <div className='relative'>
      <input
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        tabIndex={tabIndex}
        className={cn(
          "w-full rounded border border-foreground/30 focus:ring-1 focus:ring-foreground p-3 text-base placeholder-foreground/50 focus:outline-none placeholder-shown:bg-card ",
          className
        )}
      />
      {suggestions.length > 0 && (
        <ul className='absolute z-50 mt-1 w-full rounded-md bg-white shadow border-1.5 scrollable mini'>
          {suggestions.map((s, i) => (
            <li
              key={s.id}
              className={`cursor-pointer p-2 text-sm ${
                i === highlightedIndex
                  ? "bg-salPinkLt"
                  : "hover:bg-salYellow/70"
              }`}
              onMouseDown={() => handleSelect(s)}>
              {s.place_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
