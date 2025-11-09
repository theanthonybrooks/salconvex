import { SearchType } from "@/constants/filterConsts";

import type {
  CallFormat,
  CallType,
  EligibilityType,
} from "@/types/openCallTypes";
import {
  EventCategory,
  EventType,
  PostStatusOptions,
} from "@/types/eventTypes";

type SortBy =
  | "openCall"
  | "name"
  | "eventStart"
  | "country"
  | "organizer"
  | "recent";
type SortDirection = "asc" | "desc";
export type Continents =
  | "North America"
  | "Europe"
  | "Asia"
  | "Oceania"
  | "Africa"
  | "South America";

type ExtendedCallFormat = CallFormat | "";

export interface Filters {
  showHidden?: boolean;
  bookmarkedOnly?: boolean;
  eventTypes?: EventType[];
  eventCategories?: EventCategory[];
  continent?: Continents[];
  eligibility?: EligibilityType[];
  callType?: CallType[];
  callFormat?: ExtendedCallFormat;
  limit: number;
  postStatus?: PostStatusOptions;
}

export interface SortOptions {
  sortBy: SortBy;
  sortDirection: SortDirection;
}

export interface Pagination {
  page?: number;
}

export type SearchParams = {
  searchTerm?: string;
  searchType: SearchType;
};
