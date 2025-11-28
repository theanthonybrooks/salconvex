import type {
  ThemeType,
  ThemeTypeOptions,
  UserRoles,
} from "@/types/themeTypes";

export const ThemeOptions: ThemeTypeOptions[] = [
  { value: "default", label: "Default" },
  { value: "light", label: "Light" },
  { value: "white", label: "White" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

export const roleThemeMap: Record<UserRoles, ThemeType[]> = {
  user: ["default", "light", "white"],
  admin: ["default", "light", "dark", "system", "white"],
  guest: ["default"],
};
