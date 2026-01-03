"use client";

import * as React from "react";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-media-query";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import { X } from "lucide-react";

import { cn } from "@/helpers/utilsFns";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "dark:bg-tab-a0/60 fixed inset-0 z-30 bg-foreground/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

interface CustomDialogContentProps extends React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Content
> {
  showCloseButton?: boolean;
  overlayClassName?: string;
  closeBtnClassName?: string;
  zIndex?: string;
  isDraggable?: boolean;
  snapTo?: "left" | "right" | "center";
}

const DialogContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  CustomDialogContentProps
>(
  (
    {
      className,
      overlayClassName,
      children,
      showCloseButton = true,
      closeBtnClassName,
      zIndex,
      isDraggable = false,
      snapTo = "center",
      ...props
    },
    ref,
  ) => {
    const isMobile = useIsMobile(768);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [initialMousePosition, setInitialMousePosition] = useState({
      x: 0,
      y: 0,
    });
    const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0 });
    const canDrag = isDraggable && !isMobile;
    const handleMouseDown = (e: React.MouseEvent) => {
      if (!canDrag) return;
      if (e.target !== e.currentTarget) return;

      setIsDragging(true);
      setInitialMousePosition({ x: e.clientX, y: e.clientY });
      setInitialPosition({ x: position.x, y: position.y });
    };
    const handleMouseMove = (e: React.MouseEvent) => {
      if (!canDrag) return;

      if (isDragging) {
        const deltaMove = {
          x: e.clientX - initialMousePosition.x,
          y: e.clientY - initialMousePosition.y,
        };
        setPosition({
          x: initialPosition.x + deltaMove.x,
          y: initialPosition.y + deltaMove.y,
        });
      }
    };
    const handleMouseUp = () => {
      if (!canDrag) return;
      setIsDragging(false);
    };

    const alignValue = snapTo === "left" ? 95 : snapTo === "center" ? 10 : 5;
    return (
      <DialogPortal>
        <DialogOverlay className={cn(overlayClassName, zIndex)} />
        <DialogPrimitive.Content
          ref={ref}
          className={cn(
            "fixed left-1/2 top-1/2 z-[31] grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
            className,
            zIndex,
            canDrag &&
              "translate-x-auto translate-y-auto scale-100 cursor-grab border-solid",
            canDrag &&
              isDragging &&
              "scale-95 cursor-grabbing border-2 border-dashed",
          )}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={
            canDrag
              ? {
                  transform: `translate(-${alignValue}%, -50%) translate(${position.x}px, ${position.y}px)`,
                }
              : undefined
          }
          {...props}
        >
          {children}
          {showCloseButton && (
            <DialogPrimitive.Close
              className={cn(
                "focus:outline-hidden absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:cursor-pointer hover:opacity-100 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
                closeBtnClassName,
              )}
            >
              <X className="size-8 hover:text-red-600 md:size-6 xl:size-7" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          )}
        </DialogPrimitive.Content>
      </DialogPortal>
    );
  },
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className,
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className,
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className,
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-foreground/70", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
