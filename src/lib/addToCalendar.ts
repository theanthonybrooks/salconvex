import { siteUrl } from "@/constants/siteInfo";
import { getFourCharMonth } from "@/lib/dateFns";
import { getEventCategoryLabel } from "@/lib/eventFns";
import { EventCategory } from "@/types/event";
import slugify from "slugify";

export const generateICSFile = (
  title: string,
  ocStartDate: string,
  ocEndDate: string,
  location: string,
  description: string,
  eventCategory: EventCategory,
  isOpenCall: boolean,
  startDate?: string,
  endDate?: string,
  url?: string,
) => {
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
    const startDate = new Date(start);
    const endDate = new Date(end);
    const startMonth = getFourCharMonth(startDate);
    const startDay = startDate.getDate() || null; // Handle falsy values
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
  const slug = slugify(title, { lower: true });
  const thisYear = new Date().getFullYear();
  let formattedStart: string | null = null;
  let formattedEnd: string | null = null;
  let formattedDateFull: string | null = null;

  const formattedIsoOcStart = formatIsoDate(ocStartDate);
  const formattedIsoOcEnd = formatIsoDate(ocEndDate);

  formattedStart = startDate && !endDate ? formatDate(startDate) : "";
  formattedEnd = endDate && !startDate ? formatDate(endDate) : "";
  formattedDateFull =
    startDate && endDate ? formatDates(startDate, endDate) : "";

  const descriptionWithEventDates = startDate
    ? `${getEventCategoryLabel(eventCategory)} Dates: ${
        formattedStart
          ? formattedStart
          : formattedEnd
            ? formattedEnd
            : formattedDateFull
      }\n\n ${description}`
    : description;
  const urlBase = `event/${slug}/${thisYear}`;
  const urlFormatted = url
    ? `${siteUrl[0]}/thelist/${isOpenCall ? `${urlBase}/call` : urlBase}`
    : "";

  // console.log("formattedIsoOcStart", formattedIsoOcStart)
  // console.log("formattedIsoOcEnd", formattedIsoOcEnd)
  // console.log("formattedIsoStart", formattedIsoStart)
  // console.log("formattedIsoEnd", formattedIsoEnd)
  console.log(urlFormatted);
  const icsContent = `
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//YourApp//EN
BEGIN:VEVENT
SUMMARY:${title}
DTSTART:${formattedIsoOcStart}
DTEND:${formattedIsoOcEnd}
DESCRIPTION:${descriptionWithEventDates}
LOCATION:${location}
URL:${url ? urlFormatted : ""}
BEGIN:VALARM
TRIGGER:-P1D
ACTION:DISPLAY
DESCRIPTION:Reminder
END:VALARM
END:VEVENT
END:VCALENDAR`.trim();

  return `data:text/calendar;charset=utf8,${encodeURIComponent(icsContent)}`;
};
