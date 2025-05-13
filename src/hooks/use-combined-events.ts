// import type {
//   CombinedEventPreviewCardData,
//   PublicEventPreviewData,
// } from "@/types/event";
// import { UserEventMetadata } from "~/convex/artists/getUserEventMetadata";

// // Hook assumes you've already fetched and filtered public event data
// export function useCombinedEventPreviewCards(
//   publicEvents: PublicEventPreviewData[],
//   userMeta: UserEventMetadata | null,
// ): CombinedEventPreviewCardData[] {
//   return publicEvents.map((event) => {
//     const openCall = event.openCall;
//     const openCallId = openCall?._id;
//     const eventId = event._id;

//     const bookmarked = userMeta?.bookmarked.includes(eventId) ?? false;
//     const hidden = userMeta?.hidden.includes(eventId) ?? false;
//     const applied = userMeta?.applied.includes(eventId) ?? false;
//     const artistNationality = userMeta?.artistNationality ?? [];

//     const appData = openCallId ? userMeta?.applicationData[openCallId] : null;
//     const manualApplied = appData?.manualApplied ?? false;
//     const status = appData?.status ?? null;

//     return {
//       ...event,
//       tabs: {
//         opencall: openCall ?? null,
//       },
//       artistNationality,
//       bookmarked,
//       hidden,
//       applied,
//       manualApplied,
//       status,
//     };
//   });
// }
