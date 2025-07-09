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
  const [convertedTotalPerMonth, setConvertedTotalPerMonth] = useState<number>(
    toolbarData?.totalPerMonth ?? 0,
  );

  const isAdmin = userData?.user?.role?.includes("admin");
  const totalPerMonth = toolbarData?.totalPerMonth ?? 0;
  //   const userCount = toolbarData?.userCount;
  const usersMode = mode === "users";

  useEffect(() => {
    if (currency === "usd") {
      setConvertedTotalPerMonth(totalPerMonth);
      return;
    }
    convertCurrency({
      amount: totalPerMonth,
      from: "USD",
      to: currency.toUpperCase(),
    }).then(setConvertedTotalPerMonth);
  }, [currency, totalPerMonth]);

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
              <p className="text-sm text-muted-foreground">Total Monthly:</p>
              <p className="text-sm font-bold">
                {currency === "usd" ? "$" : "€"}
                {convertedTotalPerMonth.toLocaleString() ?? 0}
              </p>
              <p className="text-sm text-muted-foreground">
                ({currency === "usd" ? "$" : "€"}
                {(convertedTotalPerMonth * 12).toLocaleString()} per year)
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
