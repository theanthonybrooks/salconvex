// import { compareEnrichedEvents } from "@/lib/sort/compareEnrichedEvents";
// import { OpenCallStatus } from "@/types/openCall";
// import { getAuthUserId } from "@convex-dev/auth/server";
// import { v } from "convex/values";
// import { Id } from "~/convex/_generated/dataModel";
// import { query } from "~/convex/_generated/server";

// import { Doc } from "~/convex/_generated/dataModel";
// export const getFilteredEvents = query({
//   args: {
//     filters: v.object({
//       bookmarkedOnly: v.optional(v.boolean()),
//       showHidden: v.optional(v.boolean()),
//       appliedOnly: v.optional(v.boolean()),
//       eventCategories: v.optional(v.array(v.string())),
//       eventTypes: v.optional(v.array(v.string())),
//       continent: v.optional(v.array(v.string())),
//       limit: v.optional(v.number()),
//     }),
//     sortOptions: v.object({
//       sortBy: v.union(
//         v.literal("eventStart"),
//         v.literal("openCall"),
//         v.literal("name"),
//       ),
//       sortDirection: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
//     }),
//     page: v.optional(v.number()),
//   },
//   handler: async (ctx, { filters, sortOptions, page }) => {
//     const userId = await getAuthUserId(ctx);
//     // if (!userId) throw new ConvexError("Not authenticated");
//     let bookmarkedSet = new Set<Id<"events">>();
//     let hiddenSet = new Set<Id<"events">>();
//     let appliedEventIds = new Set<Id<"events">>();
//     let applications: Doc<"applications">[] = [];
//     let artist: Doc<"artists"> | null = null;

//     if (userId) {
//       const user = await ctx.db
//         .query("users")
//         .withIndex("by_userId", (q) => q.eq("userId", userId))
//         .unique();
//       if (user) {
//         artist = await ctx.db
//           .query("artists")
//           .withIndex("by_artistId", (q) => q.eq("artistId", user._id))
//           .unique();
//         if (artist) {
//           const listActions = await ctx.db
//             .query("listActions")
//             .withIndex("by_artistId", (q) => q.eq("artistId", user._id))
//             .collect();
//           bookmarkedSet = new Set<Id<"events">>(
//             listActions.filter((a) => a.bookmarked).map((a) => a.eventId),
//           );
//           hiddenSet = new Set<Id<"events">>(
//             listActions.filter((a) => a.hidden).map((a) => a.eventId),
//           );

//           applications = await ctx.db
//             .query("applications")
//             .withIndex("by_artistId", (q) => q.eq("artistId", user._id))
//             .collect();
//           console.log("applications", applications);
//           const appliedEventIds = new Set<Id<"events">>();
//           for (const app of applications) {
//             const oc = await ctx.db.get(app.openCallId);
//             if (oc && oc.eventId) {
//               appliedEventIds.add(oc.eventId);
//             }
//           }
//         }
//       }
//     }
//     let events = await ctx.db
//       .query("events")
//       .withIndex("by_state", (q) => q.eq("state", "published"))
//       .collect();
//     if (filters.bookmarkedOnly) {
//       events = events.filter((e) => bookmarkedSet.has(e._id));
//     }

//     if (!filters.showHidden) {
//       events = events.filter((e) => !hiddenSet.has(e._id));
//     }

//     if (filters.appliedOnly) {
//       events = events.filter((e) => appliedEventIds.has(e._id));
//     }

//     if (filters.eventCategories?.length) {
//       events = events.filter((e) =>
//         filters.eventCategories!.includes(e.category),
//       );
//     }

//     if (filters.eventTypes?.length) {
//       events = events.filter((e) =>
//         Array.isArray(e.type)
//           ? e.type.some((t) => filters.eventTypes!.includes(t))
//           : filters.eventTypes!.includes(e.type),
//       );
//     }

//     if (filters.continent?.length) {
//       events = events.filter(
//         (e) =>
//           e.location?.continent &&
//           filters.continent!.includes(e.location.continent),
//       );
//     }

//     const enriched = await Promise.all(
//       events.map(async (event) => {
//         const openCall = await ctx.db
//           .query("openCalls")
//           .withIndex("by_eventId", (q) => q.eq("eventId", event._id))
//           .unique();

//         let openCallStatus: OpenCallStatus | null = null;
//         let hasActiveOpenCall = false;

//         const now = Date.now();
//         const isPublished = openCall?.state === "published";
//         const ocType = openCall?.basicInfo?.callType;
//         const ocStart = openCall?.basicInfo?.dates?.ocStart
//           ? new Date(openCall.basicInfo.dates.ocStart).getTime()
//           : null;
//         const ocEnd = openCall?.basicInfo?.dates?.ocEnd
//           ? new Date(openCall.basicInfo.dates.ocEnd).getTime()
//           : null;

//         if (openCall && isPublished) {
//           if (ocType === "Fixed") {
//             if (ocStart && now < ocStart) {
//               openCallStatus = "coming-soon";
//             } else if (ocEnd && now > ocEnd) {
//               openCallStatus = "ended";
//             } else {
//               openCallStatus = "active";
//             }
//           } else if (ocType === "Rolling") {
//             openCallStatus = "active";
//           } else if (ocType === "Email") {
//             if (ocEnd && now > ocEnd) {
//               openCallStatus = "ended";
//             } else {
//               openCallStatus = "active";
//             }
//           } else {
//             openCallStatus = null;
//           }

//           hasActiveOpenCall = openCallStatus === "active";
//         }

//         // const fixedType = event.type;

//         const applicationMap = new Map<
//           Id<"openCalls">,
//           { status: string | null; manualApplied: boolean }
//         >();
//         for (const app of applications) {
//           applicationMap.set(app.openCallId, {
//             status: app.applicationStatus ?? null,
//             manualApplied: app.manualApplied ?? false,
//           });
//         }
//         const applicationData = openCall
//           ? applicationMap.get(openCall._id)
//           : null;

//         return {
//           ...event,
//           type: event.type,
//           openCall: openCall ?? null,
//           openCallStatus,
//           hasActiveOpenCall,

//           bookmarked: bookmarkedSet.has(event._id),
//           hidden: hiddenSet.has(event._id),
//           applied: appliedEventIds.has(event._id),
//           manualApplied: applicationData?.manualApplied ?? false,
//           status: applicationData?.status ?? null,
//           artistNationality: artist?.artistNationality ?? [],
//           appFee: openCall?.basicInfo?.appFee ?? 0,
//           adminNoteOC: openCall?.adminNoteOC ?? null,
//           eventId: event._id,
//           slug: event.slug,
//           dates: event.dates,
//           name: event.name,
//           tabs: { opencall: openCall ?? null },
//         };
//       }),
//     );

//     const sorted = enriched.sort((a, b) =>
//       compareEnrichedEvents(a, b, {
//         sortBy: sortOptions.sortBy ?? "openCall",
//         sortDirection: sortOptions.sortDirection ?? "desc",
//       }),
//     );

//     const pg = page ?? 1;
//     const limit = filters.limit ?? 10;
//     const start = (pg - 1) * limit;
//     const paginated = sorted.slice(start, start + limit);
//     // console.log("paginated", paginated, pg, limit, start);
//     return {
//       results: paginated,
//       total: sorted.length,
//     };
//   },
// });
