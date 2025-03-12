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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Check, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"

interface MappedSelectProps<T> {
  value: string
  data: Record<string, T[]>
  getItemLabel: (item: T) => string
  getItemValue: (item: T) => string
  disabled?: boolean
  onChange: (value: string) => void
}

export function MappedSelect<T>({
  value,
  data,
  getItemLabel,
  getItemValue,
  onChange,
  disabled,
}: MappedSelectProps<T>) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className='w-[280px]'>
        <SelectValue placeholder='Select an option' />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(data).map(([group, items]) => (
          <SelectGroup key={group}>
            <SelectLabel>{group}</SelectLabel>
            {items.map((item) => (
              <SelectItem key={getItemValue(item)} value={getItemValue(item)}>
                {getItemLabel(item)}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  )
}

interface SearchMappedSelectProps<T> {
  value: string
  data: Record<string, T[]>
  getItemLabel: (item: T) => string
  getItemDisplay: (item: T) => string
  getItemValue: (item: T) => string
  // getItemKey?: (item: T) => string
  onChange: (value: string) => void
  searchFields: (keyof T)[] // Specify which fields should be used for searching
  disabled?: boolean
  placeholder?: string
  // width?: string
  className?: string
}

export function SearchMappedSelect<T>({
  value,
  data,
  getItemLabel,
  getItemValue,
  className,
  // getItemKey,
  getItemDisplay,
  onChange,
  searchFields,
  disabled = false,
  placeholder = "Select an option",
}: // width = "w-[280px]",
SearchMappedSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Find the label for the selected item
  const selectedLabel = Object.values(data)
    .flat()
    .find((item) => getItemValue(item) === value)

  // Function to check if an item matches the search query
  const matchesSearch = (item: T) => {
    const lowerSearch = searchQuery.toLowerCase()
    return searchFields.some((field) => {
      const fieldValue = item[field]
      if (typeof fieldValue === "string") {
        return fieldValue.toLowerCase().includes(lowerSearch)
      } else if (typeof fieldValue === "number") {
        return fieldValue.toString().includes(lowerSearch)
      }
      return false
    })
  }

  // Filter data based on the search query and selected search fields
  const filteredData = Object.entries(data).reduce<Record<string, T[]>>(
    (acc, [group, items]) => {
      const filteredItems = items.filter(matchesSearch)
      if (filteredItems.length) acc[group] = filteredItems
      return acc
    },
    {}
  )

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          className={cn(
            " font-normal relative h-10 border-foreground/20 truncate pr-8 flex items-center justify-center w-full sm:w-[280px] bg-card hover:bg-background/20",
            className
          )}
          disabled={disabled}>
          <span className='truncate'>
            {selectedLabel ? getItemDisplay(selectedLabel) : placeholder}
          </span>
          {isOpen ? (
            <ChevronUp className='absolute right-3 top-2 origin-center text-foreground/50' />
          ) : (
            <ChevronDown className='absolute right-3 top-2 origin-center text-foreground/50' />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align='end' className='min-w-[280px] w-full p-0'>
        <Command>
          <CommandInput
            placeholder='Search...'
            autoFocus
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList className='scrollable'>
            {Object.entries(filteredData).map(([group, items]) => (
              <CommandGroup key={group} heading={group}>
                {items.map((item) => {
                  const itemValue = getItemValue(item)
                  // const itemKey = getItemKey?.(item) ?? itemValue
                  const isSelected = value === itemValue

                  return (
                    <CommandItem
                      key={itemValue}
                      onSelect={() => {
                        onChange(itemValue)
                        setIsOpen(false)
                      }}
                      className={cn(
                        "flex justify-between hover:bg-background/40",
                        isSelected && "bg-salYellow"
                      )}>
                      {getItemLabel(item)}
                      {isSelected && <Check className='h-4 w-4' />}
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
