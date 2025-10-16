import { Column } from "@tanstack/react-table";
import * as React from "react";

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
import { cn } from "@/lib/utils";
import { FaCheck } from "react-icons/fa";
import { TbFilterPlus } from "react-icons/tb";

interface DataTableFacetedFilterProps<TData, TValue> {
  className?: string;
  column?: Column<TData, TValue>;
  forDashboard?: boolean;
  isMobile?: boolean;
  minimalView?: boolean;
  title?: string;
  options: {
    label: string;
    value: string | boolean;
    icon?: React.ComponentType<{ className?: string }>;
    abbr?: string;
  }[];
}

export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
  className,
  forDashboard,
  isMobile,
  minimalView,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const facets = column?.getFacetedUniqueValues();
  // const selectedValues = new Set(column?.getFilterValue() as string[]);
  const selectedValues = new Set(
    ((column?.getFilterValue() as (string | boolean)[]) ?? []).map(String),
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "hidden h-12 items-center gap-1 border-dashed sm:h-10 md:flex",
            className,
            forDashboard && "flex",
            isMobile && "w-full",
          )}
        >
          {title}
          {selectedValues?.size === 0 && (
            <TbFilterPlus className="size-4 text-foreground/60" />
          )}
          {selectedValues?.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="basic"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {selectedValues.size}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedValues.size > 1 || minimalView ? (
                  <Badge
                    variant="basic"
                    className={cn(
                      "rounded-sm px-1 font-normal",
                      minimalView && "px-2",
                    )}
                  >
                    {selectedValues.size} {!minimalView && "selected"}
                  </Badge>
                ) : (
                  options
                    .filter((option) =>
                      selectedValues.has(String(option.value)),
                    )
                    .map((option) => (
                      <Badge
                        variant="basic"
                        key={String(option.value)}
                        className="rounded-sm px-1 font-normal"
                      >
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-fit min-w-[--radix-popover-trigger-width] border-1.5 p-0"
        align={isMobile ? "center" : "start"}
      >
        <Command>
          <CommandInput placeholder={title} />
          <CommandList className="scrollable mini darkbar justy">
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const optionKey = String(option.value);

                const isSelected = selectedValues.has(optionKey);
                return (
                  <CommandItem
                    key={optionKey}
                    onSelect={() => {
                      if (isSelected) {
                        selectedValues.delete(optionKey);
                      } else {
                        selectedValues.add(optionKey);
                      }
                      const filterValues = Array.from(selectedValues);
                      column?.setFilterValue(
                        filterValues.length ? filterValues : undefined,
                      );
                      // console.log(filterValues);
                    }}
                  >
                    <div
                      className={cn(
                        "mr-2 flex size-4 shrink-0 items-center justify-center rounded-sm border border-primary hover:cursor-pointer",
                        isSelected
                          ? "bg-card text-foreground"
                          : "opacity-50 [&_svg]:invisible",
                      )}
                    >
                      <FaCheck className="size-3 translate-y-[1.1px]" />
                    </div>
                    {option.icon && (
                      <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{option.label}</span>
                    {(facets?.get(option.value) ??
                    facets?.get(String(option.value))) ? (
                      <span className="ml-auto size-4 items-center justify-center font-mono text-xs">
                        {facets.get(option.value) ??
                          facets.get(String(option.value))}
                      </span>
                    ) : null}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            <CommandSeparator className="bg-foreground/30" />

            <div className="flex w-full items-center">
              {selectedValues.size > 0 && (
                <>
                  <CommandGroup className="w-full flex-1">
                    <CommandItem
                      onSelect={() => column?.setFilterValue(undefined)}
                      className="justify-center text-center"
                    >
                      Clear
                    </CommandItem>
                    {/* <Separator
                      orientation="vertical"
                      className="mx-1 flex h-full min-h-6"
                    /> */}
                  </CommandGroup>
                </>
              )}

              {selectedValues.size !== options.length && (
                <>
                  {selectedValues.size > 0 && (
                    <Separator
                      orientation="vertical"
                      className="h-full min-h-7 bg-foreground/30"
                    />
                  )}
                  <CommandGroup className="w-full flex-1">
                    <CommandItem
                      onSelect={() => {
                        const allValues = options.map((o) => o.value);
                        column?.setFilterValue(allValues);
                      }}
                      className="justify-center text-center"
                    >
                      Select All
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </div>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
