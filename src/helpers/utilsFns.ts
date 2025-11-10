import type { ClassValue } from "clsx";

import { clsx } from "clsx";
import sanitizeHtml from "sanitize-html";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// export const setParamIfNotDefault = <T>(
//   params: URLSearchParams,
//   key: string,
//   value: T,
//   defaultValue: T,
// ) => {
//   if (value === defaultValue) {
//     params.delete(key);
//   } else {
//     params.set(key, String(value));
//   }
// };

// export const setParamIfNotDefault = <T>(
//   params: URLSearchParams,
//   key: string,
//   value: T,
//   defaultValue: T,
// ): void => {
//   // Handle arrays explicitly
//   if (Array.isArray(value)) {
//     if (value.length === 0) {
//       params.delete(key);
//       return;
//     }

//     const isDefaultArray =
//       Array.isArray(defaultValue) &&
//       value.length === defaultValue.length &&
//       value.every((item) => (defaultValue as unknown[]).includes(item));

//     if (isDefaultArray) {
//       params.delete(key);
//       return;
//     }

//     params.set(key, value.join(","));
//     return;
//   }

//   // Non-array branch
//   if (value === defaultValue) {
//     params.delete(key);
//   } else {
//     params.set(key, String(value));
//   }
// };

export const setParamIfNotDefault = <T>(
  params: URLSearchParams,
  key: string,
  value: T,
  defaultValue: T,
) => {
  const normalize = (v: unknown): string =>
    Array.isArray(v) ? v.join(",") : String(v);

  const bothArrays = Array.isArray(value) && Array.isArray(defaultValue);

  const isDefault = bothArrays
    ? value.length === defaultValue.length &&
      value.every((item) => defaultValue.includes(item))
    : value === defaultValue;

  console.log({ key, value, defaultValue, isDefault });

  if (isDefault || (Array.isArray(value) && value.length === 0) || !value) {
    params.delete(key);
  } else {
    params.set(key, normalize(value));
  }
};

export function arraysShareValue<T>(arr1: T[], arr2: T[]): boolean {
  const set1 = new Set(arr1);
  return arr2.some((item) => set1.has(item));
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function cleanInput(input: string): string {
  return sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
  });
}
