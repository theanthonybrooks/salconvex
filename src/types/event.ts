export type EventType = "gjm" | "mur" | "pup" | "saf" | "mus" | "oth"
export type EventCategory =
  | "event"
  | "project"
  | "residency"
  | "gfund"
  | "roster"

export interface EventData {
  adminNote?: string
  organizerId: string[]
  mainOrgId: string

  id: string
  name: string
  logo: string
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
    stateAbbr?: string
    region?: string
    country: string
    countryAbbr?: string
    continent?: string
    coordinates?: {
      latitude: number
      longitude: number
    }
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
