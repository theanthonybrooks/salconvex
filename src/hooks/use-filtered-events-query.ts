//TODO: Add some sort of caching that I can use to filter the events based on the filters. Since it already has to load everything anyways? Or maybe not since convex queries everything, but the frontend still only receives paginated results. Think about it.

import { ViewOptions } from "@/features/events/event-list-client";
import {
  Filters,
  Pagination,
  SearchParams,
  SortOptions,
} from "@/types/thelist";
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
  disabled?: boolean,
  search?: SearchParams,
) => {
  return useQuery(
    api.thelist.getFilteredEventsPublicUpdate.getFilteredEventsPublic,
    !disabled
      ? {
          filters,
          sortOptions,
          page: pagination.page,
          source,
          viewType,
          // artistData,
          userAccountData,
          search,
        }
      : "skip",
  );
};
