"use client";

import { Separator } from "@/components/ui/separator";
import { dashboardNavItems } from "@/constants/links";
import { TheListFilterDrawerIcon } from "@/features/thelist/components/mobile/filter-drawer-icon";
import { Filters, SortOptions } from "@/types/thelist";
import { User, UserPref } from "@/types/user";

interface Props {
  user: User | null;
  filters: Filters;
  sortOptions: SortOptions;
  onChange: (newFilters: Partial<Filters>) => void;
  onSortChange: (newSort: Partial<SortOptions>) => void;
  onResetFilters: () => void;
  userPref: UserPref | null;
  isMobile: boolean;
}

export const EventFilters = ({
  user,
  filters,
  sortOptions,
  onChange,
  onSortChange,
  onResetFilters,
  isMobile,
}: Props) => {
  const hasActiveFilters =
    filters.bookmarkedOnly ||
    filters.showHidden ||
    (filters.eventTypes && filters.eventTypes.length > 0) ||
    (filters.eventCategories && filters.eventCategories.length > 0) ||
    filters.continent !== undefined;

  return (
    <div className="mb-6 flex w-full flex-col items-start gap-4 px-8 xl:max-w-[65vw]">
      <Separator className="w-full" thickness={2} />

      <TheListFilterDrawerIcon
        title={"Search"}
        source={dashboardNavItems}
        className="flex h-12"
        // groupName={"Heading"}
        shortcut="k"
        placeholder="Search..."
        user={user}
        // userPref={userPref}
        filters={filters}
        sortOptions={sortOptions}
        onChange={onChange}
        onSortChange={onSortChange}
        onResetFilters={onResetFilters}
        hasActiveFilters={hasActiveFilters}
        isMobile={isMobile}
      />

      <Separator className="w-full xl:max-w-[65vw]" thickness={2} />
    </div>
  );
};
