export function toMutableEnum<T extends readonly string[]>(
  arr: T,
): [T[number], ...T[number][]] {
  if (arr.length === 0) {
    throw new Error("toMutableEnum requires a non-empty array");
  }

  return arr as unknown as [T[number], ...T[number][]];
}
