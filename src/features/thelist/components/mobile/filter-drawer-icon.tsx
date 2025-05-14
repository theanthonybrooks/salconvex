"use client";

import {
  SearchType,
  TheListFilterCommandItem,
  TheListFilterDrawer,
} from "@/features/thelist/components/filter-drawer";
import { FilterBase } from "@/features/thelist/components/filters/filter-base";
import { cn } from "@/lib/utils";
import { Filters, SortOptions } from "@/types/thelist";
import { User } from "@/types/user";
import { useQuery } from "convex-helpers/react/cache";
import { useState } from "react";
import { api } from "~/convex/_generated/api";

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
  hasActiveFilters: boolean;
  // userPref: UserPref | null;
}

export const TheListFilterDrawerIcon = <T extends TheListFilterCommandItem>({
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
}: ListFilterProps<T>) => {
  const subscription = useQuery(api.subscriptions.getUserSubscriptionStatus);
  const subStatus = subscription?.subStatus;
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
          placeholder={placeholder}
          onChange={onChange}
          onSortChange={onSortChange}
          onResetFilters={onResetFilters}
          className={cn("flex h-12")}
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
        setSearch={setValue}
        isMobile={isMobile}
        userType={userType}
        subStatus={subStatus}
        userRole={userRole}
        filters={filters}
        sortOptions={sortOptions}
        onChange={onChange}
        onSortChange={onSortChange}
        onResetFilters={onResetFilters}
        hasActiveFilters={hasActiveFilters}
        searchType={searchType}
        setSearchType={setSearchType}
      />
    </div>
  );
};
