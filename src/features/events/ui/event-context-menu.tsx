import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { cn } from "@/lib/utils";
import { CheckCircle, CircleX, Ellipsis, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { EventCategory } from "@/types/event";
import { ApplicationStatus, OpenCallStatus } from "@/types/openCall";

import { Separator } from "@/components/ui/separator";
import { useArtistApplicationActions } from "@/features/artists/helpers/appActions";
import { useToggleListAction } from "@/features/artists/helpers/listActions";
import { Id } from "~/convex/_generated/dataModel";

interface EventContextMenuProps {
  // onHide: () => void;
  eventId: string;
  openCallId: string;
  isHidden: boolean;
  // setIsHidden: React.Dispatch<React.SetStateAction<boolean>>;
  appStatus: ApplicationStatus | null;
  eventCategory: EventCategory;
  openCallStatus: OpenCallStatus;
  // setManualApplied: React.Dispatch<React.SetStateAction<ApplicationStatus>>;
  publicView?: boolean;
  buttonTrigger?: boolean;
  align?: "center" | "start" | "end" | undefined;
}

// const EventContextMenu = ({
//   eventId,
//   openCallId,
//   // onHide,
//   isHidden,
//   // setIsHidden,
//   publicView,
//   appStatus,
//   eventCategory,
//   openCallStatus,
//   // setManualApplied,
//   buttonTrigger,
//   align,
// }: EventContextMenuProps) => {
//   const { toggleListAction } = useToggleListAction(eventId as Id<"events">);
//   const { toggleAppActions } = useArtistApplicationActions();
//   const onHide = () => {
//     toggleListAction({ hidden: !isHidden });
//   };
//   const onApply = () => {
//     if (typeof openCallId !== "string" || openCallId.length < 10) return;
//     toggleAppActions({
//       openCallId: openCallId as Id<"openCalls">,
//       manualApplied: appStatus === "applied" ? false : true,
//     });
//   };

//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         {buttonTrigger ? (
//           <Button
//             variant="salWithShadowHidden"
//             size="lg"
//             className={cn(
//               "relative z-[1] w-fit rounded-l-none border-l px-2 sm:px-2",

//               appStatus !== null &&
//                 !publicView &&
//                 "hover:shadow-slga border-foreground/50 bg-background text-foreground/50",
//             )}
//           >
//             <Ellipsis className="size-8" />
//           </Button>
//         ) : (
//           <Ellipsis className="size-7 cursor-pointer" />
//         )}
//       </DropdownMenuTrigger>
//       <DropdownMenuContent className="text-sm" align={align}>
//         <DropdownMenuLabel>More options</DropdownMenuLabel>
//         <DropdownMenuSeparator />
//         <div className="flex flex-col gap-y-1 p-1">
//           <DropdownMenuItem
//             onClick={onHide}
//             className={cn(
//               "cursor-pointer text-black/80 hover:text-red-500",
//               publicView && "hidden",
//             )}
//           >
//             {isHidden ? (
//               <span className="flex items-center gap-x-1">
//                 <EyeOff className="size-4" />
//                 Unhide{" "}
//                 {openCallId !== ""
//                   ? "Open Call"
//                   : eventCategory.slice(0, 1).toUpperCase() +
//                     eventCategory.slice(1)}
//               </span>
//             ) : (
//               <span className="flex items-center gap-x-1">
//                 <Eye className="size-4" />
//                 Hide{" "}
//                 {openCallId !== ""
//                   ? "Open Call"
//                   : eventCategory.slice(0, 1).toUpperCase() +
//                     eventCategory.slice(1)}
//               </span>
//             )}
//           </DropdownMenuItem>
//           {openCallStatus === "active" && (
//             <DropdownMenuItem
//               onClick={onApply}
//               className={cn(
//                 "cursor-pointer text-sm",
//                 publicView && "hidden",
//                 appStatus
//                   ? "text-emerald-700 hover:text-black/80"
//                   : "text-black/80 hover:text-emerald-700",
//               )}
//             >
//               {appStatus ? (
//                 <span className="flex items-center gap-x-1 text-sm">
//                   <CircleX className="size-4" />
//                   Mark as Not Applied
//                 </span>
//               ) : (
//                 <span className="flex items-center gap-x-1 text-sm">
//                   <CheckCircle className="size-4" />
//                   Mark as Applied
//                 </span>
//               )}
//             </DropdownMenuItem>
//           )}
//           {publicView && (
//             <DropdownMenuItem
//               className={cn(
//                 "cursor-pointer text-sm",

//                 appStatus
//                   ? "text-emerald-700 hover:text-black/80"
//                   : "text-black/80 hover:text-emerald-700",
//               )}
//             >
//               <Link href="/pricing#plans">
//                 Subscribe to bookmark, hide, or apply
//               </Link>
//             </DropdownMenuItem>
//           )}
//         </div>
//       </DropdownMenuContent>
//     </DropdownMenu>
//   );
// };

// export default EventContextMenu;

const EventContextMenu = ({
  eventId,
  openCallId,
  // onHide,
  isHidden,
  // setIsHidden,
  publicView,
  appStatus,
  eventCategory,
  openCallStatus,
  // setManualApplied,
  buttonTrigger,
  align,
}: EventContextMenuProps) => {
  const { toggleListAction } = useToggleListAction(eventId as Id<"events">);
  const { toggleAppActions } = useArtistApplicationActions();
  const onHide = () => {
    toggleListAction({ hidden: !isHidden });
  };
  const onApply = () => {
    if (typeof openCallId !== "string" || openCallId.length < 10) return;
    toggleAppActions({
      openCallId: openCallId as Id<"openCalls">,
      manualApplied: appStatus === "applied" ? false : true,
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        {buttonTrigger ? (
          <Button
            variant="salWithShadowHidden"
            size="lg"
            className={cn(
              "relative z-[1] w-fit rounded-l-none border-l px-2 sm:px-2",

              appStatus !== null &&
                !publicView &&
                "border-foreground/50 bg-background text-foreground/50 hover:shadow-slga",
            )}
          >
            <Ellipsis className="size-8" />
          </Button>
        ) : (
          <Ellipsis className="size-7 cursor-pointer" />
        )}
      </PopoverTrigger>
      <PopoverContent
        showCloseButton={false}
        className="max-w-max border-1.5 p-0 text-sm"
        align={align}
      >
        <p className="py-2 pl-4 font-bold">More options</p>
        <Separator />
        <div className="flex flex-col gap-y-1 pb-2">
          <div
            onClick={onHide}
            className={cn(
              "cursor-pointer rounded px-4 py-2 text-black/80 hover:bg-salPinkLtHover hover:text-red-700",
              publicView && "hidden",
            )}
          >
            {isHidden ? (
              <span className="flex items-center gap-x-1">
                <EyeOff className="size-4" />
                Unhide{" "}
                {openCallId !== ""
                  ? "Open Call"
                  : eventCategory.slice(0, 1).toUpperCase() +
                    eventCategory.slice(1)}
              </span>
            ) : (
              <span className="flex items-center gap-x-1">
                <Eye className="size-4" />
                Hide{" "}
                {openCallId !== ""
                  ? "Open Call"
                  : eventCategory.slice(0, 1).toUpperCase() +
                    eventCategory.slice(1)}
              </span>
            )}
          </div>
          {openCallStatus === "active" && (
            <div
              onClick={onApply}
              className={cn(
                "cursor-pointer rounded px-4 py-2 text-sm hover:bg-salPinkLtHover",
                publicView && "hidden",
                appStatus
                  ? "text-black/80 hover:text-emerald-700"
                  : "text-emerald-700 hover:text-black/80",
              )}
            >
              {appStatus ? (
                <span className="flex items-center gap-x-1 text-sm">
                  <CircleX className="size-4" />
                  Mark as Not Applied
                </span>
              ) : (
                <span className="flex items-center gap-x-1 text-sm">
                  <CheckCircle className="size-4" />
                  Mark as Applied
                </span>
              )}
            </div>
          )}
          {publicView && (
            <div
              className={cn(
                "cursor-pointer rounded px-4 py-2 text-sm hover:bg-salPinkLtHover",

                appStatus
                  ? "text-emerald-700 hover:text-black/80"
                  : "text-black/80 hover:text-emerald-700",
              )}
            >
              <Link href="/pricing">Subscribe to bookmark, hide, or apply</Link>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default EventContextMenu;
