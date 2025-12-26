import type { UserCurrenciesType } from "@/features/homepage/userPricing";

import type { StripeIntervalPricesType } from "~/convex/schema";

export function getPrice(
  priceObj: StripeIntervalPricesType | undefined,
  currency: UserCurrenciesType,
) {
  return priceObj?.[currency];
}

export const OC_PRICING_TIERS = [
  {
    name: "base",
    description: "Base price (<10,000 budget)",
    price: 50,
  },
  {
    name: "mid",
    description: "Mid-range price (10,000-20,000 budget)",
    price: 125,
  },
  {
    name: "large",
    description: "Price for larger budget projects (20,000-50,000 budget)",
    price: 250,
  },
  {
    name: "municipal",
    description:
      "Pricing for corporations and/or municipalities; (50,000+ budget)",
    price: 500,
  },
];

export async function convertToUSD(
  amount: number,
  currencyCode: string,
): Promise<number> {
  if (currencyCode.toUpperCase() === "USD") return amount;

  try {
    const res = await fetch(
      `https://www.floatrates.com/daily/${currencyCode.toLowerCase()}.json`,
    );
    const data = await res.json();
    const rate = data?.usd?.rate;
    if (!rate) throw new Error("No USD rate found for " + currencyCode);
    return amount * rate;
  } catch (err) {
    console.error("Currency conversion failed:", err);
    return amount; // fallback: treat as USD
  }
}

export async function getOcPricing(input: number, currency: string = "USD") {
  const amountInUSD = await convertToUSD(input, currency);
  // console.log(input, currency);
  // console.log(amountInUSD);
  let tier = {
    name: "base",
    description: "Base Paid Open Call Price",
    price: 50,
  };
  if (amountInUSD <= 10000) {
    tier = OC_PRICING_TIERS.find((tier) => tier.name === "base")!;
  } else if (amountInUSD > 10000 && amountInUSD <= 20000) {
    tier = OC_PRICING_TIERS.find((tier) => tier.name === "mid")!;
  } else if (amountInUSD > 20000 && amountInUSD <= 50000) {
    tier = OC_PRICING_TIERS.find((tier) => tier.name === "large")!;
  } else if (amountInUSD > 50000) {
    tier = OC_PRICING_TIERS.find((tier) => tier.name === "municipal")!;
  }
  return {
    ...tier,
    converted: amountInUSD,
  };
}
