import { Dispatch, SetStateAction } from "react";
import {
  EventCategory,
  EventType,
  MergedEventPreviewData,
} from "@/types/eventTypes";
import { Filters, SearchParams, SortOptions } from "@/types/thelist";

import { ViewOptions } from "@/features/events/event-list-client";

export const searchTypeOptions = [
  { value: "all", label: "All" },
  { value: "events", label: "Event Name" },
  { value: "orgs", label: "Organizer Name" },
  { value: "loc", label: "Location" },
] as const;

export type SearchType = (typeof searchTypeOptions)[number]["value"];

export interface TheListFilterCommandItem {
  label?: string;
  name?: string;
  icon?: React.ComponentType<{ className?: string }>;
  path?: string;
  href?: string;
  group?: string;
  meta?: string;
  edition?: number;
  category?: string;
  ocStatus?: number;
  orgName?: string;
}

export interface FilterDrawerProps<T extends TheListFilterCommandItem> {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  isMobile?: boolean;
  title: string;
  source: T[];
  shortcut?: string;
  placeholder?: string;
  userType?: string[];
  userRole?: string[] | undefined;
  search: SearchParams;
  filters: Filters;
  sortOptions: SortOptions;
  onSearchChange: (newSearch: Partial<SearchParams>) => void;
  onChange: (newFilters: Partial<Filters>) => void;
  onSortChange: (newSort: Partial<SortOptions>) => void;
  onResetFilters: () => void;
  isLoading: boolean;
  // user: User | null;
  hasActiveFilters: boolean | undefined;
  view: ViewOptions;
  results: MergedEventPreviewData[];
  localValue: string;
  setLocalValue: Dispatch<SetStateAction<string>>;
  searchType: SearchType;
  setSearchType: Dispatch<SetStateAction<SearchType>>;
}

export type Location = {
  full?: string;
  city?: string;
  stateAbbr?: string;
  countryAbbr?: string;
};

export type EventResult = {
  name: string;
  slug: string;
  category: EventCategory;
  type?: EventType[];
  dates?: { edition?: number };
  location?: Location;
  ocStatus: number;
};

export type OrgResult = {
  name: string;
  slug: string;
  location?: Location;
};

export type AllSearchResults = {
  eventName: EventResult[];
  orgName: OrgResult[];
  eventLoc: EventResult[];
  orgLoc: OrgResult[];
};
