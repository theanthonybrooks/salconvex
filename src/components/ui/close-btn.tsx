import { ReactNode } from "react";
import { X } from "lucide-react";

import { Button, ButtonSize, ButtonVariant } from "@/components/ui/button";
import { cn } from "@/helpers/utilsFns";

interface CloseBtnProps {
  type?: "icon" | "button";
  children?: ReactNode;
  className?: string;
  ariaLabel?: string;
  onAction?: () => void;
  hidden?: boolean;
  btnVariant?: ButtonVariant;
  btnSize?: ButtonSize;
  tabIndex?: number;
}

export const CloseBtn = ({
  type = "icon",
  children,
  className,
  ariaLabel = "Close modal",
  onAction,

  hidden = false,
  btnVariant = "salWithShadowHiddenYlw",
  btnSize,
  tabIndex,
}: CloseBtnProps) => {
  return type === "icon" ? (
    <Button
      variant="icon"
      className={cn(
        "absolute right-5 top-4 z-10 !w-max text-lg font-bold text-foreground hover:text-red-600 focus:text-red-600",
        hidden && "pointer-events-none opacity-0",

        className,
      )}
      aria-label={ariaLabel}
      onClick={onAction}
      tabIndex={tabIndex}
    >
      <X size={25} />
    </Button>
  ) : (
    <Button
      size={btnSize}
      variant={btnVariant}
      className={cn(className)}
      aria-label={ariaLabel}
      onClick={onAction}
      tabIndex={tabIndex}
    >
      {children}
    </Button>
  );
};
