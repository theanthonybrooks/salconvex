import { SearchType } from "@/constants/filterConsts";
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

export interface Filters {
  showHidden?: boolean;
  bookmarkedOnly?: boolean;
  eventTypes?: EventType[];
  eventCategories?: EventCategory[];
  continent?: Continents[];
  eligibility?: string[];
  callType?: string[];
  callFormat?: string;
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
