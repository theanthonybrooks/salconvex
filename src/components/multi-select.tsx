import type { VariantProps } from "class-variance-authority";
import type {
  ButtonHTMLAttributes,
  ComponentType,
  KeyboardEvent,
  Ref,
} from "react";

import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { cva } from "class-variance-authority";

import { FaCheck } from "react-icons/fa";
import {
  ChevronDown,
  ChevronUp,
  DollarSign,
  WandSparkles,
  X,
  XIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/helpers/utilsFns";

// src/components/multi-select.tsx

interface BaseOption<T extends string = string> {
  full?: string;
  label: string;
  value: T;
  group?: string;
  icon?: ComponentType<{ className?: string }>;
  abbr?: string;
  disabled?: boolean;
  premium?: boolean;
}

/**
 * Variants for the multi-select component to handle different styles.
 * Uses class-variance-authority (cva) to define different styles based on "variant" prop.
 */
const multiSelectVariants = cva("mx-[2px]", {
  variants: {
    variant: {
      basic: "border-1.5 bg-white text-foreground hover:bg-white",
      default: "border-foreground/10 bg-card text-foreground hover:bg-card",
      secondary:
        "border-foreground/10 bg-secondary text-secondary-foreground hover:bg-secondary/80",
      destructive:
        "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
      inverted: "inverted",
      ghost:
        "border-transparent bg-transparent text-foreground hover:bg-background/15 focus:ring-transparent",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

/**
 * Props for MultiSelect component
 */
interface MultiSelectProps<T extends string>
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof multiSelectVariants> {
  /**
   * An array of option objects to be displayed in the multi-select component.
   * Each option object has a label, value, and an optional icon.
   */
  // options: {
  //   /** The text to display for the option. */
  //   full?: string;
  //   label: string;
  //   /** The unique value associated with the option. */
  //   value: string;
  //   /** The group label associated with the option. */
  //   group?: string;
  //   /** Optional icon component to display alongside the option. */
  //   icon?: ComponentType<{ className?: string }>;
  //   abbr?: string;
  //   disabled?: boolean;
  //   premium?: boolean;
  // }[];
  options: BaseOption<T>[];

  /**
   * Callback function triggered when the selected values change.
   * Receives an array of the new selected values.
   */
  onValueChange: (value: string[]) => void;

  /**Callback is called when the user clicks on the update button */
  manualUpdate?: boolean;

  /** The default selected values when the component mounts. */
  defaultValue?: string[];

  /** The lockedValue will define values that must be selected and will be from the start */
  lockedValue?: string[];
  /**
   * Placeholder text to be displayed when no values are selected.
   * Optional, defaults to "Select options".
   */
  placeholder?: string;

  /** Has search input - allows hiding if not needed */
  hasSearch?: boolean;

  /** Show select all option */
  selectAll?: boolean;
  /**
   * Animation duration in seconds for the visual effects (e.g., bouncing badges).
   * Optional, defaults to 0 (no animation).
   */

  showArrow?: boolean;

  /** Show compact version of the component without side separator and down chevron. Shows only [num] selected in a single badge rather than displaying multiple options.*/
  compact?: boolean;

  condensed?: boolean;
  /** Similar to compact, aside from it still showing the X icon. May combine these at some point when I have a chance to dig in and see what differs */

  animation?: number;

  /**
   * Maximum number of items to display. Extra selected items will be summarized.
   * Optional, defaults to 3.
   */
  maxCount?: number;

  /**
   * The modality of the popover. When set to true, interaction with outside elements
   * will be disabled and only popover content will be visible to screen readers.
   * Optional, defaults to false.
   */
  modalPopover?: boolean;

  /**
   * If true, renders the multi-select component as a child of another component.
   * Optional, defaults to false.
   */
  asChild?: boolean;

  /**
   * Additional class names to apply custom styles to the multi-select component.
   * Optional, can be used to add custom styles.
   */
  fontSize?: string;
  className?: string;
  badgeClassName?: string;
  textClassName?: string;
  listClassName?: string;
  groupClassName?: string;
  height?: number;
  shortResults?: boolean;

  value?: string[];
  id?: string;
  limit?: number;
  shiftOffset?: number;
  tabIndex?: number;
  abbreviated?: boolean;
  showIcon?: boolean;
  fallbackValue?: string[];
}

export const MultiSelect = forwardRef(
  <T extends string>(
    {
      options,
      onValueChange,
      manualUpdate = false,
      value,
      defaultValue = [],
      lockedValue = [],
      tabIndex = 0,
      height = 10,
      animation = 0,
      maxCount = 3,
      hasSearch = true,
      selectAll = true,
      abbreviated = false,
      shortResults = false,
      compact = false,
      condensed = false,
      placeholder = "Select options",
      showIcon = true,
      fontSize,
      ...props
    }: Omit<MultiSelectProps<T>, "ref">,
    ref: Ref<HTMLButtonElement>,
  ) => {
    const {
      variant,
      shiftOffset,
      showArrow,
      className,
      badgeClassName,
      textClassName,
      listClassName,
      groupClassName,
      disabled,
      limit,
      fallbackValue,
      id,
    } = props;
    const [selectedValues, setSelectedValues] =
      useState<string[]>(defaultValue);
    const [pendingValues, setPendingValues] = useState<string[]>(defaultValue);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const commandInputRef = useRef<HTMLInputElement>(null);
    const firstItemRef = useRef<HTMLDivElement>(null);
    const displayValues = manualUpdate ? pendingValues : selectedValues;
    const hasPendingChanges =
      manualUpdate &&
      (pendingValues.length !== selectedValues.length ||
        pendingValues.some((v) => !selectedValues.includes(v)));

    const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        setIsPopoverOpen(true);
      } else if (event.key === "Backspace" && !event.currentTarget.value) {
        const newSelectedValues = [...displayValues];
        newSelectedValues.pop();
        setSelectedValues(newSelectedValues);
        onValueChange(newSelectedValues);
      }
    };

    const toggleOption = (option: string) => {
      if (lockedValue?.includes(option)) return;

      const isSelected = displayValues.includes(option);
      if (!isSelected && limit && displayValues.length >= limit) return;

      let newSelectedValues = displayValues.includes(option)
        ? displayValues.filter((value) => value !== option)
        : [...displayValues, option];

      if (newSelectedValues.length === 0 && fallbackValue?.length) {
        newSelectedValues = [...fallbackValue];
      }
      if (manualUpdate) {
        setPendingValues(newSelectedValues);
      } else {
        setSelectedValues(newSelectedValues);
        onValueChange(newSelectedValues);
      }
    };

    const handleClear = useCallback(() => {
      let newValues = [...lockedValue];
      if (newValues.length === 0 && fallbackValue?.length) {
        newValues = [...fallbackValue];
      }

      if (manualUpdate) {
        setPendingValues(newValues);
      } else {
        setSelectedValues(newValues);
        onValueChange([]);
      }
    }, [manualUpdate, lockedValue, fallbackValue, onValueChange]);

    const forceClear = useCallback(() => {
      let newValues = [...lockedValue];
      if (newValues.length === 0 && fallbackValue?.length) {
        newValues = [...fallbackValue];
      }

      setSelectedValues(newValues);
      setPendingValues(newValues);
      onValueChange([]);
    }, [lockedValue, fallbackValue, onValueChange]);

    const handleTogglePopover = () => {
      setIsPopoverOpen((prev) => !prev);
    };

    const clearExtraOptions = () => {
      const newValues = displayValues.slice(0, maxCount);
      if (manualUpdate) {
        setPendingValues(newValues);
      } else {
        setSelectedValues(newValues);
        onValueChange(newValues);
      }
    };

    const toggleAll = () => {
      const allValues = options.map((option) => option.value);

      if (displayValues.length === options.length) {
        if (manualUpdate) {
          setPendingValues([]);
        } else {
          handleClear();
        }
      } else {
        if (manualUpdate) {
          setPendingValues(allValues);
        } else {
          setSelectedValues(allValues);
          onValueChange(allValues);
        }
      }
    };

    useEffect(() => {
      if (value !== undefined) {
        setSelectedValues([...value]);
        setPendingValues([...value]);
      }
    }, [value]);

    useEffect(() => {
      if (isPopoverOpen) {
        const timeout = setTimeout(() => {
          if (hasSearch && commandInputRef.current) {
            commandInputRef.current.focus();
          } else if (firstItemRef.current) {
            firstItemRef.current.focus();
          }
        }, 0);
        return () => clearTimeout(timeout);
      }
    }, [isPopoverOpen, hasSearch]);

    return (
      <Popover
        open={isPopoverOpen}
        onOpenChange={(open) => {
          if (!open && manualUpdate && hasPendingChanges) {
            setSelectedValues(pendingValues);
            onValueChange(pendingValues);
          }
          setIsPopoverOpen(open);
        }}
        modal
      >
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            // {...props}
            tabIndex={tabIndex}
            onClick={handleTogglePopover}
            disabled={disabled}
            // style={{ height: `${height * 4}px` }}
            className={cn(
              "flex h-11 w-full min-w-40 items-center justify-between truncate rounded-md border bg-card p-1 text-foreground hover:bg-card focus:ring-1 focus:ring-black disabled:pointer-events-none disabled:border-foreground/30 disabled:opacity-50 disabled:hover:bg-transparent sm:h-9 [&_svg]:pointer-events-auto",
              multiSelectVariants({ variant }),
              variant === "basic" ? "border-foreground" : "",
              className,
            )}
            fontSize={fontSize}
          >
            {displayValues.length > 0 ? (
              <div
                className={cn(
                  "flex w-full items-center justify-between border-stone-300",
                  disabled && "pointer-events-none",
                )}
              >
                <div className="jack flex flex-wrap items-center">
                  {!shortResults &&
                    displayValues.slice(0, maxCount).map((value) => {
                      const option = options.find((o) => o.value === value);
                      const IconComponent = option?.icon;
                      return (
                        <Badge
                          disabled={disabled}
                          key={value}
                          className={cn(
                            "m-0 first:ml-0",
                            isAnimating ? "animate-bounce" : "",
                            multiSelectVariants({ variant }),
                            badgeClassName,
                          )}
                          style={{
                            animationDuration: `${animation}s`,
                            height: `${height * 4 - 8}px`,
                          }}
                        >
                          {IconComponent && showIcon && (
                            <IconComponent className="mr-2 size-4" />
                          )}
                          <p
                            className={cn(
                              "text-sm font-normal",
                              textClassName,
                              fontSize,
                            )}
                          >
                            {abbreviated ? option?.abbr : option?.label}
                          </p>
                          {!lockedValue?.includes(value) &&
                            !condensed &&
                            !disabled && (
                              <X
                                className={cn("ml-2 size-3 cursor-pointer")}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  toggleOption(value);
                                }}
                              />
                            )}
                        </Badge>
                      );
                    })}
                  {!shortResults && displayValues.length > maxCount && (
                    <Badge
                      disabled={disabled}
                      className={cn(
                        "border-foreground/1 bg-transparent text-foreground hover:bg-salPink/40",
                        isAnimating ? "animate-bounce" : "",
                        badgeClassName,
                      )}
                      style={{
                        animationDuration: `${animation}s`,
                        height: `${height * 4 - 8}px`,
                      }}
                    >
                      {condensed || compact ? (
                        <> {displayValues.length - maxCount}</>
                      ) : (
                        <>
                          {`+ ${displayValues.length - maxCount} more`}

                          {!disabled && (
                            <X
                              className={cn(
                                "ml-2 size-3 cursor-pointer",
                                disabled &&
                                  "pointer-events-none border-foreground/50 opacity-50",
                              )}
                              onClick={(event) => {
                                event.stopPropagation();
                                clearExtraOptions();
                              }}
                            />
                          )}
                        </>
                      )}
                    </Badge>
                  )}
                  {shortResults && (
                    <Badge
                      disabled={disabled}
                      variant="basic"
                      className={cn(
                        "border-foreground/1 bg-transparent text-foreground hover:bg-salPink/50",
                        isAnimating ? "animate-bounce" : "",
                        badgeClassName,
                      )}
                      style={{ animationDuration: `${animation}s` }}
                    >
                      {`${displayValues.length} selected`}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  {!compact && (
                    <XIcon
                      className={cn(
                        "mx-2 h-4 cursor-pointer text-foreground/50 hover:scale-110 hover:text-red-600",
                        disabled &&
                          "pointer-events-none border-foreground/50 opacity-50",
                      )}
                      onClick={(event) => {
                        event.stopPropagation();
                        forceClear();
                      }}
                    />
                  )}
                  {!shortResults && !compact && (
                    <>
                      <Separator
                        orientation="vertical"
                        className="flex h-full min-h-6"
                      />
                      {isPopoverOpen ? (
                        <ChevronUp className="mx-2 h-4 cursor-pointer text-foreground/50" />
                      ) : (
                        <ChevronDown className="mx-2 h-4 cursor-pointer text-foreground/50" />
                      )}
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div
                className={cn(
                  "mx-auto flex w-full items-center justify-between",
                  disabled && "pointer-events-none",
                )}
              >
                <span
                  className={cn(
                    "mx-3 text-sm font-normal text-foreground/50",
                    textClassName,
                    fontSize,
                  )}
                >
                  {placeholder}
                </span>
                {isPopoverOpen ? (
                  <ChevronUp
                    className={cn(
                      "mx-2 h-4 cursor-pointer text-foreground/50",
                      disabled &&
                        "pointer-events-none cursor-default opacity-50",
                    )}
                  />
                ) : (
                  <ChevronDown
                    className={cn(
                      "mx-2 h-4 cursor-pointer text-foreground/50",
                      disabled &&
                        "pointer-events-none cursor-default opacity-50",
                    )}
                  />
                )}
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          side="bottom"
          shiftOffset={shiftOffset}
          showCloseButton={false}
          showArrow={showArrow}
          className={cn(
            "z-top w-[--radix-popover-trigger-width] border border-foreground p-0",
            // hasSearch ? "w-auto" : "w-full min-w-[200px]",
            variant === "basic" ? "border-foreground" : "",
          )}
          align="start"
          onEscapeKeyDown={() => setIsPopoverOpen(false)}
        >
          <Command>
            {hasSearch && (
              <CommandInput
                id={id}
                placeholder="Search..."
                onKeyDown={handleInputKeyDown}
                ref={commandInputRef}
              />
            )}
            <CommandList className={listClassName}>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup className={cn("scrollable invis", groupClassName)}>
                {selectAll && (
                  <CommandItem
                    key="all"
                    onSelect={toggleAll}
                    className="cursor-pointer data-[selected='true']:bg-primary data-[selected='true']:text-primary-foreground"
                  >
                    <div
                      className={cn(
                        "mr-2 flex size-4 items-start justify-center rounded-sm border border-primary",
                        displayValues.length === options.length
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible",
                      )}
                    >
                      <FaCheck className="size-3 translate-y-[1.1px]" />
                    </div>
                    <span className={cn("text-base sm:text-sm", fontSize)}>
                      (Select All)
                    </span>
                  </CommandItem>
                )}
                {options.some((o) => o.group) ? (
                  // note-to-self: For grouped results
                  Object.entries(
                    options.reduce<Record<string, typeof options>>(
                      (acc, curr) => {
                        const group = curr.group ?? "Ungrouped";
                        if (!acc[group]) acc[group] = [];
                        acc[group].push(curr);
                        return acc;
                      },
                      {},
                    ),
                  ).map(([group, groupOptions]) => (
                    <CommandGroup
                      key={group}
                      heading={group === "Ungrouped" ? undefined : group}
                      className={cn(
                        "scrollable mini justy max-h-64",
                        groupClassName,
                      )}
                    >
                      {groupOptions.map((option, idx) => {
                        const isSelected = displayValues.includes(option.value);
                        const isDisabled =
                          option.disabled ||
                          !!(
                            !isSelected &&
                            limit &&
                            displayValues.length >= limit
                          );
                        return (
                          <CommandItem
                            ref={idx === 0 ? firstItemRef : null}
                            key={option.value}
                            onSelect={() => toggleOption(option.value)}
                            disabled={isDisabled}
                            className={cn("cursor-pointer")}
                            tabIndex={0}
                          >
                            <div
                              className={cn(
                                "mr-2 flex size-4 items-start justify-center rounded-sm border border-primary",
                                isSelected
                                  ? "bg-primary text-primary-foreground"
                                  : "opacity-50 [&_svg]:invisible",
                              )}
                            >
                              <FaCheck className="size-3 translate-y-[1.1px]" />
                            </div>
                            {option.icon && (
                              <option.icon className="mr-2 size-4 text-foreground/50" />
                            )}
                            {option.premium && (
                              <span className="flex items-center gap-0">
                                (<DollarSign className="size-3" />)
                              </span>
                            )}
                            <span
                              className={cn("text-base sm:text-sm", fontSize)}
                            >
                              {abbreviated ? option?.abbr : option?.label}
                            </span>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  ))
                ) : (
                  //note-to-self: For non-grouped results
                  <CommandGroup className="scrollable mini justy max-h-64">
                    {options.map((option, idx) => {
                      const isSelected = displayValues.includes(option.value);
                      const isDisabled =
                        option.disabled ||
                        !!(
                          !isSelected &&
                          limit &&
                          displayValues.length >= limit
                        );
                      return (
                        <CommandItem
                          ref={idx === 0 ? firstItemRef : null}
                          disabled={isDisabled}
                          key={option.value}
                          onSelect={() => toggleOption(option.value)}
                          className="cursor-pointer"
                          tabIndex={0}
                        >
                          <div
                            className={cn(
                              "mr-2 flex size-4 items-start justify-center rounded-sm border border-primary",
                              isSelected
                                ? "bg-card text-foreground"
                                : "opacity-50 [&_svg]:invisible",
                            )}
                          >
                            <FaCheck className="size-3 translate-y-[1.1px]" />
                          </div>
                          {option.premium && (
                            <span className="flex items-center gap-0">
                              (<DollarSign className="size-3" />)
                            </span>
                          )}
                          {option.icon && (
                            <option.icon className="mr-2 size-4 text-foreground/50" />
                          )}
                          <span
                            className={cn("text-base sm:text-sm", fontSize)}
                          >
                            {abbreviated ? option?.abbr : option?.label}
                          </span>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                )}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup className="border-t border-muted-foreground/30">
                <div className="flex items-center justify-between">
                  {displayValues.length > 0 && (
                    <>
                      <CommandItem
                        onSelect={handleClear}
                        className="flex-1 cursor-pointer justify-center"
                        fontSize={fontSize}
                      >
                        Clear
                      </CommandItem>
                      <Separator
                        orientation="vertical"
                        className="mx-1 flex h-full min-h-6"
                      />
                    </>
                  )}
                  {manualUpdate && hasPendingChanges ? (
                    <CommandItem
                      onSelect={() => {
                        setSelectedValues(pendingValues);
                        onValueChange(pendingValues);
                        setIsPopoverOpen(false);
                      }}
                      className="flex-1 cursor-pointer justify-center"
                      fontSize={fontSize}
                    >
                      Update
                    </CommandItem>
                  ) : (
                    <CommandItem
                      onSelect={() => setIsPopoverOpen(false)}
                      className="max-w-full flex-1 cursor-pointer justify-center"
                      fontSize={fontSize}
                    >
                      Close
                    </CommandItem>
                  )}
                </div>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
        {animation > 0 && displayValues.length > 0 && (
          <WandSparkles
            className={cn(
              "my-2 h-3 w-3 cursor-pointer bg-background text-foreground",
              isAnimating ? "" : "text-foreground/50",
            )}
            onClick={() => setIsAnimating(!isAnimating)}
          />
        )}
      </Popover>
    );
  },
);

MultiSelect.displayName = "MultiSelect";
