import { cn } from "@/lib/utils"
import { cva } from "class-variance-authority"
import Link from "next/link"
import React from "react"

import type { VariantProps } from "class-variance-authority"

const linkVariants = cva(
  "transition-colors duration-200 ease-in-out text-base lg:text-sm",
  {
    variants: {
      variant: {
        default: "hover:underline underline-offset-2",
        subtle: "text-muted-foreground hover:text-foreground",
        bold: "font-semibold underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

type LinkVariantProps = VariantProps<typeof linkVariants>

export interface CustomLinkProps extends LinkVariantProps {
  href: string
  children: React.ReactNode
  className?: string
  onClick?: () => void
  target?: string
  rel?: string
  prefetch?: boolean
}

const CustomLink = ({
  href,
  children,
  className,
  onClick,
  target,
  rel,
  variant,
  prefetch,
}: CustomLinkProps) => {
  return (
    <Link
      href={href}
      className={cn(linkVariants({ variant }), className)}
      onClick={onClick}
      target={target}
      rel={rel}
      prefetch={prefetch}>
      {children}
    </Link>
  )
}

export { CustomLink as Link }
