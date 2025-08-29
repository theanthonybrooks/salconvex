import { Filters, Pagination, SortOptions } from "@/types/thelist";
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
  viewType?: "all" | "event" | "openCall" | "organizer",
) => {
  return useQuery(api.thelist.getFilteredEventsPublic.getFilteredEventsPublic, {
    filters,
    sortOptions,
    page: pagination.page,
    source,
    viewType,
  });
};
