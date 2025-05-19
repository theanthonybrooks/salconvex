import { currencies } from "@/app/data/currencies";

export async function convertCurrency({
  amount,
  from,
  to,
}: {
  amount: number;
  from: string;
  to: string;
}): Promise<number> {
  if (from === to) return amount;

  try {
    const res = await fetch(
      `https://api.exchangerate.host/convert?from=${from}&to=${to}&amount=${amount}`,
    );
    const data = await res.json();
    return data.result ?? amount;
  } catch (err) {
    console.error("Currency conversion failed:", err);
    return amount; // Fallback to original
  }
}

export function getCurrencySymbol(code: string): string | undefined {
  for (const region of currencies) {
    for (const group of Object.values(region)) {
      const currency = group.find((c) => c.code === code);
      if (currency) return currency.symbol;
    }
  }
  return undefined;
}
