import {
  eventCategoryOptions,
  eventTypeOptions,
  freeEvents,
  paidEvents,
} from "@/constants/eventConsts";
import { CALL_TYPE_LABELS } from "@/constants/openCallConsts";
import { convertCurrency } from "@/helpers/currencyFns";
import {
  EventCategory,
  EventType,
  MergedEventPreviewData,
} from "@/types/eventTypes";
import { CallType } from "@/types/openCallTypes";
import currencies from "currency-codes";

export const isFreeEvent = (eventTypes: EventType[] | string[]): boolean => {
  const hasFree = eventTypes.some((type) => freeEvents.includes(type));
  const hasPaid = eventTypes.some((type) => paidEvents.includes(type));
  return hasFree && !hasPaid;
};

export const getCallTypeLabel = (callType: CallType): string => {
  if (!callType) return "";
  return CALL_TYPE_LABELS[callType] ?? "Unknown";
};

export const getEventTypeLabel = (
  eventType: EventType | EventType[] | null,
): string => {
  if (!eventType) return "";

  const getLabel = (type: EventType): string =>
    eventTypeOptions.find((opt) => opt.value === type)?.label ?? "Other";

  if (Array.isArray(eventType)) {
    return eventType
      .filter((type): type is EventType => !!type)
      .map(getLabel)
      .join(" & ");
  }
  return getLabel(eventType);
};

export const getEventCategoryLabel = (
  category: EventCategory,
  abbreviate: boolean = false,
): string => {
  const match = eventCategoryOptions.find((opt) => opt.value === category);

  return (abbreviate ? match?.abbr : match?.label) ?? "Unknown";
};

export const formatBudgetCurrency = (
  min: number,
  max: number | undefined,
  currency: string,
  preview: boolean = false,
  total: boolean = true,
) => {
  if (min === 0 && (!max || max === 0)) return "No Info";
  const currencyInfo = currencies.code(currency);
  if (!currencyInfo) throw new Error(`Invalid currency code: ${currency}`);

  const locale = new Intl.NumberFormat(undefined, {
    currency,
  }).resolvedOptions().locale;

  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: min % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });

  // Extract the currency symbol from formatted output
  const currencySymbol = formatter.format(0).replace(/\d/g, "").trim();

  // Handle different cases
  if (max && min !== max) {
    if (!preview && min !== 0) {
      return `${currencySymbol}${min.toLocaleString(
        locale,
      )} - ${max.toLocaleString(locale)}`;
    } else if (min === 0) {
      return `Up to ${currencySymbol}${max.toLocaleString(locale)}`;
    } else {
      return total ? formatter.format(max) : `${formatter.format(max)}+`;
    }
  }

  // If no max value, return only min formatted
  return formatter.format(min);
};

export const formatRate = (
  rate: number,
  unit: string,
  currency: string,
  total: boolean = true,
) => {
  if (rate === 0) return null;
  const currencyInfo = currencies.code(currency);
  if (!currencyInfo) throw new Error(`Invalid currency code: ${currency}`);

  const locale = new Intl.NumberFormat(undefined, {
    currency,
  }).resolvedOptions().locale;

  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: rate % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });

  // Extract the currency symbol from formatted output
  const currencySymbol = formatter.format(0).replace(/\d/g, "").trim();

  if (!total) return `${currencySymbol}${rate.toLocaleString(locale)}/${unit}+`;

  return `${currencySymbol}${rate.toLocaleString(locale)}/${unit}`;
};

export const formatCurrencyServer = async (
  min: number,
  max: number | null,
  currency: string,
  preview: boolean = false,
  total: boolean = true,
  userCurrency?: string,
) => {
  const currencyInfo = currencies.code(currency);
  if (!currencyInfo) throw new Error(`Invalid currency code: ${currency}`);

  let currencyMin = min;
  let currencyMax = max;
  if (userCurrency && userCurrency !== currency) {
    currencyMin = await convertCurrency({
      amount: min,
      from: currency,
      to: userCurrency,
    });
    currencyMax = max
      ? await convertCurrency({ amount: max, from: currency, to: userCurrency })
      : null;
  }

  const locale = new Intl.NumberFormat(undefined, {
    currency: userCurrency || currency,
  }).resolvedOptions().locale;

  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: userCurrency || currency,
    minimumFractionDigits: min % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });

  // Extract the currency symbol from formatted output
  const currencySymbol = formatter.format(0).replace(/\d/g, "").trim();

  // Handle different cases
  if (currencyMax) {
    if (!preview) {
      return `${currencySymbol}${currencyMin.toLocaleString(
        locale,
      )} - ${currencyMax.toLocaleString(locale)}`;
    } else if (currencyMin === 0) {
      return `Up to ${currencySymbol}${currencyMax.toLocaleString(locale)}+`;
    } else {
      return total
        ? formatter.format(currencyMax)
        : `${formatter.format(currencyMax)}+`;
    }
  }

  // If no max value, return only min formatted
  return formatter.format(currencyMin);
};

export const formatRateServer = async (
  rate: number,
  unit: string,
  currency: string,
  total: boolean = true,
  userCurrency?: string,
) => {
  const currencyInfo = currencies.code(currency);
  if (!currencyInfo) throw new Error(`Invalid currency code: ${currency}`);

  let convertedRate = rate;
  if (userCurrency && userCurrency !== currency) {
    convertedRate = await convertCurrency({
      amount: rate,
      from: currency,
      to: userCurrency,
    });
  }

  const locale = new Intl.NumberFormat(undefined, {
    currency: userCurrency || currency,
  }).resolvedOptions().locale;

  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: userCurrency || currency,
    minimumFractionDigits: rate % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });

  // Extract the currency symbol from formatted output
  const currencySymbol = formatter.format(0).replace(/\d/g, "").trim();

  if (!total)
    return `${currencySymbol}${convertedRate.toLocaleString(locale)}/${unit}+`;

  return `${currencySymbol}${convertedRate.toLocaleString(locale)}/${unit}`;
};

export type EventLinkFields = Pick<MergedEventPreviewData, "slug" | "dates" | "hasOpenCall">;


export const formatEventLink = (
  event: EventLinkFields,
  activeSub?: boolean,
  toEvent?: boolean,
) => {
  const { slug, dates, hasOpenCall } = event;
  return `/thelist/event/${slug}/${dates?.edition}/${hasOpenCall && activeSub ? "call" : ""}${activeSub && toEvent ? "?tab=event" : ""}`;
};

type OpenCallStatusProps = {
  event: MergedEventPreviewData;
};

export const getOpenCallStatusLabel = ({
  event,
}: OpenCallStatusProps): number => {
  const { hasOpenCall } = event;
  const { openCall } = event.tabs;
  const now = Date.now();
  const ocStart = openCall?.basicInfo?.dates?.ocStart
    ? new Date(openCall.basicInfo.dates.ocStart).getTime()
    : null;
  const ocEnd = openCall?.basicInfo?.dates?.ocEnd
    ? new Date(openCall.basicInfo.dates.ocEnd).getTime()
    : null;

  if (hasOpenCall) {
    const isCurrent = ocStart && now > ocStart && ocEnd && now < ocEnd;
    const isComing = ocEnd && ocStart && now > ocStart && now < ocEnd;
    const isEnded = ocEnd && now > ocEnd;
    if (isCurrent) {
      return 2;
    } else if (isComing) {
      return 3;
    } else if (isEnded) {
      return 1;
    } else {
      return 0;
    }
  } else {
    return 0;
  }
};
