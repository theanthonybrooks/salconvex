export function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateSkeletonGroups(
  seed = 42,
  groupCount = 3,
  minItems = 2,
  maxItems = 5,
) {
  const rand = mulberry32(seed);
  return Array.from({ length: groupCount }, (_, i) => ({
    id: i,
    results: Array.from({
      length: Math.floor(rand() * (maxItems - minItems + 1)) + minItems,
    }),
  }));
}
