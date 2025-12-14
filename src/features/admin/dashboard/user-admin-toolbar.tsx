"use client";

import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-media-query";

import { DollarSign, Euro } from "lucide-react";

import { SelectSimple } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
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
  const isMobile = useIsMobile(768);
  const [currency, setCurrency] = useState<CurrencyOption>("usd");
  const [rate, setRate] = useState<number>(1);

  const currentMonth = new Date().toLocaleString("default", {
    month: isMobile ? "short" : "long",
  });
  const currentYear = new Date().getFullYear();

  // const totalThisMonth = 12823.23;
  // const totalThisYear = 136520.3;
  // const totalMonthly = 12900.0;
  // const totalYearly = 139000.0;
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
        "mx-auto flex w-full max-w-[80vw] flex-row items-center justify-between gap-2 rounded-lg border-1.5 border-foreground/20 bg-card/70 p-2 sm:max-w-full",
      )}
    >
      <div className="flex flex-col gap-2 text-sm sm:flex-row sm:pl-4">
        <span className="flex items-center gap-2">
          <p className="text-muted-foreground">{currentMonth}:</p>
          <p className="font-bold">
            {currency === "usd" ? "$" : "€"}
            {formatAmount(totalThisMonth) ?? 0}
          </p>
          <p className="text-sm text-muted-foreground">
            ({currency === "usd" ? "$" : "€"}
            {formatAmount(totalMonthly) ?? 0} monthly)
          </p>
        </span>
        <Separator
          thickness={2}
          className="mx-2 hidden h-6 border-foreground/20 sm:block"
          orientation="vertical"
        />
        <span className="flex items-center gap-2">
          <p className="text-muted-foreground">{currentYear}:</p>
          <p className="font-bold">
            {currency === "usd" ? "$" : "€"}
            {formatAmount(totalThisYear) ?? 0}
          </p>
          <p className="text-muted-foreground">
            ({currency === "usd" ? "$" : "€"}
            {formatAmount(totalYearly) ?? 0} yearly)
          </p>
        </span>
      </div>
      <SelectSimple
        options={[...currencyOptions]}
        value={currency}
        onChangeAction={(value) => setCurrency(value as CurrencyOption)}
        placeholder="Currency"
        className="h-10 w-6 sm:w-16"
        iconOnly={isMobile}
      />
    </div>
  );
};
