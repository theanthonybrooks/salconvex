import { v } from "convex/values"
import { DatabaseReader, query } from "./_generated/server"

import { v4 as uuidv4 } from "uuid"

export async function maybeAssignOrganizationId({
  db,
  currentOrgName,
  accountType,
}: {
  db: DatabaseReader
  currentOrgName?: string
  accountType: string[]
}): Promise<string | undefined> {
  const isOrganizer = accountType.includes("organizer")
  const hasOrgName = !!currentOrgName

  console.log("isOrganizer: ", isOrganizer)
  console.log("hasOrgName: ", hasOrgName)

  if (!isOrganizer || !hasOrgName) return undefined

  // Try to reuse an existing orgId if this orgName is already in use
  const existing = await db
    .query("organizations")
    .filter((q) =>
      q.and(
        q.eq("organizationName", currentOrgName),
        q.neq("organizationId", null)
      )
    )
    .first()

  console.log("existing: ", existing)

  if (existing?.organizationId !== undefined) {
    return existing.organizationId
  }

  // Otherwise, generate a new one
  const usersWithOrgId = await db
    .query("organizations")
    .filter((q) => q.neq("organizationId", null))
    .collect()

  console.log("usersWithOrgId: ", usersWithOrgId)
  return uuidv4()
}

export const isNewOrg = query({
  args: {
    organizationName: v.string(),
  },
  handler: async (ctx, args) => {
    const existingOrg = await ctx.db
      .query("organizations")
      .withIndex("by_organizationName", (q) =>
        q.eq("organizationName", args.organizationName)
      )
      .unique()
    return existingOrg === null
  },
})
