"use client";

import * as SwitchPrimitives from "@radix-ui/react-switch";
import * as React from "react";

import { cn } from "@/helpers/utilsFns";

const Switch = React.forwardRef<
  // React.ComponentRef<typeof SwitchPrimitives.Root>,
  React.ComponentRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "shadow-xs focus-visible:outline-hidden peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-1.5 border-primary transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-backgroundDark/70 data-[state=unchecked]:bg-input",
      className,
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block size-3 rounded-full shadow-lg ring-1.5 ring-primary transition-transform data-[state=checked]:translate-x-[18px] data-[state=unchecked]:translate-x-1 data-[state=checked]:bg-background data-[state=unchecked]:bg-background",
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
