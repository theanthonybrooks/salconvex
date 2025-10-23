"use client";

import type { VariantProps } from "class-variance-authority";
import { type ComponentPropsWithRef } from "react";
import Link from "next/link";
import { cva } from "class-variance-authority";

import { cn } from "@/helpers/utilsFns";

const linkVariants = cva(
  "text-base transition-colors duration-200 ease-in-out lg:text-sm [&_button]:hover:no-underline [&_button]:active:scale-95",
  {
    variants: {
      variant: {
        default: "underline-offset-2 hover:underline",
        subtle: "text-muted-foreground hover:text-foreground",
        subtleUnderline:
          "text-muted-foreground decoration-foreground underline-offset-2 hover:text-foreground hover:underline",
        bold: "font-semibold underline",
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
  };

const CustomLink = ({
  className,
  variant,
  fontSize,

  ...props
}: CustomLinkProps) => {
  return (
    <Link
      className={cn(linkVariants({ variant }), className, fontSize)}
      {...props}
    />
  );
};

export { CustomLink as Link };
