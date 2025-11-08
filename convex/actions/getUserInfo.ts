"use node";

import type { Infer } from "convex/values";

import { v } from "convex/values";

const userCurrenciesValidator = v.union(v.literal("usd"), v.literal("eur"));

export type UserCurrenciesType = Infer<typeof userCurrenciesValidator>;

const locationValidator = v.object({
  country: v.string(),
  currency: userCurrenciesValidator,
});

export type UserLocationType = Infer<typeof locationValidator>;
