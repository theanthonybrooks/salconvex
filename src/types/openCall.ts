export type CallType =
  | "Fixed"
  | "Rolling"
  | "Email"
  | "Invite"
  | "Unknown"
  | null

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

export interface OpenCall {
  adminNoteOC?: string
  id: string //This is what will be used in the application data for artists
  eventId: string
  organizerId: string[]
  mainOrgId: string

  basicInfo: {
    appFee: number
    callFormat: "RFP" | "RFQ"
    callType: CallType
    dates: {
      ocStart: string | null //null for rolling, email, etc or just open calls without dates
      ocEnd: string | null
      timezone: string //TODO: Ensure that the accurate timezone is passed when the events are submitted. Perhaps get this from the event location? I have to see what's possible.
    }
  }
  eligibility: {
    type: EligibilityType
    whom: string
    details?: string
  }
  compensation: {
    budget: {
      min: number
      max?: number
      rate: number
      unit: RateUnit
      currency: string
      allInclusive: boolean
    }
    categories: {
      designFee?: string
      accommodation?: string
      food?: string
      travelCosts?: string
      materials?: string
      equipment?: string
      other?: string
    }
  }
  requirements: {
    requirements: string[]
    more: string[]
    destination: string
    documents?: {
      title: string
      href: string
    }[]
    otherInfo?: string[]
  }
}

export interface OpenCallApplication {
  openCallId: string
  artistId: string
  applicationId: string
  applicationStatus: ApplicationStatus
}
