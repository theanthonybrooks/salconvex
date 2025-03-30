import { cn } from "@/lib/utils"
import { useQuery } from "convex/react"
import { Check, CircleCheck, CircleX, Search } from "lucide-react"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { api } from "~/convex/_generated/api"
import { Id } from "~/convex/_generated/dataModel"

interface OrgSearchProps {
  value:
    | string
    | {
        _id?: Id<"organizations">
        organizationName: string
        logo?: string
      }
    | null
  onChange: (
    value:
      | string
      | {
          _id?: Id<"organizations">
          organizationName: string
          logo?: string
        }
      | null
  ) => void
  placeholder?: string
  className?: string
  isValid?: string
  onReset?: () => void
}

export const OrgSearch = ({
  value,
  onChange,
  placeholder,
  className,
  isValid,
  onReset,
}: OrgSearchProps) => {
  const [inputValue, setInputValue] = useState(
    typeof value === "string" ? value : value?.organizationName ?? ""
  )

  const invalid = isValid === "invalid"
  const valid = isValid === "valid"
  const [focused, setFocused] = useState(false)
  const [clearHovered, setClearHovered] = useState(false)
  const [hasUserInteracted, setHasUserInteracted] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)
  const containerRef = useRef<HTMLDivElement>(null)

  const trimmedQuery = inputValue.trim()
  const results = useQuery(
    api.organizations.getUserOrganizations,
    hasUserInteracted ? { query: trimmedQuery || "" } : "skip"
  )
  const showSuggestions = focused && results && results.length > 0

  const handleSelect = (org: {
    _id: Id<"organizations">
    organizationName: string
    logo?: string
  }) => {
    onChange(org)
    setInputValue(org.organizationName)
    setFocused(false)
  }

  const handleReset = () => {
    setInputValue("")
    if (value !== null) onChange(null)
    if (onReset) onReset()
  }

  //   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //     const newVal = e.target.value
  //     setInputValue(newVal)
  //     onChange(null)
  //     onChange({
  //       _id: undefined,
  //       organizationName: newVal,
  //     })
  //     setSelectedIndex(-1)
  //   }
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value
    setInputValue(newVal)
    onChange(newVal) // just the string
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!results || results.length === 0) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % results.length)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) =>
        prev === -1
          ? results.length - 1
          : (prev - 1 + results.length) % results.length
      )
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault()
      handleSelect(results[selectedIndex])
    } else if (e.key === "Escape") {
      setFocused(false)
      setSelectedIndex(-1)
    }
  }

  // Ensure the inputValue reflects the selected org again if passed externally
  useEffect(() => {
    if (
      typeof value === "object" &&
      value !== null &&
      "organizationName" in value &&
      inputValue !== value.organizationName
    ) {
      setInputValue(value.organizationName)
    }
  }, [value, inputValue])

  return (
    <div className='relative' ref={containerRef}>
      <input
        value={inputValue}
        onChange={handleInputChange}
        autoFocus={false}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 100)}
        onMouseDown={() => {
          setHasUserInteracted(true)
        }}
        onKeyDown={(e) => {
          if (!hasUserInteracted) setHasUserInteracted(true)
          handleKeyDown(e)
        }}
        placeholder={placeholder}
        maxLength={35}
        className={cn(
          "w-full border p-2 pl-8 lg:pr-12 lg:pl-14 rounded",
          className,
          invalid && "text-red-500 italic ring-2 ring-red-500 ring-offset-1",
          clearHovered && "text-red-500 italic line-through"
        )}
      />
      <Search
        onMouseDown={(e) => {
          e.preventDefault()
          containerRef.current?.querySelector("input")?.focus()
        }}
        className='absolute left-2 top-1/2 transform -translate-y-1/2 text-foreground/50 hover:text-foreground/100 cursor-pointer size-4 lg:size-7 lg:ml-2 '
      />
      {/* {focused && inputValue === "" && (
        <span className='absolute left-10 top-1/2 -translate-y-1/2 h-10 w-[2px] bg-foreground animate-caret-blink pointer-events-none' />
      )} */}
      {valid && !clearHovered && (
        <span
          onMouseEnter={() => setClearHovered(true)}
          onMouseLeave={() => setClearHovered(false)}
          className='absolute right-2 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground/100 cursor-pointer size-4 lg:size-7 '>
          <CircleCheck className='text-emerald-600 font-bold ' />
        </span>
      )}
      {(invalid || clearHovered) && (
        <span
          onMouseEnter={() => setClearHovered(true)}
          onMouseLeave={() => setClearHovered(false)}
          className='absolute right-2 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground/100 cursor-pointer size-4 lg:size-7 '
          onClick={handleReset}>
          <CircleX
            className={cn(
              "text-red-600 font-bold ",
              clearHovered && "font-semibold spin-in-90 scale-110"
            )}
          />
        </span>
      )}

      {showSuggestions && (
        <ul className='absolute z-50 w-full bg-white shadow-md rounded mt-1 max-h-60 overflow-auto'>
          {results.map((org, idx) => (
            <li
              key={org._id}
              onMouseDown={() => handleSelect(org)}
              className={cn(
                "p-2 pl-4 gap-x-4 cursor-pointer flex items-center relative",
                selectedIndex === idx
                  ? "bg-salYellow/50"
                  : "hover:bg-salYellow/40"
              )}>
              {org.logo && (
                <Image
                  src={org.logo}
                  alt={org.organizationName}
                  width={35}
                  height={35}
                  className='rounded-full'
                />
              )}
              {org.organizationName}
              {org.organizationName.toLowerCase() ===
                inputValue.toLowerCase() && (
                <Check className='absolute right-6 top-1/2 -translate-y-1/2 text-foreground font-bold ' />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
