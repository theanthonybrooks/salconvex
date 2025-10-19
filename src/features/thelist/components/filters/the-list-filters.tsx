"use client";

import { SearchType, TheListFilterCommandItem } from "@/constants/filterConsts";
import { ViewOptions } from "@/features/events/event-list-client";
import { TheListFilterDrawer } from "@/features/thelist/components/filter-drawer";
import { FilterBase } from "@/features/thelist/components/filters/filter-base";
import { cn } from "@/helpers/utilsFns";
import { Filters, SortOptions } from "@/types/thelist";
import { User } from "@/types/user";
import { useState } from "react";

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
  onChange: (newFilters: Partial<Filters>) => void;
  onSortChange: (newSort: Partial<SortOptions>) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean | undefined;
  view: ViewOptions;
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
  filters,
  sortOptions,
  onChange,
  onSortChange,
  onResetFilters,
  view,
}: ListFilterProps<T>) => {
  const [searchType, setSearchType] = useState<SearchType>("all");

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(placeholder);
  const userType = user?.accountType;
  const userRole = user?.role;

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      {!isMobile && !iconOnly && (
        <FilterBase
          isMobile={isMobile}
          filters={filters}
          sortOptions={sortOptions}
          hasActiveFilters={hasActiveFilters}
          setOpen={setOpen}
          setValue={setValue}
          value={value}
          shortcut={shortcut}
          hasShortcut={true}
          placeholder={placeholder}
          onChange={onChange}
          onSortChange={onSortChange}
          onResetFilters={onResetFilters}
          className={cn("flex h-12")}
          searchType={searchType}
          setSearchType={setSearchType}
          view={view}
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
        setSearch={setValue}
        isMobile={isMobile}
        userType={userType}
        userRole={userRole}
        filters={filters}
        sortOptions={sortOptions}
        onChange={onChange}
        onSortChange={onSortChange}
        onResetFilters={onResetFilters}
        hasActiveFilters={hasActiveFilters}
        searchType={searchType}
        setSearchType={setSearchType}
        view={view}
      />
    </div>
  );
};
