"use node";

import type { Infer } from "convex/values";

import { v } from "convex/values";
import { action } from "../_generated/server";

const userCurrenciesValidator = v.union(v.literal("usd"), v.literal("eur"));

export type UserCurrenciesType = Infer<typeof userCurrenciesValidator>;

const locationValidator = v.object({
  country: v.string(),
  currency: userCurrenciesValidator,
});

export type UserLocationType = Infer<typeof locationValidator>;

export const getLocation = action({
  args: {},
  returns: locationValidator,
  handler: async () => {
    let country = "US";
    let currency = "usd";

    try {
      const res = await fetch("https://ipapi.co/json/");
      if (res.ok) {
        const data = await res.json();
        if (data?.country_code) {
          country = data.country_code;
          currency = data.currency === "EUR" ? "eur" : "usd";
        }
        console.log("data", data);
      }
    } catch {
      console.error("Error fetching IP address, using default location");
    }

    return { country, currency } as UserLocationType;
  },
});
