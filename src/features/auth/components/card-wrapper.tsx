import { Header } from "@/features/auth/components/header"
import { Social } from "@/features/auth/components/social"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import Link from "next/link"
import React from "react"

type CardWrapperProps = {
  children: React.ReactNode
  hasHeader?: boolean
  headerLabel: string
  backButtonLabel: string
  backButtonQuestion: string
  backButtonHref?: string
  backButtonAction?: () => void
  showSocial?: boolean
  className?: string
}

export default function CardWrapper({
  children,
  headerLabel,
  backButtonLabel,
  backButtonQuestion,
  backButtonHref,
  backButtonAction,
  showSocial,
  className,
  hasHeader,
}: CardWrapperProps) {
  return (
    <Card
      className={cn(
        "min-w-[400px] w-[30dvw] max-w-[500px] shadow-md px-10",
        className
      )}>
      <CardHeader>
        <Header hasHeader={hasHeader} label={headerLabel} />
      </CardHeader>
      <CardContent className='flex gap-y-5 flex-col justify-center items-center'>
        {showSocial && (
          <>
            <Social />
            <p className='flex w-full items-center gap-x-3 text-sm text-black before:h-[1px] before:flex-1 before:bg-black after:h-[1px] after:flex-1 after:bg-black'>
              or
            </p>
          </>
        )}
      </CardContent>
      <CardContent> {children}</CardContent>
      <CardFooter className='flex justify-center items-center gap-2 text-sm text-black'>
        {backButtonHref && (
          <>
            <p>{backButtonQuestion}</p>
            <Link href={backButtonHref} className='hover:underline '>
              {backButtonLabel}
            </Link>
          </>
        )}
        {backButtonAction && (
          <p className='flex gap-1'>
            {backButtonQuestion}
            <span
              onClick={backButtonAction}
              className='text-sky-700 hover:underline cursor-pointer'>
              {backButtonLabel}
            </span>
          </p>
        )}
      </CardFooter>
    </Card>
  )
}
