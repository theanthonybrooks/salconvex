import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { LucidePencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { Id } from "~/convex/_generated/dataModel";

interface DataTableAdminProps {
  eventId: Id<"events">;
}

export const DataTableAdminActions = ({ eventId }: DataTableAdminProps) => {
  const router = useRouter();

  return (
    <>
      <DropdownMenuItem
        onClick={(e) => {
          e.stopPropagation();
          router.push(`/dashboard/admin/event?_id=${eventId}`);
        }}
        className="flex items-center gap-x-2"
      >
        <LucidePencil className="size-4" /> Edit
      </DropdownMenuItem>
    </>
  );
};
