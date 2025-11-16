import type { VariantProps } from "class-variance-authority";

import * as React from "react";
import { cva } from "class-variance-authority";

import { cn } from "@/helpers/utilsFns";

const inputVariants = cva(
  "flex w-full rounded-md border px-3 py-2 text-[16px] file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm",

  {
    variants: {
      variant: {
        basic:
          "border-[1.5px] border-foreground bg-white text-foreground focus:bg-white focus:outline focus:ring-1",

        default: "border-gray-300 bg-white text-foreground",
        outline: "border-foreground bg-transparent",
        ghost: "border-none bg-transparent",
        destructive: "border-red-500 bg-red-100 text-red-600",
      },
      inputHeight: {
        sm: "h-10 sm:h-9",
        default: "h-11",
        lg: "h-12 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      inputHeight: "default",
    },
  },
);
const radioVariants = cva(
  "size-4 rounded-full border border-gray-400 transition-colors checked:border-blue-500 checked:ring-2 checked:ring-blue-500 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400",

  {
    variants: {
      variant: {
        basic: "border-foreground bg-white text-foreground",
        default:
          "border-1.5 border-gray-300 bg-salPink/20 text-foreground checked:border-foreground/70 checked:ring-salPink focus:ring-salPink",
        outline: "border-foreground bg-transparent",
        ghost: "border-none bg-transparent",
        destructive: "border-red-500 bg-red-100",
      },
      inputHeight: {
        sm: "size-3",
        default: "size-6 sm:size-5",
        lg: "size-6",
      },
    },
    defaultVariants: {
      variant: "default",
      inputHeight: "default",
    },
  },
);
const radioInnerVariants = cva(
  "scale-0 rounded-full bg-blue-500 transition-transform duration-200",

  {
    variants: {
      variant: {
        basic: "border-foreground bg-white text-foreground",
        default:
          "border-gray-300 bg-foreground/90 text-foreground checked:border-salPink checked:ring-salPink focus:ring-salPink",
        outline: "border-foreground bg-transparent",
        ghost: "border-none bg-transparent",
        destructive: "border-red-500 bg-red-100",
      },
      inputHeight: {
        sm: "size-2",
        default: "size-3",
        lg: "size-3",
      },
    },
    defaultVariants: {
      variant: "default",
      inputHeight: "default",
    },
  },
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  labelClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { variant, inputHeight, className, labelClassName, type, ...props },
    ref,
  ) => {
    const baseClasses =
      type === "radio"
        ? radioVariants({ variant, inputHeight })
        : inputVariants({ variant, inputHeight });

    if (type === "radio") {
      return (
        <label
          className={cn("relative inline-flex items-center", labelClassName)}
        >
          <input
            ref={ref}
            type="radio"
            className={cn("peer", baseClasses, className)}
            {...props}
          />
          <span className="pointer-events-none absolute left-0 top-0 flex size-6 items-center justify-center rounded-full sm:size-5 peer-checked:[&>*]:scale-100">
            <span
              className={cn(
                radioInnerVariants({ variant, inputHeight }),
                className,
              )}
            />
          </span>
        </label>
      );
    }

    // default input
    return (
      <input
        type={type}
        className={cn(
          baseClasses,
          className,
          "disabled:border-foreground/50 disabled:opacity-50",
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input, inputVariants };
