import { ViewOptions } from "@/features/events/event-list-client";
import { Filters, Pagination, SortOptions } from "@/types/thelist";
import { UserAccountData } from "@/types/user";
import { useQuery } from "convex-helpers/react/cache";
import { api } from "~/convex/_generated/api";

export const sourceOptions = [
  "thelist",
  "archive",
  "thisweek",
  "nextweek",
] as const;
export type Source = (typeof sourceOptions)[number];

export const useFilteredEventsQuery = (
  filters: Filters,
  sortOptions: SortOptions,
  pagination: Pagination,
  source: Source,
  viewType?: ViewOptions,
  // artistData?: ArtistListActions,
  userAccountData?: UserAccountData,
) => {
  return useQuery(
    api.thelist.getFilteredEventsPublicUpdate.getFilteredEventsPublic,
    {
      filters,
      sortOptions,
      page: pagination.page,
      source,
      viewType,
      // artistData,
      userAccountData,
    },
  );
};
