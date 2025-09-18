"use client";

import { Separator } from "@/components/ui/separator";
import { dashboardNavItems } from "@/constants/links";
import { ViewOptions } from "@/features/events/event-list-client";
import { TheListFilters } from "@/features/thelist/components/filters/the-list-filters";
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
  view: ViewOptions;
}

export const EventFilters = ({
  user,
  filters,
  sortOptions,
  onChange,
  onSortChange,
  onResetFilters,
  isMobile,
  view,
}: Props) => {
  const hasActiveFilters =
    filters.bookmarkedOnly ||
    filters.showHidden ||
    (filters.eventTypes && filters.eventTypes.length > 0) ||
    (filters.eventCategories && filters.eventCategories.length > 0) ||
    (filters.continent && filters.continent.length > 0) ||
    (filters.eligibility && filters.eligibility.length > 0) ||
    (filters.callType && filters.callType.length > 0) ||
    !!(filters.callFormat && filters.callFormat !== "") ||
    (filters.postStatus && filters.postStatus !== "all");

  //TODO: Add filters for: applied, open calls, budget range?, eligibility, ... ?
  return (
    <div className="mx-auto mb-6 flex w-full max-w-[min(95vw,1280px)] flex-col items-center gap-4 px-6 sm:gap-6 sm:px-8">
      <Separator className="mx-auto" thickness={2} />

      <TheListFilters
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
        view={view}
      />

      <Separator className="mx-auto" thickness={2} />
    </div>
  );
};
