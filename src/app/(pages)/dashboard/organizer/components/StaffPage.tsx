import type { AdminActionType } from "@/types/tanstack-table";

import { InfoIcon } from "lucide-react";

import type { Id } from "~/convex/_generated/dataModel";
import { ResponsiveDataTable } from "@/components/data-table/DataTableWrapper";
import { Button } from "@/components/ui/button";
import { orgStaffColumns } from "@/features/organizers/dashboard/data-tables/orgStaff-columns";
import { cn } from "@/helpers/utilsFns";

import { api } from "~/convex/_generated/api";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { useMutation } from "convex/react";

type StaffPageProps = {
  orgId: Id<"organizations">;
  isOwner: boolean;
  adminActions: AdminActionType;
};

export const StaffPage = ({ orgId, adminActions, isOwner }: StaffPageProps) => {
  //   const { preloadedUserData } = useConvexPreload();
  //   const userData = usePreloadedQuery(preloadedUserData);
  //   const { user } = userData ?? {};
  const { isAdmin } = adminActions;
  console.log(orgId);
  const updateOrgOwner = useMutation(
    api.organizer.organizations.updateOrgOwnerMutation,
  );
  const staffDataResult = useQuery(api.organizer.staff.getOrganizationStaff, {
    orgId,
  });
  const staffData = staffDataResult?.data;
  const handleUpdateOrgOwner = async () => {
    await updateOrgOwner({
      orgId,
    });
  };
  return (
    <div>
      {isAdmin && !isOwner && (
        <Button onClick={() => handleUpdateOrgOwner()}>Claim Ownership</Button>
      )}
      {!isAdmin && (
        <p className="text-sm italic text-muted-foreground">
          {" "}
          Ability to add members (other staff, judges, etc) is coming soon.
        </p>
      )}
      <ResponsiveDataTable
        title="Staff"
        description="View current members, change roles, and invite new members"
        data={staffData ?? []}
        columns={orgStaffColumns}
        defaultVisibility={{
          desktop: {},
          mobile: {
            type: false,
            category: false,
            _id: false,
            lastEditedAt: false,
          },
        }}
        defaultSort={{ id: `lastUpdatedAt`, desc: true }}
        tableType="organizationStaff"
        pageType="dashboard"
        pageSize={{ desktop: 20, mobile: 10 }}
        adminActions={{
          isAdmin: true,
          isEditor: true,
        }}
      />
      {isAdmin && (
        <div
          className={cn(
            "mx-auto mb-8 flex max-w-[90%] items-center gap-x-5 rounded-lg border-1.5 border-dashed border-foreground/20 bg-salYellowLtHover px-8 py-6 text-sm",
          )}
        >
          <InfoIcon className="size-10 shrink-0" />
          <span>
            <p className="font-bold">Admin note:</p>
            Should have ability to view current members, a way to generate an
            invite link to add new members, a way to remove members, and a way
            to reassign an organization to a new owner (should be admin only).
          </span>
        </div>
      )}
    </div>
  );
};
