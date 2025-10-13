import { ViewOptions } from "@/features/events/event-list-client";
import { EventCategory, EventType } from "@/types/event";
import { Filters, SortOptions } from "@/types/thelist";
import { Dispatch, SetStateAction } from "react";

export const searchTermOptions = [
  { value: "all", label: "All" },
  { value: "events", label: "Event Name" },
  { value: "orgs", label: "Organizer Name" },
  { value: "loc", label: "Location" },
] as const;

export type SearchType = (typeof searchTermOptions)[number]["value"];

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
}

export interface FilterDrawerProps<T extends TheListFilterCommandItem> {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  isMobile?: boolean;
  title: string;
  source: T[];
  shortcut?: string;
  placeholder?: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  userType?: string[];
  userRole?: string[] | undefined;
  filters: Filters;
  sortOptions: SortOptions;
  onChange: (newFilters: Partial<Filters>) => void;
  onSortChange: (newSort: Partial<SortOptions>) => void;
  searchType: SearchType;
  setSearchType: React.Dispatch<React.SetStateAction<SearchType>>;
  onResetFilters: () => void;
  // user: User | null;
  hasActiveFilters: boolean | undefined;
  view: ViewOptions;
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
