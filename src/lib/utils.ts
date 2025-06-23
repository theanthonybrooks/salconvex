import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const setParamIfNotDefault = <T>(
  params: URLSearchParams,
  key: string,
  value: T,
  defaultValue: T,
) => {
  if (value === defaultValue) {
    params.delete(key);
  } else {
    params.set(key, String(value));
  }
};

export function arraysShareValue<T>(arr1: T[], arr2: T[]): boolean {
  const set1 = new Set(arr1);
  return arr2.some((item) => set1.has(item));
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
