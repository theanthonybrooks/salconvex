export function getUserFontSizePref(pref?: string, full?: boolean): string {
  switch (pref) {
    case "large":
      return full
        ? "text-base sm:text-base md:text-base lg:text-base"
        : "text-base";
    case "normal":
      return full ? "text-sm sm:text-sm md:text-sm lg:text-sm" : "text-sm";
    default:
      return "";
  }
}
