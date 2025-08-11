"use client";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";
import { type ComponentPropsWithRef } from "react";
const linkVariants = cva(
  "transition-colors duration-200 ease-in-out text-base lg:text-sm [&_button]:active:scale-95 [&_button]:hover:no-underline",
  {
    variants: {
      variant: {
        default: "hover:underline underline-offset-2",
        subtle: "text-muted-foreground hover:text-foreground",
        subtleUnderline:
          "text-muted-foreground hover:underline hover:text-foreground underline-offset-2 decoration-foreground",
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
    fontSize?: "text-sm" | "text-base";
  };

const CustomLink = ({
  className,
  variant,
  fontSize,

  ...props
}: CustomLinkProps) => {
  return (
    <Link
      className={cn(
        linkVariants({ variant }),
        className,
        fontSize === "text-base"
          ? "lg:text-base"
          : fontSize === "text-sm"
            ? fontSize
            : "",
      )}
      {...props}
    />
  );
};

export { CustomLink as Link };
