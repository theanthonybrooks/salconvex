import { CallType } from "@/types/openCall";
import { DateTime } from "luxon";

export const formatEventDates = (
  start: string,
  end: string,
  ongoing: boolean,
  mode: "desktop" | "mobile" = "desktop",
  preview?: boolean,
) => {
  const isMobile = mode === "mobile";
  if (ongoing) console.log("ongoing");
  if (ongoing) return "Ongoing";
  if (ongoing) console.log("ongoingafter");

  const seasonalTerms = ["spring", "summer", "fall", "winter"];

  const isSeasonalStart = seasonalTerms.some((term) =>
    start.toLowerCase().includes(term),
  );
  const isSeasonalEnd = seasonalTerms.some((term) =>
    end.toLowerCase().includes(term),
  );

  if ((!start.trim() || start === null || !isSeasonalStart) && isSeasonalEnd) {
    return `By ${end}`;
  }

  if (isSeasonalStart || isSeasonalEnd) {
    const startParts = start.split(" ");
    const endParts = end.split(" ");

    const startSeason = startParts[0] || "";
    const endSeason = endParts[0] || "";
    const startYear = startParts[1] || "";
    const endYear = endParts[1] || "";

    if (!startSeason && endSeason) {
      return `By ${end}`;
    }

    return startYear === endYear
      ? `${startSeason} - ${endSeason} ${startYear}`
      : `${start} - ${end}`;
  }

  // Checking for non-full date strings (month and year/year only)
  const isYearOnly = (str: string) => /^\d{4}$/.test(str);
  const isYearAndMonth = (str: string) => /^\d{4}-(0[1-9]|1[0-2])$/.test(str);

  if (isYearOnly(start) && isYearOnly(end)) {
    return start === end ? start : `${start}-${end}`;
  }

  if (isYearAndMonth(start) && isYearAndMonth(end)) {
    const startDate = new Date(start + "-01");
    const endDate = new Date(end + "-01");

    const fullStartMonth = isMobile
      ? getFourCharMonth(startDate)
      : startDate.toLocaleString("en-US", { month: "long" });
    const startMonth = isMobile
      ? startDate.toLocaleString("en-US", { month: "short" })
      : getFourCharMonth(startDate);
    const endMonth = isMobile
      ? endDate.toLocaleString("en-US", { month: "short" })
      : getFourCharMonth(endDate);

    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();

    if (start === end) return `${fullStartMonth} ${startYear}`;

    return startYear === endYear
      ? `${startMonth} - ${endMonth} ${startYear}`
      : `${startMonth} ${startYear} - ${endMonth} ${endYear}`;
  }

  if (isYearOnly(start)) return start;
  if (!isYearOnly(start) && isYearOnly(end)) return `By ${end}`;
  if (isYearAndMonth(start)) {
    const date = new Date(start + "-01");
    const month = date.toLocaleString("en-US", { month: "long" });
    return `${month} ${date.getFullYear()}`;
  }
  if (!isYearAndMonth(start) && isYearAndMonth(end)) {
    const date = new Date(end + "-01");
    const month = date.toLocaleString("en-US", { month: "long" });
    return `By ${month} ${date.getFullYear()}`;
  }

  const startDate = new Date(start);
  const endDate = new Date(end);

  const isStartDateValid = !isNaN(startDate.getTime());
  const isEndDateValid = !isNaN(endDate.getTime());

  const fullMonth = new Intl.DateTimeFormat("en-US", { month: "long" });

  let startMonthShort = "by";
  let startMonthFull = "by";
  let startDay: number | null = null;
  let endDay: number | null = null;
  let startYear: number | null = null;
  let endYear: number | null = null;
  let endMonthShort: string | null = null;
  let endMonthFull: string | null = null;
  let startYearShort: number | string | null = null;
  let endYearShort: number | string | null = null;

  if (isStartDateValid) {
    startMonthShort = isMobile
      ? startDate.toLocaleString("en-US", { month: "short" })
      : getFourCharMonth(startDate);
    startMonthFull = fullMonth.format(startDate);
    startDay = startDate.getDate() || null;
    startYear = startDate.getFullYear();
    startYearShort = isMobile
      ? startDate.getFullYear().toString().slice(2)
      : startYear;
  }

  if (isEndDateValid) {
    endMonthShort = isMobile
      ? endDate.toLocaleString("en-US", { month: "short" })
      : getFourCharMonth(endDate);
    endMonthFull = fullMonth.format(endDate);
    endDay = endDate.getDate() || null;
    endYear = endDate.getFullYear();
    endYearShort = isMobile
      ? endDate.getFullYear().toString().slice(2)
      : endYear;
  }

  if (!startDay) {
    return `By ${endMonthFull} ${endDay}, ${endYear}`;
  }

  if (!endDay) return "Dates unknown";

  if (startYear !== endYear) {
    if (preview) {
      return `${startMonthShort} ${startYear} - ${endMonthShort} ${endYear}`;
    } else {
      return `${startMonthShort} ${startDay}, ${startYearShort} - ${endMonthShort} ${endDay}, ${endYearShort}`;
    }
  } else if (startMonthFull !== endMonthFull) {
    return `${startMonthShort} ${startDay} - ${endMonthShort} ${endDay} (${startYear})`;
  } else if (start === end) {
    return `${getFourCharMonth(startDate)} ${startDay} (${startYear})`;
  } else {
    return `${startMonthShort} ${startDay}-${endDay} (${startYear})`;
  }
};

export const formatOcDates = (start: string, end: string) => {
  const startDate = new Date(start);
  const endDate = new Date(end);

  //TODO: Format this with the four-string length months and ensure that isMobile is also used here.
  const startMonth = startDate.toLocaleString("en-US", { month: "short" });
  const endMonth = endDate.toLocaleString("en-US", { month: "short" });

  const startDay = startDate.getDate();
  const endDay = endDate.getDate();

  const startYear = startDate.getFullYear();
  const endYear = endDate.getFullYear();

  if (startYear !== endYear) {
    return `${startMonth} ${startDay} (${startYear}) - ${endMonth} ${endDay} (${endYear})`;
  } else if (startMonth !== endMonth) {
    return `${startMonth} ${startDay} - ${endMonth} ${endDay} (${startYear})`;
  } else {
    return `${startMonth} ${startDay}-${endDay} (${startYear})`;
  }
};

export const formatOpenCallDeadline = (
  dateString: string,
  timezone: string,
  callType: CallType,
  preview?: boolean,
) => {
  if (callType === "Invite") return "Invite-only";
  if (callType === "Rolling") return "Rolling Open Call";

  if (!dateString) return "Unknown Deadline";

  const dt = DateTime.fromISO(dateString, { setZone: true }).setZone(timezone);
  if (!dt.isValid) return "Invalid date";

  const dateObj = dt.toJSDate();
  const month = getFourCharMonth(dateObj);
  const day = dt.day;
  const year = dt.year;
  const ordinal = getOrdinalSuffix(day);
  const timeZoneFormat = dt.offsetNameShort || `GMT${dt.toFormat("ZZ")}`;

  if (preview) return `${month} ${day}${ordinal}, ${year}`;

  const time = dt.toFormat("h:mm a");
  return `${month} ${day}${ordinal}, ${year} @ ${time} (${timeZoneFormat})`;
};

export const convertOpenCallDatesToUserTimezone = (
  dates: {
    ocStart?: string;
    ocEnd?: string;
  },
  userTimezone: string,
) => {
  const convertToUTC = (localISODate: string | undefined, zone: string) => {
    if (!localISODate) return undefined;
    const dt = DateTime.fromISO(localISODate, { zone });
    return dt.isValid ? dt.toUTC().toISO() : undefined;
  };

  return {
    ocStart: convertToUTC(dates.ocStart, userTimezone),
    ocEnd: convertToUTC(dates.ocEnd, userTimezone),
  };
};
export const formatSingleDate = (date: number) => {
  if (!date) return "";
  // const dt = DateTime.fromISO(date, { setZone: true }).setZone(timezone);
  // const month = getFourCharMonth(dt);
  // const day = dt.day;
  // const year = dt.year;
  // const ordinal = getOrdinalSuffix(day);
  const output = new Date(date).toLocaleString("en-US");

  // return `${month} ${day}${ordinal}, ${year}`;
  return output;
};

export const getOrdinalSuffix = (day: number): string => {
  if (day >= 11 && day <= 13) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
};

export const isoDateRegex =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

// Allow: YYYY, YYYY-MM, YYYY-MM-DD, full ISO with time
export const relaxedIsoRegex =
  /^\d{4}(-\d{2}){0,2}(T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2}))?$/;

/*export const isValidIsoDate = (value: string | null): value is string =>
  typeof value === "string" &&
  isoDateRegex.test(value) &&
  !isNaN(Date.parse(value));*/

export const isValidIsoDate = (value: string | null): value is string => {
  if (typeof value !== "string") return false;

  if (!relaxedIsoRegex.test(value)) return false;

  // Pad partials for Date.parse()
  const padded =
    value.length === 4
      ? `${value}-01-01`
      : value.length === 7
        ? `${value}-01`
        : value;

  return !isNaN(Date.parse(padded));
};

export const getFourCharMonth = (date: Date): string => {
  const monthMap: Record<number, string> = {
    0: "Jan",
    1: "Feb",
    2: "Mar",
    3: "Apr",
    4: "May",
    5: "June",
    6: "July",
    7: "Aug",
    8: "Sept",
    9: "Oct",
    10: "Nov",
    11: "Dec",
  };

  return monthMap[date.getMonth()];
};

// utils/timezone.ts
export async function fetchTimezoneFromCoordinates(
  lat: number,
  lng: number,
): Promise<string | undefined> {
  const key = process.env.TIMEZONE_API_KEY;
  const url = `https://api.timezonedb.com/v2.1/get-time-zone?key=${key}&format=json&by=position&lat=${lat}&lng=${lng}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.status === "OK") return data.zoneName;
  return undefined;
}

/**
 * Converts a datetime-local input and IANA timezone into a properly
 * formatted ISO 8601 string with the correct offset.
 *
 * @param localInput - A datetime string like '2025-03-15T08:00'
 * @param timeZone - An IANA time zone, e.g. 'America/Chicago'
 * @returns ISO 8601 string with offset, e.g. '2025-03-15T08:00:00-05:00'
 */
export function formatToZonedISOString(
  localInput: string,
  timeZone: string,
): string {
  const zoned = DateTime.fromISO(localInput, { zone: timeZone });

  // Return ISO string with offset (includes -05:00 or -06:00)
  return zoned.toISO() ?? "";
}

// export const toDate = (
//   value: string | Date | null | undefined,
// ): Date | null => {
//   // console.log("toDate", value);
//   if (!value) return null;
//   if (value instanceof Date) return value;
//   const date = new Date(value);
//   // console.log("toDate", date);
//   return isNaN(date.getTime()) ? null : date;
// };

export const toDate = (
  value: string | Date | null | undefined,
): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return value;

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    const [, yearStr, monthStr, dayStr] = match;
    return new Date(Number(yearStr), Number(monthStr) - 1, Number(dayStr)); // Local time
  }

  const date = new Date(value);
  console.log(date);
  return isNaN(date.getTime()) ? null : date;
};

export const toYearMonth = (date: Date | null | undefined): string => {
  if (!date) return "";
  // return date.toISOString().slice(0, 7); // "YYYY-MM" but also gave the wrong month sometimes. Need to test this more.
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  console.log(year, month);
  console.log(`${year}-${month}`);
  return `${year}-${month}`; // Local YYYY-MM
};

export const toSeason = (date: Date | null | undefined): string => {
  console.log("toSeason", date);
  if (!date) return "";
  const year = date.getFullYear();
  const month = date.getMonth();
  const quarter = Math.floor(month / 3) + 1;

  const seasonMap: Record<number, string> = {
    1: "Spring",
    2: "Summer",
    3: "Fall",
    4: "Winter",
  };
  console.log("toSeason", seasonMap[quarter], year);
  return `${seasonMap[quarter]} ${year}`;
};

export const toYear = (date: Date | null | undefined): string => {
  if (!date) return "";
  return date.getFullYear().toString();
};

// export const toDateString = (date: Date | null | undefined): string => {
//   if (!date) return "";
//   return date.toISOString().slice(0, 10);
// };

export const toDateString = (date: Date | null | undefined): string => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  console.log(year, month, day);
  console.log(`${year}-${month}-${day}`);
  return `${year}-${month}-${day}`; // Local YYYY-MM-DD
};

export const fromSeason = (input: string): Date | null => {
  const match = input.match(/^(Spring|Summer|Fall|Winter)\s+(\d{4})$/i);
  if (!match) return null;

  const [, seasonRaw, yearStr] = match;
  const year = parseInt(yearStr, 10);
  const season = seasonRaw.toLowerCase();

  const monthMap: Record<string, number> = {
    spring: 0, // Jan
    summer: 3, // April
    fall: 6, // July
    winter: 9, // October
  };

  const month = monthMap[season];
  return new Date(year, month, 1);
};
