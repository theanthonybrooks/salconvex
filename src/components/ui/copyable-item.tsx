import type { TooltipSides } from "@/components/ui/tooltip";

import { ReactNode, useState } from "react";
import { toast } from "react-toastify";

import { Check, LucideIcon } from "lucide-react";

import IconComponent from "@/components/ui/icon-component";
import { TooltipSimple } from "@/components/ui/tooltip";
import { cn } from "@/helpers/utilsFns";

interface CopyableItemProps {
  children: string | number;
  truncate?: boolean;
  iconBefore?: boolean;
  defaultIcon?: ReactNode | LucideIcon;
  className?: string;
  copyContent?: string;
  center?: boolean;
  side?: TooltipSides;
}

export const CopyableItem = ({
  children,
  truncate,
  iconBefore,
  defaultIcon,
  className,
  copyContent,
  center,
  side = "left",
}: CopyableItemProps) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(copyContent ?? children.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard!", {
      autoClose: 2000,
      pauseOnHover: false,
      hideProgressBar: true,
    });
  };
  return (
    <TooltipSimple content="Click to copy" side={side}>
      <div
        onClick={() => handleCopy()}
        className={cn(
          "flex cursor-pointer items-center gap-x-2",
          className,
          center && "justify-center",
        )}
      >
        {(iconBefore || defaultIcon) && copied && <Check className="size-5" />}
        {defaultIcon && !copied && <IconComponent icon={defaultIcon} />}
        {copied ? (
          "Copied!"
        ) : (
          <p className={cn(truncate && "truncate")}>{children}</p>
        )}
        {!iconBefore && !defaultIcon && copied && <Check className="size-5" />}
      </div>
    </TooltipSimple>
  );
};
