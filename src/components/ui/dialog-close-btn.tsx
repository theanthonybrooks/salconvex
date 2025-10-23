import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

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
import { findScrollableParent } from "@/helpers/scrollFns";
import { cn } from "@/helpers/utilsFns";

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
  cancelTitle?: string;
  primaryActionClassName?: string;
  primaryActionTitle?: string;
  triggerTitle?: string;
  triggerClassName?: string;
  triggerVariant?: ButtonVariant;
  triggerSize?: ButtonSize;
  tabIndex?: number;
  ariaLabel?: string;
}

export const DialogCloseBtn = ({
  tabIndex = 0,
  title = "Discard unsaved changes?",
  description = "If you close now, your changes will be lost. Are you sure you want to leave?",
  className,
  actionTitle = "Discard",
  onAction,
  cancelTitle = "Cancel",
  onPrimaryAction,
  primaryActionTitle = "Return to homepage",
  actionClassName,
  primaryActionClassName,
  type = "icon",
  triggerTitle,
  triggerClassName,
  triggerVariant = "salWithShadowHiddenYlw",
  triggerSize = "lg",

  ariaLabel = "Close modal",
}: DialogCloseBtnProps) => {
  const [hidden, setHidden] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!triggerRef.current) return;

    const scrollContainer = findScrollableParent(
      triggerRef.current?.parentElement || null,
    );

    const onScroll = () => {
      const scrollPos =
        scrollContainer instanceof Window
          ? window.scrollY
          : scrollContainer.scrollTop;

      setHidden((prev) => {
        const shouldBeHidden = scrollPos > 100;
        return prev !== shouldBeHidden ? shouldBeHidden : prev;
      });
    };

    scrollContainer.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      scrollContainer.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {type === "icon" ? (
          <Button
            ref={triggerRef}
            tabIndex={tabIndex}
            variant="icon"
            className={cn(
              "absolute right-5 top-4 z-10 !w-max text-lg font-bold text-foreground hover:text-red-600 focus:text-red-600",
              hidden && "pointer-events-none opacity-0",

              triggerClassName,
            )}
            aria-label={ariaLabel}
          >
            <X size={25} />
          </Button>
        ) : (
          <Button
            size={triggerSize}
            variant={triggerVariant}
            className={cn(triggerClassName)}
            aria-label={ariaLabel}
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
          <AlertDialogCancel onClick={() => {}}>
            {cancelTitle}
          </AlertDialogCancel>

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
