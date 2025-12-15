import type { QueryCtx } from "~/convex/_generated/server";

import { getAuthUserId } from "@convex-dev/auth/server";

export async function ensureAdminOrCreator(ctx: QueryCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) return null;
  const user = await ctx.db.get(userId);
  if (!user) return null;
  if (!user.role?.includes("admin") && !user.role?.includes("creator")) {
    return null;
  }
  return user;
}
