import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useQuery } from "convex-helpers/react/cache";
import { LucideClipboardCopy } from "lucide-react";
import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";

interface DataTableOrgInfoProps {
  orgId: Id<"organizations">;
}

export const DataTableOrgInfo = ({ orgId }: DataTableOrgInfoProps) => {
  const org = useQuery(api.organizer.organizations.getOrgById, { orgId });
  const orgName = org?.name ?? "Not Found";

  return (
    <>
      <DropdownMenuItem
        onClick={() => navigator.clipboard.writeText(orgId)}
        className="flex items-center gap-x-2"
      >
        <LucideClipboardCopy className="size-4" /> Org ID
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={() => navigator.clipboard.writeText(orgName)}
        className="flex items-center gap-x-2"
      >
        <LucideClipboardCopy className="size-4" /> Org Name
      </DropdownMenuItem>
    </>
  );
};
