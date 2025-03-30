"use node"

import { v } from "convex/values"
import { action } from "~/convex/_generated/server"

export const getTimezone = action({
  args: {
    latitude: v.number(),
    longitude: v.number(),
  },
  handler: async (ctx, args) => {
    const API_KEY = process.env.TIMEZONE_API_KEY
    if (!API_KEY) throw new Error("Missing TimezoneDB API key")

    console.log("args", args)

    const res = await fetch(
      `https://api.timezonedb.com/v2.1/get-time-zone?key=${API_KEY}&format=json&by=position&lat=${args.latitude}&lng=${args.longitude}`
    )
    if (!res.ok) throw new Error("Failed to fetch timezone")
    const data = await res.json()
    console.log("data", data)
    return data
  },
})
