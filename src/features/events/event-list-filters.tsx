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
    (filters.continent && filters.continent.length > 0);
  //TODO: Add filters for: applied, open calls, budget range?, eligibility, ... ?
  return (
    <div className="mx-auto mb-6 flex w-[min(90vw,1280px)] flex-col items-center gap-4 px-6 sm:gap-6 sm:px-12">
      <Separator className="mx-auto" thickness={2} />

      <TheListFilterDrawerIcon
        title={"Search"}
        source={dashboardNavItems}
        className="flex"
        // groupName={"Heading"}
        shortcut="k"
        placeholder="Search"
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

      <Separator className="mx-auto" thickness={2} />
    </div>
  );
};
