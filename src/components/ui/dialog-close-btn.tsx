import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPrimaryAction,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, ButtonSize, ButtonVariant } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface DialogCloseBtnProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  type?: "icon" | "button";
  title?: string;
  description: string;
  actionTitle?: string;
  onAction?: () => void;
  onPrimaryAction?: () => void | string;
  className?: string;
  actionClassName?: string;
  primaryActionClassName?: string;
  primaryActionTitle?: string;
  triggerTitle?: string;
  triggerClassName?: string;
  triggerVariant?: ButtonVariant;
  triggerSize?: ButtonSize;
}

export const DialogCloseBtn = ({
  title = "Discard unsaved changes?",
  description = "If you close now, your changes will be lost. Are you sure you want to leave?",
  className,
  actionTitle = "Discard",
  onAction,
  onPrimaryAction,
  primaryActionTitle = "Return to homepage",
  actionClassName,
  primaryActionClassName,
  type = "icon",
  triggerTitle,
  triggerClassName,
  triggerVariant = "salWithShadowHiddenYlw",
  triggerSize = "lg",
}: DialogCloseBtnProps) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {type === "icon" ? (
          <Button
            variant="icon"
            className={cn(
              "absolute right-5 top-4 z-10 !w-max text-lg font-bold text-foreground hover:text-red-600 focus:text-red-600",
              triggerClassName,
            )}
            aria-label="Close modal"
          >
            <X size={25} />
          </Button>
        ) : (
          <Button
            size={triggerSize}
            variant={triggerVariant}
            className={cn(triggerClassName)}
            aria-label="Close modal"
          >
            {triggerTitle}
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent
        className={cn("w-[80dvw] bg-salYellow text-foreground", className)}
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl lowercase">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-foreground">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => {}}>Cancel</AlertDialogCancel>

          <AlertDialogAction
            onClick={onAction}
            className={cn(actionClassName, "min-w-30")}
            variant={
              onPrimaryAction ? "salWithShadowHiddenYlw" : "salWithShadowHidden"
            }
          >
            {actionTitle}
          </AlertDialogAction>
          {onPrimaryAction && (
            <AlertDialogPrimaryAction
              onClick={onPrimaryAction}
              className={cn("min-w-30", primaryActionClassName)}
            >
              {primaryActionTitle}
            </AlertDialogPrimaryAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
