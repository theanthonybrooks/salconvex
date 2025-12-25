"use client";

// #region ------------- Imports --------------
import type { SearchType } from "@/constants/filterConsts";
import type { EventCategory, EventType } from "@/types/eventTypes";
import type {
  CallFormat,
  CallType,
  EligibilityType,
} from "@/types/openCallTypes";
import type {
  Continents,
  Filters,
  SearchParams,
  SortOptions,
} from "@/types/thelist";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import { debounce } from "lodash";

import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { setParamIfNotDefault } from "@/helpers/utilsFns";

import { usePreloadedQuery } from "convex/react";

// #endregion

const getDefaultSortForView = (view: ViewOptions): SortOptions => {
  if (view === "event" || view === "archive") {
    return { sortBy: "eventStart", sortDirection: "asc" };
  }
  if (view === "organizer" || view === "orgView") {
    return { sortBy: "organizer", sortDirection: "asc" };
  }
  return { sortBy: "openCall", sortDirection: "asc" };
};

export const viewOptionValues = [
  { value: "openCall", label: "Open Calls" },
  { value: "organizer", label: "Organizers" },
  { value: "event", label: "Events Only" },
  { value: "archive", label: "Archive" },
  { value: "orgView", label: "My Submissions" },
] as const;

export type ViewOptions = (typeof viewOptionValues)[number]["value"];

interface EventListContextValue {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  sortOptions: SortOptions;
  setSortOptions: React.Dispatch<React.SetStateAction<SortOptions>>;
  search: SearchParams;
  setSearch: React.Dispatch<React.SetStateAction<SearchParams>>;
  view: ViewOptions;
  setView: React.Dispatch<React.SetStateAction<ViewOptions>>;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  defaultFilters: Filters;
  defaultSort: SortOptions;
  defaultSearch: SearchParams;
  getDefaultSortForView: (view: ViewOptions) => SortOptions;
  // getDefaultSearchForView: (view: ViewOptions) => SearchParams;
  handleResetFilters: () => void;
}

const EventListContext = createContext<EventListContextValue | null>(null);

export const EventListProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const searchParams = useSearchParams();
  const { preloadedSubStatus, preloadedUserData } = useConvexPreload();
  const userData = usePreloadedQuery(preloadedUserData);
  const subData = usePreloadedQuery(preloadedSubStatus);
  const { hasActiveSubscription } = subData ?? {};
  const { user } = userData ?? {};
  const isAdmin =
    user?.role?.includes("admin") || user?.role?.includes("creator");

  const defaultFilters: Filters = useMemo(
    () => ({
      showHidden: false,
      bookmarkedOnly: false,
      limit: 10,
      eventTypes: [],
      eventCategories: [],
      eligibility: [],
      callType: [],
      callFormat: "",
    }),
    [],
  );

  const [view, setView] = useState<ViewOptions>(() => {
    // 1. Search param
    const paramView = searchParams.get("view") as ViewOptions | null;
    if (
      paramView &&
      viewOptionValues.some((opt) => opt.value === paramView) &&
      hasActiveSubscription
    ) {
      return paramView;
    }

    // 2. Session storage
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("salView") as ViewOptions | null;
      if (saved && viewOptionValues.some((opt) => opt.value === saved)) {
        return saved;
      }
    }

    // 3. Fallback
    return "openCall";
  });

  const defaultSort = useMemo(() => getDefaultSortForView(view), [view]);

  const defaultSearch = useMemo<SearchParams>(
    () => ({
      searchTerm: "",
      searchType: isAdmin ? "all" : "events",
    }),
    [isAdmin],
  );

  const currentFilters: Filters = {
    showHidden: searchParams.get("h") === "true",
    bookmarkedOnly: searchParams.get("b") === "true",
    limit: Number(searchParams.get("l")) || defaultFilters.limit,
    // page: Number(searchParams.get("page")) || 1,
    eventTypes:
      (searchParams.get("type")?.split(",") as EventType[]) ??
      defaultFilters.eventTypes,
    eventCategories:
      (searchParams.get("cat")?.split(",") as EventCategory[]) ??
      defaultFilters.eventCategories,
    continent:
      (searchParams.get("cont")?.split(",") as Continents[]) ??
      defaultFilters.continent,
    eligibility:
      (searchParams.get("e")?.split(",") as EligibilityType[]) ??
      defaultFilters.eligibility,
    callType:
      (searchParams.get("ct")?.split(",") as CallType[]) ??
      defaultFilters.callType,
    callFormat:
      (searchParams.get("f") as CallFormat) ?? defaultFilters.callFormat,
  };

  const currentSort: SortOptions = {
    sortBy:
      (searchParams.get("sb") as SortOptions["sortBy"]) ?? defaultSort.sortBy,
    sortDirection:
      (searchParams.get("sd") as SortOptions["sortDirection"]) ??
      defaultSort.sortDirection,
  };

  const currentSearch: SearchParams = {
    searchTerm: searchParams.get("term") ?? "",
    searchType:
      (searchParams.get("st") as SearchType) ?? (isAdmin ? "all" : "events"),
  };

  const [filters, setFilters] = useState<Filters>(currentFilters);
  const [sortOptions, setSortOptions] = useState<SortOptions>(currentSort);
  const [search, setSearch] = useState<SearchParams>(currentSearch);
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
    setSortOptions(defaultSort);
    setSearch(defaultSearch);
    setPage(1);
  }, [
    defaultFilters,
    defaultSort,
    defaultSearch,
    setFilters,
    setSortOptions,
    setSearch,
    setPage,
  ]);

  const updateURL = useMemo(
    () =>
      debounce(
        (
          filters: Filters,
          sortOptions: SortOptions,
          search: SearchParams,
          page: number,
        ) => {
          const params = new URLSearchParams();

          setParamIfNotDefault(params, "h", filters.showHidden, false);
          setParamIfNotDefault(params, "b", filters.bookmarkedOnly, false);
          setParamIfNotDefault(params, "l", filters.limit, 10);
          setParamIfNotDefault(params, "type", filters.eventTypes, []);
          setParamIfNotDefault(params, "cat", filters.eventCategories, []);
          setParamIfNotDefault(params, "e", filters.eligibility, []);
          setParamIfNotDefault(params, "ct", filters.callType, []);
          setParamIfNotDefault(params, "f", filters.callFormat, "");
          setParamIfNotDefault(params, "cont", filters.continent, []);

          if (page !== 1) params.set("page", String(page));
          else params.delete("page");

          setParamIfNotDefault(
            params,
            "sb",
            sortOptions.sortBy,
            defaultSort.sortBy,
          );
          setParamIfNotDefault(params, "sd", sortOptions.sortDirection, "asc");
          setParamIfNotDefault(params, "term", search.searchTerm, "");

          if (search.searchTerm) {
            setParamIfNotDefault(
              params,
              "st",
              search.searchType,
              isAdmin ? "all" : "events",
            );
          } else {
            params.delete("st");
          }

          const baseUrl = window.location.origin + window.location.pathname;
          const queryString = params.toString();
          const fullUrl = baseUrl + (queryString ? `?${queryString}` : "");

          sessionStorage.setItem("previousSalPage", fullUrl);
          window.history.replaceState(null, "", fullUrl);
        },
        0,
      ),
    [defaultSort.sortBy, isAdmin],
  );

  useEffect(() => {
    if (view !== "event") return;

    setFilters((prev) => {
      if (
        Array.isArray(prev.eventCategories) &&
        prev.eventCategories.length === 1 &&
        prev.eventCategories[0] === "event"
      ) {
        return prev; // no change
      }
      return { ...prev, eventCategories: [] };
    });
  }, [view]);

  useEffect(() => {
    updateURL(filters, sortOptions, search, page);
  }, [filters, sortOptions, search, page, updateURL]);

  useEffect(() => {
    return () => updateURL.cancel();
  }, [updateURL]);

  useEffect(() => {
    sessionStorage.setItem("salView", view);
  }, [view]);

  const value = useMemo(
    () => ({
      filters,
      setFilters,
      sortOptions,
      setSortOptions,
      search,
      setSearch,
      view,
      setView,
      page,
      setPage,
      defaultFilters,
      defaultSort,
      defaultSearch,
      getDefaultSortForView,
      handleResetFilters,
    }),
    [
      filters,
      sortOptions,
      search,
      view,
      page,
      defaultFilters,
      defaultSort,
      defaultSearch,
      handleResetFilters,
    ],
  );

  return (
    <EventListContext.Provider value={value}>
      {children}
    </EventListContext.Provider>
  );
};

export const useEventListContext = (): EventListContextValue => {
  const ctx = useContext(EventListContext);
  if (!ctx) {
    throw new Error(
      "useEventListContext must be used within EventListProvider",
    );
  }
  return ctx;
};
