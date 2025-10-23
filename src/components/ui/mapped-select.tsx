import { useState } from "react";
import { Check, ChevronDown, ChevronUp, X } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/helpers/utilsFns";

interface MappedSelectProps<T> {
  value: string;
  data: Record<string, T[]>;
  getItemLabel: (item: T) => string;
  getItemValue: (item: T) => string;
  disabled?: boolean;
  onChange: (value: string) => void;
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
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="Select an option" />
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
  );
}

interface SearchMappedSelectProps<T> {
  value: string;
  data: Record<string, T[]>;
  getItemLabel: (item: T) => string;
  getItemDisplay: (item: T) => string;
  getItemValue: (item: T) => string;
  // getItemKey?: (item: T) => string
  onChange: (value: string) => void;
  searchFields: string[]; // Specify which fields should be used for searching
  disabled?: boolean;
  placeholder?: string;
  // width?: string
  className?: string;
  tabIndex?: number;
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
  tabIndex = 0,
}: // width = "w-[280px]",
SearchMappedSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  function getNestedValue<T>(obj: T, path: string): unknown {
    return path.split(".").reduce((acc, key) => {
      if (acc && typeof acc === "object") {
        const current = acc as Record<string, unknown>;
        return current[key];
      }
      return undefined;
    }, obj as unknown);
  }

  // Find the label for the selected item
  const selectedLabel = Object.values(data)
    .flat()
    .find((item) => getItemValue(item) === value);

  // Function to check if an item matches the search query
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

  // Filter data based on the search query and selected search fields
  const filteredData = Object.entries(data).reduce<Record<string, T[]>>(
    (acc, [group, items]) => {
      const filteredItems = items.filter(matchesSearch);
      if (filteredItems.length) acc[group] = filteredItems;
      return acc;
    },
    {},
  );

  const onClear = (e: React.MouseEvent<SVGSVGElement>) => {
    e.stopPropagation();
    onChange("");
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen} modal={true}>
      <PopoverTrigger asChild tabIndex={tabIndex}>
        <Button
          variant="outline"
          className={cn(
            "relative flex h-10 w-full items-center justify-center truncate border-foreground/20 bg-card pr-8 font-normal hover:bg-background/20 sm:w-[280px]",
            className,
          )}
          disabled={disabled}
        >
          <span className="truncate">
            {selectedLabel ? getItemDisplay(selectedLabel) : placeholder}
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
        className="w-full min-w-[280px] max-w-[280px] border p-0 sm:max-w-full"
        showCloseButton={false}
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search..."
            autoFocus
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="pr-18 text-base sm:text-sm lg:text-sm"
          />
          {value !== "" && (
            <span className="group absolute right-3 top-2 flex cursor-pointer items-center gap-1 hover:scale-105">
              <p className="text-sm text-foreground/50">Reset</p>
              <X
                className="size-5 text-foreground/50 group-hover:text-red-600 group-active:scale-95"
                onClick={onClear}
              />
            </span>
          )}
          <CommandList className="scrollable mini darkbar max-h-36">
            {Object.entries(filteredData).map(([group, items]) => (
              <CommandGroup key={group} heading={group}>
                {items.map((item) => {
                  const itemValue = getItemValue(item);

                  const isSelected = value === itemValue;

                  return (
                    <CommandItem
                      key={itemValue}
                      onSelect={() => {
                        onChange(itemValue);
                        setIsOpen(false);
                      }}
                      className={cn(
                        "flex justify-between hover:bg-background/40",
                        isSelected && "bg-salYellow",
                      )}
                    >
                      {getItemLabel(item)}
                      {isSelected && <Check className="h-4 w-4" />}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
