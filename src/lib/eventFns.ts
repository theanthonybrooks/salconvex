import {
  CALL_TYPE_LABELS,
  EVENT_CATEGORY_LABELS,
  EVENT_TYPE_LABELS,
} from "@/constants/eventConsts"
import { CallType, EventCategory, EventType } from "@/types/event"

export const getCallTypeLabel = (callType: CallType): string => {
  if (!callType) return ""
  return CALL_TYPE_LABELS[callType] ?? "Unknown"
}

export const getEventTypeLabel = (
  eventType: EventType | [EventType, EventType] | null
): string => {
  if (!eventType) return ""

  if (Array.isArray(eventType)) {
    return eventType
      .filter((type): type is Exclude<EventType, null> => !!type)
      .map((type) => EVENT_TYPE_LABELS[type] ?? "Other")
      .join(" & ")
  }

  return EVENT_TYPE_LABELS[eventType] ?? ""
}

export const getEventCategoryLabel = (eventCategory: EventCategory): string =>
  EVENT_CATEGORY_LABELS[eventCategory] ?? "Unknown"

import currencies from "currency-codes"

export const formatCurrency = (
  min: number,
  max: number | null,
  currency: string,
  preview: boolean = false,
  total: boolean = true
) => {
  const currencyInfo = currencies.code(currency)
  if (!currencyInfo) throw new Error(`Invalid currency code: ${currency}`)

  const locale = new Intl.NumberFormat(undefined, {
    currency,
  }).resolvedOptions().locale

  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: min % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })

  // Extract the currency symbol from formatted output
  const currencySymbol = formatter.format(0).replace(/\d/g, "").trim()

  // Handle different cases
  if (max) {
    if (!preview) {
      return `${currencySymbol}${min.toLocaleString(
        locale
      )} - ${max.toLocaleString(locale)}`
    } else if (min === 0) {
      return `Up to ${currencySymbol}${max.toLocaleString(locale)}+`
    } else {
      return total ? formatter.format(max) : `${formatter.format(max)}+`
    }
  }

  // If no max value, return only min formatted
  return formatter.format(min)
}

export const formatRate = (
  rate: number,
  unit: string,
  currency: string,
  total: boolean = true
) => {
  const currencyInfo = currencies.code(currency)
  if (!currencyInfo) throw new Error(`Invalid currency code: ${currency}`)

  const locale = new Intl.NumberFormat(undefined, {
    currency,
  }).resolvedOptions().locale

  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: rate % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })

  // Extract the currency symbol from formatted output
  const currencySymbol = formatter.format(0).replace(/\d/g, "").trim()

  if (!total) return `${currencySymbol}${rate.toLocaleString(locale)}/${unit}+`

  return `${currencySymbol}${rate.toLocaleString(locale)}/${unit}`
}
