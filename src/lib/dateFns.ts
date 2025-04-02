import { CallType } from "@/types/openCall";
import { DateTime } from "luxon";

export const formatEventDates = (
  start: string,
  end: string,
  ongoing: boolean,
  mode: "desktop" | "mobile" = "desktop",
  preview?: boolean,
) => {
  // console.log("ongoing", ongoing, start, end)
  const isMobile = mode === "mobile";
  if (ongoing) return "Ongoing";

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
  } else {
    return `${startMonthShort} ${startDay}-${endDay} (${startYear})`;
  }
};

export const formatOcDates = (start: string, end: string) => {
  const startDate = new Date(start);
  const endDate = new Date(end);

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

export const isValidIsoDate = (value: string | null): value is string =>
  typeof value === "string" &&
  isoDateRegex.test(value) &&
  !isNaN(Date.parse(value));

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
