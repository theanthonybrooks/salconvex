// export const generateCalendarLinks = (
//   title: string,
//   startDate: string,
//   endDate: string,
//   location: string,
//   description: string
// ) => {
//   const formattedStart = new Date(startDate)
//     .toISOString()
//     .replace(/-|:|\.\d+/g, "") // Convert to UTC format
//   const formattedEnd = new Date(endDate).toISOString().replace(/-|:|\.\d+/g, "")

//   return {
//     google: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
//       title
//     )}&dates=${formattedStart}/${formattedEnd}&details=${encodeURIComponent(
//       description
//     )}&location=${encodeURIComponent(location)}&sf=true&output=xml`,

//     outlook: `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&startdt=${formattedStart}&enddt=${formattedEnd}&subject=${encodeURIComponent(
//       title
//     )}&location=${encodeURIComponent(location)}&body=${encodeURIComponent(
//       description
//     )}&allday=false`,

//     yahoo: `https://calendar.yahoo.com/?v=60&TITLE=${encodeURIComponent(
//       title
//     )}&ST=${formattedStart}&ET=${formattedEnd}&DESC=${encodeURIComponent(
//       description
//     )}&in_loc=${encodeURIComponent(location)}&DUR=0100`,

//     apple: `data:text/calendar;charset=utf8,BEGIN:VCALENDAR%0D%0AVERSION:2.0%0D%0ABEGIN:VEVENT%0D%0ASUMMARY:${encodeURIComponent(
//       title
//     )}%0D%0ADTSTART:${formattedStart}%0D%0ADTEND:${formattedEnd}%0D%0ADESCRIPTION:${encodeURIComponent(
//       description
//     )}%0D%0ALOCATION:${encodeURIComponent(
//       location
//     )}%0D%0AEND:VEVENT%0D%0AEND:VCALENDAR`,
//   }
// }

export const generateICSFile = (
  title: string,
  startDate: string,
  endDate: string,
  location: string,
  description: string
) => {
  const formattedStart = new Date(startDate)
    .toISOString()
    .replace(/-|:|\.\d+/g, "")
  const formattedEnd = new Date(endDate).toISOString().replace(/-|:|\.\d+/g, "")

  return `data:text/calendar;charset=utf8,BEGIN:VCALENDAR%0D%0AVERSION:2.0%0D%0APRODID:-//YourApp//EN%0D%0ABEGIN:VEVENT%0D%0ASUMMARY:${encodeURIComponent(
    title
  )}%0D%0ADTSTART:${formattedStart}%0D%0ADTEND:${formattedEnd}%0D%0ADESCRIPTION:${encodeURIComponent(
    description
  )}%0D%0ALOCATION:${encodeURIComponent(
    location
  )}%0D%0AEND:VEVENT%0D%0AEND:VCALENDAR`
}
