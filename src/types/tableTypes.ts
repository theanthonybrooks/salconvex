import type { Campaign } from "@/features/admin/dashboard/campaign-columns";

export const newsletterTableTypes = ["campaigns", "audience"] as const;

export const adminTableTypes = [
  "users",
  "newsletter",
  "resources",
  "artists",
  "sac",
  "support",
  "userAddOns",
] as const;

export const tableTypes = [
  ...newsletterTableTypes,
  ...adminTableTypes,
  "events",
  "socials",
  "orgEvents",
  "organizations",
  "organizationStaff",
  "applications",
  "openCalls",
  "bookmarks",
  "hidden",
] as const;

type TableTypeMap = {
  campaigns: Campaign;
};

export function asRow<T extends keyof TableTypeMap>(
  row: unknown,
  tableType: T,
): TableTypeMap[T] {
  void tableType;
  return row as TableTypeMap[T];
}
