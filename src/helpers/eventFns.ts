import {
  eventCategoryOptions,
  eventTypeOptions,
  freeEvents,
  paidEvents,
} from "@/constants/eventConsts";
import { CALL_TYPE_LABELS } from "@/constants/openCallConsts";
import {
  baseHashtags,
  graffitiEventHashtags,
  muralProjectHashtags,
  pasteUpHashtags,
  streetArtFestivalHashtags,
} from "@/constants/socialConsts";

import type { EventData } from "@/types/eventTypes";
import {
  EventCategory,
  EventType,
  MergedEventPreviewData,
} from "@/types/eventTypes";
import { CallType } from "@/types/openCallTypes";

import currencies from "currency-codes";

import { convertCurrency } from "@/helpers/currencyFns";

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
  abbreviate: boolean = false,
): string => {
  if (!eventType) return "";

  // const getLabel = (type: EventType): string =>
  //   eventTypeOptions.find((opt) => opt.value === type)?.label ?? "Other";
  const getLabel = (type: EventType): string => {
    const opt = eventTypeOptions.find((opt) => opt.value === type);
    if (!opt) return "Other";
    return abbreviate ? opt.abbr : opt.label;
  };

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
  // const currencySymbol = formatter.format(0).replace(/\d/g, "").trim();
  const outputRate = formatter.format(rate);

  if (!total) return `${outputRate}/${unit}+`;

  return `${outputRate}/${unit}`;
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

export type EventLinkFields = Pick<
  MergedEventPreviewData,
  "slug" | "hasOpenCall"
> & {
  dates: Pick<MergedEventPreviewData["dates"], "edition">;
};

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
    const rollingOrEmail = hasOpenCall === "Rolling" || hasOpenCall === "Email";
    const isCurrent = ocStart && now > ocStart && ocEnd && now < ocEnd;
    const isComing = ocEnd && ocStart && now > ocStart && now < ocEnd;
    const isEnded = ocEnd && now > ocEnd;
    if (isCurrent || rollingOrEmail) {
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

type EventTypeCategory = Pick<EventData, "type" | "category">;

export const getEventTags = (event: EventTypeCategory) => {
  const { type, category } = event;
  const parts: string[] = [baseHashtags];

  switch (category) {
    case "project":
      parts.push(muralProjectHashtags);
      break;
    case "residency":
      parts.push("artistresidency resartis");
      break;
    case "gfund":
      parts.push("artgrant artsfunding");
      break;
    case "roster":
      parts.push("artistroster");
      break;
  }

  // if (postType === "socialPost") {
  //   parts.push(postCommentHashtags);
  // } else {
  //   parts.push(recapCommentHashtags);
  // }

  if (type.includes("gjm")) {
    parts.push(graffitiEventHashtags);
  } else if (type.includes("saf")) {
    parts.push(streetArtFestivalHashtags);
  } else if (type.includes("pup")) {
    parts.push(pasteUpHashtags);
  } else if (type.includes("mur")) {
    parts.push(muralProjectHashtags);
  }

  return parts.join(" ");
};
