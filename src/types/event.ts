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

export type RateUnit = "ft²" | "m²"

export interface EventData {
  id: number
  logo: string
  openCall: boolean
  appFee: number
  callFormat: string
  callType: CallType
  eventType: EventType | [EventType, EventType]
  eventCategory: EventCategory

  location: {
    locale: string | null
    city: string
    state: string
    stateAbbr: string
    country: string
    countryAbbr: string
    continent: string
  }
  dates: {
    eventStart: string | null
    eventEnd: string
    ocStart: string
    ocEnd: string
    timezone: string
  }

  eligibilityType: EligibilityType
  eligibility: string
  eligibilityDetails: string | null
  budgetMin: number
  budgetMax: number | null
  currency: string
  budgetRate: number
  budgetRateUnit: RateUnit
  allInclusive: boolean

  status: "accepted" | "rejected" | "pending"
  bookmarked: boolean
  hidden: boolean
  event: {
    name: string
    location: string
    dates: string
    category: string
    type: string
  }
  tabs: {
    opencall: {
      compensation: {
        designFee: number | null
        accommodation: string | null
        food: string | null
        travelCosts: string | null
        materials: string | null
        equipment: string | null
        other: string | null
      }
      requirements: string[]
    }
    event: {
      location: {
        map: string
        directions: string
      }
      about: string
      links: string[]
    }
    organizer: {
      name: string
      location: string
      about: string
      contact: {
        organizer: string
        email: string
      }
      links: string[]
    }
  }
}
