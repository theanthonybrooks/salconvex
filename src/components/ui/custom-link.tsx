import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";
import { type ComponentPropsWithRef } from "react";
const linkVariants = cva(
  "transition-colors duration-200 ease-in-out text-base lg:text-sm",
  {
    variants: {
      variant: {
        default: "hover:underline underline-offset-2",
        subtle: "text-muted-foreground hover:text-foreground",
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
  };

const CustomLink = ({
  className,
  variant,

  ...props
}: CustomLinkProps) => {
  return (
    <Link className={cn(linkVariants({ variant }), className)} {...props} />
  );
};

export { CustomLink as Link };
