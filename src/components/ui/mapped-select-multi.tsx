import { Button } from "@/components/ui/button"
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronUp, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import {
  MdOutlineCheckBox,
  MdOutlineCheckBoxOutlineBlank,
} from "react-icons/md"

interface SearchMappedMultiSelectProps<T> {
  values: string[]
  data: Record<string, T[]>
  getItemLabel: (item: T) => string
  //   getItemDisplay: (item: T) => string
  getItemValue: (item: T) => string
  onChange: (values: string[]) => void
  searchFields: string[]
  disabled?: boolean
  placeholder?: string
  className?: string
  hideGroupLabels?: boolean
  selectLimit?: number
  tabIndex?: number
  required?: boolean
}

export function SearchMappedMultiSelect<T>({
  values,
  data,
  getItemLabel,
  getItemValue,
  className,
  //   getItemDisplay,
  onChange,
  searchFields,
  disabled = false,
  placeholder = "Select options",
  hideGroupLabels = false,
  selectLimit,
  tabIndex,
  required,
}: SearchMappedMultiSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const inputRef = useRef<HTMLInputElement | null>(null)
  const isLimit = values.length === selectLimit

  console.log("input ref", inputRef.current)

  function getNestedValue<T>(obj: T, path: string): unknown {
    return path.split(".").reduce((acc, key) => {
      if (acc && typeof acc === "object") {
        const current = acc as Record<string, unknown>
        return current[key]
      }
      return undefined
    }, obj as unknown)
  }

  const matchesSearch = (item: T) => {
    const lowerSearch = searchQuery.toLowerCase()

    return searchFields.some((path) => {
      const value = getNestedValue(item, path)

      if (Array.isArray(value)) {
        return value.some((entry) =>
          typeof entry === "string"
            ? entry.toLowerCase().includes(lowerSearch)
            : false
        )
      }

      if (typeof value === "string") {
        return value.toLowerCase().includes(lowerSearch)
      }

      if (typeof value === "number") {
        return value.toString().includes(lowerSearch)
      }

      return false
    })
  }

  const filteredData = Object.entries(data).reduce<Record<string, T[]>>(
    (acc, [group, items]) => {
      const filteredItems = items.filter(matchesSearch)
      if (filteredItems.length) acc[group] = filteredItems
      return acc
    },
    {}
  )

  const onClear = (e: React.MouseEvent<SVGSVGElement>) => {
    e.stopPropagation()
    onChange([])
    setIsOpen(false)
  }

  // useEffect(() => {
  //   if (isOpen && inputRef.current) {
  //     inputRef.current.focus()
  //   }
  // }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 10)
    }
  }, [isOpen])

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen} modal={true}>
      <PopoverTrigger asChild tabIndex={tabIndex}>
        <Button
          variant='outline'
          className={cn(
            "font-normal relative h-10 border-foreground/20 truncate  flex items-center justify-between w-full  bg-card hover:bg-background/20 pr-[3px] py-1 pl-2 focus:ring-1 focus:ring-foreground",
            className,
            required && values.length === 0 && "bg-salYellow/50"
          )}
          disabled={disabled}>
          <span className={cn("truncate")}>
            {values.length > 0 ? (
              <div className='flex gap-1 justify-start '>
                {values.slice(0, 1).map((val) => (
                  <span
                    key={val}
                    className='flex items-center gap-1 text-sm px-2 py-0.5 border-foreground/50 border rounded whitespace-nowrap'>
                    {getItemLabel(
                      Object.values(data)
                        .flat()
                        .find((item) => getItemValue(item) === val)!
                    )}
                  </span>
                ))}
                {values.length > 1 && (
                  <span className='text-sm text-muted-foreground'>
                    +{values.length - 1} more
                  </span>
                )}
              </div>
            ) : (
              <span className='text-foreground/50'>{placeholder}</span>
            )}
          </span>

          {isOpen ? (
            <ChevronUp className=' text-foreground/50' />
          ) : (
            <ChevronDown className=' text-foreground/50' />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align='end'
        className='min-w-[280px] w-full p-0 relative border-1.5 '
        showCloseButton={false}>
        <Command shouldFilter={false}>
          <CommandInput
            ref={inputRef}
            placeholder={
              isLimit
                ? "Max 3 selected"
                : values.length > 0 && selectLimit
                ? `Select up to ${selectLimit - values.length} more`
                : "Search..."
            }
            // autoFocus
            value={searchQuery}
            onValueChange={setSearchQuery}
            className='pr-8 text-base lg:text-sm'
          />
          {values.length > 0 && (
            <X
              className='size-6 absolute top-2 right-3 text-black/80 hover:text-red-600 hover:scale-110 cursor-pointer'
              onClick={onClear}
            />
          )}

          <CommandList className='scrollable mini darkbar max-h-36'>
            {Object.entries(filteredData).map(([group, items]) => (
              <CommandGroup
                key={group}
                {...(!hideGroupLabels && { heading: group })}>
                {items.map((item) => {
                  const itemValue = getItemValue(item)
                  const isSelected = values.includes(itemValue)

                  return (
                    <CommandItem
                      key={itemValue}
                      onSelect={() => {
                        if (
                          !isSelected &&
                          selectLimit &&
                          values.length >= selectLimit
                        )
                          return

                        const newValues = isSelected
                          ? values.filter((val) => val !== itemValue)
                          : [...values, itemValue]

                        onChange(newValues)
                      }}
                      className={cn(
                        "flex justify-start gap-x-2 items-center hover:bg-salPink/30 hover:cursor-pointer data-[selected='true']:ring-2 data-[selected='true']:ring-salPink",
                        isSelected && "bg-salYellow",
                        isLimit && "hover:cursor-default",
                        isLimit && !isSelected && " text-foreground/50"
                      )}>
                      {isSelected && <MdOutlineCheckBox className='h-4 w-4' />}
                      {!isSelected && (
                        <MdOutlineCheckBoxOutlineBlank className='h-4 w-4 ' />
                      )}
                      {getItemLabel(item)}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
