"use client";

import { MultiSelect } from "@/components/multi-select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FlairBadge } from "@/components/ui/flair-badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SearchType,
  TheListFilterCommandItem,
} from "@/features/thelist/components/filter-drawer";
import { select_continents } from "@/lib/locations";
import { cn } from "@/lib/utils";
import {
  EventCategory,
  eventCategoryOptions,
  EventType,
  eventTypeOptions,
} from "@/types/event";
import { Continents, Filters, SortOptions } from "@/types/thelist";
import {
  ChevronDown,
  ChevronUp,
  LucideFilter,
  LucideFilterX,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { BiSolidQuoteLeft, BiSolidQuoteRight } from "react-icons/bi";
import { FiCommand, FiSearch } from "react-icons/fi";
import {
  LiaSortAlphaDownAltSolid,
  LiaSortAlphaDownSolid,
  LiaSortNumericDownAltSolid,
  LiaSortNumericDownSolid,
} from "react-icons/lia";

export interface FilterBaseProps {
  isMobile: boolean;
  filters: Filters;
  sortOptions: SortOptions;
  hasActiveFilters: boolean | undefined;

  setOpen: Dispatch<SetStateAction<boolean>>;
  setValue: Dispatch<SetStateAction<string>>;
  searchType?: SearchType;
  setSearchType: Dispatch<SetStateAction<SearchType>>;
  value: string;
  shortcut: string;
  placeholder: string;
  groupedResults?: Record<string, TheListFilterCommandItem[]>;
  onChange: (newFilters: Partial<Filters>) => void;
  onSortChange: (newSort: Partial<SortOptions>) => void;
  onResetFilters: () => void;
  className?: string;
}

export const FilterBase = ({
  isMobile,
  filters,
  sortOptions,
  hasActiveFilters,
  setOpen,
  setValue,
  searchType,
  setSearchType,
  value,
  placeholder,
  onChange,
  onSortChange,
  onResetFilters,
  className,
  shortcut,
  groupedResults,
  // user,
}: FilterBaseProps) => {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showFull, setShowFull] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const notEvent =
    filters.eventCategories?.length !== 0 &&
    !filters.eventCategories?.includes("event");
  const alphaSort = sortOptions.sortBy === "name";

  // useEffect(() => {

  //   if (value.length > 0 && !dropdownOpen) {
  //     setDropdownOpen(true);
  //   }
  // }, [value, dropdownOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      {isMobile ? (
        <div className="flex flex-col items-center gap-4 px-5 sm:hidden [&>section]:w-full [&>section]:flex-1">
          <section className="flex flex-col gap-2">
            <div className="flex justify-between gap-3">
              <Label htmlFor="list-search" className="flex items-center gap-2">
                Search:
              </Label>
              <Label htmlFor="limit" className="flex items-center gap-2">
                Search Type:
              </Label>
            </div>
            <div className="flex justify-between gap-3">
              <div
                className={cn(
                  "relative flex w-full items-center rounded-lg border border-foreground px-2 py-1.5 text-sm text-foreground hover:bg-white/30",
                  className,
                )}
              >
                <FiSearch
                  className="mr-2 size-5 cursor-pointer"
                  onClick={() => {
                    setOpen(true);
                  }}
                />
                <input
                  type="text"
                  onChange={(e) => {
                    setDropdownOpen(true);
                    setValue(e.target.value);
                  }}
                  placeholder={placeholder}
                  value={value}
                  //   value={value}
                  className="focus:outline-hidden w-full flex-1 bg-transparent text-base placeholder:text-foreground/30"
                />
                {groupedResults && dropdownOpen && (
                  <div
                    ref={dropdownRef}
                    className="scrollable mini max-h-70 absolute left-0 top-full z-top mt-2 flex w-[calc(100vw-40px)] flex-col gap-2 rounded-lg border border-foreground bg-card px-5 py-4"
                  >
                    {Object.values(groupedResults).every(
                      (items) => items.length === 0,
                    ) ? (
                      <>
                        {value.length > 0 && (
                          <span className="inline-flex items-center gap-2 text-lg">
                            No results found for
                            <span className="inline-flex items-center gap-[1px] italic">
                              <BiSolidQuoteLeft className="size-1 -translate-y-1" />
                              {value}
                              <BiSolidQuoteRight className="ml-[2px] size-1 -translate-y-1" />
                            </span>
                          </span>
                        )}
                      </>
                    ) : (
                      Object.entries(groupedResults)
                        .filter(([, items]) => items.length > 0)
                        .map(([groupKey, groupItems]) => (
                          <div key={groupKey}>
                            <h3 className="mb-2 mt-3 text-xs font-semibold text-stone-400">
                              {groupKey.toUpperCase()}
                            </h3>
                            <ul className="flex flex-col gap-1">
                              {groupItems.map((item) => (
                                <li
                                  key={item.path}
                                  onClick={() => {
                                    router.push(item.path || "/thelist");
                                    setOpen(false);
                                    setDropdownOpen(false);
                                  }}
                                  className="group flex cursor-pointer items-center rounded-md px-3 py-2 text-base transition-colors active:scale-95 active:underline"
                                >
                                  {groupKey.startsWith("Events") ? (
                                    <div className="grid w-full grid-cols-[1.5fr_auto_1fr] items-center gap-2">
                                      <span className="flex items-center gap-1 truncate">
                                        {item.name}
                                        {item.ocStatus === 2 && (
                                          <FlairBadge>Open Call</FlairBadge>
                                        )}
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="flex w-full justify-between gap-2">
                                      <span className="truncate">
                                        {item.name}
                                      </span>
                                    </div>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))
                    )}
                  </div>
                )}
              </div>

              <section>
                <Select
                  name="searchType"
                  value={searchType}
                  onValueChange={(value) =>
                    setSearchType(value as "events" | "loc" | "orgs" | "all")
                  }
                >
                  <SelectTrigger className="w-32 text-center">
                    <SelectValue placeholder="Search Type" />
                  </SelectTrigger>
                  <SelectContent align="end" className="z-top">
                    <SelectItem value="events">Events</SelectItem>
                    <SelectItem value="orgs">Organizers</SelectItem>
                    <SelectItem value="loc">Location</SelectItem>
                    <SelectItem value="all">All</SelectItem>
                  </SelectContent>
                </Select>
              </section>
            </div>
          </section>
          <div className="flex w-full max-w-full items-center justify-between gap-3">
            <section className="flex flex-1 flex-col gap-2">
              <Label htmlFor="limit" className="flex items-center gap-2">
                Per page:
              </Label>
              <Select
                name="limit"
                value={String(filters.limit)}
                onValueChange={(value) =>
                  onChange({ limit: parseInt(value, 10) })
                }
              >
                <SelectTrigger className="w-full min-w-15 text-center">
                  <SelectValue placeholder="Limit" />
                </SelectTrigger>
                <SelectContent className="min-w-auto z-top">
                  <SelectItem fit value="1">
                    1
                  </SelectItem>
                  <SelectItem fit value="5">
                    5
                  </SelectItem>
                  <SelectItem fit value="10">
                    10
                  </SelectItem>
                  <SelectItem fit value="25">
                    25
                  </SelectItem>
                </SelectContent>
              </Select>
            </section>
            <section className="flex flex-1 flex-col gap-2">
              <Label htmlFor="sortBy" className="flex items-center gap-2">
                Sort by:
              </Label>
              <Select
                name="sortBy"
                value={sortOptions.sortBy}
                onValueChange={(value) =>
                  onSortChange({ sortBy: value as SortOptions["sortBy"] })
                }
              >
                <SelectTrigger className="min-w-25">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent className="z-top">
                  <SelectItem value="openCall">Open Call</SelectItem>
                  <SelectItem value="eventStart">Event Start</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>
            </section>

            <section className="flex flex-col gap-2">
              <Label htmlFor="sortOrder" className="flex items-center gap-2">
                Sort order:
              </Label>
              <Select
                name="sortOrder"
                value={sortOptions.sortDirection}
                onValueChange={(value) =>
                  onSortChange({
                    sortDirection: value as SortOptions["sortDirection"],
                  })
                }
              >
                <SelectTrigger className="w-fit min-w-25 hover:bg-white/30 sm:h-12 [&_span]:flex [&_span]:items-center [&_span]:justify-center [&_span]:gap-1 [&_svg]:size-4">
                  <SelectValue placeholder="Direction" />
                </SelectTrigger>
                <SelectContent className="z-top">
                  <SelectItem value="asc">
                    <span className="flex items-center gap-1 text-nowrap">
                      {alphaSort ? (
                        <LiaSortAlphaDownSolid className="size-4" />
                      ) : (
                        <LiaSortNumericDownSolid className="size-4" />
                      )}
                      Asc
                    </span>
                  </SelectItem>
                  <SelectItem
                    value="desc"
                    className="flex items-center gap-1 text-nowrap"
                  >
                    <span className="flex items-center gap-1 text-nowrap">
                      {/* <LiaSortAlphaDownSolid className="size-4" /> */}
                      {alphaSort ? (
                        <LiaSortAlphaDownAltSolid className="size-4" />
                      ) : (
                        <LiaSortNumericDownAltSolid className="size-4" />
                      )}
                      Desc
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </section>
          </div>

          <section className="flex flex-col gap-2">
            <Label
              htmlFor="eventCategories"
              className="flex items-center gap-2"
            >
              Event Category:
            </Label>
            <MultiSelect
              options={[...eventCategoryOptions]}
              value={filters.eventCategories ?? []}
              onValueChange={(value) =>
                onChange({ eventCategories: value as EventCategory[] })
              }
              placeholder="Category"
              variant="basic"
              selectAll={false}
              hasSearch={false}
              className="w-full border bg-card sm:h-9"
              maxCount={1}
              showArrow={false}
            />
          </section>
          <section className="flex flex-col gap-2">
            <Label htmlFor="eventTypes" className="flex items-center gap-2">
              Event Type:
            </Label>
            <MultiSelect
              options={[...eventTypeOptions]}
              value={filters.eventTypes ?? []}
              onValueChange={(value) =>
                onChange({ eventTypes: value as EventType[] })
              }
              placeholder="--Event Type--"
              disabled={notEvent}
              variant="basic"
              selectAll={false}
              hasSearch={false}
              textClassName="text-center"
              className="w-full border bg-transparent hover:bg-white/30 sm:h-12"
              badgeClassName="h-9"
              maxCount={1}
              // shortResults
              showArrow={false}
            />
          </section>
          <section className="flex flex-col gap-2">
            <Label htmlFor="continents" className="flex items-center gap-2">
              Continent:
            </Label>
            <MultiSelect
              options={select_continents}
              value={filters.continent ?? []}
              onValueChange={(value) =>
                onChange({ continent: value as Continents[] })
              }
              placeholder="--Continent--"
              variant="basic"
              selectAll={false}
              hasSearch={false}
              textClassName="text-center"
              className="w-full border bg-transparent hover:bg-white/30 sm:h-12"
              badgeClassName="h-9"
              maxCount={1}
              // shortResults
              showArrow={false}
            />
          </section>
          <div className="mt-2 flex w-full justify-between">
            <section className="flex flex-col gap-4">
              <label className="flex cursor-pointer items-center gap-2">
                <Checkbox
                  id="bookmarkedOnly"
                  checked={filters.bookmarkedOnly}
                  onCheckedChange={(checked) =>
                    onChange({ bookmarkedOnly: Boolean(checked) })
                  }
                />
                <span className="text-sm">Bookmarked Only</span>
              </label>

              <label className="flex cursor-pointer items-center gap-2">
                <Checkbox
                  id="showHidden"
                  checked={filters.showHidden}
                  onCheckedChange={(checked) =>
                    onChange({ showHidden: Boolean(checked) })
                  }
                />
                <span className="text-sm">
                  {filters.showHidden ? "Hide" : "Show"} Hidden
                </span>
              </label>
            </section>
            {hasActiveFilters && (
              <Button
                variant="salWithoutShadow"
                className="cursor-pointer text-center text-base font-semibold text-foreground underline-offset-4 hover:underline"
                onClick={onResetFilters}
              >
                Clear filters
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="hidden flex-col gap-5 px-5 sm:flex">
          <div className="flex max-w-[80vw] flex-wrap items-center gap-3">
            <section className="flex flex-col gap-2">
              <Label htmlFor="list-search" className="flex items-center gap-2">
                Search:
              </Label>
              <div
                className={cn(
                  "relative flex w-36 max-w-full items-center rounded-lg border border-foreground px-2 py-1.5 text-sm text-foreground hover:bg-white/30",
                  className,
                )}
              >
                <FiSearch
                  className="mr-2 size-5 cursor-pointer"
                  onClick={() => {
                    setOpen(true);
                  }}
                />
                <input
                  onFocus={(e) => {
                    e.target.blur();
                    setOpen(true);
                  }}
                  type="text"
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={placeholder}
                  //   defaultValue={value}
                  value={value}
                  className="w-full max-w-64 truncate bg-transparent pr-10 placeholder:text-foreground/30"
                />

                <span className="absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded bg-transparent p-1 text-sm lg:flex">
                  <FiCommand /> + {shortcut}
                </span>
              </div>
            </section>
            <section className="flex flex-col gap-2">
              <Label htmlFor="sortBy" className="flex items-center gap-2">
                Sort by:
              </Label>
              <Select
                name="sortBy"
                value={sortOptions.sortBy}
                onValueChange={(value) =>
                  onSortChange({ sortBy: value as SortOptions["sortBy"] })
                }
              >
                <SelectTrigger className="w-full min-w-40 hover:bg-white/30 sm:h-12">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent className="z-top">
                  <SelectItem value="openCall">Open Call</SelectItem>
                  <SelectItem value="eventStart">Event Start</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>
            </section>
            <section className="flex flex-col gap-2">
              <Label htmlFor="sortOrder" className="flex items-center gap-2">
                Sort order:
              </Label>
              <Select
                name="sortOrder"
                value={sortOptions.sortDirection}
                onValueChange={(value) =>
                  onSortChange({
                    sortDirection: value as SortOptions["sortDirection"],
                  })
                }
              >
                <SelectTrigger className="w-fit min-w-25 hover:bg-white/30 sm:h-12 [&_span]:flex [&_span]:items-center [&_span]:justify-center [&_span]:gap-1 [&_svg]:size-4">
                  <SelectValue placeholder="Direction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">
                    <span className="flex items-center gap-1 text-nowrap">
                      {alphaSort ? (
                        <LiaSortAlphaDownSolid className="size-4" />
                      ) : (
                        <LiaSortNumericDownSolid className="size-4" />
                      )}
                      Asc
                    </span>
                  </SelectItem>
                  <SelectItem
                    value="desc"
                    className="flex items-center gap-1 text-nowrap"
                  >
                    <span className="flex items-center gap-1 text-nowrap">
                      {/* <LiaSortAlphaDownSolid className="size-4" /> */}
                      {alphaSort ? (
                        <LiaSortAlphaDownAltSolid className="size-4" />
                      ) : (
                        <LiaSortNumericDownAltSolid className="size-4" />
                      )}
                      Desc
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </section>
            <section className="flex flex-col gap-2">
              <Label
                htmlFor="eventCategories"
                className="flex items-center gap-2"
              >
                Event Category:
              </Label>
              <MultiSelect
                options={[...eventCategoryOptions]}
                value={filters.eventCategories ?? []}
                onValueChange={(value) =>
                  onChange({ eventCategories: value as EventCategory[] })
                }
                placeholder="--Category--"
                variant="basic"
                selectAll={false}
                hasSearch={false}
                textClassName="text-center"
                className="w-40 border bg-transparent hover:bg-white/30 sm:h-12"
                badgeClassName="h-9"
                shortResults
                showArrow={false}
              />
            </section>

            <section className="flex flex-col gap-2">
              <Label htmlFor="eventTypes" className="flex items-center gap-2">
                Event Type:
              </Label>
              <MultiSelect
                options={[...eventTypeOptions]}
                value={filters.eventTypes ?? []}
                onValueChange={(value) =>
                  onChange({ eventTypes: value as EventType[] })
                }
                placeholder="--Event Type--"
                disabled={notEvent}
                variant="basic"
                selectAll={false}
                hasSearch={false}
                textClassName="text-center"
                className="w-50 border bg-transparent hover:bg-white/30 sm:h-12"
                badgeClassName="h-9"
                shortResults
                showArrow={false}
              />
            </section>
            <section className="flex flex-col gap-2">
              <Label htmlFor="limit" className="flex items-center gap-2">
                Per page:
              </Label>
              <Select
                name="limit"
                value={String(filters.limit)}
                onValueChange={(value) =>
                  onChange({ limit: parseInt(value, 10) })
                }
              >
                <SelectTrigger className="w-full min-w-15 text-center hover:bg-white/30 sm:h-12">
                  <SelectValue placeholder="Limit" />
                </SelectTrigger>
                <SelectContent className="min-w-auto z-top">
                  <SelectItem fit value="1">
                    1
                  </SelectItem>
                  <SelectItem fit value="5">
                    5
                  </SelectItem>
                  <SelectItem fit value="10">
                    10
                  </SelectItem>
                  <SelectItem fit value="25">
                    25
                  </SelectItem>
                </SelectContent>
              </Select>
            </section>
            <section className="ml-2 flex flex-col gap-2 self-end">
              <span
                className={cn(
                  "flex cursor-pointer items-center gap-1 text-center text-sm text-foreground underline-offset-4 hover:underline",
                  !hasActiveFilters &&
                    "pointer-events-none cursor-default opacity-50",
                )}
                onClick={onResetFilters}
              >
                {hasActiveFilters ? (
                  <LucideFilterX className="size-4" />
                ) : (
                  <LucideFilter className="size-4" />
                )}
                Clear filters
              </span>

              <div onClick={() => setShowFull((prev) => !prev)}>
                {showFull ? (
                  <span className="flex cursor-pointer items-center gap-1 text-center text-sm text-foreground underline-offset-4 hover:underline">
                    <ChevronUp className="size-4" />
                    Less Filters
                  </span>
                ) : (
                  <span className="flex cursor-pointer items-center gap-1 text-center text-sm text-foreground underline-offset-4 hover:underline">
                    <ChevronDown className="size-4" />
                    More Filters
                  </span>
                )}
              </div>
            </section>
          </div>
          {showFull && (
            <div className="flex flex-col gap-3">
              <p className="font-bold">More Filters:</p>
              <div className="flex items-center gap-3"></div>
              <div className="flex items-center gap-3">
                <section className="flex flex-col gap-2">
                  <Label
                    htmlFor="continents"
                    className="flex items-center gap-2"
                  >
                    Continent:
                  </Label>
                  <MultiSelect
                    options={select_continents}
                    value={filters.continent ?? []}
                    onValueChange={(value) =>
                      onChange({ continent: value as Continents[] })
                    }
                    placeholder="--Continent--"
                    variant="basic"
                    selectAll={false}
                    hasSearch={false}
                    textClassName="text-center"
                    className="w-50 border bg-transparent hover:bg-white/30 sm:h-12"
                    badgeClassName="h-9"
                    shortResults
                    showArrow={false}
                  />
                </section>
                <section className="flex flex-col gap-3 self-end">
                  <label className="flex cursor-pointer items-center gap-2">
                    <Checkbox
                      id="bookmarkedOnly"
                      checked={filters.bookmarkedOnly}
                      onCheckedChange={(checked) =>
                        onChange({ bookmarkedOnly: Boolean(checked) })
                      }
                    />
                    <span className="text-sm">Bookmarked Only</span>
                  </label>

                  <label className="flex cursor-pointer items-center gap-2">
                    <Checkbox
                      id="showHidden"
                      checked={filters.showHidden}
                      onCheckedChange={(checked) =>
                        onChange({ showHidden: Boolean(checked) })
                      }
                    />
                    <span className="text-sm">
                      {filters.showHidden ? "Hide" : "Show"} Hidden
                    </span>
                  </label>
                </section>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};
