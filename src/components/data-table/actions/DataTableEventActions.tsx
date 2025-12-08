import { EventCategory, SubmissionFormState } from "@/types/eventTypes";

import { useMemo, useState } from "react";
import { toast } from "react-toastify";

import { FaRegCopy, FaRegTrashCan } from "react-icons/fa6";
import {
  Eye,
  IdCard,
  Image as ImageIcon,
  LoaderCircle,
  LucideFolderCheck,
  LucideFolderClock,
  LucideFolderInput,
} from "lucide-react";

import type { Doc } from "~/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { useConfirmAction } from "@/components/ui/confirmation-dialog-context";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { SearchMappedSelect } from "@/components/ui/mapped-select";
import { getEventCategoryLabel } from "@/helpers/eventFns";
import { cn } from "@/helpers/utilsFns";
import { showToast } from "@/lib/toast";

import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";

export interface EventActionProps {
  eventId: Id<"events">;
}

export interface DuplicateEventProps extends EventActionProps {
  onDuplicate: () => void;
}

export interface CopyActionProps extends EventActionProps {
  displayText?: string;
}
interface DeleteEventActionProps extends EventActionProps {
  isAdmin: boolean | undefined;
}

interface SubmittedActionProps extends EventActionProps {
  state: SubmissionFormState;
}

interface BaseEventActionProps {
  slug: string;
  edition: number;
}

interface ToEventActionProps extends BaseEventActionProps {
  hasOpenCall: boolean;
  category: EventCategory;
  general?: boolean;
}

interface ChangeEventOwnerProps extends EventActionProps {
  ocId?: Id<"openCalls">;
  orgId: Id<"organizations">;
}

export const GoToEvent = ({
  slug,
  edition,
  hasOpenCall,
  category,
  general,
}: ToEventActionProps) => {
  return (
    <DropdownMenuItem
      onClick={() => {
        const linkPath = `/thelist/event/${slug}/${edition}${hasOpenCall ? "/call" : ""}`;
        window.open(linkPath, "_blank");
      }}
    >
      <Eye className="size-4" />
      View{" "}
      {general
        ? "Listing"
        : hasOpenCall
          ? "Open Call"
          : getEventCategoryLabel(category, true)}
    </DropdownMenuItem>
  );
};

export const GoToSocialPost = ({ slug, edition }: BaseEventActionProps) => {
  return (
    <DropdownMenuItem
      onClick={() => {
        const linkPath = `/thelist/event/${slug}/${edition}/call/social`;
        window.open(linkPath, "_blank");
      }}
    >
      <ImageIcon className="size-4" />
      View Socials
    </DropdownMenuItem>
  );
};

export const DuplicateEvent = ({
  eventId,
  onDuplicate,
}: DuplicateEventProps) => {
  const duplicateEvent = useMutation(api.events.event.duplicateEvent);
  const handleDuplicate = async () => {
    try {
      await duplicateEvent({ eventId: eventId as Id<"events"> });
      onDuplicate();
      toast.success("Event duplicated!");
    } catch (error) {
      console.error("Failed to duplicate event:", error);
      toast.error("Failed to duplicate event");
    }
  };
  return (
    <DropdownMenuItem onClick={handleDuplicate}>
      <FaRegCopy className="size-4" />
      Duplicate
    </DropdownMenuItem>
  );
};

export const DeleteEvent = ({ eventId, isAdmin }: DeleteEventActionProps) => {
  const confirm = useConfirmAction().confirm;
  const deleteEvent = useMutation(api.events.event.deleteEvent);
  // console.log(eventId, isAdmin);
  const handleDelete = async () => {
    try {
      await deleteEvent({ eventId });
      toast.success("Event deleted!");
    } catch (error) {
      console.error("Failed to delete event:", error);
      toast.error("Failed to delete event");
    }
  };
  return (
    <DropdownMenuItem
      // onClick={() => {
      //   confirm({
      //     label: isAdmin ? "Delete Event & Open Calls" : "Delete Event",
      //     description: isAdmin
      //       ? "Are you sure you want to delete this event? This will also delete any associated open calls."
      //       : "Are you sure you want to delete this event? You can only delete drafts and any published events will be archived.",
      //     onConfirm: handleDelete,
      //   });
      // }}
      onSelect={(e) => {
        e.preventDefault(); // keeps dropdown open
        confirm({
          label: isAdmin ? "Delete Event & Open Calls" : "Delete Event",
          description: isAdmin
            ? "Are you sure you want to delete this event? This will also delete any associated open calls."
            : "Are you sure you want to delete this event? You can only delete drafts and any published events will be archived.",
          onConfirm: handleDelete,
        });
      }}
    >
      <FaRegTrashCan className="size-4" />
      Delete
    </DropdownMenuItem>
  );
};

export const ArchiveEvent = ({ eventId }: EventActionProps) => {
  const archiveEvent = useMutation(api.events.event.archiveEvent);
  const handleArchive = async () => {
    try {
      await archiveEvent({ eventId: eventId as Id<"events"> });
      toast.success("Event archived!");
    } catch (error) {
      console.error("Failed to archive event:", error);
      toast.error("Failed to archive event");
    }
  };
  return (
    <DropdownMenuItem onClick={handleArchive}>
      <LucideFolderClock className="size-4" />
      Archive
    </DropdownMenuItem>
  );
};

export const ReactivateEvent = ({ eventId, state }: SubmittedActionProps) => {
  const activateEvent = useMutation(api.events.event.reactivateEvent);
  const handleReactivate = async () => {
    try {
      await activateEvent({ eventId: eventId as Id<"events"> });
      if (state === "published") {
        toast.success("Event changed to Submitted!");
      } else {
        toast.success("Event reactivated!");
      }
    } catch (error) {
      console.error("Failed to reactivate event:", error);
      toast.error("Failed to reactivate event");
    }
  };
  return (
    <DropdownMenuItem onClick={handleReactivate}>
      <LucideFolderInput className="size-4" />
      {state === "archived" ? "Activate" : "Change to Submitted"}
    </DropdownMenuItem>
  );
};

export const ApproveEvent = ({ eventId }: EventActionProps) => {
  const approveEvent = useMutation(api.events.event.approveEvent);
  const handleApprove = async () => {
    try {
      await approveEvent({ eventId: eventId as Id<"events"> });
      toast.success("Event approved!");
    } catch (error) {
      console.error("Failed to approve event:", error);
      toast.error("Failed to approve event");
    }
  };
  return (
    <DropdownMenuItem onClick={handleApprove}>
      <LucideFolderCheck className="size-4" />
      Approve
    </DropdownMenuItem>
  );
};

export const CopyEventId = ({ eventId, displayText }: CopyActionProps) => {
  const [copied, setCopied] = useState(false);
  const displayVal = displayText ?? eventId;

  const handleCopy = () => {
    navigator.clipboard.writeText(eventId);
    setCopied(true);
    toast.success("Event ID copied!");
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <span
      className="max-w-[20ch] truncate font-medium capitalize"
      onClick={handleCopy}
    >
      {copied ? "Copied!" : displayVal}
    </span>
  );
};

export function ChangeEventOwner({
  eventId,
  ocId,
  orgId,
}: ChangeEventOwnerProps) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [mainOrgId, setMainOrgId] = useState<Id<"organizations">>(orgId);

  // const inputRef = useRef<HTMLInputElement>(null);
  const changeOrgOwner = useMutation(api.events.event.changeOrgOwner);
  const MainOrgInfo = useQuery(api.organizer.organizations.getOrgById, {
    orgId,
  });
  const userOrgResults = useQuery(
    api.organizer.organizations.getUserOrganizations,
    { query: "" },
  );
  const { data: userOrgData } = userOrgResults ?? {};
  const userOrgs = useMemo(() => userOrgData ?? [], [userOrgData]);
  const orgData = {
    "": [...userOrgs],
  };
  const noOrgs = userOrgs.length === 0;

  const handleSave = async () => {
    if (mainOrgId === orgId) {
      setOpen(false);
      return;
    }
    try {
      setPending(true);
      await changeOrgOwner({
        eventId,
        newOrgId: mainOrgId,
        openCallId: ocId,
      });
      // await updateName({ eventId: event._id, name: trimmed });
      showToast("success", "Organization updated!");
      setOpen(false);
    } catch (error) {
      if (error instanceof ConvexError) {
        showToast("error", error.data ?? "Failed to update organization.");
      } else {
        showToast("error", "Unexpected error.");
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <DropdownMenuItem
        onSelect={(e) => {
          e.preventDefault();
          setOpen(true);
        }}
      >
        <IdCard className="size-4" />
        Change Org
      </DropdownMenuItem>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent zIndex="z-top">
          <DialogHeader>
            <DialogTitle>Change Owner Organization</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <p>Current Owner: {MainOrgInfo?.name}</p>
            <p>New Owner:{mainOrgId}</p>

            <SearchMappedSelect<Doc<"organizations">>
              value={mainOrgId ?? ""}
              disabled={noOrgs}
              data={orgData}
              getItemLabel={(org) => <span>{org.name}</span>}
              getItemValue={(org) => org._id}
              onChange={(val) => setMainOrgId(val as Id<"organizations">)}
              searchFields={["name", "slug"]}
              className={cn("h-12 justify-start bg-card py-2")}
              popover={{
                align: "center",
                contentClassName: "max-w-[90vw] z-top ",
                listClassName: "max-h-68",
              }}
              getItemDisplay={(org) => (
                <div className="flex items-center gap-2">
                  {/* <Image
                              src={org.logo}
                              alt={org.name}
                              width={30}
                              height={30}
                              className="rounded-full"
                            /> */}
                  <span className="truncate">{org.name}</span>
                </div>
              )}
              placeholder="Select an organization"
            />
          </div>

          <DialogFooter>
            <Button
              disabled={pending}
              variant="salWithShadowHiddenBg"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              disabled={mainOrgId === orgId || pending}
              variant="salWithShadowHidden"
              onClick={handleSave}
              className={cn("w-40")}
            >
              {pending ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
