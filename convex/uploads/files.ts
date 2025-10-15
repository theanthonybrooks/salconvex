import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
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
    openCallId: v.optional(v.union(v.id("openCalls"), v.null())),
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

        if (args.openCallId) {
          const openCall = await ctx.db.get(args.openCallId);
          if (openCall) {
            const existingDoc = openCall.documents?.find(
              (doc) => doc.title === file.fileName,
            );
            if (!existingDoc) {
              await ctx.db.patch(openCall._id, {
                documents: [
                  ...(openCall.documents ?? []),
                  {
                    id: duplicate._id,
                    title: file.fileName,
                    href: duplicate.fileUrl,
                  },
                ],
              });
            }
          }
        }

        // console.log(`Duplicate skipped: ${file.fileName}`);
        // uploadedRecords.push({
        //   id: duplicate._id,
        //   url: duplicate.fileUrl,
        //   storageId: duplicate.storageId,
        //   fileName: duplicate.fileName,
        // });
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
        ...(args.openCallId && { openCallId: args.openCallId }),
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

export const deleteFile = mutation({
  args: {
    fileId: v.id("openCallFiles"),
    eventId: v.id("events"),
    archive: v.optional(v.boolean()),
  },
  handler: async (ctx, { archive, ...args }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!user) throw new ConvexError("User not found");

    const isAdmin = user.role?.includes("admin");
    const file = await ctx.db.get(args.fileId);
    if (!file) return null;

    const openCall = await ctx.db
      .query("openCalls")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .first();

    const hasBeenPublished = !!openCall?.approvedBy ;

    if (hasBeenPublished || archive) {
      if (isAdmin && !archive) {
        // Admins can fully delete
        await ctx.db.delete(args.fileId);
        if (file.storageId) await ctx.storage.delete(file.storageId);
        if (openCall?._id && openCall.documents) {
          const filteredDocs = openCall.documents.filter(
            (doc) => doc.id !== args.fileId,
          );
          await ctx.db.patch(openCall._id, {
            documents: filteredDocs,
          });
        }
      } else {
        // Non-admins archive instead of delete — or toggle archive state
        const newArchivedState = !file.archived;

        await ctx.db.patch(args.fileId, {
          archived: newArchivedState,
        });

        if (openCall?._id && openCall.documents) {
          const updatedDocs = openCall.documents.map((doc) =>
            doc.id === args.fileId
              ? { ...doc, archived: newArchivedState }
              : doc,
          );
          await ctx.db.patch(openCall._id, {
            documents: updatedDocs,
          });
        }
      }
    } else {
      // Not published: full delete + remove from openCall documents
      await ctx.db.delete(args.fileId);
      if (file.storageId) await ctx.storage.delete(file.storageId);

      if (openCall?._id && openCall.documents) {
        const filteredDocs = openCall.documents.filter(
          (doc) => doc.id !== args.fileId,
        );
        await ctx.db.patch(openCall._id, {
          documents: filteredDocs,
        });
      }
    }
  },
});

export const editFileName = mutation({
  args: {
    fileId: v.id("openCallFiles"),
    eventId: v.id("events"),
    newTitle: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!user) throw new ConvexError("User not found");

    const file = await ctx.db.get(args.fileId);
    if (!file) return null;

    const openCall = await ctx.db
      .query("openCalls")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .first();

    if (openCall?._id && openCall.documents) {
      const updatedDocs = openCall.documents.map((doc) =>
        doc.id === args.fileId ? { ...doc, title: args.newTitle } : doc,
      );
      await ctx.db.patch(openCall._id, {
        documents: updatedDocs,
      });
    }
  },
});
