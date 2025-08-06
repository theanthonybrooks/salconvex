import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  MdOutlineCheckBox,
  MdOutlineCheckBoxOutlineBlank,
} from "react-icons/md";

interface SearchMappedMultiSelectProps<T> {
  values: string[];
  data: Record<string, T[]>;
  getItemLabel: (item: T) => string;
  //   getItemDisplay: (item: T) => string
  getItemValue: (item: T) => string;
  onChange: (values: string[]) => void;
  searchFields: string[];
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  hideGroupLabels?: boolean;
  enableGroupSelect?: boolean;
  selectLimit?: number;
  displayLimit?: number;
  tabIndex?: number;
  required?: boolean;
}

export function SearchMappedMultiSelect<T>({
  values = [],
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
  enableGroupSelect = false,
  selectLimit,
  displayLimit = 1,
  tabIndex,
  required,
}: SearchMappedMultiSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const inputRef = useRef<HTMLInputElement | null>(null);
  const isLimit = values?.length === selectLimit;

  // console.log("input ref", inputRef.current)

  function getNestedValue<T>(obj: T, path: string): unknown {
    return path.split(".").reduce((acc, key) => {
      if (acc && typeof acc === "object") {
        const current = acc as Record<string, unknown>;
        return current[key];
      }
      return undefined;
    }, obj as unknown);
  }

  const matchesSearch = (item: T) => {
    const lowerSearch = searchQuery.toLowerCase();

    return searchFields.some((path) => {
      const value = getNestedValue(item, path);

      if (Array.isArray(value)) {
        return value.some((entry) =>
          typeof entry === "string"
            ? entry.toLowerCase().includes(lowerSearch)
            : false,
        );
      }

      if (typeof value === "string") {
        return value.toLowerCase().includes(lowerSearch);
      }

      if (typeof value === "number") {
        return value.toString().includes(lowerSearch);
      }

      return false;
    });
  };

  const filteredData = Object.entries(data).reduce<Record<string, T[]>>(
    (acc, [group, items]) => {
      const filteredItems = items.filter(matchesSearch);
      if (filteredItems.length) acc[group] = filteredItems;
      return acc;
    },
    {},
  );

  function getGroupState(
    groupItems: T[],
    selectedValues: string[],
  ): "checked" | "indeterminate" | "unchecked" {
    const itemValues = groupItems.map(getItemValue);
    const selectedInGroup = itemValues.filter((val) =>
      selectedValues.includes(val),
    ).length;

    if (selectedInGroup === 0) return "unchecked";
    if (selectedInGroup === itemValues.length) return "checked";
    return "indeterminate";
  }

  const onClear = (e: React.MouseEvent<SVGSVGElement>) => {
    e.stopPropagation();
    onChange([]);
    setIsOpen(false);
  };

  // useEffect(() => {
  //   if (isOpen && inputRef.current) {
  //     inputRef.current.focus()
  //   }
  // }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 10);
    }
  }, [isOpen]);

  return (
    <div translate="no">
      <Popover open={isOpen} onOpenChange={setIsOpen} modal={true}>
        <PopoverTrigger asChild tabIndex={tabIndex}>
          <Button
            variant="outline"
            className={cn(
              "relative flex h-10 w-full items-center justify-between truncate border-foreground/20 bg-card py-1 pl-2 pr-3 font-normal hover:bg-background/20 focus:ring-1 focus:ring-foreground",
              className,
              required && values?.length === 0 && "bg-salYellow/50",
            )}
            disabled={disabled}
          >
            <span className={cn("truncate")}>
              {values?.length > 0 ? (
                <div className="flex items-center justify-start gap-1">
                  {values?.slice(0, displayLimit).map((val) => (
                    <span
                      key={val}
                      className="max-w-[18ch] truncate rounded border border-foreground/50 px-2 py-0.5 text-sm"
                    >
                      {getItemLabel(
                        Object.values(data)
                          .flat()
                          .find((item) => getItemValue(item) === val)!,
                      )}
                    </span>
                  ))}
                  {values?.length > displayLimit && (
                    <span className="flex items-center text-sm text-muted-foreground">
                      +{values?.length - displayLimit} more
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-foreground/50">{placeholder}</span>
              )}
            </span>

            {isOpen ? (
              <ChevronUp className="absolute right-3 size-4 origin-center text-foreground/50" />
            ) : (
              <ChevronDown className="absolute right-3 size-4 origin-center text-foreground/50" />
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="end"
          className="relative w-full min-w-[280px] border-1.5 p-0"
          showCloseButton={false}
        >
          <Command shouldFilter={false}>
            <CommandInput
              ref={inputRef}
              placeholder={
                isLimit
                  ? "Max 3 selected"
                  : values?.length > 0 && selectLimit
                    ? `Select up to ${selectLimit - values?.length} more`
                    : "Search..."
              }
              // autoFocus
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="pr-18 text-base sm:text-sm"
              translate="no"
            />
            {values?.length > 0 && (
              <span className="group absolute right-3 top-2 flex cursor-pointer items-center gap-1 hover:scale-105">
                <p className="text-sm text-foreground/50">Reset</p>
                <X
                  className="size-5 text-foreground/50 group-hover:text-red-600 group-active:scale-95"
                  onClick={onClear}
                />
              </span>
            )}

            <CommandList
              className="scrollable mini darkbar max-h-36"
              translate="no"
            >
              {Object.entries(filteredData).map(([group, items]) => (
                // <CommandGroup
                //   key={group}
                //   {...(!hideGroupLabels && { heading: group })}
                // >
                <CommandGroup
                  key={group}
                  {...(!hideGroupLabels && {
                    heading: enableGroupSelect ? (
                      <div
                        className="flex cursor-pointer items-center gap-2 border-b-1.5 border-foreground/50 pb-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (
                            isLimit &&
                            getGroupState(items, values) === "unchecked"
                          )
                            return; // prevent adding over limit

                          const groupItems = items;
                          const groupItemValues = groupItems.map(getItemValue);
                          const groupState = getGroupState(groupItems, values);

                          if (
                            groupState === "checked" ||
                            groupState === "indeterminate"
                          ) {
                            // Deselect all group items
                            onChange(
                              values.filter(
                                (val) => !groupItemValues.includes(val),
                              ),
                            );
                          } else {
                            const remaining = selectLimit
                              ? selectLimit - values.length
                              : groupItemValues.length;
                            if (remaining < 1) return;
                            const toAdd = groupItemValues
                              .filter((val) => !values.includes(val))
                              .slice(0, remaining);
                            onChange([...values, ...toAdd]);
                          }
                        }}
                      >
                        <span
                          className={cn(
                            "flex cursor-pointer items-center",
                            isLimit &&
                              getGroupState(items, values) === "unchecked" &&
                              "cursor-not-allowed text-foreground/50",
                          )}
                        >
                          {(() => {
                            const groupState = getGroupState(items, values);
                            if (groupState === "checked")
                              return <MdOutlineCheckBox className="h-4 w-4" />;
                            if (groupState === "indeterminate")
                              return (
                                <MdOutlineCheckBox className="h-4 w-4 opacity-60" />
                              );
                            return (
                              <MdOutlineCheckBoxOutlineBlank className="h-4 w-4" />
                            );
                          })()}
                        </span>
                        <span>{group}</span>
                      </div>
                    ) : (
                      <span>{group}</span>
                    ),
                  })}
                >
                  {items.map((item) => {
                    const itemValue = getItemValue(item);
                    const isSelected = values?.includes(itemValue);

                    return (
                      <CommandItem
                        key={itemValue}
                        onSelect={() => {
                          if (
                            !isSelected &&
                            selectLimit &&
                            values?.length >= selectLimit
                          )
                            return;

                          const newValues = isSelected
                            ? values?.filter((val) => val !== itemValue)
                            : [...values, itemValue];

                          onChange(newValues);
                        }}
                        className={cn(
                          "flex items-center justify-start gap-x-2 hover:cursor-pointer hover:bg-salPink/30 data-[selected='true']:ring-2 data-[selected='true']:ring-salPink",
                          isSelected && "bg-salYellow",
                          isLimit && "hover:cursor-default",
                          isLimit && !isSelected && "text-foreground/50",
                        )}
                      >
                        {isSelected && (
                          <MdOutlineCheckBox className="h-4 w-4" />
                        )}
                        {!isSelected && (
                          <MdOutlineCheckBoxOutlineBlank className="h-4 w-4" />
                        )}
                        {getItemLabel(item)}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
