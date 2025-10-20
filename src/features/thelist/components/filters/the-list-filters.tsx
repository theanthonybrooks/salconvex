"use client";

import { SearchType, TheListFilterCommandItem } from "@/constants/filterConsts";
import { ViewOptions } from "@/features/events/event-list-client";
import { TheListFilterDrawer } from "@/features/thelist/components/filter-drawer";
import { FilterBase } from "@/features/thelist/components/filters/filter-base";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { cn } from "@/helpers/utilsFns";
import { MergedEventPreviewData } from "@/types/eventTypes";
import { Filters, SearchParams, SortOptions } from "@/types/thelist";
import { User } from "@/types/user";
import { usePreloadedQuery } from "convex/react";
import { debounce } from "lodash";
import { useEffect, useMemo, useState } from "react";

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
}: ListFilterProps<T>) => {
  const { preloadedSubStatus } = useConvexPreload();
  const subData = usePreloadedQuery(preloadedSubStatus);
  const { hasActiveSubscription } = subData ?? {};

  const [open, setOpen] = useState(false);
  const [localValue, setLocalValue] = useState(search?.searchTerm ?? "");
  const [isLoading, setIsLoading] = useState(false);
  const [searchType, setSearchType] = useState<SearchType>(
    search?.searchType ?? "all",
  );
  const [checkLoading, setCheckLoading] = useState(false);
  const userType = user?.accountType;
  const userRole = user?.role;

  const debouncedSearch = useMemo(
    () =>
      debounce((value: string, searchType: SearchType) => {
        const cleaned = value.replace(/[^a-zA-Z0-9\s]/g, "");
        if (cleaned.length >= 2 || value.length === 0)
          onSearchChange({ searchTerm: value, searchType });
        setCheckLoading(true);
      }, 600),
    [onSearchChange],
  );

  useEffect(() => {
    if (!checkLoading) return;

    const MIN_DURATION = 1500;
    const start = Date.now();

    const checkResults = () => {
      const elapsed = Date.now() - start;

      if (results && results.length > 0) {
        setIsLoading(false);
        setCheckLoading(false);
        return;
      }

      if (elapsed >= MIN_DURATION) {
        setIsLoading(false);
        setCheckLoading(false);
        return;
      }

      requestAnimationFrame(checkResults);
    };

    checkResults();
  }, [checkLoading, results]);

  useEffect(() => {
    if (
      localValue !== search.searchTerm ||
      (localValue.length > 0 && searchType !== search.searchType)
    ) {
      const cleaned = localValue.replace(/[^a-zA-Z0-9\s]/g, "");
      if (cleaned.length >= 2 || localValue.length === 0) setIsLoading(true);

      debouncedSearch(localValue, searchType);
    }
    return () => {
      debouncedSearch.cancel();
    };
  }, [localValue, debouncedSearch, search, searchType]);
  // "organizer" | "event" | "openCall" | "archive" | "orgView"
  useEffect(() => {
    if (view === "organizer") {
      setSearchType("orgs");
    } else if (view === "event" || view === "archive") {
      setSearchType("events");
    } else {
      setSearchType("all");
    }
    return;
  }, [hasActiveSubscription, view]);
  // useEffect(() => {
  //   const params = new URLSearchParams();
  //   setParamIfNotDefault(params, "term", value, "");
  //   setParamIfNotDefault(params, "st", searchType, "all");
  //   const queryString = params.toString();
  //   const baseUrl = window.location.origin + window.location.pathname;
  //   sessionStorage.setItem(
  //     "previousSalPage",
  //     baseUrl + (queryString ? `?${queryString}` : ""),
  //   );
  //   window.history.replaceState(
  //     null,
  //     "",
  //     baseUrl + (queryString ? `?${queryString}` : ""),
  //   );
  // }, [searchType, value]);

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
