import { getAuthUserId } from "@convex-dev/auth/server"
import { v } from "convex/values"
import { mutation } from "~/convex/_generated/server"

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl()
  },
})

export const uploadProfileImage = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error("Not authenticated")
    const fileUrl = await ctx.storage.getUrl(args.storageId)
    if (!fileUrl) throw new Error("Failed to retrieve file URL")
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique()

    if (!user) {
      throw new Error("User not found")
    }

    await ctx.db.patch(user._id, { image: fileUrl })
    return { success: true, imageUrl: fileUrl }
  },
})
