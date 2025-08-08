"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as React from "react";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useState } from "react";

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverAnchor = PopoverPrimitive.Anchor;

interface CustomArrowProps
  extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Arrow> {
  shiftOffset?: number; // optional prop to offset the arrow
}

const CustomArrow = React.forwardRef<SVGSVGElement, CustomArrowProps>(
  ({ className, shiftOffset, ...props }, ref) => {
    const localRef = React.useRef<SVGSVGElement>(null);

    // Merge forwarded ref and localRef (if needed)
    const combinedRef = (node: SVGSVGElement | null) => {
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<SVGSVGElement | null>).current = node;
      }
      localRef.current = node;
    };

    // Fix: force visibility on the parent span injected by Radix
    // React.useEffect(() => {
    //   const parent = localRef.current?.parentElement;
    //   if (!parent) return;

    //   // Force visibility if needed
    //   if (parent.style.visibility === "hidden") {
    //     parent.style.visibility = "visible";
    //     parent.style.left = "60px";
    //   }

    //   // Shift the arrow 10px left
    //   const leftValue = parseFloat(parent.style.left || "0");
    //   const offset = -10; // ← move left by 10px, use +10 to move right
    //   parent.style.left = `${leftValue + offset}px`;
    //   parent.classList.add("roger");
    // }, []);

    React.useEffect(() => {
      if (shiftOffset === undefined) return;
      const span = localRef.current?.parentElement;
      if (!span) return;

      requestAnimationFrame(() => {
        if (!span) return;

        span.style.visibility = "visible";
        const leftValue = parseFloat(span.style.left || "0");
        span.style.left = `${leftValue + shiftOffset}px`;

        // Optional: add class for debug/styling
        span.classList.add("roger");
      });
    }, [shiftOffset]);

    return (
      <PopoverPrimitive.Arrow asChild ref={combinedRef} {...props}>
        <svg
          className={cn("z-[41] block", className)}
          width="15"
          height="10"
          viewBox="0 0 30 10"
          preserveAspectRatio="none"
        >
          <polygon points="0,0 30,0 15,10" fill="black" />
          <polygon points="2,0 28,0 15,8" fill="white" />
        </svg>
      </PopoverPrimitive.Arrow>
    );
  },
);

CustomArrow.displayName = "CustomArrow";

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> & {
    showCloseButton?: boolean;
    shiftOffset?: number;
    showArrow?: boolean;
  }
>(
  (
    {
      className,
      align = "center",
      sideOffset = 4,
      children,
      shiftOffset,
      showCloseButton = true,
      showArrow = true,
      ...props
    },
    ref,
  ) => (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "outline-hidden relative z-40 w-72 rounded-md bg-popover p-4 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className,
        )}
        {...props}
      >
        {/* <PopoverPrimitive.Arrow className='fill-white' /> */}
        {showArrow && <CustomArrow shiftOffset={shiftOffset} />}
        <PopoverPrimitive.Close
          aria-label="Close popover"
          className="absolute right-3 top-2 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75"
        >
          {showCloseButton && (
            <X className="size-6 text-black/80 hover:text-red-600" />
          )}
        </PopoverPrimitive.Close>
        {children}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  ),
);
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

type PopoverGroupProps = {
  children: React.ReactNode;
  className?: string;
};

const PopoverGroup = ({ children, className }: PopoverGroupProps) => {
  return (
    <div className={cn("flex flex-col gap-y-2", className)}>{children}</div>
  );
};

type PopoverItemProps = {
  children: React.ReactNode;
  className?: string;
  inset?: boolean;
};

const PopoverItem = ({ children, className, inset }: PopoverItemProps) => {
  return (
    <div
      className={cn(
        "outline-hidden data-disabled:pointer-events-none data-disabled:opacity-50 relative flex select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors focus:bg-accent focus:text-accent-foreground [&>svg]:size-4 [&>svg]:shrink-0",
        inset && "pl-8",
        // "flex items-center gap-x-2 rounded-md text-sm hover:bg-salYellow/50 focus:bg-salYellow/50",
        className,
      )}
    >
      {children}
    </div>
  );
};

export {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverGroup,
  PopoverItem,
  PopoverTrigger,
};

export const PopoverSimple = ({
  children,
  content,
  align = "center",
  sideOffset = 4,
  showCloseButton = false,
  showArrow = true,
  className,
  triggerClassName,
  disabled,
}: {
  children: React.ReactNode;
  content: React.ReactNode;
  align?: "start" | "center" | "end";
  sideOffset?: number;
  showCloseButton?: boolean;
  showArrow?: boolean;
  className?: string;
  triggerClassName?: string;
  disabled?: boolean;
}) => {
  const [popoverOpen, setPopoverOpen] = useState(false);
  if (disabled) return <>{children}</>;
  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger
        asChild
        onMouseOver={() => setPopoverOpen(true)}
        onMouseLeave={() => setPopoverOpen(false)}
        className={cn(triggerClassName, "hover:cursor-pointer")}
      >
        {children}
      </PopoverTrigger>

      <PopoverContent
        align={align}
        sideOffset={sideOffset}
        showCloseButton={showCloseButton}
        showArrow={showArrow}
        className={cn(
          "outline-hidden relative z-40 w-72 rounded-md bg-popover p-5 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className,
        )}
      >
        {content}
      </PopoverContent>
    </Popover>
  );
};
