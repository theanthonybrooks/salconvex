export const colorModes = [
  { label: "HSL", value: "hsl" },
  { label: "RGB", value: "rgb" },
  { label: "HEX", value: "hex" },
] as const;

export type ColorMode = (typeof colorModes)[number]["value"];
