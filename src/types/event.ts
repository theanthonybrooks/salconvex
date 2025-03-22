export type CallType =
  | "Fixed"
  | "Rolling"
  | "Email"
  | "Invite"
  | "Unknown"
  | null

export type EventType = "gjm" | "mur" | "pup" | "saf" | "mus" | "oth" | null
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
  callFormat: "RFP" | "RFQ"
  callType: CallType
  eventType: EventType | [EventType, EventType]
  eventCategory: EventCategory

  location: {
    sameAsOrganizer?: boolean
    locale: string | null
    city: string | null
    state: string | null
    stateAbbr: string | null
    region: string | null
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

  status: "accepted" | "rejected" | "pending" | null
  bookmarked: boolean
  hidden: boolean
  event: {
    name: string
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
      requirementsMore: string[]
      requirementDestination: string
      documents: {
        title: string
        href: string
      }[]
      otherInfo?: string[]
    }
    event: {
      location: {
        latitude: number
        longitude: number

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
    organizer: {
      id: number
      name: string
      logo: string
      location: {
        locale: string | null
        city: string | null
        state: string | null
        stateAbbr: string | null
        region: string | null
        country: string
        countryAbbr: string
        continent: string
      }
      about: string
      contact: {
        organizer: string
        primaryContact: {
          email?: string
          phone?: string
          href?: string
        }
      }
      links: {
        website?: string
        instagram?: string
        facebook?: string
        threads?: string
        email?: string
        vk?: string
        phone?: string
        address?: string
      }
    }
  }
}
