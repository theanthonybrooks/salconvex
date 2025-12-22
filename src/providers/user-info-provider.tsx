"use client";

import { IBAN_COUNTRIES } from "@/constants/locationConsts";

import type { ReactNode } from "react";

import { createContext, useContext, useEffect, useState } from "react";

import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";

import { api } from "~/convex/_generated/api";
import { useMutation, usePreloadedQuery } from "convex/react";

// ---------------------------------------------
// Context
// ---------------------------------------------
type CurrencyOptions = "usd" | "eur";
type SymbolOptions = "$" | "€";
type UserInfoContextValue = {
  currency: CurrencyOptions;
  symbol: SymbolOptions;
  ip: string;
  location: string;
};

const UserInfoContext = createContext<UserInfoContextValue | undefined>(
  undefined,
);

export const useUserInfo = (): UserInfoContextValue => {
  const ctx = useContext(UserInfoContext);
  if (!ctx) throw new Error("useUserInfo must be used within UserInfoProvider");
  return ctx;
};

// ---------------------------------------------
// Encryption helpers (AES-GCM)
// ---------------------------------------------
const LOCAL_STORAGE_KEY = "lc__uc";
const SECRET_SALT = "app-specific-salt";

async function getKey() {
  const enc = new TextEncoder().encode(SECRET_SALT);
  const hash = await crypto.subtle.digest("SHA-256", enc);
  return crypto.subtle.importKey("raw", hash, "AES-GCM", false, [
    "encrypt",
    "decrypt",
  ]);
}

async function encrypt(value: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(value);
  const key = await getKey();
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded,
  );
  return (
    btoa(String.fromCharCode(...iv)) +
    "." +
    btoa(String.fromCharCode(...new Uint8Array(ciphertext)))
  );
}

async function decrypt(token: string): Promise<string | null> {
  try {
    const [ivB64, dataB64] = token.split(".");
    const iv = Uint8Array.from(atob(ivB64), (c) => c.charCodeAt(0));
    const ciphertext = Uint8Array.from(atob(dataB64), (c) => c.charCodeAt(0));
    const key = await getKey();
    const plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      ciphertext,
    );
    return new TextDecoder().decode(plain);
  } catch {
    return null;
  }
}

// ---------------------------------------------
// Currency detection
// ---------------------------------------------

type UserInfoType = {
  currency: CurrencyOptions;
  location: string;
  ip: string;
};
type ClientInfoReturnType = {
  status: "success" | "error";
  userInfo: UserInfoType;
};
async function getClientInfo(): Promise<ClientInfoReturnType> {
  let currency: CurrencyOptions = "usd";
  let location: string = "";
  let ip: string = "0.0.0.0";

  let res = await fetch("https://ipapi.co/json/").catch(() => null);

  if (!res || !res.ok) {
    res = await fetch("https://ipinfo.io/json").catch(() => null);
  }

  if (!res || !res.ok)
    return {
      status: "error",
      userInfo: {
        currency,
        location,
        ip,
      },
    };
  const data = await res.json();
  if (data.country && IBAN_COUNTRIES.has(data.country)) {
    currency = "eur";
  }
  location = `${data.city}, ${data.region_code ? data.region_code + ", " : ""} ${data.country}`;
  ip = data.ip;

  return {
    status: "success",
    userInfo: {
      currency,
      location,
      ip,
    },
  };
}

// ---------------------------------------------
// Provider
// ---------------------------------------------
type Props = { children: ReactNode };

export const UserInfoProvider = ({ children }: Props) => {
  const updateUserPrefs = useMutation(api.users.updateUserPrefs);
  const { preloadedUserData } = useConvexPreload();
  const userData = usePreloadedQuery(preloadedUserData);
  const { user, userPref } = userData ?? {};
  const userPrefCurrency = userPref?.currency;
  const [userInfo, setUserInfo] = useState<UserInfoType>({
    currency: "usd",
    location: "",
    ip: "0.0.0.0",
  });

  useEffect(() => {
    // if (ipRef.current !== "0.0.0.0") return;
    // console.log(userPrefCurrency);
    const loadUserInfo = async () => {
      const userData = await getClientInfo();
      // console.log(userData);
      const { status, userInfo: userInfoResults } = userData;
      const { currency } = userInfoResults;
      // console.log(userPrefCurrency, status, currency);
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (user) {
        if (userPrefCurrency) {
          setUserInfo({
            ...userInfoResults,
            currency:
              status === "success"
                ? currency
                : (userPrefCurrency.toLowerCase() as CurrencyOptions),
            // currency: userPrefCurrency.toLowerCase() as CurrencyOptions,
          });
        } else {
          await updateUserPrefs({ currency });
        }
        return;
      }
      // Guest: try stored, else detect
      if (stored) {
        const decoded = await decrypt(stored);
        if (decoded) {
          setUserInfo({
            ...userInfoResults,
            currency: decoded as CurrencyOptions,
          });
          return;
        }
      }

      setUserInfo(userInfoResults);
      const encrypted = await encrypt(currency);
      localStorage.setItem(LOCAL_STORAGE_KEY, encrypted);
    };

    loadUserInfo();
  }, [user, userPrefCurrency, updateUserPrefs]);
  const symbol = userInfo.currency === "usd" ? "$" : "€";

  return (
    <UserInfoContext.Provider
      value={{
        currency: userInfo.currency,
        symbol,
        ip: userInfo.ip,
        location: userInfo.location,
      }}
    >
      {children}
    </UserInfoContext.Provider>
  );
};
