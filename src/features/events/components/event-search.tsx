import { cn } from "@/lib/utils"
import { useQuery } from "convex/react"
import { AnimatePresence, motion } from "framer-motion"
import { Check, CircleCheck, CircleX, Search } from "lucide-react"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { api } from "~/convex/_generated/api"
import { Doc } from "~/convex/_generated/dataModel"

interface OrgSearchProps {
  value:
    | string
    | {
        organizationName: string
      }
    | null
  onChange: (
    value:
      | string
      | {
          organizationName: string
        }
      | null
  ) => void
  placeholder?: string
  className?: string
  isValid?: string
  onReset?: () => void
  onLoadClick: (org: Doc<"organizations"> | null) => void
}

export const OrgSearch = ({
  value,
  onChange,
  placeholder,
  className,
  isValid,
  onReset,
  onLoadClick,
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
  const [selectedVal, setSelectedVal] = useState<string>("")
  const itemRefs = useRef<(HTMLLIElement | null)[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const orgInputRef = useRef<HTMLInputElement>(null)
  const trimmedQuery = inputValue.trim()
  const results = useQuery(
    api.organizer.organizations.getUserOrganizations,
    hasUserInteracted ? { query: trimmedQuery || "" } : "skip"
  )
  const showSuggestions = focused && results && results.length > 0

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value
    setInputValue(newVal)
    onChange(newVal)
    onLoadClick(null)
  }

  const handleSelect = (org: Doc<"organizations">) => {
    console.log("organization: ", org)
    onChange(org.organizationName)
    setInputValue(org.organizationName)
    setSelectedVal(org.organizationName)
    onLoadClick(org)
    setFocused(false)
  }

  const handleReset = () => {
    setInputValue("")
    onLoadClick(null)
    if (value !== null) onChange(null)
    if (onReset) onReset()
    orgInputRef.current?.focus()
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
      // setSelectedVal(results[selectedIndex].organizationName)
    } else if (e.key === "Escape") {
      setFocused(false)
      setSelectedIndex(-1)
    }
  }

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

  useEffect(() => {
    const selectedEl = itemRefs.current[selectedIndex]
    if (selectedEl) {
      selectedEl.scrollIntoView({ behavior: "smooth", block: "nearest" })
    }
  }, [selectedIndex])

  return (
    <div
      className='relative  max-w-sm lg:max-w-md lg:min-w-[400px] mx-auto'
      ref={containerRef}>
      <section className='relative z-[51]'>
        <input
          ref={orgInputRef}
          value={inputValue}
          onChange={handleInputChange}
          autoFocus={false}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 100)}
          onKeyDown={(e) => {
            if (!hasUserInteracted) setHasUserInteracted(true)
            handleKeyDown(e)
          }}
          placeholder={placeholder}
          maxLength={35}
          className={cn(
            " w-full border p-2 pl-8 pr-10 lg:pr-14 lg:pl-14 rounded",
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
          <CircleCheck
            onMouseEnter={() => setClearHovered(true)}
            onMouseLeave={() => setClearHovered(false)}
            className='text-emerald-600 font-bold absolute right-[9px] lg:right-4 top-1/2 -translate-y-1/2  cursor-pointer size-6 lg:size-7 '
          />
        )}
        {(invalid || clearHovered) && (
          <CircleX
            onMouseEnter={() => setClearHovered(true)}
            onMouseLeave={() => setClearHovered(false)}
            onClick={handleReset}
            className={cn(
              " absolute right-[9px] lg:right-4 top-1/2 -translate-y-1/2 text-red-600 font-bold cursor-pointer size-6 lg:size-7 ",
              clearHovered && "font-semibold spin-in-90 scale-110"
            )}
          />
        )}
      </section>

      <AnimatePresence>
        {showSuggestions && (
          <motion.ul
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            layout
            className='absolute z-50 top-full left-0 w-full bg-white shadow-md rounded-b max-h-52 overflow-auto border-x border-b pt-6 -translate-y-4 scrollable mini'
            style={{ scrollPaddingTop: "1.2rem" }}>
            {results.map((org, idx) => (
              <li
                key={org._id}
                ref={(el) => {
                  itemRefs.current[idx] = el
                }}
                onMouseDown={() => handleSelect(org)}
                className={cn(
                  "pr-2 pl-4 gap-x-4 cursor-pointer flex items-center relative py-3 ",
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
                  selectedVal.toLowerCase() && (
                  <Check className='absolute right-6 top-1/2 -translate-y-1/2 text-foreground font-bold ' />
                )}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
