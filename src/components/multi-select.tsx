// src/components/multi-select.tsx

import { cva, type VariantProps } from "class-variance-authority"
import {
  CheckIcon,
  ChevronDown,
  ChevronUp,
  WandSparkles,
  X,
  XCircle,
  XIcon,
} from "lucide-react"
import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { useCallback, useEffect } from "react"

/**
 * Variants for the multi-select component to handle different styles.
 * Uses class-variance-authority (cva) to define different styles based on "variant" prop.
 */
const multiSelectVariants = cva("mx-[2px] ", {
  variants: {
    variant: {
      basic: " border-[1.5px] text-foreground bg-white  hover:bg-white",
      default: "border-foreground/10 text-foreground bg-card  hover:bg-card",
      secondary:
        "border-foreground/10 bg-secondary text-secondary-foreground hover:bg-secondary/80",
      destructive:
        "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
      inverted: "inverted",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

/**
 * Props for MultiSelect component
 */
interface MultiSelectProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof multiSelectVariants> {
  /**
   * An array of option objects to be displayed in the multi-select component.
   * Each option object has a label, value, and an optional icon.
   */
  options: {
    /** The text to display for the option. */
    label: string
    /** The unique value associated with the option. */
    value: string
    /** The group label associated with the option. */
    group?: string
    /** Optional icon component to display alongside the option. */
    icon?: React.ComponentType<{ className?: string }>
  }[]

  /**
   * Callback function triggered when the selected values change.
   * Receives an array of the new selected values.
   */
  onValueChange: (value: string[]) => void

  /** The default selected values when the component mounts. */
  defaultValue?: string[]

  /** The lockedValue will define values that must be selected and will be from the start */
  lockedValue?: string[]
  /**
   * Placeholder text to be displayed when no values are selected.
   * Optional, defaults to "Select options".
   */
  placeholder?: string

  /** Has search input - allows hiding if not needed */
  hasSearch?: boolean

  /** Show select all option */
  selectAll?: boolean
  /**
   * Animation duration in seconds for the visual effects (e.g., bouncing badges).
   * Optional, defaults to 0 (no animation).
   */

  animation?: number

  /**
   * Maximum number of items to display. Extra selected items will be summarized.
   * Optional, defaults to 3.
   */
  maxCount?: number

  /**
   * The modality of the popover. When set to true, interaction with outside elements
   * will be disabled and only popover content will be visible to screen readers.
   * Optional, defaults to false.
   */
  modalPopover?: boolean

  /**
   * If true, renders the multi-select component as a child of another component.
   * Optional, defaults to false.
   */
  asChild?: boolean

  /**
   * Additional class names to apply custom styles to the multi-select component.
   * Optional, can be used to add custom styles.
   */
  className?: string
  height?: number
  shortResults?: boolean
  value?: string[]
}

export const MultiSelect = React.forwardRef<
  HTMLButtonElement,
  MultiSelectProps
>(
  (
    {
      value,
      options,
      onValueChange,
      variant,
      height = 10,
      hasSearch = true,
      selectAll = true,
      defaultValue = [],
      lockedValue = [],

      placeholder = "Select options",
      animation = 0,
      maxCount = 3,
      modalPopover = false,
      shortResults = false,
      // asChild = false,
      className,
      ...props
    },
    ref
  ) => {
    const [selectedValues, setSelectedValues] =
      React.useState<string[]>(defaultValue)

    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false)
    const [isAnimating, setIsAnimating] = React.useState(false)

    const handleInputKeyDown = (
      event: React.KeyboardEvent<HTMLInputElement>
    ) => {
      if (event.key === "Enter") {
        setIsPopoverOpen(true)
      } else if (event.key === "Backspace" && !event.currentTarget.value) {
        const newSelectedValues = [...selectedValues]
        newSelectedValues.pop()
        setSelectedValues(newSelectedValues)
        onValueChange(newSelectedValues)
      }
    }

    const toggleOption = (option: string) => {
      if (lockedValue.includes(option)) return
      const newSelectedValues = selectedValues.includes(option)
        ? selectedValues.filter((value) => value !== option)
        : [...selectedValues, option]
      setSelectedValues(newSelectedValues)
      onValueChange(newSelectedValues)
    }

    const handleClear = useCallback(() => {
      setSelectedValues([...lockedValue])
      onValueChange([])
    }, [lockedValue, onValueChange])

    const handleTogglePopover = () => {
      setIsPopoverOpen((prev) => !prev)
    }

    const clearExtraOptions = () => {
      const newSelectedValues = selectedValues.slice(0, maxCount)
      setSelectedValues(newSelectedValues)
      onValueChange(newSelectedValues)
    }

    const toggleAll = () => {
      if (selectedValues.length === options.length) {
        handleClear()
      } else {
        const allValues = options.map((option) => option.value)
        setSelectedValues(allValues)
        onValueChange(allValues)
      }
    }

    useEffect(() => {
      if (value !== undefined) {
        setSelectedValues([...value])
      }
    }, [value])

    // useEffect(() => {
    //   if (defaultValue.length === 0) {
    //     handleClear()
    //   }
    // }, [defaultValue, handleClear])

    // useEffect(() => {
    //   setSelectedValues([...new Set([...defaultValue, ...lockedValue])]) /
    // }, [defaultValue, lockedValue])

    // Group options if any have a group property

    return (
      <Popover
        open={isPopoverOpen}
        onOpenChange={setIsPopoverOpen}
        modal={modalPopover}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            {...props}
            onClick={handleTogglePopover}
            // style={{ height: `${height * 4}px` }}
            className={cn(
              "flex w-full p-1 rounded-md border items-center justify-between bg-stone-100 hover:bg-stone-100 [&_svg]:pointer-events-auto h-[40px] sm:h-[32px] focus:ring-1 focus:ring-black",
              className,
              variant === "basic" ? "border-foreground" : "",
              multiSelectVariants({ variant })
            )}>
            {selectedValues.length > 0 ? (
              <div className='flex justify-between items-center w-full border-stone-300'>
                <div className='flex flex-wrap items-center jack'>
                  {!shortResults &&
                    selectedValues.slice(0, maxCount).map((value) => {
                      const option = options.find((o) => o.value === value)
                      const IconComponent = option?.icon
                      return (
                        <Badge
                          key={value}
                          className={cn(
                            "first:ml-0 m-0",
                            isAnimating ? "animate-bounce" : "",
                            multiSelectVariants({ variant })
                          )}
                          style={{
                            animationDuration: `${animation}s`,
                            height: `${height * 4 - 8}px`,
                          }}>
                          {IconComponent && (
                            <IconComponent className='h-4 w-4 mr-2' />
                          )}
                          <p className='text-sm font-normal'>{option?.label}</p>
                          {!lockedValue.includes(value) && (
                            <X
                              className='ml-2 h-3 w-3 cursor-pointer'
                              onClick={(event) => {
                                event.stopPropagation()
                                toggleOption(value)
                              }}
                            />
                          )}
                        </Badge>
                      )
                    })}
                  {!shortResults && selectedValues.length > maxCount && (
                    <Badge
                      className={cn(
                        "bg-transparent text-foreground border-foreground/1 hover:bg-red-500",
                        isAnimating ? "animate-bounce" : ""
                      )}
                      style={{ animationDuration: `${animation}s` }}>
                      {`+ ${selectedValues.length - maxCount} more`}

                      <XCircle
                        className='ml-2 h-4 w-4 cursor-pointer'
                        onClick={(event) => {
                          event.stopPropagation()
                          clearExtraOptions()
                        }}
                      />
                    </Badge>
                  )}
                  {shortResults && (
                    <Badge
                      variant='basic'
                      className={cn(
                        "bg-transparent text-foreground border-foreground/1  hover:bg-salPink/50",
                        isAnimating ? "animate-bounce" : ""
                      )}
                      style={{ animationDuration: `${animation}s` }}>
                      {`${selectedValues.length} selected`}
                    </Badge>
                  )}
                </div>
                <div className='flex items-center justify-between'>
                  <XIcon
                    className='h-4 mx-2 cursor-pointer text-muted-foreground hover:text-red-600 hover:scale-110'
                    onClick={(event) => {
                      event.stopPropagation()
                      handleClear()
                    }}
                  />
                  {!shortResults && (
                    <>
                      <Separator
                        orientation='vertical'
                        className='flex min-h-6 h-full'
                      />
                      {isPopoverOpen ? (
                        <ChevronUp className='h-4 mx-2 cursor-pointer text-muted-foreground' />
                      ) : (
                        <ChevronDown className='h-4 mx-2 cursor-pointer text-muted-foreground' />
                      )}
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className='flex items-center justify-between w-full mx-auto'>
                <span className='text-sm text-muted-foreground mx-3'>
                  {placeholder}
                </span>
                {isPopoverOpen ? (
                  <ChevronUp className='h-4 mx-2 cursor-pointer text-muted-foreground' />
                ) : (
                  <ChevronDown className='h-4 mx-2 cursor-pointer text-muted-foreground' />
                )}
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className={cn(
            "p-0 max-w-max",
            hasSearch ? "w-auto" : "w-full min-w-[200px]",
            variant === "basic" ? "border-foreground" : ""
          )}
          align='start'
          onEscapeKeyDown={() => setIsPopoverOpen(false)}>
          <Command>
            {hasSearch && (
              <CommandInput
                placeholder='Search...'
                onKeyDown={handleInputKeyDown}
              />
            )}
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {selectAll && (
                  <CommandItem
                    key='all'
                    onSelect={toggleAll}
                    className='cursor-pointer'>
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        selectedValues.length === options.length
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}>
                      <CheckIcon className='h-4 w-4' />
                    </div>
                    <span>(Select All)</span>
                  </CommandItem>
                )}
                {/* {options.map((option) => {
                  const isSelected = selectedValues.includes(option.value)
                  return (
                    <CommandItem
                      key={option.value}
                      onSelect={() => toggleOption(option.value)}
                      className='cursor-pointer'>
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible"
                        )}>
                        <CheckIcon className='h-4 w-4' />
                      </div>
                      {option.icon && (
                        <option.icon className='mr-2 h-4 w-4 text-muted-foreground' />
                      )}
                      <span>{option.label}</span>
                    </CommandItem>
                  )
                })} */}
                {/* {Object.entries(groupedOptions).map(([groupLabel, items]) => (
                  <CommandGroup key={groupLabel} heading={groupLabel}>
                    {items.map((option) => {
                      const isSelected = selectedValues.includes(option.value)
                      return (
                        <CommandItem
                          key={option.value}
                          onSelect={() => toggleOption(option.value)}
                          className='cursor-pointer'>
                          <div
                            className={cn(
                              "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                              isSelected
                                ? "bg-primary text-primary-foreground"
                                : "opacity-50 [&_svg]:invisible"
                            )}>
                            <CheckIcon className='h-4 w-4' />
                          </div>
                          {option.icon && (
                            <option.icon className='mr-2 h-4 w-4 text-muted-foreground' />
                          )}
                          <span>{option.label}</span>
                        </CommandItem>
                      )
                    })}
                  </CommandGroup>
                ))} */}
                {options.some((o) => o.group) ? (
                  Object.entries(
                    options.reduce<Record<string, typeof options>>(
                      (acc, curr) => {
                        const group = curr.group ?? "Ungrouped"
                        if (!acc[group]) acc[group] = []
                        acc[group].push(curr)
                        return acc
                      },
                      {}
                    )
                  ).map(([group, groupOptions]) => (
                    <CommandGroup
                      key={group}
                      heading={group === "Ungrouped" ? undefined : group}>
                      {groupOptions.map((option) => {
                        const isSelected = selectedValues.includes(option.value)
                        return (
                          <CommandItem
                            key={option.value}
                            onSelect={() => toggleOption(option.value)}
                            className='cursor-pointer'>
                            <div
                              className={cn(
                                "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                isSelected
                                  ? "bg-primary text-primary-foreground"
                                  : "opacity-50 [&_svg]:invisible"
                              )}>
                              <CheckIcon className='h-4 w-4' />
                            </div>
                            {option.icon && (
                              <option.icon className='mr-2 h-4 w-4 text-muted-foreground' />
                            )}
                            <span>{option.label}</span>
                          </CommandItem>
                        )
                      })}
                    </CommandGroup>
                  ))
                ) : (
                  <CommandGroup>
                    {options.map((option) => {
                      const isSelected = selectedValues.includes(option.value)
                      return (
                        <CommandItem
                          key={option.value}
                          onSelect={() => toggleOption(option.value)}
                          className='cursor-pointer'>
                          <div
                            className={cn(
                              "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                              isSelected
                                ? "bg-primary text-primary-foreground"
                                : "opacity-50 [&_svg]:invisible"
                            )}>
                            <CheckIcon className='h-4 w-4' />
                          </div>
                          {option.icon && (
                            <option.icon className='mr-2 h-4 w-4 text-muted-foreground' />
                          )}
                          <span>{option.label}</span>
                        </CommandItem>
                      )
                    })}
                  </CommandGroup>
                )}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                <div className='flex items-center justify-between'>
                  {selectedValues.length > 0 && (
                    <>
                      <CommandItem
                        onSelect={handleClear}
                        className='flex-1 justify-center cursor-pointer'>
                        Clear
                      </CommandItem>
                      <Separator
                        orientation='vertical'
                        className='flex min-h-6 h-full'
                      />
                    </>
                  )}
                  <CommandItem
                    onSelect={() => setIsPopoverOpen(false)}
                    className='flex-1 justify-center cursor-pointer max-w-full'>
                    Close
                  </CommandItem>
                </div>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
        {animation > 0 && selectedValues.length > 0 && (
          <WandSparkles
            className={cn(
              "cursor-pointer my-2 text-foreground bg-background w-3 h-3",
              isAnimating ? "" : "text-muted-foreground"
            )}
            onClick={() => setIsAnimating(!isAnimating)}
          />
        )}
      </Popover>
    )
  }
)

MultiSelect.displayName = "MultiSelect"
