import { EventCategory, EventType } from "@/types/event";
import { Id } from "~/convex/_generated/dataModel";

type SortBy = "openCall" | "name" | "eventStart";
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
}

export interface SortOptions {
  sortBy: SortBy;
  sortDirection: SortDirection;
}

export interface Pagination {
  page?: number;
}

export interface ArtistEventMetadata {
  bookmarked: Id<"events">[];
  hidden: Id<"events">[];
  applied: Id<"events">[];
}
