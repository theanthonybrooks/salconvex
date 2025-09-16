export function toMutableEnum<T extends readonly string[]>(
  arr: T,
): [T[number], ...T[number][]] {
  if (arr.length === 0) {
    throw new Error("toMutableEnum requires a non-empty array");
  }

  return arr as unknown as [T[number], ...T[number][]];
}

export const domainRegex = /^(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

export const isValidInstagram = (value: string) => {
  const username = value.startsWith("@") ? value.slice(1) : value;

  // Must be 1–30 chars, only a-z, 0-9, _, ., no consecutive or trailing periods
  const regex = /^(?!.*\.\.)(?!.*\.$)[a-zA-Z0-9._]{2,30}$/;

  return regex.test(username);
};

export const isValidFacebook = (value: string) => {
  const handleRegex = /^@?[a-zA-Z0-9.]{5,}$/;
  const urlRegex = /^https:\/\/www\.facebook\.com\/.+$/i;

  return handleRegex.test(value) || urlRegex.test(value);
};

export const isValidLinkedIn = (value: string) => {
  const urlRegex = /^https:\/\/www\.linkedin\.com\/.+$/i;

  return urlRegex.test(value);
};

export const isValidPhone = (value: string) =>
  /^\+?[0-9\s\-().]{7,}$/i.test(value);

export const isValidThreads = isValidInstagram;
export const isValidVK = (value: string) =>
  /^@?[a-z][a-z0-9._-]{4,31}$/i.test(value);
