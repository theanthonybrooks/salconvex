import { ApplicationStatus } from "@/types/openCall"

export interface Artist {
  id: string
  name: string
  nationality: string[]
  residency: {
    full?: string
    city?: string
    state?: string
    stateAbbr?: string
    region?: string
    country?: string
    countryAbbr?: string
    timezone?: string
    timezoneOffset?: number
    location?: {
      latitude: number
      longitude: number
    }
  }
  documents: {
    cv?: string
    resume?: string
    artistStatement?: string
    images?: string[]
  }
  applications: {
    eventName: string
    applicationId: string
    applicationStatus: ApplicationStatus
  }[]
  listActions: {
    eventId: string
    hidden: boolean
    bookmarked: boolean
  }[]
}
