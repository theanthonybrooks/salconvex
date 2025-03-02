import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-01-27.acacia",
})

// 1. Define your price map
export const priceMap: Record<string, Record<string, string>> = {
    basic: {
        month: "price_1QrYc6KuZqgayGlKRAk68UwC",
        year: "price_1QrYyhKuZqgayGlKKv8XQozk",
    },
    pro: {
        month: "price_1QrYxiKuZqgayGlK1myn1W3R",
        year: "price_1QrYz8KuZqgayGlKtwQ384e3",
    },
    ultraballs: {
        month: "price_1QrYyCKuZqgayGlKDc0ZQeII",
        year: "price_1QrZ23KuZqgayGlKVqEtpSc1",
    },
}
