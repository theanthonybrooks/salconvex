import { EventCategory, EventType } from "@/types/event"

type SortBy = "openCall" | "name" | "eventStart"
type SortDirection = "asc" | "desc"
type Continents =
  | "North America"
  | "Europe"
  | "Asia"
  | "Oceania"
  | "Africa"
  | "South America"

export interface Filters {
  showHidden: boolean
  bookmarkedOnly: boolean
  limit: number
  eventTypes?: EventType[]
  eventCategories?: EventCategory[]
  continent?: Continents
  page?: number
}

export interface SortOptions {
  sortBy: SortBy
  sortDirection: SortDirection
}
