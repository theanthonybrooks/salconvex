import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation } from "~/convex/_generated/server";
import { v } from "convex/values";

export const uploadProfileImage = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const fileUrl = await ctx.storage.getUrl(args.storageId);
    if (!fileUrl) throw new Error("Failed to retrieve file URL");
    const user = await ctx.db.get(userId);

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      image: fileUrl,
      imageStorageId: args.storageId,
    });
    return { success: true, imageUrl: fileUrl };
  },
});

export const removeProfileImage = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);

    if (!user) {
      throw new Error("User not found");
    }
    await ctx.storage.delete(args.storageId);

    await ctx.db.patch(user._id, { image: undefined });
    return { success: true };
  },
});
