import { ApplicationStatus } from "@/types/event"

export interface Artist {
  id: string
  name: string
  nationality: string[]
  residency: {
    full?: string
    city?: string
    state?: string
    region?: string
    country?: string
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
