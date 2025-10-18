"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import * as React from "react";

import { cn } from "@/helpers/utilsFns";
import { FaCheck } from "react-icons/fa";

const Checkbox = React.forwardRef<
  React.ComponentRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & {
    size?: string;
    checkSize?: string;
  }
>(({ className, size, checkSize, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer size-4 shrink-0 rounded-sm border border-primary bg-transparent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-white data-[state=checked]:text-foreground",
      className,
      size,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn(
        "flex scale-0 items-center justify-center text-foreground transition-transform duration-200 data-[state=checked]:scale-100",
        size,
      )}
    >
      <FaCheck className={cn("size-3", checkSize)} />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
