export const OC_PRICING_TIERS = [
  {
    name: "base",
    description: "Base price (<5,000 budget)",
    price: 50,
  },
  {
    name: "mid",
    description: "Mid-range price (5,000-10,000 budget)",
    price: 100,
  },
  {
    name: "large",
    description: "Price for larger budget projects (10,000-20,000 budget)",
    price: 200,
  },
  {
    name: "municipal",
    description:
      "Pricing for corporations and/or municipalities; (20,000+ budget)",
    price: 250,
  },
];
export function getOcPricing(input: number | true) {
  if (input === 0) return { name: "base", price: 50 };
  if (input === true || input <= 5000) {
    return OC_PRICING_TIERS.find((tier) => tier.name === "base")!;
  } else if (input > 5000 && input <= 10000) {
    return OC_PRICING_TIERS.find((tier) => tier.name === "mid")!;
  } else if (input > 10000 && input <= 20000) {
    return OC_PRICING_TIERS.find((tier) => tier.name === "large")!;
  } else if (input > 20000) {
    return OC_PRICING_TIERS.find((tier) => tier.name === "municipal")!;
  }
}
