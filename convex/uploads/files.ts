import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { Id } from "~/convex/_generated/dataModel";
import { mutation } from "~/convex/_generated/server";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveOrgFile = mutation({
  args: {
    files: v.array(
      v.object({
        storageId: v.id("_storage"),
        fileName: v.string(),
        fileType: v.string(),
        fileSize: v.number(),
        lastModified: v.number(),
      }),
    ),
    reason: v.union(v.literal("docs"), v.literal("images")),
    organizationId: v.id("organizations"),
    eventId: v.id("events"),
    openCallId: v.optional(v.id("openCalls")),
  },

  handler: async (ctx, args) => {
    const uploadedRecords: {
      id: Id<"openCallFiles">;
      url: string;
      storageId: Id<"_storage">;
      fileName: string;
    }[] = [];

    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existingFiles = await ctx.db
      .query("openCallFiles")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .collect();

    for (const file of args.files) {
      const duplicate = existingFiles.find(
        (f) =>
          f.fileName === file.fileName &&
          f.fileSize === file.fileSize &&
          f.organizationId === args.organizationId,
      );

      if (duplicate) {
        // Delete the uploaded file to avoid waste
        await ctx.storage.delete(file.storageId);

        console.log(`Duplicate skipped: ${file.fileName}`);
        uploadedRecords.push({
          id: duplicate._id,
          url: duplicate.fileUrl,
          storageId: duplicate.storageId,
          fileName: duplicate.fileName,
        });
        continue;
      }

      const url = await ctx.storage.getUrl(file.storageId);
      if (!url) continue;

      const fileId = await ctx.db.insert("openCallFiles", {
        ...file,
        fileUrl: url,
        reason: args.reason,
        uploadedBy: userId,
        uploadedAt: Date.now(),
        organizationId: args.organizationId,
        eventId: args.eventId,
        openCallId: args.openCallId,
      });

      uploadedRecords.push({
        id: fileId,
        url,
        storageId: file.storageId,
        fileName: file.fileName,
      });
    }

    return uploadedRecords;
  },
});
