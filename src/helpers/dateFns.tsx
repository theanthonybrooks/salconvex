import { EventFormat } from "@/types/eventTypes";
import { CallType } from "@/types/openCallTypes";

import { DateTime } from "luxon";

export const FAR_FUTURE = new Date("9999-12-31");
const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;

export const seasonalTerms = ["spring", "summer", "fall", "winter"];

export const getNextHour = () => {
  const now = new Date();
  const nextHour = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours() + 1,
    0,
    0,
    0,
  );
  return nextHour;
};
export const formatEventDates = (
  start: string,
  end: string,
  eventFormat: EventFormat | null,
  mode: "desktop" | "mobile" = "desktop",
  preview?: boolean,
) => {
  const isMobile = mode === "mobile";
  if (eventFormat === "ongoing") return "Ongoing";
  // if (eventFormat === "noEvent") {
  //   return "No Event Dates";
  // }

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
    if (start === end) {
      return `${start}`;
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
    const startDate = DateTime.fromISO(start, { zone })
      .plus({ hours: 12 })
      .toJSDate();
    const endDate = DateTime.fromISO(end, { zone })
      .plus({ hours: 12 })
      .toJSDate();

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
    // const date = new Date(start + "-01");
    const date = DateTime.fromISO(start, { zone })
      .plus({ hours: 12 })
      .toJSDate();
    const month = date.toLocaleString("en-US", { month: "long" });
    return `${month} ${date.getFullYear()}`;
  }
  if (!isYearAndMonth(start) && isYearAndMonth(end)) {
    // const date = new Date(end + "-01");
    const dt = DateTime.fromISO(end, { zone }).plus({ hours: 12 }).toJSDate();
    const month = dt.toLocaleString("en-US", { month: "long" });
    return `By ${month} ${dt.getFullYear()}`;
  }
  const hasTime = (dt: string) => dt.endsWith("Z") && dt.includes("T");
  const startDt = DateTime.fromISO(start, { zone });
  const endDt = DateTime.fromISO(end, { zone });
  const safeStartDate = hasTime(start) ? startDt : startDt.plus({ hours: 12 });
  const startDate = safeStartDate.toJSDate();
  const safeEndDate = hasTime(end) ? endDt : endDt.plus({ hours: 12 });
  const endDate = safeEndDate.toJSDate();

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
    if (!isMobile) {
      return `By ${endMonthFull} ${endDay}, ${endYear}`;
    } else {
      return `By ${endMonthShort} ${endDay}, ${endYear}`;
    }
  }

  if (!endDay) return "Dates unknown";

  if (startYear !== endYear) {
    if (preview) {
      return `${startMonthShort} ${startYear} - ${endMonthShort} ${endYear}`;
    } else {
      return `${startMonthShort?.slice(0, 3)} ${startDay}, ${startYearShort} - ${endMonthShort?.slice(0, 3)} ${endDay}, ${endYearShort}`;
    }
  } else if (startMonthFull !== endMonthFull) {
    return `${startMonthShort} ${startDay} - ${endMonthShort} ${endDay}, ${startYear}`;
  } else if (start === end) {
    return `${getFourCharMonth(startDate)} ${startDay} (${startYear})`;
  } else {
    return `${startMonthShort} ${startDay}-${endDay} (${startYear})`;
  }
};

export const formatOcDates = (start: string, end: string) => {
  const startDate = new Date(start);
  const endDate = new Date(end);

  //TODO: Format this with the four-string length months and ensure that isMobile is also used here. Check that it's actually displaying correctly!
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

export const getTimezoneFormat = (dateString: string, timezone: string) => {
  const dt = DateTime.fromISO(dateString, { setZone: true }).setZone(timezone);
  const timeZoneFormat = dt.offsetNameShort || `GMT${dt.toFormat("ZZ")}`;
  return timeZoneFormat;
};

export function formatTimeConditionalMinutes(date: DateTime<true>) {
  if (date.minute === 0) {
    return date.toFormat("ha");
  }
  return date.toFormat("h:mma");
}

export const formatOpenCallDeadlineForPost = (
  dateString: string,
  timezone: string,
  callType: CallType,
) => {
  if (callType === "Invite") return "Invite-only";
  if (callType === "Rolling") return "Ongoing";
  if (callType === "Email") return "No Deadline; Email Submissions";
  if (callType === "False") return "No Open Call";

  if (!dateString) return "Unknown Deadline";

  const dt = DateTime.fromISO(dateString, { setZone: true }).setZone(timezone);
  if (!dt.isValid) return "Invalid date";

  const month = dt.monthShort;
  const day = dt.day;
  const year = dt.year;

  return ` ${day} ${month} ${year}`;
};
export const formatOpenCallStartDate = (
  dateString: string,
  timezone: string,
) => {
  const dt = DateTime.fromISO(dateString, { setZone: true }).setZone(timezone);
  if (!dt.isValid) return;

  const month = getFourCharMonthFromLuxon(dt);
  const day = dt.day;
  const ordinal = getOrdinalSuffix(day);
  const year = dt.year;

  return ` ${month} ${day}${ordinal}, ${year} - `;
};
export const formatOpenCallDeadline = (
  dateString: string,
  timezone: string,
  callType: CallType,
  preview?: boolean,
  weeklyRecap?: boolean,
  screenSize?: "mobile" | "tablet" | "desktop" | "xlDesktop",
) => {
  if (callType === "Invite") return "Invite-only";
  if (callType === "Rolling") return "Rolling Open Call";
  if (callType === "Email")
    return (
      <>
        No Deadline;
        <br />
        Email Submissions
      </>
    );
  if (callType === "False") return "No Open Call";

  if (!dateString) return "Unknown Deadline";

  const dt = DateTime.fromISO(dateString, { setZone: true }).setZone(timezone);
  if (!dt.isValid) return "Invalid date";

  // const dateObj = dt.toJSDate();
  // const month = dt.toFormat("LLLL");
  const month = getFourCharMonthFromLuxon(dt);

  const day = dt.day;
  const year = dt.year;
  const ordinal = getOrdinalSuffix(day);
  const time = formatTimeConditionalMinutes(dt);
  const timeZoneFormat = dt.offsetNameShort || `GMT${dt.toFormat("ZZ")}`;

  if (preview) {
    if (screenSize === "mobile") {
      return `${month} ${day} @ ${time}`;
    } else if (screenSize === "tablet") {
      return `${month} ${day}${ordinal} @ ${time}`;
    } else {
      return `${month} ${day}${ordinal}, ${year} @ ${time}`;
    }
  }

  if (weeklyRecap)
    return `${month} ${day}${ordinal} @ ${time} (${timeZoneFormat})`;

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

export const getFourCharMonthFromLuxon = (dt: DateTime): string => {
  const monthMap: Record<number, string> = {
    1: "Jan",
    2: "Feb",
    3: "Mar",
    4: "Apr",
    5: "May",
    6: "June",
    7: "July",
    8: "Aug",
    9: "Sept",
    10: "Oct",
    11: "Nov",
    12: "Dec",
  };

  return monthMap[dt.month];
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

  const dt = DateTime.fromISO(value, { zone });
  if (!dt.isValid) return null;
  return dt.toJSDate();
};

export const toYearMonth = (date: Date | null | undefined): string => {
  if (!date) return "";

  const dt = DateTime.fromJSDate(date, { zone });
  return dt.toFormat("yyyy-MM");
};

export const toSeason = (date: Date | null | undefined): string => {
  // console.log("toSeason", date);
  if (!date) return "";
  const dt = DateTime.fromJSDate(date, { zone });
  const year = dt.year;
  const month = dt.month;
  const quarter = Math.floor((month - 1) / 3) + 1;

  const seasonMap: Record<number, string> = {
    1: "Spring",
    2: "Summer",
    3: "Fall",
    4: "Winter",
  };
  // console.log("toSeason", seasonMap[quarter], year);
  return `${seasonMap[quarter]} ${year}`;
};

export const toYear = (date: Date | null | undefined): string => {
  if (!date) return "";
  // return date.getFullYear().toString();
  const dt = DateTime.fromJSDate(date, { zone });
  return dt.toFormat("yyyy");
};

export const toDateString = (date: Date | null | undefined): string => {
  if (!date) return "";
  // console.log(zone);

  const dt = DateTime.fromJSDate(date, { zone });
  // console.log(dt);
  return dt.toFormat("yyyy-MM-dd");
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
  const dt = DateTime.fromObject({ year, month: month + 1, day: 1 }, { zone });
  return dt.toJSDate();
};

export const parseEventDate = (
  input: string | null | undefined,
): Date | null => {
  if (!input) return null;

  // First try seasonal parsing
  const seasonalMatch = input.match(/^(Spring|Summer|Fall|Winter)\s+\d{4}$/i);
  if (seasonalMatch) {
    return fromSeason(input);
  }

  // Try ISO parsing using relaxedIsoRegex
  if (isValidIsoDate(input)) {
    const padded =
      input.length === 4
        ? `${input}-01-01`
        : input.length === 7
          ? `${input}-01`
          : input;
    const parsed = new Date(padded);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
};

export function formatCondensedDateRange(
  startIso: string,
  endIso: string,
  // tz: string = "UTC",
): string {
  const start = DateTime.fromISO(startIso, { zone: "UTC" });
  const end = DateTime.fromISO(endIso, { zone: "Etc/GMT+12" });

  if (!start.isValid || !end.isValid) return "";

  const startMonth = getFourCharMonthFromLuxon(start);
  const endMonth = getFourCharMonthFromLuxon(end);

  const startDay = start.day;
  const endDay = end.day;

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay}–${endDay}`;
  }

  return `${startMonth} ${startDay} – ${endMonth} ${endDay}`;
}

export function formatDateWithOrdinal(dateString: string): string {
  const date = new Date(dateString);
  const day = date.getDate();
  const year = date.getFullYear();
  const month = date.toLocaleString("default", { month: "long" });

  // Ordinal logic
  const getOrdinal = (n: number) => {
    if (n > 3 && n < 21) return "th";
    switch (n % 10) {
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

  return `${month} ${day}<sup>${getOrdinal(day)}</sup>, ${year}`;
}
export function formatDatePlain(dateString: string): string {
  const date = new Date(dateString);
  const day = date.getDate();
  const year = date.getFullYear();
  const month = date.toLocaleString("default", { month: "long" });
  return `${month} ${day}, ${year}`;
}

export function DateWrapper({ rawTerm }: { rawTerm: string }) {
  return (
    <time
      dateTime={rawTerm}
      dangerouslySetInnerHTML={{
        __html: formatDateWithOrdinal(rawTerm),
      }}
    />
  );
}

export const sameDate = (a: Date | null, b: Date | null) => {
  if (!a || !b) return false;
  const aDay = a.getDate();
  const aMonth = a.getMonth();
  const bDay = b.getDate();
  const bMonth = b.getMonth();
  const aYear = a.getFullYear();
  const bYear = b.getFullYear();

  if (aYear === bYear) {
    return aMonth === bMonth && aDay === bDay;
  }

  return false;
};

export const getYearOptions = (
  startYear: number,
  endYear: number,
): { value: string; label: string }[] => {
  const options = [];
  for (let i = startYear; i <= endYear; i++) {
    options.push({ value: i.toString(), label: i.toString() });
  }
  return options;
};

export const getYearOptionsFromArray = (
  years: number[],
): { value: string; label: string }[] => {
  const sortedYears = years.sort((a, b) => a - b);
  const options = [];
  for (let i = 0; i < sortedYears.length; i++) {
    options.push({ value: years[i].toString(), label: years[i].toString() });
  }
  return options;
};
