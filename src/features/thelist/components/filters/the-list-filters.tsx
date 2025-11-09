"use client";

import { SearchType, TheListFilterCommandItem } from "@/constants/filterConsts";

import { MergedEventPreviewData } from "@/types/eventTypes";
import { Filters, SearchParams, SortOptions } from "@/types/thelist";
import { User } from "@/types/user";

import { useEffect, useMemo, useState } from "react";
import { debounce } from "lodash";

import { ViewOptions } from "@/features/events/event-list-client";
import { TheListFilterDrawer } from "@/features/thelist/components/filter-drawer";
import { FilterBase } from "@/features/thelist/components/filters/filter-base";
import { cn } from "@/helpers/utilsFns";

interface ListFilterProps<T extends TheListFilterCommandItem> {
  title: string;
  source: T[];
  shortcut?: string;
  // groupName: string
  className?: string;
  placeholder?: string;
  iconOnly?: boolean;
  isMobile?: boolean;
  user: User | null;

  filters: Filters;
  sortOptions: SortOptions;
  search: SearchParams;
  onSearchChange: (newSearch: Partial<SearchParams>) => void;
  onChange: (newFilters: Partial<Filters>) => void;
  onSortChange: (newSort: Partial<SortOptions>) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean | undefined;
  view: ViewOptions;
  results: MergedEventPreviewData[];
  isLoading: boolean;
  // userPref: UserPrefsType | null;
}

export const TheListFilters = <T extends TheListFilterCommandItem>({
  title,
  source,
  shortcut = "/",
  user,
  // groupName,
  iconOnly = false,
  isMobile = false,
  className,
  placeholder = "Search",
  hasActiveFilters,
  search,
  filters,
  sortOptions,
  onSearchChange,
  onChange,
  onSortChange,
  onResetFilters,
  view,
  results,
  isLoading,
}: ListFilterProps<T>) => {
  // const { preloadedSubStatus } = useConvexPreload();
  // const subData = usePreloadedQuery(preloadedSubStatus);
  // const { hasActiveSubscription } = subData ?? {};

  const [open, setOpen] = useState(false);
  const [localValue, setLocalValue] = useState(search?.searchTerm ?? "");

  const [searchType, setSearchType] = useState<SearchType>(
    search?.searchType ?? "all",
  );
  const userType = user?.accountType;
  const userRole = user?.role;

  const debouncedSearch = useMemo(
    () =>
      debounce((value: string, searchType: SearchType) => {
        const cleaned = value.replace(/[^a-zA-Z0-9\s]/g, "");
        if (cleaned.length >= 2 || value.length === 0)
          onSearchChange({ searchTerm: value, searchType });
      }, 600),
    [onSearchChange],
  );

  useEffect(() => {
    if (
      localValue !== search.searchTerm ||
      (localValue.length > 0 && searchType !== search.searchType)
    ) {
      debouncedSearch(localValue, searchType);
    }
    return () => {
      debouncedSearch.cancel();
    };
  }, [localValue, debouncedSearch, search, searchType]);

  useEffect(() => {
    if (view === "organizer") {
      setSearchType("orgs");
    } else if (view === "event" || view === "archive") {
      setSearchType("events");
    } else {
      setSearchType("all");
    }
    return;
  }, [view]);

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      {!isMobile && !iconOnly && (
        <FilterBase
          isMobile={isMobile}
          search={search}
          filters={filters}
          sortOptions={sortOptions}
          hasActiveFilters={hasActiveFilters}
          setOpen={setOpen}
          shortcut={shortcut}
          hasShortcut={true}
          placeholder={placeholder}
          onSearchChange={onSearchChange}
          onChange={onChange}
          onSortChange={onSortChange}
          onResetFilters={onResetFilters}
          isLoading={isLoading}
          className={cn("flex h-12")}
          view={view}
          localValue={localValue}
          setLocalValue={setLocalValue}
          searchType={searchType}
          setSearchType={setSearchType}
        />
      )}

      <TheListFilterDrawer
        open={open}
        setOpen={setOpen}
        title={title}
        source={source}
        shortcut={shortcut}
        // groupName={groupName}
        placeholder={placeholder}
        isMobile={isMobile}
        userType={userType}
        userRole={userRole}
        search={search}
        filters={filters}
        sortOptions={sortOptions}
        onSearchChange={onSearchChange}
        onChange={onChange}
        onSortChange={onSortChange}
        onResetFilters={onResetFilters}
        isLoading={isLoading}
        hasActiveFilters={hasActiveFilters}
        view={view}
        localValue={localValue}
        setLocalValue={setLocalValue}
        results={results}
        searchType={searchType}
        setSearchType={setSearchType}
      />
    </div>
  );
};
