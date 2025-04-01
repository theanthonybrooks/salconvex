// // lib/grouping.ts

// import { CombinedEventCardData } from "@/hooks/use-combined-events"
// import { getFourCharMonth, getOrdinalSuffix } from "@/lib/dateFns"
// import { format } from "date-fns"

// export function getGroupKeyFromEvent(
//   event: CombinedEventCardData,
//   sortBy: string
// ): string {
//   const basicInfo = event.tabs.opencall?.basicInfo
//   const callType = basicInfo?.callType
//   const ocEnd = basicInfo?.dates?.ocEnd
//   const eventStart = event.dates?.eventStart
//   const hasOpenCall = event.hasActiveOpenCall
//   const isPast = ocEnd ? new Date(ocEnd) < new Date() : false
//   const day = ocEnd && new Date(ocEnd).getDate()

//   if (sortBy === "openCall") {
//     if (callType === "Fixed" && !isPast && day) {
//       return (
//         getFourCharMonth(new Date(ocEnd)) +
//         format(new Date(ocEnd), " d") +
//         getOrdinalSuffix(day)
//       )

//       // return getFourCharMonth(new Date(ocEnd)) + format(new Date(ocEnd), " d")
//     }
//     if (callType === "Fixed" && isPast && day) {
//       return (
//         getFourCharMonth(new Date(ocEnd)) +
//         format(new Date(ocEnd), " d") +
//         `<sup>${getOrdinalSuffix(day)}</sup>` +
//         format(new Date(ocEnd), " (yyyy)")
//       )
//     }
//     if (callType === "Rolling") return "Rolling Open Call"
//     if (callType === "Email") return "Email Open Call"
//     if (hasOpenCall) return "Open Call – Unknown Type"
//     if (!!callType) return "Past Open Call"
//     return "No Public Open Call"
//   }

//   if (sortBy === "eventStart") {
//     return eventStart
//       ? `Event Start – ${format(new Date(eventStart), "MMM d, yyyy")}`
//       : "No Event Date"
//   }

//   return "Ungrouped"
// }

// lib/grouping.ts

import { CombinedEventCardData } from "@/hooks/use-combined-events"
import { getFourCharMonth, getOrdinalSuffix } from "@/lib/dateFns"
import { format } from "date-fns"

export function getGroupKeyFromEvent(
  event: CombinedEventCardData,
  sortBy: string
): {
  raw: string
  parts?: {
    month: string
    day: number
    suffix: string
    year?: string
  }
} {
  const basicInfo = event.tabs.opencall?.basicInfo
  const callType = basicInfo?.callType
  const ocEnd = basicInfo?.dates?.ocEnd
  const eventStart = event.dates?.eventStart
  const hasOpenCall = event.hasActiveOpenCall
  const isPast = ocEnd ? new Date(ocEnd) < new Date() : false
  const day = ocEnd && new Date(ocEnd).getDate()

  if (sortBy === "openCall" && callType === "Fixed" && day) {
    const month = getFourCharMonth(new Date(ocEnd))
    const suffix = getOrdinalSuffix(day)
    const year = isPast ? format(new Date(ocEnd), "yyyy") : undefined

    return {
      raw: `${month} ${day}${suffix}${year ? ` (${year})` : ""}`,
      parts: { month, day, suffix, year },
    }
  }

  if (sortBy === "openCall") {
    if (callType === "Rolling") return { raw: "Rolling Open Call" }
    if (callType === "Email") return { raw: "Email Open Call" }
    if (hasOpenCall) return { raw: "Open Call – Unknown Type" }
    if (!!callType) return { raw: "Past Open Call" }
    return { raw: "No Public Open Call" }
  }

  if (sortBy === "eventStart" && eventStart) {
    return {
      raw: `Event Start – ${format(new Date(eventStart), "MMM d, yyyy")}`,
    }
  }

  return { raw: "Ungrouped" }
}
