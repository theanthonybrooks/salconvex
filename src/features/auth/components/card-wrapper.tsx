import React from "react";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Header } from "@/features/auth/components/header";
import { Social } from "@/features/auth/components/social";
import { cn } from "@/helpers/utilsFns";

type CardWrapperProps = {
  children: React.ReactNode;
  hasHeader?: boolean;
  headerLabel: string;
  backButtonLabel: string;
  backButtonQuestion: string;
  backButtonHref?: string;
  backButtonAction?: () => void;
  showSocial?: boolean;
  className?: string;
};

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
        "w-[30dvw] min-w-[400px] max-w-[500px] px-10 shadow-md",
        className,
      )}
    >
      <CardHeader>
        <Header hasHeader={hasHeader} label={headerLabel} />
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-y-5">
        {showSocial && (
          <>
            <Social />
            <p className="flex w-full items-center gap-x-3 text-sm text-foreground before:h-[1px] before:flex-1 before:bg-foreground after:h-[1px] after:flex-1 after:bg-foreground">
              or
            </p>
          </>
        )}
      </CardContent>
      <CardContent> {children}</CardContent>
      <CardFooter className="flex items-center justify-center gap-2 text-sm text-foreground">
        {backButtonHref && (
          <>
            <p>{backButtonQuestion}</p>
            <Link href={backButtonHref} className="hover:underline">
              {backButtonLabel}
            </Link>
          </>
        )}
        {backButtonAction && (
          <p className="flex gap-1">
            {backButtonQuestion}
            <span
              onClick={backButtonAction}
              className="cursor-pointer text-sky-700 hover:underline"
            >
              {backButtonLabel}
            </span>
          </p>
        )}
      </CardFooter>
    </Card>
  );
}
