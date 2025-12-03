"use client";

import { IBAN_COUNTRIES } from "@/constants/locationConsts";

import type { ReactNode } from "react";

import { createContext, useContext, useEffect, useRef, useState } from "react";

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
async function getClientInfo(): Promise<UserInfoType> {
  let currency: CurrencyOptions = "usd";
  let location: string = "";
  let ip: string = "0.0.0.0";
  try {
    const res = await fetch("https://ipapi.co/json/");
    if (!res.ok) throw new Error("Failed to fetch location");
    const data = await res.json();
    const country = data.country;
    if (country && IBAN_COUNTRIES.has(country)) {
      currency = "eur";
    }
    location = `${data.city}, ${data.region_code ? data.region_code + ", " : ""} ${data.country}`;
    ip = data.ip;
    // console.log("data", data);
  } catch (error) {
    console.error("Error fetching client location:", error);
  } finally {
    return {
      currency,
      location,
      ip,
    };
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
  const [userInfo, setUserInfo] = useState<UserInfoType>({
    currency: "usd",
    location: "",
    ip: "0.0.0.0",
  });
  const ipRef = useRef<string>("0.0.0.0");

  useEffect(() => {
    if (ipRef.current !== "0.0.0.0") return;
    const loadUserInfo = async () => {
      const userData = await getClientInfo();
      const { currency, ip } = userData;
      ipRef.current = ip;
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (user) {
        if (userPref?.currency) {
          setUserInfo({
            ...userData,
            currency: userPref.currency.toLowerCase() as CurrencyOptions,
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
          setUserInfo({ ...userData, currency: decoded as CurrencyOptions });
          return;
        }
      }

      setUserInfo(userData);
      const encrypted = await encrypt(currency);
      localStorage.setItem(LOCAL_STORAGE_KEY, encrypted);
    };

    loadUserInfo();
  }, [user, userPref, updateUserPrefs]);
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
