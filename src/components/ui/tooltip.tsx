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
        "group-data-[side=top]:-translate-y-[1.4px]",
        "group-data-[side=bottom]:-translate-y-[1.5px]",
        "group-data-[side=left]:translate-x-[2px]",
        "group-data-[side=right]:-translate-x-[2px]",
        "group-data-[align=start]:translate-x-[3px]",
        "group-data-[align=end]:-translate-x-[2px]",
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
      <polygon points="2,0 28,0 15,8" style={{ fill: "white" }} />
    </svg>
  </TooltipPrimitive.Arrow>
));
CustomArrow.displayName = "CustomArrow";

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ComponentRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> & {
    withArrow?: boolean;
  }
>(
  (
    {
      className,
      sideOffset = 4,

      children,
      withArrow = true,
      ...props
    },
    ref,
  ) => (
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
        {withArrow && <CustomArrow />}
        {children}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  ),
);
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };

interface TooltipProps {
  content: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  align?: "start" | "center" | "end";
  alignOffset?: number;
  className?: string;
  disabled?: boolean;
  delayDuration?: number;
  children: React.ReactNode;
}

export const TooltipSimple = ({
  children,
  content,
  side = "top",
  sideOffset = 8,
  align = "center",
  alignOffset = 0,
  delayDuration = 300,
  className,
  disabled,

  ...props
}: TooltipProps) => {
  // if (disabled || !content) return <>{children}</>;
  const vertSides = ["top", "bottom"];
  const showArrow = vertSides.includes(side);
  const sideOffsetValue = showArrow ? sideOffset : 6;

  return (
    <TooltipProvider delayDuration={disabled ? 0 : delayDuration}>
      {/* note-to-self:for testing */}
      {/* <Tooltip open={true}> */}
      <Tooltip open={disabled ? false : undefined}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>

        {!disabled && content ? (
          <TooltipContent
            side={side}
            sideOffset={sideOffsetValue}
            align={align}
            alignOffset={alignOffset}
            className={cn(
              "group z-50 overflow-hidden rounded-md border-1.5 bg-white px-3 py-1.5 text-xs text-black",
              "opacity-0 transition-opacity duration-200",
              "data-[state=closed]:opacity-0 data-[state=delayed-open]:opacity-100",
              "pointer-events-none",
              className,
            )}
            withArrow={showArrow}
            {...props}
          >
            {content}
          </TooltipContent>
        ) : null}
      </Tooltip>
    </TooltipProvider>
  );
};
