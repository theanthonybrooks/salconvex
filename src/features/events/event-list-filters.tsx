"use client";

import { Separator } from "@/components/ui/separator";
import { dashboardNavItems } from "@/constants/links";
import { ViewOptions } from "@/features/events/event-list-client";
import { TheListFilters } from "@/features/thelist/components/filters/the-list-filters";
import { MergedEventPreviewData } from "@/types/eventTypes";
import { Filters, SearchParams, SortOptions } from "@/types/thelist";
import { User } from "@/types/user";
import { UserPrefsType } from "~/convex/schema";

interface Props {
  user: User | null;
  search: SearchParams;
  filters: Filters;
  sortOptions: SortOptions;
  onSearchChange: (newSearch: Partial<SearchParams>) => void;
  onChange: (newFilters: Partial<Filters>) => void;
  onSortChange: (newSort: Partial<SortOptions>) => void;
  onResetFilters: () => void;
  userPref: UserPrefsType | null;
  isMobile: boolean;
  view: ViewOptions;
  results: MergedEventPreviewData[];
  isLoading: boolean;
}

export const EventFilters = ({
  user,
  search,
  filters,
  sortOptions,
  onSearchChange,
  onChange,
  onSortChange,
  onResetFilters,
  isMobile,
  view,
  results,
  isLoading,
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
    (filters.postStatus && filters.postStatus !== "all") ||
    search.searchTerm !== "";

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
        search={search}
        filters={filters}
        sortOptions={sortOptions}
        onSearchChange={onSearchChange}
        onChange={onChange}
        onSortChange={onSortChange}
        onResetFilters={onResetFilters}
        hasActiveFilters={hasActiveFilters}
        isMobile={isMobile}
        view={view}
        results={results}
        isLoading={isLoading}
      />

      <Separator className="mx-auto" thickness={2} />
    </div>
  );
};
