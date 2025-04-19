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
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface CloseBtnProps {
  title?: string;
  description: string;
  className?: string;
  actionTitle?: string;
  onAction?: () => void;
  onPrimaryAction?: () => void | string;
  primaryActionTitle?: string;
  actionClassName?: string;
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
}: CloseBtnProps) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="icon"
          className={cn(
            "absolute right-5 top-4 z-10 !w-max rounded text-lg font-bold text-foreground hover:rounded-full hover:text-red-600 focus:text-red-600",
            className,
          )}
          aria-label="Close modal"
        >
          <X size={25} />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="w-[80dvw] bg-salYellow text-foreground">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-foreground">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => {}}>Cancel</AlertDialogCancel>
          {onPrimaryAction && (
            <AlertDialogPrimaryAction onClick={onPrimaryAction}>
              {primaryActionTitle}
            </AlertDialogPrimaryAction>
          )}
          <AlertDialogAction onClick={onAction} className={actionClassName}>
            {actionTitle}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
