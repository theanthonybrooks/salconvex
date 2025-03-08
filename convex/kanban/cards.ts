import { v } from "convex/values"
import { mutation, query } from "../_generated/server"

type ColumnType = "proposed" | "backlog" | "todo" | "doing" | "done"

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
      v.literal("proposed"),
      v.literal("backlog"),
      v.literal("todo"),
      v.literal("doing"),
      v.literal("done")
    ),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get the highest order value in this column
    const cardsInColumn = await ctx.db
      .query("todoKanban")
      .withIndex("by_column_order", (q) => q.eq("column", args.column))
      .order("desc") // Get highest order first
      .first()

    const newOrder = cardsInColumn ? cardsInColumn.order + 1 : 0

    return await ctx.db.insert("todoKanban", {
      title: args.title,
      column: args.column as ColumnType,
      createdAt: Date.now(),
      lastUpdatedBy: args.userId,
      order: newOrder,
    })
  },
})

export const moveCard = mutation({
  args: {
    id: v.id("todoKanban"),
    column: v.union(
      v.literal("proposed"),
      v.literal("backlog"),
      v.literal("todo"),
      v.literal("doing"),
      v.literal("done")
    ),
    beforeId: v.optional(v.id("todoKanban")),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, column, beforeId, userId } = args
    const card = await ctx.db.get(id)
    if (!card) throw new Error("Card not found")

    // console.log(`Moving card ${id} to column ${column}, before ${beforeId}`)

    let cardsInColumn = await ctx.db
      .query("todoKanban")
      .withIndex("by_column_order", (q) => q.eq("column", column))
      .order("asc")
      .collect()

    // console.log(
    //   "Current column cards before move:",
    //   cardsInColumn.map((c) => ({ id: c._id, order: c.order }))
    // )

    let newOrder

    if (!beforeId) {
      newOrder = cardsInColumn.length
        ? cardsInColumn[cardsInColumn.length - 1].order + 1
        : 0
      // console.log(`Assigning order ${newOrder} (placing at end)`)
    } else {
      const beforeIndex = cardsInColumn.findIndex((c) => c._id === beforeId)
      if (beforeIndex === -1) throw new Error("Before card not found")

      newOrder = beforeIndex
      // console.log(`Assigning order ${newOrder} (before card ${beforeId})`)
    }

    await ctx.db.patch(id, {
      column,
      order: newOrder - 0.001,
      updatedAt: Date.now(),
      lastUpdatedBy: userId,
    })

    cardsInColumn = await ctx.db
      .query("todoKanban")
      .withIndex("by_column_order", (q) => q.eq("column", column))
      .order("asc")
      .collect()

    await Promise.all(
      cardsInColumn.map((c, index) => ctx.db.patch(c._id, { order: index }))
    )

    console.log(
      "Final column order after renumbering:",
      cardsInColumn.map((c, index) => ({ id: c._id, order: index }))
    )
  },
})

export const editCard = mutation({
  args: {
    id: v.id("todoKanban"),
    title: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      title: args.title,
      updatedAt: Date.now(),
      lastUpdatedBy: args.userId,
    })
  },
})

export const deleteCard = mutation({
  args: {
    id: v.id("todoKanban"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // console.log(`Card ${args.id} deleted by ${args.userId}`)
    return await ctx.db.delete(args.id)
  },
})
