"use client";

import * as AvatarPrimitive from "@radix-ui/react-avatar";
import * as React from "react";

import { cn } from "@/lib/utils";
import { User } from "@/types/user";
import { User as UserIcon } from "lucide-react";

const Avatar = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "size-12.5 relative flex shrink-0 overflow-hidden rounded-full border-1.5 border-border active:scale-95",
      className,
    )}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    loading="eager"
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full border border-border bg-userIcon font-bold text-foreground",
      className,
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

interface AvatarSimpleProps {
  src?: string;
  alt?: string;
  user?: User | null;
  className?: string;
}

export const AvatarSimple = ({
  src,
  alt,
  className,
  user,
}: AvatarSimpleProps) => (
  <Avatar className={className}>
    <AvatarImage src={src} alt={alt} />
    <AvatarFallback className="text-foreground">
      {user?.firstName?.[0].toUpperCase()}
      {user?.lastName?.[0].toUpperCase()}
      {!user && <UserIcon className="size-4" />}
    </AvatarFallback>
  </Avatar>
);

export { Avatar, AvatarFallback, AvatarImage };
