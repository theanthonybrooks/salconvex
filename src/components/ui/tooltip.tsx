"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as React from "react";

import { cn } from "@/lib/utils";

const CustomArrow = React.forwardRef<
  SVGSVGElement,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Arrow>
>(({ className, ...props }, ref) => (
  <TooltipPrimitive.Arrow asChild ref={ref} {...props}>
    <svg
      className={cn(
        "block",
        "group-data-[side=top]:-translate-y-[2px]",
        "group-data-[side=bottom]:translate-y-[2px]",
        "group-data-[side=left]:translate-x-[2px]",
        "group-data-[side=right]:-translate-x-[2px]",
        "opacity-0 transition-opacity duration-200",
        "group-data-[state=closed]:opacity-0 group-data-[state=delayed-open]:opacity-100",
        className,
      )}
      width="15"
      height="10"
      viewBox="0 0 30 10"
      preserveAspectRatio="none"
    >
      <polygon points="0,0 30,0 15,10" fill="black" />
      <polygon points="2,0 28,0 15,8" fill="white" />
    </svg>
  </TooltipPrimitive.Arrow>
));
CustomArrow.displayName = "CustomArrow";

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, children, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "group z-50 overflow-hidden rounded-md border-1.5 bg-card px-3 py-1.5 text-xs text-foreground",
        "opacity-0 transition-opacity duration-200",
        "data-[state=closed]:opacity-0 data-[state=delayed-open]:opacity-100",
        className,
      )}
      {...props}
    >
      <CustomArrow />
      {children}
    </TooltipPrimitive.Content>
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
