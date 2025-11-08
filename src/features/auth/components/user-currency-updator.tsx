"use client";

import type { ReactNode } from "react";

import { useEffect } from "react";

import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";

import { api } from "~/convex/_generated/api";
import { useAction, useMutation, usePreloadedQuery } from "convex/react";

type UserInfoUpdatorProps = {
  children: ReactNode;
};

export const UserInfoUpdator = ({ children }: UserInfoUpdatorProps) => {
  const updateUserPrefs = useMutation(api.users.updateUserPrefs);
  const getUserInfo = useAction(api.actions.getUserInfo.getLocation);
  const { preloadedUserData } = useConvexPreload();
  const userData = usePreloadedQuery(preloadedUserData);
  const { user, userPref } = userData ?? {};
  const userCurrency = userPref?.currency;
  useEffect(() => {
    console.log("called it", user);
    if (userCurrency || !user) return;

    const updateCurrency = async () => {
      try {
        const result = await getUserInfo();
        console.log("result", result);
        if (!result) return;
        await updateUserPrefs({ currency: result.currency });
      } catch (error) {
        console.error("Failed to update user currency:", error);
      }
    };

    updateCurrency();
  }, [getUserInfo, userCurrency, updateUserPrefs, user]);
  return <> {children}</>;
};
