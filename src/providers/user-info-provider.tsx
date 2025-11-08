"use client";

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
async function getClientCurrency(): Promise<CurrencyOptions> {
  let currency: CurrencyOptions = "usd";
  try {
    const res = await fetch("https://ipapi.co/json/");
    if (!res.ok) throw new Error("Failed to fetch location");
    const data = await res.json();
    // console.log("data", data);
    currency = data.currency === "EUR" ? "eur" : "usd";
  } catch (error) {
    console.error("Error fetching client location:", error);
  } finally {
    return currency;
  }
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

  const [currency, setCurrency] = useState<CurrencyOptions>("usd");

  useEffect(() => {
    const loadCurrency = async () => {
      if (user) {
        if (userPref?.currency) {
          setCurrency(userPref.currency.toLowerCase() as CurrencyOptions);
        } else {
          const detected = await getClientCurrency();
          await updateUserPrefs({ currency: detected });
        }
        return;
      }

      // Guest: try stored, else detect
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const decoded = await decrypt(stored);
        if (decoded) {
          setCurrency(decoded as CurrencyOptions);
          return;
        }
      }

      const detected = await getClientCurrency();
      setCurrency(detected);
      const encrypted = await encrypt(detected);
      localStorage.setItem(LOCAL_STORAGE_KEY, encrypted);
    };

    loadCurrency();
  }, [user, userPref, updateUserPrefs]);
  const symbol = currency === "usd" ? "$" : "€";

  return (
    <UserInfoContext.Provider value={{ currency, symbol }}>
      {children}
    </UserInfoContext.Provider>
  );
};
