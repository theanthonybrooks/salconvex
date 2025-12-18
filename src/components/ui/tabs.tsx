"use client";

import type { VariantProps } from "class-variance-authority";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cva } from "class-variance-authority";

import { cn } from "@/helpers/utilsFns";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-9 items-center justify-center gap-1 rounded-lg border-1.5 border-foreground/30 p-1 text-txtMutedForeground",
      className,
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const tabsTriggerVariants = cva(
  "focus-visible:outline-hidden inner-shadow inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "rounded-md px-3 py-1 transition-all duration-200 ease-in-out data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
        underline:
          "rounded-none border-foreground px-2 py-1 pb-2 data-[state=active]:border-b-2 data-[state=inactive]:opacity-50 data-[state=active]:shadow-none",
      },
      border: {
        true: "transition-none duration-0 data-[state=active]:border data-[state=active]:border-foreground",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      border: false,
    },
  },
);

type TabsTriggerProps = React.ComponentPropsWithoutRef<
  typeof TabsPrimitive.Trigger
> &
  VariantProps<typeof tabsTriggerVariants>;

const TabsTrigger = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, border = false, variant, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    // className={cn(
    //   "focus-visible:outline-hidden inner-shadow inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all duration-200 ease-in-out focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
    //   border &&
    //     "transition-none duration-0 data-[state=active]:border data-[state=active]:border-foreground",
    //     variant,
    //   className,
    // )}
    className={cn(tabsTriggerVariants({ variant, border }), className)}
    {...props}
  />
));

TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "focus-visible:outline-hidden mt-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsContent, TabsList, TabsTrigger };
