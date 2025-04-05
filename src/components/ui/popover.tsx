"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as React from "react";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverAnchor = PopoverPrimitive.Anchor;

const CustomArrow = React.forwardRef<
  SVGSVGElement,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Arrow>
>(({ className, ...props }, ref) => (
  <PopoverPrimitive.Arrow asChild ref={ref} {...props}>
    <svg
      className={cn("block", className)}
      width="15"
      height="10"
      viewBox="0 0 30 10"
      preserveAspectRatio="none"
    >
      <polygon points="0,0 30,0 15,10" fill="black" />
      <polygon points="2,0 28,0 15,8" fill="white" />
    </svg>
  </PopoverPrimitive.Arrow>
));
CustomArrow.displayName = "CustomArrow";

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> & {
    showCloseButton?: boolean;
  }
>(
  (
    {
      className,
      align = "center",
      sideOffset = 4,
      children,
      showCloseButton = true,
      ...props
    },
    ref,
  ) => (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "outline-hidden relative z-10 w-72 rounded-md bg-popover p-4 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className,
        )}
        {...props}
      >
        {/* <PopoverPrimitive.Arrow className='fill-white' /> */}
        <CustomArrow />
        <PopoverPrimitive.Close
          aria-label="Close popover"
          className="absolute right-3 top-2 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75"
        >
          {showCloseButton && (
            <X className="size-6 text-black/80 hover:text-red-600" />
          )}
        </PopoverPrimitive.Close>
        {children}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  ),
);
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverAnchor, PopoverContent, PopoverTrigger };
