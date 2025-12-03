// src/components/email/tailwind-email.config.ts
import type { TailwindConfig } from "@react-email/tailwind";

import { pixelBasedPreset } from "@react-email/components";

export const emailTailwindConfig = {
  presets: [pixelBasedPreset],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        tanker: ["var(--font-tanker-reg)"],
        spaceGrotesk: ["var(--font-space-grotesk)"],
        spaceMono: ["var(--font-space-mono)"],
        libreFranklin: ["var(--font-libre-franklin)"],
        bebasNeue: ["var(--font-bebas-neue)"],
        acumin: ['"acumin-variable"', "sans-serif"],
        ramaE: ["rama-gothic-e"],
        ramaM: ["rama-gothic-m"],
        ramaC: ["rama-gothic-c"],
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
      },
      boxShadow: {
        sxl: "-7px 7px 0 0 #000000",
        slgHover: "-4px 4px 0 0 #000000",
        slg: "-5px 5px 0 0 #000000",
        slga: "-5px 5px 0 0 rgba(0, 0, 0, 0.7)",
        slga2: "-5px 5px 0 0 rgba(0, 0, 0, 0.9)",
        llg: "5px 5px 0 0 #000000",
        llga: "5px 5px 0 0 rgba(0, 0, 0, 0.7)",
        vlg: "0 5px 0 0 #000000",
        vlga: "0 5px 0 0 rgba(0, 0, 0, 0.7)",
        smd: "-3px 3px 0 0 #000000",
        ssm: "-2px 2px 0 0 #000000",
        dropdown: "-5px 5px 0 0 #000000",
      },
    },
  },
} satisfies TailwindConfig;
