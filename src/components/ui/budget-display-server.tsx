// app/components/server/ConvertedBudget.tsx

import { formatCurrencyServer, formatRateServer } from "@/lib/eventFns"

interface ConvertedBudgetProps {
  min: number
  max: number | null
  currency: string
  allInclusive: boolean
  userCurrency?: string
  preview?: boolean
}

export const ConvertedBudget = async ({
  min,
  max,
  currency,
  allInclusive,
  userCurrency,
  preview = false,
}: ConvertedBudgetProps) => {
  const result = await formatCurrencyServer(
    min,
    max,
    currency,
    preview,
    allInclusive,
    userCurrency
  )

  return <>{result}</>
}

// app/components/server/ConvertedRate.tsx

interface ConvertedRateProps {
  rate: number
  unit: string
  currency: string
  allInclusive: boolean
  userCurrency?: string
}

export const ConvertedRate = async ({
  rate,
  unit,
  currency,
  allInclusive = true,
  userCurrency,
}: ConvertedRateProps) => {
  const result = await formatRateServer(
    rate,
    unit,
    currency,
    allInclusive,
    userCurrency
  )

  return <>{result}</>
}
