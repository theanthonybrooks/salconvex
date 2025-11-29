"use client";

import {
  SearchType,
  searchTypeOptions,
  TheListFilterCommandItem,
} from "@/constants/filterConsts";

import { MergedEventPreviewData } from "@/types/eventTypes";
import { Filters, SearchParams, SortOptions } from "@/types/thelist";
import { User } from "@/types/user";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { debounce } from "lodash";

import { useEventListContext } from "@/features/the-list/client-provider";
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
  results: MergedEventPreviewData[];
  isLoading: boolean;
  // userPref: UserPrefsType | null;
}

export function getSearchTypeOptions(view: string, isAdmin: boolean) {
  switch (view) {
    case "organizer":
      // Remove "events"
      return searchTypeOptions.filter((opt) =>
        ["events", "orgs", "loc"].includes(opt.value),
      );
    case "openCall":
      return isAdmin
        ? searchTypeOptions
        : searchTypeOptions.filter((opt) => !["all"].includes(opt.value));
    case "archive":
      // if (isAdmin) return searchTypeOptions;
      return searchTypeOptions.filter((opt) => !["all"].includes(opt.value));
    case "event":
      return searchTypeOptions.filter((opt) => !["all"].includes(opt.value));

    default:
      return searchTypeOptions;
  }
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

  results,
  isLoading,
}: ListFilterProps<T>) => {
  const {
    search,
    view,
    filters,
    sortOptions,
    setFilters,
    setSortOptions,
    setSearch,
    setPage,
    handleResetFilters,
  } = useEventListContext();

  const hasActiveFilters =
    filters.bookmarkedOnly ||
    filters.showHidden ||
    (filters.eventTypes && filters.eventTypes.length > 0) ||
    (filters.eventCategories && filters.eventCategories.length > 0) ||
    (filters.continent && filters.continent.length > 0) ||
    (filters.eligibility && filters.eligibility.length > 0) ||
    (filters.callType && filters.callType.length > 0) ||
    Boolean(filters.callFormat) ||
    (filters.postStatus && filters.postStatus !== "all") ||
    search.searchTerm !== "";

  const handleFilterChange = (partial: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
    setPage(1);
  };

  const handleSortChange = (partial: Partial<SortOptions>) => {
    setSortOptions((prev) => ({ ...prev, ...partial }));
    setPage(1);
  };

  const handleSearchChange = useCallback(
    (partial: Partial<SearchParams>) => {
      setSearch((prev) => ({ ...prev, ...partial }));
      setPage(1);
    },
    [setSearch, setPage],
  );

  // const { preloadedSubStatus } = useConvexPreload();
  // const subData = usePreloadedQuery(preloadedSubStatus);
  // const { hasActiveSubscription } = subData ?? {};
  const searchTypeRef = useRef(search?.searchType ?? "all");
  const [open, setOpen] = useState(false);
  const [localValue, setLocalValue] = useState(search?.searchTerm ?? "");

  const [searchType, setSearchType] = useState<SearchType>(
    search?.searchType ?? "all",
  );
  const userType = user?.accountType;
  const userRole = user?.role;
  const isAdmin = userRole?.includes("admin") ?? false;

  const debouncedSearch = useMemo(
    () =>
      debounce((value: string, searchType: SearchType) => {
        const cleaned = value.replace(/[^a-zA-Z0-9\s]/g, "");
        if (cleaned.length >= 2 || value.length === 0)
          handleSearchChange({ searchTerm: value, searchType });
      }, 1000),
    [handleSearchChange],
  );
  

  useEffect(() => {
    if (
      localValue !== search.searchTerm ||
      (localValue.length > 0 && searchType !== search.searchType)
    ) {
      debouncedSearch(localValue, searchType);
      searchTypeRef.current = searchType;
    }
    return () => {
      debouncedSearch.cancel();
    };
  }, [localValue, debouncedSearch, search, searchType]);

  useEffect(() => {
    const searchOptions = getSearchTypeOptions(view, isAdmin).map(
      (type) => type.value,
    );
    // console.log(searchOptions, searchTypeRef.current);
    if (searchOptions.includes(searchTypeRef.current)) return;
    setLocalValue("");
    if (view === "organizer") {
      setSearchType("orgs");
    } else if (view === "event" || view === "archive") {
      setSearchType("events");
    } else {
      setSearchType("all");
    }
    return;
  }, [view, isAdmin]);

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
          onSearchChange={handleSearchChange}
          onChange={handleFilterChange}
          onSortChange={handleSortChange}
          onResetFilters={handleResetFilters}
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
        onSearchChange={handleSearchChange}
        onChange={handleFilterChange}
        onSortChange={handleSortChange}
        onResetFilters={handleResetFilters}
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
