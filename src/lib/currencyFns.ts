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
      `https://api.frankfurter.app/latest?amount=${amount}&from=${from}&to=${to}`,
    );

    const data = await res.json();
    return data.rates.EUR;
  } catch (err) {
    console.error("Currency conversion failed:", err);
    return amount;
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
