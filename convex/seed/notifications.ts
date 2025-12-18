// import { internalMutation } from "~/convex/_generated/server";

// export const init = internalMutation(async (ctx) => {
//   const existing = await ctx.db.query("notifications").collect();
//   if (existing.length >= 30) return;

//   const firstAdmin = await ctx.db
//     .query("userRoles")
//     .withIndex("by_role", (q) => q.eq("role", "admin"))
//     .first();

//   for (let count = existing.length; count < 30; count++) {
//     const random = Math.random();

//     await ctx.db.insert("notifications", {
//       type:
//         random <= 0.3 ? "newSupport" : random > 0.7 ? "newOpenCall" : "newSac",
//       userId: random <= 0.5 ? (firstAdmin?.userId ?? null) : null,
//       targetRole: random > 0.5 ? "admin" : "user",
//       targetUserType:
//         random <= 0.3 ? "artist" : random > 0.7 ? "organizer" : undefined,
//       importance: random <= 0.3 ? "low" : random > 0.7 ? "medium" : "high",
//       displayText: "Random placeholder notification",
//       redirectUrl: "/thelist/notifications",
//       dedupeKey: `placeholder-${count}`,
//       dismissed: false,
//     });
//   }
// });
