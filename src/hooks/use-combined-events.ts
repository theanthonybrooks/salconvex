import { useMemo } from "react"

import {
  testApplicationsData,
  testArtistData,
  testEventData,
  testOpenCallData,
  testOrganizerData,
} from "@/features/events/data/mockEventData"
import { EventData } from "@/types/event"
import { ApplicationStatus, OpenCall, OpenCallStatus } from "@/types/openCall"
import { Organizer } from "@/types/organizer"

export type CombinedEventCardData = EventData & {
  tabs: { organizer: Organizer; opencall: OpenCall }
  bookmarked: boolean
  hidden: boolean
  status: ApplicationStatus | null
  hasActiveOpenCall: boolean
  appFee?: number
  openCallStatus: OpenCallStatus | null
  adminNoteOC?: string | null
}

export const useMockEventCards = (): CombinedEventCardData[] => {
  return useMemo(() => {
    return testEventData.flatMap((event) => {
      const organizer = testOrganizerData.find((o) =>
        event.organizerId?.includes(o.id)
      )
      if (!organizer)
        throw new Error(`No organizer found for event ${event.id}`)

      const openCalls = testOpenCallData.filter((oc) => oc.eventId === event.id)

      if (openCalls.length === 0) {
        // Case: Event has no open call
        const listAction = testArtistData.listActions.find(
          (la) => la.eventId === event.id
        )

        return [
          {
            ...event,
            tabs: {
              organizer: organizer,
              opencall: null as unknown as OpenCall, // or handle as optional
            },
            bookmarked: listAction?.bookmarked ?? false,
            hidden: listAction?.hidden ?? false,
            status: null,
            adminNoteOC: null,
            appFee: 0,
            hasActiveOpenCall: false,
            openCallStatus: null,
          },
        ]
      }

      // Case: Event has one or more open calls
      return openCalls.map((openCall) => {
        const listAction = testArtistData.listActions.find(
          (la) => la.eventId === event.id
        )

        const application = testApplicationsData.find(
          (app) =>
            app.openCallId === openCall.id && app.artistId === testArtistData.id
        )

        const ocDates = openCall?.basicInfo?.dates
        const ocType = openCall?.basicInfo?.callType

        const now = new Date()
        const start = ocDates?.ocStart ? new Date(ocDates.ocStart) : null
        const end = ocDates?.ocEnd ? new Date(ocDates.ocEnd) : null

        let openCallStatus: OpenCallStatus | null = null
        if (start && end && ocType === "Fixed") {
          if (now < start) openCallStatus = "coming-soon"
          else if (now > end) openCallStatus = "ended"
          else openCallStatus = "active"
        } else if (!start && end && ocType === "Fixed") {
          if (now > end) openCallStatus = "ended"
          else openCallStatus = "active"
        } else if (ocType === "Rolling") {
          openCallStatus = "active"
        } else if (ocType === "Email" && end) {
          if (now > end) openCallStatus = "ended"
          else openCallStatus = "active"
        } else {
          openCallStatus = null
        }

        const hasActiveOpenCall = openCallStatus === "active"

        return {
          ...event,
          tabs: { organizer: organizer, opencall: openCall },
          bookmarked: listAction?.bookmarked ?? false,
          hidden: listAction?.hidden ?? false,
          status: application?.applicationStatus ?? null,
          adminNoteOC: openCall?.adminNoteOC ?? null,
          appFee: openCall?.basicInfo.appFee ?? 0,
          hasActiveOpenCall,
          openCallStatus,
        }
      })
    })
  }, [])
}
