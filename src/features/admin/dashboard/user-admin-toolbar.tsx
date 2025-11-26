"use client";

import { useEffect, useState } from "react";

import { DollarSign, Euro } from "lucide-react";

import { SelectSimple } from "@/components/ui/select";
import { formatAmount, getRate } from "@/helpers/currencyFns";
import { cn } from "@/helpers/utilsFns";

export type ToolbarData = {
  totalThisMonth?: number;
  totalThisYear?: number;
  totalMonthly?: number;
  totalYearly?: number;
  userCount?: number;
};

interface UserAdminToolbarProps {
  toolbarData: ToolbarData | undefined;
}

const currencyOptions = [
  { value: "usd", label: "USD", icon: DollarSign },
  { value: "eur", label: " EUR", icon: Euro },
] as const;

type CurrencyOption = (typeof currencyOptions)[number]["value"];

export const AdminToolbar = ({ toolbarData }: UserAdminToolbarProps) => {
  const [currency, setCurrency] = useState<CurrencyOption>("usd");
  const [rate, setRate] = useState<number>(1);

  const totalThisMonth = (toolbarData?.totalThisMonth ?? 0) * rate;
  const totalThisYear = (toolbarData?.totalThisYear ?? 0) * rate;
  const totalMonthly = (toolbarData?.totalMonthly ?? 0) * rate;
  const totalYearly = (toolbarData?.totalYearly ?? 0) * rate;

  //   const userCount = toolbarData?.userCount;

  useEffect(() => {
    const fetchRate = async () => {
      if (currency === "usd") {
        setRate(1);
      } else {
        const newRate = await getRate({ from: "usd", to: currency });
        setRate(newRate);
      }
    };

    fetchRate();
  }, [currency]);

  return (
    <div
      className={cn(
        "mx-auto mb-6 flex w-full max-w-[80vw] flex-row items-center justify-between gap-2 sm:max-w-full",
      )}
    >
      <div className="flex flex-col gap-2 sm:flex-row">
        <span className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">This Month:</p>
          <p className="text-sm font-bold">
            {currency === "usd" ? "$" : "€"}
            {formatAmount(totalThisMonth) ?? 0}
          </p>
          <p className="text-sm text-muted-foreground">
            ({currency === "usd" ? "$" : "€"}
            {formatAmount(totalMonthly) ?? 0} / month)
          </p>
        </span>
        <span className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">This Year:</p>
          <p className="text-sm font-bold">
            {currency === "usd" ? "$" : "€"}
            {formatAmount(totalThisYear) ?? 0}
          </p>
          <p className="text-sm text-muted-foreground">
            ({currency === "usd" ? "$" : "€"}
            {formatAmount(totalYearly) ?? 0} / year)
          </p>
        </span>
      </div>
      <SelectSimple
        options={[...currencyOptions]}
        value={currency}
        onChangeAction={(value) => setCurrency(value as CurrencyOption)}
        placeholder="Currency"
        className="w-16"
      />
    </div>
  );
};
