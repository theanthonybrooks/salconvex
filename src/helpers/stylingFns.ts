export function getUserFontSizePref(pref?: string): string {
  switch (pref) {
    case "large":
      return "text-base";
    case "normal":
      return "text-sm";
    default:
      return "";
  }
}
