export type CallType =
  | "Fixed"
  | "Rolling"
  | "Email"
  | "Invite"
  | "Unknown"
  | null

export type EventType = "gjm" | "mur" | "pup" | "saf" | "mus" | "oth"
export type EventCategory =
  | "event"
  | "project"
  | "residency"
  | "gfund"
  | "roster"

export type EligibilityType =
  | "International"
  | "National"
  | "Regional/Local"
  | "Other"
  | null

export type ApplicationStatus =
  | "applied"
  | "considering"
  | "to next step"
  | "accepted"
  | "rejected"
  | "pending"
  | "roster"
  | "shortlisted"
  | null

export type OpenCallStatus = "active" | "ended" | "coming-soon" | null

export type RateUnit = "ft²" | "m²"

export interface EventData {
  adminNote?: string
  organizerId: string[]

  id: string
  name: string
  logo: string
  hasActiveOpenCall: boolean
  openCallId?: string[] //list the open call id's that are associated with this event
  eventType?: [EventType] | [EventType, EventType]
  category: EventCategory
  dates: {
    eventStart: string | null
    eventEnd: string
  }

  location: {
    sameAsOrganizer?: boolean
    locale?: string
    city?: string
    state?: string
    stateAbbr?: string //needs this for the preview (so I don't need to map it later)
    region?: string
    country: string
    countryAbbr?: string // get this as well while searching anyways.
    continent?: string
    coordinates?: {
      latitude: number
      longitude: number
    }
    directions: string
  }
  about: string
  links: {
    type: string
    title: string
    href: string
    handle?: string
  }[]
  otherInfo?: string[]
}
