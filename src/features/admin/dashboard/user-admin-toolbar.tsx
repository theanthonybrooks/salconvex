"use client";

import { ToolbarData } from "@/components/data-table/data-table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { convertCurrency } from "@/lib/currencyFns";
import { cn } from "@/lib/utils";
import { TableTypes } from "@/types/tanstack-table";
import { useQuery } from "convex-helpers/react/cache";
import { useEffect, useState } from "react";
import { api } from "~/convex/_generated/api";

interface UserAdminToolbarProps {
  toolbarData: ToolbarData | undefined;
  mode?: TableTypes;
}

export const AdminToolbar = ({ toolbarData, mode }: UserAdminToolbarProps) => {
  const userData = useQuery(api.users.getCurrentUser, {});
  const [currency, setCurrency] = useState<"usd" | "eur">("usd");
  const [convertedTotalThisMonth, setConvertedTotalThisMonth] =
    useState<number>(toolbarData?.totalThisMonth ?? 0);
  const [convertedTotalThisYear, setConvertedTotalThisYear] = useState<number>(
    toolbarData?.totalThisYear ?? 0,
  );
  const [convertedTotalPerMonth, setConvertedTotalPerMonth] = useState<number>(
    toolbarData?.totalMonthly ?? 0,
  );
  const [convertedTotalPerYear, setConvertedTotalPerYear] = useState<number>(
    toolbarData?.totalYearly ?? 0,
  );

  const isAdmin = userData?.user?.role?.includes("admin");
  const totalThisMonth = toolbarData?.totalThisMonth ?? 0;
  const totalThisYear = toolbarData?.totalThisYear ?? 0;
  const totalMonthly = toolbarData?.totalMonthly ?? 0;
  const totalYearly = toolbarData?.totalYearly ?? 0;
  //   const userCount = toolbarData?.userCount;
  const usersMode = mode === "users";

  useEffect(() => {
    if (currency === "usd") {
      setConvertedTotalThisMonth(totalThisMonth);
      setConvertedTotalThisYear(totalThisYear);
      setConvertedTotalPerMonth(totalMonthly);
      setConvertedTotalPerYear(totalYearly);
      return;
    }

    convertCurrency({
      amount: totalThisMonth,
      from: "USD",
      to: currency.toUpperCase(),
    }).then(setConvertedTotalThisMonth);
    convertCurrency({
      amount: totalThisYear,
      from: "USD",
      to: currency.toUpperCase(),
    }).then(setConvertedTotalThisYear);
    convertCurrency({
      amount: totalMonthly,
      from: "USD",
      to: currency.toUpperCase(),
    }).then(setConvertedTotalPerMonth);
    convertCurrency({
      amount: totalYearly,
      from: "USD",
      to: currency.toUpperCase(),
    }).then(setConvertedTotalPerYear);
  }, [currency, totalThisMonth, totalThisYear, totalMonthly, totalYearly]);

  if (!isAdmin) return null;

  return (
    <div
      className={cn(
        "flex w-full flex-col items-center gap-2 sm:flex-row",
        usersMode && "justify-between",
      )}
    >
      {usersMode && (
        <>
          <div className="flex flex-col items-center gap-2 sm:flex-row">
            {/* <span className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">Total Users:</p>
              <p className="text-sm font-bold">{userCount ?? 0}</p>
            </span> */}
            <span className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">This Month:</p>
              <p className="text-sm font-bold">
                {currency === "usd" ? "$" : "€"}
                {convertedTotalThisMonth.toLocaleString("en-US", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                }) ?? 0}
              </p>
              <p className="hidden text-sm text-muted-foreground lg:block">
                ({currency === "usd" ? "$" : "€"}
                {convertedTotalPerMonth.toLocaleString("en-US", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })}{" "}
                per month)
              </p>
            </span>
            <span className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">This Year:</p>
              <p className="text-sm font-bold">
                {currency === "usd" ? "$" : "€"}
                {convertedTotalThisYear.toLocaleString("en-US", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                }) ?? 0}
              </p>
              <p className="hidden text-sm text-muted-foreground lg:block">
                ({currency === "usd" ? "$" : "€"}
                {convertedTotalPerYear.toLocaleString("en-US", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })}{" "}
                per year)
              </p>
            </span>
          </div>
          <div className="flex w-full items-center gap-2 px-10 sm:w-auto sm:px-0">
            <Select
              value={currency}
              onValueChange={(value) => setCurrency(value as "usd" | "eur")}
            >
              <SelectTrigger className="h-12 w-full sm:w-fit">
                <SelectValue placeholder="Currency" />
              </SelectTrigger>
              <SelectContent className="min-w-auto">
                <SelectGroup>
                  <SelectLabel className="text-sm text-muted-foreground">
                    Currency
                  </SelectLabel>
                  <SelectSeparator />
                  <SelectItem value="usd">USD</SelectItem>
                  <SelectItem value="eur">EUR</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </>
      )}
    </div>
  );
};
