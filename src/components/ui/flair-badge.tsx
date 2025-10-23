import React from "react";

import { cn } from "@/helpers/utilsFns";

interface FlairBadgeProps {
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export const FlairBadge = ({ children, className, icon }: FlairBadgeProps) => {
  return (
    <div
      className={cn(
        "inline-flex w-fit items-center gap-1 rounded-full bg-foreground/[5%] px-[8px] py-1 text-[10px] leading-4 text-foreground/70 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        className,
      )}
    >
      {icon}
      {children}
    </div>
  );
};
