export async function convertCurrency({
  amount,
  from,
  to,
}: {
  amount: number
  from: string
  to: string
}): Promise<number> {
  if (from === to) return amount

  try {
    const res = await fetch(
      `https://api.exchangerate.host/convert?from=${from}&to=${to}&amount=${amount}`
    )
    const data = await res.json()
    return data.result ?? amount
  } catch (err) {
    console.error("Currency conversion failed:", err)
    return amount // Fallback to original
  }
}
