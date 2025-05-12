"use client";

import {
  TheListFilterCommandItem,
  TheListFilterDrawer,
} from "@/features/thelist/components/filter-drawer";
import { FilterBase } from "@/features/thelist/components/filters/filter-base";
import { cn } from "@/lib/utils";
import { Filters, SortOptions } from "@/types/thelist";
import { User } from "@/types/user";
import { useQuery } from "convex-helpers/react/cache";
import { useState } from "react";
import { FiSearch } from "react-icons/fi";
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

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(placeholder);
  const userType = user?.accountType;
  const userRole = user?.role;

  return (
    <div className="flex items-center gap-2">
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
          className={className}
        />
      )}
      {iconOnly && (
        <div
          className={cn("flex items-center gap-x-2", className)}
          onClick={() => setOpen(true)}
        >
          <FiSearch className="size-8 cursor-pointer sm:size-5" />
          {value && value !== "Search" && (
            <span className="flex items-center">
              &quot;
              <p className="max-w-[15ch] overflow-hidden truncate whitespace-nowrap">
                {value}
              </p>
              &quot;
            </span>
          )}
        </div>
      )}
      {/* <Button
        variant="icon"
        size="icon"
        type="button"
        onClick={() => setOpen(true)}
        className="cursor-pointer"
      >
        <FiFilter className="size-5 " />
      </Button> */}

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
      />
    </div>
  );
};
