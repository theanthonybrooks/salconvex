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

type ExtendedRoles = UserRoles | "beta";

export const roleThemeMap: Record<ExtendedRoles, ThemeType[]> = {
  user: ["default", "light", "white"],
  beta: ["default", "light", "dark", "system"],
  admin: ["default", "light", "dark", "system", "white"],
  guest: ["default"],
};
