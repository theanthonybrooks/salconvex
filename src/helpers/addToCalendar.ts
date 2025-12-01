import { siteUrl } from "@/constants/siteInfo";

import { EventCategory } from "@/types/eventTypes";

import sanitizeHtml from "sanitize-html";

import { getFourCharMonth, isValidIsoDate } from "@/helpers/dateFns";
import { getEventCategoryLabel } from "@/helpers/eventFns";
import { cleanInput } from "@/helpers/utilsFns";

const formatIsoDate = (dateStr: string) =>
  new Date(dateStr).toISOString().replace(/-|:|\.\d+/g, "");

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    timeZoneName: "short",
  });

const formatDates = (start: string, end: string) => {
  const validStart = isValidIsoDate(start);
  const validEnd = isValidIsoDate(end);
  if (!validStart || !validEnd) return "(No Event Dates) ";
  const startDate = new Date(start);
  const endDate = new Date(end);
  const startMonth = getFourCharMonth(startDate);
  const startDay = startDate.getDate() || null;
  const startYear = startDate.getFullYear();
  const endMonth = getFourCharMonth(endDate);
  const endDay = endDate.getDate();
  const endYear = endDate.getFullYear();
  //TODO: Add functionality to include all event dates and not just the first set of start/end.

  if (startYear !== endYear) {
    return `${startMonth} ${startDay}, ${startYear} - ${endMonth} ${endDay}, ${endYear}`;
  } else {
    if (startMonth !== endMonth) {
      return `${startMonth} ${startDay} - ${endMonth} ${endDay} (${startYear})`;
    } else if (startDay !== endDay) {
      return `${startMonth} ${startDay}-${endDay} (${startYear})`;
    } else {
      return `${startMonth} ${startDay} (${startYear})`;
    }
  }
};

type Dates = {
  startDate?: string;
  endDate?: string;
};

type EventDates = Required<Dates> & {
  edition: number;
};
type OpenCallDates = Partial<Dates>;
type CalendarProps = {
  openCallInfo?: {
    dates: OpenCallDates;
  };
  eventInfo: {
    title: string;
    description: string;
    eventCategory: EventCategory;
    location: string;
    dates: EventDates;
  };
  calendarProps: {
    slug: string;
    type: "event" | "openCall";
  };
};
export const generateICSFile = ({
  openCallInfo,
  eventInfo,
  calendarProps,
}: CalendarProps) => {
  const { slug, type } = calendarProps;
  const { dates: openCallDates } = openCallInfo ?? {};
  const {
    title,
    description,
    eventCategory,
    location,
    dates: eventDates,
  } = eventInfo ?? {};
  const {
    startDate: eventStartDate,
    endDate: eventEndDate,
    edition,
  } = eventDates ?? {};
  const { endDate: ocDeadline } = openCallDates ?? {};
  const isOpenCall = type === "openCall" && ocDeadline;

  const formattedIsoDisplayStart = formatIsoDate(
    isOpenCall ? ocDeadline : eventStartDate,
  );
  const formattedIsoDisplayEnd = formatIsoDate(
    isOpenCall ? ocDeadline : eventEndDate,
  );
  const formattedDateFull = formatDates(eventStartDate, eventEndDate);

  const descriptionWithEventDates = cleanInput(
    `${getEventCategoryLabel(eventCategory)} Dates: ${
      formattedDateFull
    }\n\n ${description}`,
  );
  const urlBase = `event/${slug}/${edition}`;
  const urlFormatted = `${siteUrl[0]}/thelist/${isOpenCall ? `${urlBase}/call` : urlBase}`;

  const icsContent = `
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//YourApp//EN
BEGIN:VEVENT
SUMMARY:${title}
DTSTART:${formattedIsoDisplayStart}
DTEND:${formattedIsoDisplayEnd}
DESCRIPTION:${descriptionWithEventDates}
LOCATION:${location}
URL:${urlFormatted}
BEGIN:VALARM
TRIGGER:-P1D
ACTION:DISPLAY
DESCRIPTION:Reminder
END:VALARM
END:VEVENT
END:VCALENDAR`.trim();

  return `data:text/calendar;charset=utf8,${encodeURIComponent(icsContent)}`;
};

export const generateGeneralICSFile = (
  title: string,
  displayStartDate: string,
  displayEndDate: string,
  description: string,
  slug: string,
  startDate?: string,
  endDate?: string,
  location?: string,
) => {
  const stripHTML = (html: string): string =>
    sanitizeHtml(html, {
      allowedTags: [],
      allowedAttributes: {},
      textFilter: (text) => text.trim(),
    });

  let formattedStart: string | null = null;
  let formattedEnd: string | null = null;
  let formattedDateFull: string | null = null;

  const formattedIsoDisplayStart = formatIsoDate(displayStartDate);
  const formattedIsoDisplayEnd = formatIsoDate(displayEndDate);

  formattedStart = startDate && !endDate ? formatDate(startDate) : "";
  formattedEnd = endDate && !startDate ? formatDate(endDate) : "";
  formattedDateFull =
    startDate && endDate ? formatDates(startDate, endDate) : "";
  const descriptionWithEventDates = cleanInput(
    startDate
      ? ` Dates: ${
          formattedStart
            ? formattedStart
            : formattedEnd
              ? formattedEnd
              : formattedDateFull
        }\n\n ${stripHTML(description)}`
      : stripHTML(description),
  );

  const urlFormatted = `${siteUrl[0]}/${slug}`;

  // console.log("formattedIsoDisplayStart", formattedIsoDisplayStart)
  // console.log("formattedIsoDisplayEnd", formattedIsoDisplayEnd)
  // console.log("formattedIsoStart", formattedIsoStart)
  // console.log("formattedIsoEnd", formattedIsoEnd)
  // console.log(urlFormatted);
  const icsContent = `
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//YourApp//EN
BEGIN:VEVENT
SUMMARY:${title}
DTSTART:${formattedIsoDisplayStart}
DTEND:${formattedIsoDisplayEnd}
DESCRIPTION:${descriptionWithEventDates}
LOCATION:${location}
URL:${urlFormatted}
BEGIN:VALARM
TRIGGER:-P1D
ACTION:DISPLAY
DESCRIPTION:Reminder
END:VALARM
END:VEVENT
END:VCALENDAR`.trim();

  return `data:text/calendar;charset=utf8,${encodeURIComponent(icsContent)}`;
};
