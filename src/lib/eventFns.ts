import { CALL_TYPE_LABELS } from "@/constants/openCallConsts";
import { convertCurrency } from "@/lib/currencyFns";
import {
  EventCategory,
  eventCategoryOptions,
  EventType,
  eventTypeOptions,
} from "@/types/event";
import { CallType } from "@/types/openCall";

export const getCallTypeLabel = (callType: CallType): string => {
  if (!callType) return "";
  return CALL_TYPE_LABELS[callType] ?? "Unknown";
};

// export const getEventTypeLabel = (
//   eventType: EventType | [EventType, EventType] | null,
// ): string => {
//   if (!eventType) return "";

//   if (Array.isArray(eventType)) {
//     return eventType
//       .filter((type): type is Exclude<EventType, null> => !!type)
//       .map((type) => EVENT_TYPE_LABELS[type] ?? "Other")
//       .join(" & ");
//   }

//   return EVENT_TYPE_LABELS[eventType] ?? "";
// };

export const getEventTypeLabel = (
  eventType: EventType | [EventType, EventType] | null,
  // eventType: EventType[] | null,
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

export const getEventCategoryLabel = (category: EventCategory): string => {
  return (
    eventCategoryOptions.find((opt) => opt.value === category)?.label ??
    "Unknown"
  );
};

export const getEventCategoryLabelAbbr = (category: EventCategory): string => {
  return (
    eventCategoryOptions.find((opt) => opt.value === category)?.abbr ??
    "Unknown"
  );
};

import currencies from "currency-codes";

export const formatCurrency = (
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
  if (max) {
    if (!preview) {
      return `${currencySymbol}${min.toLocaleString(
        locale,
      )} - ${max.toLocaleString(locale)}`;
    } else if (min === 0) {
      return `Up to ${currencySymbol}${max.toLocaleString(locale)}+`;
    } else {
      return total ? formatter.format(max) : `${formatter.format(max)}+`;
    }
  }

  // If no max value, return only min formatted
  return formatter.format(min);
};

export const formatCompCurrency = (value: number, currency: string) => {
  if (value === 0) return "Not Provided";
  const currencyInfo = currencies.code(currency);
  if (!currencyInfo) throw new Error(`Invalid currency code: ${currency}`);

  const locale = new Intl.NumberFormat(undefined, {
    currency,
  }).resolvedOptions().locale;

  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });

  // Extract the currency symbol from formatted output
  // const currencySymbol = formatter.format(0).replace(/\d/g, "").trim();

  // // Handle different cases
  // if (max) {
  //   if (!preview) {
  //     return `${currencySymbol}${min.toLocaleString(
  //       locale,
  //     )} - ${max.toLocaleString(locale)}`;
  //   } else if (min === 0) {
  //     return `Up to ${currencySymbol}${max.toLocaleString(locale)}+`;
  //   } else {
  //     return total ? formatter.format(max) : `${formatter.format(max)}+`;
  //   }
  // }

  // If no max value, return only min formatted
  return formatter.format(value);
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
