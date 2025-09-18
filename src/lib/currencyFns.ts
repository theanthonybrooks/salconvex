import { currencies } from "@/app/data/currencies";
import currencyCodes from "currency-codes";
export function formatAmount(amount: number): string {
  return amount % 1 === 0
    ? amount.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
    : amount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
}

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


export const formatCurrency = (value: number, currency: string) => {
  if (value === 0) return "Not Provided";
  const currencyInfo = currencyCodes.code(currency);
  if (!currencyInfo) throw new Error(`Invalid currency code: ${currency}`);

  const locale = new Intl.NumberFormat(undefined, {
    currency,
  }).resolvedOptions().locale;

  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });

  // If no max value, return only min formatted
  return formatter.format(value);
};