import { v } from "convex/values"
import { mutation, query } from "../_generated/server"

type ColumnType = "backlog" | "todo" | "doing" | "done"

// ✅ Fetch all cards from the board
export const getCards = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("todoKanban").collect()
  },
})

// ✅ Add a new card (Track creation time & lastUpdatedBy)
export const addCard = mutation({
  args: {
    title: v.string(),
    column: v.union(
      v.literal("backlog"),
      v.literal("todo"),
      v.literal("doing"),
      v.literal("done")
    ),
    userId: v.string(), // Track who created it
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("todoKanban", {
      title: args.title,
      column: args.column as ColumnType, // ✅ Fix Type Issue
      createdAt: Date.now(),
      lastUpdatedBy: args.userId, // Store admin who created it
    })
  },
})

// ✅ Move a card between columns (Track who moved it)
export const moveCard = mutation({
  args: {
    id: v.id("todoKanban"), // ✅ Fix Table Reference
    column: v.union(
      v.literal("backlog"),
      v.literal("todo"),
      v.literal("doing"),
      v.literal("done")
    ),
    userId: v.string(), // Track who moved it
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      column: args.column as ColumnType, // ✅ Fix Type Issue
      updatedAt: Date.now(),
      lastUpdatedBy: args.userId, // Store admin who moved it
    })
  },
})

// ✅ Edit card title (Track who changed it)
export const editCard = mutation({
  args: {
    id: v.id("todoKanban"), // ✅ Fix Table Reference
    title: v.string(),
    userId: v.string(), // Track who edited it
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      title: args.title,
      updatedAt: Date.now(),
      lastUpdatedBy: args.userId, // Store admin who changed it
    })
  },
})

// ✅ Delete a card (Track who deleted it)
export const deleteCard = mutation({
  args: {
    id: v.id("todoKanban"), // ✅ Fix Table Reference
    userId: v.string(), // Track who deleted it
  },
  handler: async (ctx, args) => {
    console.log(`Card ${args.id} deleted by ${args.userId}`)
    return await ctx.db.delete(args.id)
  },
})
