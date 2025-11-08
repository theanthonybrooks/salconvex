"use client";

import type { ReactNode } from "react";

import { useEffect } from "react";

import type { UserLocationType } from "~/convex/actions/getUserInfo";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";

import { api } from "~/convex/_generated/api";
import { useMutation, usePreloadedQuery } from "convex/react";

type UserInfoUpdatorProps = {
  children: ReactNode;
};

async function getClientLocation() {
  try {
    const res = await fetch("https://ipapi.co/json/");
    if (!res.ok) throw new Error("Failed to fetch location");
    const data = await res.json();
    // console.log("data", data);
    const country = data.country_code ?? "US";
    const currency = data.currency === "EUR" ? "eur" : "usd";
    return { country, currency } as UserLocationType;
  } catch (error) {
    console.error("Error fetching client location:", error);
    return { country: "US", currency: "usd" } as UserLocationType;
  }
}

export const UserInfoUpdator = ({ children }: UserInfoUpdatorProps) => {
  const updateUserPrefs = useMutation(api.users.updateUserPrefs);
  // const getUserInfo = useAction(api.actions.getUserInfo.getLocation);
  const { preloadedUserData } = useConvexPreload();
  const userData = usePreloadedQuery(preloadedUserData);
  const { user, userPref } = userData ?? {};
  const userCurrency = userPref?.currency;

  useEffect(() => {
    if (userCurrency || !user) return;

    const updateCurrency = async () => {
      try {
        const result = await getClientLocation();
        if (!result) return;
        await updateUserPrefs({ currency: result.currency });
      } catch (error) {
        console.error("Failed to update user currency:", error);
      }
    };

    updateCurrency();
  }, [userCurrency, updateUserPrefs, user]);
  return <> {children}</>;
};
