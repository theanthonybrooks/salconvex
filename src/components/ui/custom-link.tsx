"use client";

import type { VariantProps } from "class-variance-authority";

import { type ComponentPropsWithRef } from "react";
import Link from "next/link";
import { cva } from "class-variance-authority";

import { cn } from "@/helpers/utilsFns";

const linkVariants = cva(
  "text-base transition-colors duration-200 ease-in-out lg:text-sm [&_button]:hover:no-underline [&_button]:active:scale-[0.975]",
  {
    variants: {
      variant: {
        default: "underline-offset-2 hover:underline",
        underline: "underline underline-offset-2 hover:underline-offset-1",
        subtle: "text-muted-foreground hover:text-foreground",
        subtleUnderline:
          "text-muted-foreground decoration-foreground underline-offset-2 hover:text-foreground hover:underline",
        bold: "font-semibold underline hover:underline-offset-2",
        standard: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type CustomLinkProps = ComponentPropsWithRef<typeof Link> &
  VariantProps<typeof linkVariants> & {
    className?: string;
    fontSize?: string;
    disabled?: boolean;
  };

const CustomLink = ({
  className,
  variant,
  fontSize,
  disabled,

  ...props
}: CustomLinkProps) => {
  return (
    <Link
      className={cn(
        linkVariants({ variant }),
        className,
        fontSize,
        disabled && "pointer-events-none",
      )}
      {...props}
    />
  );
};

export { CustomLink as Link };
