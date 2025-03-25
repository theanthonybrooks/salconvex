import { CallType } from "@/types/event"
import { DateTime } from "luxon"

export const formatEventDates = (
  start: string,
  end: string,
  preview?: boolean
) => {
  const seasonalTerms = ["spring", "summer", "fall", "winter"]

  // Convert to lowercase for case-insensitive comparison
  const isSeasonalStart = seasonalTerms.some((term) =>
    start.toLowerCase().includes(term)
  )
  const isSeasonalEnd = seasonalTerms.some((term) =>
    end.toLowerCase().includes(term)
  )

  // If the end date is seasonal and the start date is missing, return "By [end season]"
  if (!start.trim() && isSeasonalEnd) {
    return `By ${end}`
  }

  // If either start or end is a seasonal term, format properly
  if (isSeasonalStart || isSeasonalEnd) {
    const startParts = start.split(" ")
    const endParts = end.split(" ")

    const startSeason = startParts[0] || "" // e.g., "Spring"
    const endSeason = endParts[0] || "" // e.g., "Summer"
    const startYear = startParts[1] || "" // e.g., "2025"
    const endYear = endParts[1] || "" // e.g., "2025"

    // If the start is missing but the end is seasonal, return "By [end season]"
    if (!startSeason && endSeason) {
      return `By ${end}`
    }

    // Avoid repeating the year if it's the same
    return startYear === endYear
      ? `${startSeason} - ${endSeason} ${startYear}`
      : `${start} - ${end}`
  }

  const startDate = new Date(start)
  const endDate = new Date(end)

  const fullMonth = new Intl.DateTimeFormat("en-US", { month: "long" })
  const shortMonth = new Intl.DateTimeFormat("en-US", { month: "short" })

  const startMonthShort = shortMonth.format(startDate)
  const startMonthFull = fullMonth.format(startDate)
  const endMonthShort = shortMonth.format(endDate)
  const endMonthFull = fullMonth.format(endDate)

  const startDay = startDate.getDate() || null // Handle falsy values
  const endDay = endDate.getDate()

  const startYear = startDate.getFullYear()
  const endYear = endDate.getFullYear()

  // If startDay is missing, return "By [end date]"
  if (!startDay) {
    return `By ${endMonthFull} ${endDay}, ${endYear}`
  }

  if (startYear !== endYear) {
    if (preview) {
      return `${startMonthShort} ${startYear} - ${endMonthShort} ${endYear}`
    } else {
      return `${startMonthShort} ${startDay}, ${startYear} - ${endMonthShort} ${endDay}, ${endYear}`
    }
  } else if (startMonthFull !== endMonthFull) {
    return `${startMonthShort} ${startDay} - ${endMonthShort} ${endDay} (${startYear})`
  } else {
    return `${startMonthFull} ${startDay}-${endDay} (${startYear})`
  }
}

export const formatOcDates = (start: string, end: string) => {
  const startDate = new Date(start)
  const endDate = new Date(end)

  const startMonth = startDate.toLocaleString("en-US", { month: "short" })
  const endMonth = endDate.toLocaleString("en-US", { month: "short" })

  const startDay = startDate.getDate()
  const endDay = endDate.getDate()

  const startYear = startDate.getFullYear()
  const endYear = endDate.getFullYear()

  if (startYear !== endYear) {
    // Different years → "Jul 10, 2025 - Aug 5, 2026"
    return `${startMonth} ${startDay}, ${startYear} - ${endMonth} ${endDay}, ${endYear}`
  } else if (startMonth !== endMonth) {
    // Same year, different months → "Jul 10 - Aug 5, 2025"
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${startYear}`
  } else {
    // Same month → "Jul 10-20, 2025"
    return `${startMonth} ${startDay}-${endDay}, ${startYear}`
  }
}

export const formatOpenCallDeadline = (
  dateString: string,
  timezone: string,
  callType: CallType,
  preview?: boolean
) => {
  if (!dateString) {
    return "Unknown Deadline"
  }
  if (callType === "Invite") return "Invite-only"
  else if (callType === "Rolling") return "Rolling Open Call"

  const dt = DateTime.fromISO(dateString, { setZone: true }).setZone(timezone)
  if (!dt.isValid) return "Invalid date"
  const ordinalSuffix = getOrdinalSuffix(dt.day)
  const timeZoneFormat = dt.offsetNameShort || `GMT${dt.toFormat("ZZ")}`
  if (preview) return dt.toFormat(`MMM d'${ordinalSuffix}', yyyy`)

  return `${dt.toFormat(
    `MMM d'${ordinalSuffix}', yyyy @ h:mm a`
  )} (${timeZoneFormat})`
}

const getOrdinalSuffix = (day: number): string => {
  if (day >= 11 && day <= 13) return "th" // Special case for 11-13
  switch (day % 10) {
    case 1:
      return "st"
    case 2:
      return "nd"
    case 3:
      return "rd"
    default:
      return "th"
  }
}
