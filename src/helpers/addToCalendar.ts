import { siteUrl } from "@/constants/siteInfo";
import { getFourCharMonth } from "@/helpers/dateFns";
import { getEventCategoryLabel } from "@/helpers/eventFns";
import { cleanInput } from "@/helpers/utilsFns";
import { EventCategory } from "@/types/eventTypes";
import slugify from "slugify";

export const generateICSFile = (
  title: string,
  displayStartDate: string,
  displayEndDate: string,
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
  const slug = slugify(title, { lower: true, strict: true });
  const thisYear = new Date().getFullYear();
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
      ? `${getEventCategoryLabel(eventCategory)} Dates: ${
          formattedStart
            ? formattedStart
            : formattedEnd
              ? formattedEnd
              : formattedDateFull
        }\n\n ${description}`
      : description,
  );
  const urlBase = `event/${slug}/${thisYear}`;
  const urlFormatted = url
    ? `${siteUrl[0]}/thelist/${isOpenCall ? `${urlBase}/call` : urlBase}`
    : "";

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
