import { useMemo } from "react"

import {
  testApplicationsData,
  testArtistData,
  testEventData,
  testOpenCallData,
  testOrganizerData,
} from "@/features/events/data/mockEventData"
import { ApplicationStatus, EventData, OpenCallStatus } from "@/types/event"
import { OpenCall } from "@/types/openCall"
import { Organizer } from "@/types/organizer"

export type CombinedEventCardData = EventData & {
  tabs: { organizer: Organizer; opencall: OpenCall }
  bookmarked: boolean
  hidden: boolean
  status: ApplicationStatus | null
  appFee?: number
  openCallStatus: OpenCallStatus | null
  adminNoteOC?: string | null
}

export const useMockEventCards = (): CombinedEventCardData[] => {
  return useMemo(() => {
    return (
      testEventData
        // Removes any open calls that don't have the boolean of "hasActiveOpenCall" set to true
        //   .filter((e) => e.hasActiveOpenCall)

        .map((event): CombinedEventCardData => {
          const organizer = testOrganizerData.find((o) =>
            event.organizerId?.includes(o.id)
          )
          const openCall = testOpenCallData.find(
            (oc) => oc.eventId === event.id
          )
          const listAction = testArtistData.listActions.find(
            (la) => la.eventId === event.id
          )
          const application = testApplicationsData.find(
            (app) =>
              app.openCallId === openCall?.id &&
              app.artistId === testArtistData.id
          )

          const ocDates = openCall?.basicInfo?.dates
          const now = new Date()
          const start = ocDates?.ocStart ? new Date(ocDates.ocStart) : null
          const end = ocDates?.ocEnd ? new Date(ocDates.ocEnd) : null

          let openCallStatus: "active" | "ended" | "coming-soon" | null = null
          if (start && end) {
            if (now < start) openCallStatus = "coming-soon"
            else if (now > end) openCallStatus = "ended"
            else openCallStatus = "active"
          } else if (!start && end) {
            if (now > end) openCallStatus = "ended"
            else if (now <= end) openCallStatus = "active"
          }
          //   console.log(
          //     "Event ID:",
          //     event.id,
          //     "Matched OpenCall:",
          //     openCall?.id,
          //     openCall
          //   )

          return {
            ...event,
            tabs: { organizer: organizer!, opencall: openCall! },
            bookmarked: listAction?.bookmarked ?? false,
            hidden: listAction?.hidden ?? false,
            status: application?.applicationStatus ?? null,
            adminNoteOC: openCall?.adminNoteOC ?? null,
            appFee: openCall?.basicInfo.appFee ?? 0,
            openCallStatus,
          }
        })
    )
  }, [])
}
