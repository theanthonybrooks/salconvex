import type { VariantProps } from "class-variance-authority";

import * as React from "react";
import { cva } from "class-variance-authority";

import { cn } from "@/helpers/utilsFns";

const badgeVariants = cva(
  "focus:outline-hidden inline-flex items-center rounded-md border px-2.5 py-0.5 text-sm font-semibold transition-none focus:ring-2 focus:ring-ring focus:ring-offset-2 lg:text-xs",
  {
    variants: {
      variant: {
        basic:
          "border-foregound bg-background text-foreground hover:bg-white/75 white:hover:bg-salYellowLt",
        default:
          "border-transparent bg-transparent text-primary-foreground hover:border hover:border-stone-200 hover:shadow-sm",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  disabled?: boolean;
}

function Badge({ className, variant, disabled, ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        badgeVariants({ variant }),
        className,
        disabled && "pointer-events-none border-foreground/50 opacity-50",
      )}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
