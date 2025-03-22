export const generateICSFile = (
  title: string,
  ocStartDate: string,
  ocEndDate: string,
  location: string,
  description: string,
  startDate?: string,
  endDate?: string,
  url?: string
) => {
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toISOString().replace(/-|:|\.\d+/g, "")

  const formattedOcStart = formatDate(ocStartDate)
  const formattedOcEnd = formatDate(ocEndDate)
  const formattedStart = startDate ? formatDate(startDate) : ""
  const formattedEnd = endDate ? formatDate(endDate) : ""

  const descriptionWithEventDates = startDate
    ? `Event/project dates:${formattedStart}-${formattedEnd}\n\n ${description}`
    : description

  const urlFormatted = url
    ? `https://www.thestreetartlist.com/thelist/${url}`
    : ""

  const icsContent = `
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//YourApp//EN
BEGIN:VEVENT
SUMMARY:${title}
DTSTART:${formattedOcStart}
DTEND:${formattedOcEnd}
DESCRIPTION:${descriptionWithEventDates}
LOCATION:${location}
URL:${url ? urlFormatted : ""}
BEGIN:VALARM
TRIGGER:-P1D
ACTION:DISPLAY
DESCRIPTION:Reminder
END:VALARM
END:VEVENT
END:VCALENDAR`.trim()

  return `data:text/calendar;charset=utf8,${encodeURIComponent(icsContent)}`
}
