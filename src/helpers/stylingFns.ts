// export function getUserFontSizePref(pref?: string, full?: boolean): string {
//   switch (pref) {
//     case "large":
//       return full
//         ? "text-base sm:text-base md:text-base lg:text-base"
//         : "text-base sm:text-base";
//     case "normal":
//       return full
//         ? "text-sm sm:text-sm md:text-sm lg:text-sm"
//         : "text-sm sm:text-sm";
//     default:
//       return "";
//   }

import { capitalize } from "lodash";

import { FontSizeType } from "~/convex/schema";

// }
type FontPref = {
  subHeading: string;
  body: string;
  small: string;
  tiny: string;
  pref: NonNullable<FontSizeType>;
};

export function capitalizeWords(value: string): string {
  return value
    .split(" ")
    .map((word) => capitalize(word))
    .join(" ");
}

export function getUserFontSizePref(pref?: FontSizeType): FontPref | null {
  if (!pref)
    return {
      subHeading: "text-base",
      body: "text-sm",
      small: "text-xs",
      tiny: "text-xs",
      pref: "normal",
    };

  let subHeading: string | null;
  let body: string | null;
  let small: string | null;
  let tiny: string | null;
  switch (pref) {
    case "large":
      subHeading = "text-2xl sm:text-2xl md:text-2xl lg:text-2xl";
      body = "text-base sm:text-base md:text-base lg:text-base";
      small = "text-sm sm:text-sm md:text-sm lg:text-sm";
      tiny = "text-xs sm:text-xs md:text-xs lg:text-xs";
      break;
    case "normal":
      subHeading = "text-xl sm:text-xl md:text-xl lg:text-xl";
      body = "text-sm sm:text-sm md:text-sm lg:text-sm";
      small = "text-xs sm:text-xs md:text-xs lg:text-xs";
      tiny = "text-xs sm:text-xs md:text-xs lg:text-xs";
      break;
  }

  const fontPref = {
    subHeading,
    body,
    small,
    tiny,
    pref,
  };
  return fontPref;
}
