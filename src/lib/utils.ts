import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const setParamIfNotDefault = <T>(
  params: URLSearchParams,
  key: string,
  value: T,
  defaultValue: T
) => {
  if (value === defaultValue) {
    params.delete(key)
  } else {
    params.set(key, String(value))
  }
}
