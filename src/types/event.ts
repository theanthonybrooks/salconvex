export type EventType = "gjm" | "mur" | "pup" | "saf" | "mus" | "oth"
export type EventCategory =
  | "event"
  | "project"
  | "residency"
  | "gfund"
  | "roster"

export interface EventData {
  id: string
  adminNote?: string
  organizerId: string[]
  mainOrgId: string
  openCallId?: string[] //list the open call id's that are associated with this event

  name: string
  logo: string
  eventType?: [EventType] | [EventType, EventType]
  category: EventCategory
  dates: {
    eventStart?: string
    eventEnd?: string
    ongoing: boolean
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
