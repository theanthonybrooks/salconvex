import { Filters, Pagination, SortOptions } from "@/types/thelist";
import { useQuery } from "convex-helpers/react/cache";
import { api } from "~/convex/_generated/api";

export const useFilteredEventsQuery = (
  filters: Filters,
  sortOptions: SortOptions,
  pagination: Pagination,
) => {
  return useQuery(api.thelist.getFilteredEvents.getFilteredEvents, {
    filters,
    sortOptions,
    page: pagination.page,
  });
};
