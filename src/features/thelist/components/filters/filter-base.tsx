"use client";

import {
  eventCategoryOptions,
  eventTypeOptions,
  PostStatusOptionValues,
} from "@/constants/eventConsts";
import { SearchType, TheListFilterCommandItem } from "@/constants/filterConsts";
import { select_continents } from "@/constants/locationConsts";
import {
  callFormat_option_values,
  callType_option_values,
  eligibilityOptionValues,
} from "@/constants/openCallConsts";

import {
  EventCategory,
  EventType,
  PostStatus,
  PostStatusOptions,
} from "@/types/eventTypes";
import { CallFormat, CallType, EligibilityType } from "@/types/openCallTypes";
import {
  Continents,
  Filters,
  SearchParams,
  SortOptions,
} from "@/types/thelist";

import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { BiSolidQuoteLeft, BiSolidQuoteRight } from "react-icons/bi";
import { FiCommand, FiSearch } from "react-icons/fi";
import {
  LiaSortAlphaDownAltSolid,
  LiaSortAlphaDownSolid,
  LiaSortNumericDownAltSolid,
  LiaSortNumericDownSolid,
} from "react-icons/lia";
import {
  ChevronDown,
  ChevronUp,
  LucideFilter,
  LucideFilterX,
  X,
} from "lucide-react";

import { MultiSelect } from "@/components/multi-select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FlairBadge } from "@/components/ui/flair-badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSimple,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ViewOptions } from "@/features/events/event-list-client";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { cn } from "@/helpers/utilsFns";

import { usePreloadedQuery } from "convex/react";

export interface FilterBaseProps {
  isMobile: boolean;
  search: SearchParams;
  filters: Filters;
  sortOptions: SortOptions;
  hasActiveFilters: boolean | undefined;

  setOpen: Dispatch<SetStateAction<boolean>>;
  localValue: string;
  setLocalValue: Dispatch<SetStateAction<string>>;
  searchType: SearchType;
  setSearchType: Dispatch<SetStateAction<SearchType>>;
  shortcut: string;
  hasShortcut: boolean;
  placeholder: string;
  groupedResults?: Record<string, TheListFilterCommandItem[]>;
  onSearchChange: (newSearch: Partial<SearchParams>) => void;
  onChange: (newFilters: Partial<Filters>) => void;
  onSortChange: (newSort: Partial<SortOptions>) => void;
  onResetFilters: () => void;
  isLoading: boolean;
  className?: string;
  view: ViewOptions;
}

export const FilterBase = ({
  isMobile,
  // search,
  filters,
  sortOptions,
  hasActiveFilters,
  setOpen,
  localValue,
  setLocalValue,
  searchType,
  setSearchType,
  placeholder,
  onChange,
  onSortChange,
  onResetFilters,
  // onSearchChange,
  // isLoading,
  className,
  shortcut,
  hasShortcut,
  groupedResults,
  view,
  // user,
}: FilterBaseProps) => {
  // const searchTerm = search.searchTerm ?? "";
  const { preloadedSubStatus, preloadedUserData } = useConvexPreload();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showFull, setShowFull] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const subData = usePreloadedQuery(preloadedSubStatus);
  const userData = usePreloadedQuery(preloadedUserData);
  const hasActiveSubscription = subData?.hasActiveSubscription;
  const isArtist = userData?.user?.accountType?.includes("artist");
  const isAdmin = userData?.user?.role?.includes("admin");
  const paidUser = (isArtist && hasActiveSubscription) || isAdmin;
  const limitOpenCalls = view === "event" || view === "orgView";
  const orgView = view === "orgView";
  const archiveView = view === "archive";
  const notEvent =
    filters.eventCategories?.length !== 0 &&
    !filters.eventCategories?.includes("event");
  const alphaSort = sortOptions.sortBy === "name";
  const unknownOption = isAdmin ? [{ value: "Unknown", label: "Unknown" }] : [];
  const callTypeOptions = [...callType_option_values, ...unknownOption];

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
        <div className="scrollable flex flex-col items-center gap-4 px-5 sm:hidden [&>section]:w-full [&>section]:flex-1">
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
                  autoFocus={false}
                  onChange={(e) => {
                    setDropdownOpen(true);
                    // onSearchChange({ searchTerm: e.target.value });
                    setLocalValue(e.target.value);
                  }}
                  placeholder={placeholder}
                  value={localValue}
                  //   value={value}
                  className="focus:outline-hidden w-full flex-1 bg-transparent text-base placeholder:text-foreground/30"
                />
                {groupedResults && dropdownOpen && (
                  <div
                    ref={dropdownRef}
                    className="scrollable mini absolute left-0 top-full z-top mt-2 flex max-h-70 w-[calc(100vw-40px)] flex-col gap-2 rounded-lg border border-foreground bg-card px-5 py-4"
                  >
                    {Object.values(groupedResults).every(
                      (items) => items.length === 0,
                    ) ? (
                      <>
                        {localValue?.length > 0 && (
                          <span className="flex flex-col items-center gap-2 text-lg">
                            No results found for
                            <span className="inline-flex items-center gap-[1px] italic">
                              <BiSolidQuoteLeft className="size-1 -translate-y-1" />
                              {localValue}
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
                              {groupItems.map((item) => {
                                const hasOpenCall =
                                  typeof item.ocStatus === "number" &&
                                  item.ocStatus > 0;
                                return (
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
                                      <div className="flex w-full flex-col gap-2">
                                        <span className="flex max-w-full items-center justify-start gap-1 truncate text-wrap">
                                          {item.name}
                                        </span>
                                        <span className="flex max-w-full gap-2 truncate text-xs text-foreground/50">
                                          {hasOpenCall && (
                                            <FlairBadge
                                              className={cn(
                                                "px-2 py-0.5",
                                                item.ocStatus === 2
                                                  ? "bg-green-500/20"
                                                  : item.ocStatus === 3
                                                    ? "bg-yellow-500/20"
                                                    : "bg-red-500/20",
                                              )}
                                            >
                                              Open Call
                                            </FlairBadge>
                                          )}

                                          {item.meta}
                                        </span>
                                      </div>
                                    ) : (
                                      <div className="flex w-full flex-col gap-2">
                                        <span className="truncate">
                                          {item.name}
                                        </span>
                                        <span className="truncate text-xs text-foreground/50">
                                          {item.meta}
                                        </span>
                                      </div>
                                    )}
                                  </li>
                                );
                              })}
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
                  onValueChange={(value) => setSearchType(value as SearchType)}
                >
                  <SelectTrigger className="w-32 text-center">
                    <SelectValue placeholder="Search Type" />
                  </SelectTrigger>
                  <SelectContent align="end" className="z-top">
                    {!orgView && (
                      <SelectItem value="events">Event Name</SelectItem>
                    )}
                    <SelectItem value="orgs">Organizers</SelectItem>
                    <SelectItem value="loc">Location</SelectItem>
                    {!orgView && <SelectItem value="all">All</SelectItem>}
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
                  {/* <SelectItem fit value="1">
                    1
                  </SelectItem> */}
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
                  {paidUser && (
                    <SelectItem value="recent">Most Recent</SelectItem>
                  )}
                  {!limitOpenCalls && (
                    <>
                      <SelectItem value="openCall">Open Call</SelectItem>
                    </>
                  )}
                  <SelectItem value="eventStart">Event Start</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="country">Country</SelectItem>
                  <SelectItem value="organizer">Organizer</SelectItem>
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

          {!limitOpenCalls && (
            <section className="flex flex-col gap-2">
              <Label
                htmlFor="eventCategories"
                className="flex items-center gap-2"
              >
                Category:
              </Label>
              <MultiSelect
                manualUpdate
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
          )}
          {(filters.eventCategories?.includes("event") ||
            filters.eventCategories?.length === 0) && (
            <section className="flex flex-col gap-2">
              <Label htmlFor="eventTypes" className="flex items-center gap-2">
                Event Type:
              </Label>
              <MultiSelect
                manualUpdate
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
                showArrow={false}
              />
            </section>
          )}
          {limitOpenCalls && (
            <section className="flex flex-col gap-2">
              <Label htmlFor="continents" className="flex items-center gap-2">
                Continent:
              </Label>
              <MultiSelect
                manualUpdate
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
          )}
          {(!limitOpenCalls || paidUser) && (
            <div
              onClick={() => setShowFull((prev) => !prev)}
              className="flex w-full flex-col items-center justify-center gap-2"
            >
              <Separator
                orientation="horizontal"
                className="mx-auto h-2 w-full text-foreground/50"
              />
              {showFull && <ChevronUp className="size-5 text-foreground/50" />}

              {showFull ? "Hide Open Call Filters" : "Show Open Call Filters"}
              {!showFull && (
                <ChevronDown className="size-5text-foreground/50" />
              )}
            </div>
          )}
          {showFull && (
            <>
              <section className="flex w-full flex-col gap-2">
                <Label htmlFor="callType" className="flex items-center gap-2">
                  Call Type:
                </Label>
                <MultiSelect
                  manualUpdate
                  options={callTypeOptions}
                  value={filters.callType ?? []}
                  onValueChange={(value) =>
                    onChange({ callType: value as CallType[] })
                  }
                  placeholder="--Call Type--"
                  variant="basic"
                  selectAll={false}
                  hasSearch={false}
                  textClassName="text-center"
                  className="w-full border bg-transparent hover:bg-white/30 sm:h-12"
                  badgeClassName="h-9"
                  shortResults
                  showArrow={false}
                />
              </section>
              <div className="flex w-full max-w-full items-center justify-between gap-3">
                <section className="flex w-full flex-col gap-2">
                  <Label
                    htmlFor="eligibility"
                    className="flex items-center gap-2"
                  >
                    Eligibility:
                  </Label>
                  <MultiSelect
                    manualUpdate
                    options={[
                      ...eligibilityOptionValues.filter(
                        (option) => isAdmin || option.value !== "Unknown",
                      ),
                    ]}
                    value={filters.eligibility ?? []}
                    onValueChange={(value) =>
                      onChange({ eligibility: value as EligibilityType[] })
                    }
                    placeholder="--Eligibility--"
                    variant="basic"
                    selectAll={false}
                    hasSearch={false}
                    textClassName="text-center"
                    className="w-full border bg-transparent hover:bg-white/30 sm:h-12"
                    badgeClassName="h-9"
                    shortResults
                    showArrow={false}
                  />
                </section>
                <section className="flex flex-col gap-2">
                  <Label htmlFor="limit" className="flex items-center gap-2">
                    Call Format:
                  </Label>
                  <Select
                    name="limit"
                    value={filters.callFormat ?? ""}
                    onValueChange={(value) =>
                      onChange({
                        callFormat:
                          value === "none" ? "" : (value as CallFormat),
                      })
                    }
                  >
                    <SelectTrigger className="w-full min-w-15 text-center hover:bg-white/30 sm:h-12">
                      <SelectValue placeholder="Format" />
                    </SelectTrigger>
                    <SelectContent className="min-w-auto z-top">
                      {filters.callFormat !== "" && (
                        <SelectItem
                          fit
                          value="none"
                          className="italic text-foreground/50"
                        >
                          -- All --
                        </SelectItem>
                      )}
                      {callFormat_option_values.map(({ value, label }) => (
                        <SelectItem fit value={value} key={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </section>
              </div>

              <section className="flex flex-col gap-2">
                <Label htmlFor="continents" className="flex items-center gap-2">
                  Continent:
                </Label>
                <MultiSelect
                  manualUpdate
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
            </>
          )}
          {isAdmin && (
            <section className="flex flex-col gap-2">
              <Label htmlFor="limit" className="flex items-center gap-2">
                Post Status:
              </Label>
              <SelectSimple
                options={[...PostStatusOptionValues]}
                placeholder="Posted"
                value={filters.postStatus ?? ""}
                onChangeAction={(value) => {
                  onChange({ postStatus: value as PostStatus });
                }}
                className="w-full border bg-transparent hover:bg-white/30 sm:h-12"
              />
            </section>
          )}

          <div className="mt-2 flex w-full justify-between">
            {paidUser && !orgView && !archiveView && (
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
            )}

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
        <div className="hidden flex-col gap-5 sm:flex">
          <div className="flex max-w-[90vw] flex-wrap items-center gap-3">
            {view !== "orgView" && (
              <section className="flex flex-col gap-2">
                <Label
                  htmlFor="list-search"
                  className="flex items-center gap-2"
                >
                  Search:
                </Label>
                <div
                  className={cn(
                    "relative flex w-52 max-w-full items-center rounded-lg border border-foreground px-2 py-1.5 text-sm text-foreground hover:bg-white/30",
                    className,
                    !hasShortcut && "w-36",
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
                    onChange={(e) =>
                      // onSearchChange({ searchTerm: e.target.value })
                      setLocalValue(e.target.value)
                    }
                    placeholder={placeholder}
                    //   defaultValue={value}
                    value={localValue}
                    className={cn(
                      "w-full max-w-64 truncate bg-transparent placeholder:text-foreground/30",
                      hasShortcut && "pr-10",
                    )}
                  />

                  {hasShortcut && !localValue && (
                    <span className="absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded bg-transparent p-1 text-sm lg:flex">
                      <FiCommand /> + {shortcut}
                    </span>
                  )}
                  {localValue?.trim().length > 0 && (
                    <span
                      onClick={() => setLocalValue("")}
                      className="absolute right-2 top-1/2 hidden -translate-y-1/2 cursor-pointer items-center gap-0.5 rounded bg-transparent p-1 text-sm lg:flex"
                    >
                      <X className="size-5 hover:scale-110 hover:text-red-600 active:scale-95" />
                    </span>
                  )}
                </div>
              </section>
            )}
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
                  {paidUser && (
                    <SelectItem value="recent">Most Recent</SelectItem>
                  )}
                  {!limitOpenCalls && (
                    <>
                      <SelectItem value="openCall">Open Call</SelectItem>
                    </>
                  )}
                  <SelectItem value="eventStart">Event Start</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="country">Country</SelectItem>
                  <SelectItem value="organizer">Organizer</SelectItem>
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
            {!limitOpenCalls && (
              <section className="flex flex-col gap-2">
                <Label
                  htmlFor="eventCategories"
                  className="flex items-center gap-2"
                >
                  Category:
                </Label>
                <MultiSelect
                  manualUpdate
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
            )}

            <section className="flex flex-col gap-2">
              <Label htmlFor="eventTypes" className="flex items-center gap-2">
                Event Type:
              </Label>
              <MultiSelect
                manualUpdate
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
            {limitOpenCalls && (
              <section className="flex flex-col gap-2">
                <Label htmlFor="continents" className="flex items-center gap-2">
                  Continent:
                </Label>
                <MultiSelect
                  manualUpdate
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
                  className="w-44 border bg-transparent hover:bg-white/30 sm:h-12"
                  badgeClassName="h-9"
                  shortResults
                  showArrow={false}
                />
              </section>
            )}
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
                  {/* <SelectItem fit value="1">
                    1
                  </SelectItem> */}
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
            <section
              className={cn(
                "ml-2 flex flex-col gap-2 self-end",
                ((limitOpenCalls && !paidUser) || orgView) && "self-center",
              )}
            >
              <span
                className={cn(
                  "flex cursor-pointer items-center gap-1 text-center text-sm text-foreground underline-offset-4 hover:underline",
                  !hasActiveFilters &&
                    "pointer-events-none cursor-default opacity-30",
                )}
                onClick={() => {
                  setLocalValue("");
                  onResetFilters();
                }}
              >
                {hasActiveFilters ? (
                  <LucideFilterX className="size-4" />
                ) : (
                  <LucideFilter className="size-4" />
                )}
                Clear filters
              </span>

              {(!limitOpenCalls || paidUser) && !orgView && (
                <div onClick={() => setShowFull((prev) => !prev)}>
                  {showFull ? (
                    <span className="flex cursor-pointer items-center gap-1 text-center text-sm text-foreground underline-offset-4 hover:underline active:scale-95">
                      <ChevronUp className="size-4" />
                      Less Filters
                    </span>
                  ) : (
                    <span className="flex cursor-pointer items-center gap-1 text-center text-sm text-foreground underline-offset-4 hover:underline active:scale-95">
                      <ChevronDown className="size-4" />
                      More Filters
                    </span>
                  )}
                </div>
              )}
            </section>
          </div>
          {showFull && !orgView && (
            <div className="flex flex-col gap-3">
              <p className="font-bold">More Filters:</p>
              <div className="flex items-center gap-3"></div>
              <div className="flex items-center gap-3">
                {!limitOpenCalls && (
                  <section className="flex flex-col gap-2">
                    <Label
                      htmlFor="continents"
                      className="flex items-center gap-2"
                    >
                      Continent:
                    </Label>
                    <MultiSelect
                      manualUpdate
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
                )}
                <section className="flex flex-col gap-2">
                  <Label
                    htmlFor="eligibility"
                    className="flex items-center gap-2"
                  >
                    Eligibility:
                  </Label>
                  <MultiSelect
                    manualUpdate
                    options={[
                      ...eligibilityOptionValues.filter(
                        (option) => isAdmin || option.value !== "Unknown",
                      ),
                    ]}
                    value={filters.eligibility ?? []}
                    onValueChange={(value) =>
                      onChange({ eligibility: value as EligibilityType[] })
                    }
                    placeholder="--Eligibility--"
                    variant="basic"
                    selectAll={false}
                    hasSearch={false}
                    textClassName="text-center"
                    className="w-30 border bg-transparent hover:bg-white/30 sm:h-12"
                    badgeClassName="h-9"
                    shortResults
                    showArrow={false}
                  />
                </section>
                <section className="flex flex-col gap-2">
                  <Label htmlFor="callType" className="flex items-center gap-2">
                    Call Type:
                  </Label>
                  <MultiSelect
                    manualUpdate
                    options={callTypeOptions}
                    value={filters.callType ?? []}
                    onValueChange={(value) =>
                      onChange({ callType: value as CallType[] })
                    }
                    placeholder="--Call Type--"
                    variant="basic"
                    selectAll={false}
                    hasSearch={false}
                    textClassName="text-center"
                    className="w-30 border bg-transparent hover:bg-white/30 sm:h-12"
                    badgeClassName="h-9"
                    shortResults
                    showArrow={false}
                  />
                </section>

                <section className="flex flex-col gap-2">
                  <Label htmlFor="limit" className="flex items-center gap-2">
                    Call Format:
                  </Label>
                  <Select
                    name="limit"
                    value={filters.callFormat ?? ""}
                    onValueChange={(value) =>
                      onChange({
                        callFormat:
                          value === "none" ? "" : (value as CallFormat),
                      })
                    }
                  >
                    <SelectTrigger className="w-full min-w-15 text-center hover:bg-white/30 sm:h-12">
                      <SelectValue placeholder="Format" />
                    </SelectTrigger>
                    <SelectContent className="min-w-auto z-top">
                      {filters.callFormat !== "" && (
                        <SelectItem
                          fit
                          value="none"
                          className="italic text-foreground/50"
                        >
                          -- All --
                        </SelectItem>
                      )}
                      {callFormat_option_values.map(({ value, label }) => (
                        <SelectItem fit value={value} key={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </section>
                {isAdmin && (
                  <section className="flex flex-col gap-2">
                    <Label
                      htmlFor="postStatus"
                      className="flex items-center gap-2"
                    >
                      Post Status:
                    </Label>
                    <SelectSimple
                      options={[...PostStatusOptionValues]}
                      placeholder="Posted"
                      value={filters.postStatus ?? "all"}
                      onChangeAction={(value) => {
                        onChange({ postStatus: value as PostStatusOptions });
                      }}
                      className="w-full max-w-40 border bg-transparent hover:bg-white/30 sm:h-12"
                    />
                  </section>
                )}

                {!archiveView && (
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
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};
