"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";

import { Check, ChevronDown, Circle } from "lucide-react";

import { cn } from "@/helpers/utilsFns";

const DropdownMenu = DropdownMenuPrimitive.Root;

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

const DropdownMenuGroup = DropdownMenuPrimitive.Group;

const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

const DropdownMenuSub = DropdownMenuPrimitive.Sub;

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

const CustomArrow = React.forwardRef<
  SVGSVGElement,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Arrow> & {
    thick?: boolean;
  }
>(({ thick, className, ...props }, ref) => (
  <DropdownMenuPrimitive.Arrow
    asChild
    ref={ref}
    {...props}
    className={cn(
      "group-data-[side=bottom]/content:-translate-y-[2px]",
      "group-data-[side=top]/content:-translate-y-[2px]",
    )}
  >
    <svg
      className={cn(
        "block",
        // "group-data-[side=top]/content:-translate-y-[1.8px]",
        // "group-data-[side=bottom]/content:-translate-y-[1.4px]",
        className,
      )}
      width="15"
      height="10"
      viewBox="0 0 30 10"
      preserveAspectRatio="none"
    >
      {thick ? (
        <>
          <polygon points="0,0 30,0 15,10" fill="black" />
          <polygon points="4,0 26,0 15,6" fill="white" />
        </>
      ) : (
        <>
          <polygon points="0,0 30,0 15,10" fill="black" />
          <polygon points="2,0 28,0 15,8" fill="white" />
        </>
      )}
    </svg>
  </DropdownMenuPrimitive.Arrow>
));
CustomArrow.displayName = "CustomArrow";

const DropdownMenuSubTrigger = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean;
  }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "outline-hidden group/trigger relative flex select-none items-center gap-2 rounded-sm px-2 py-1.5 text-base focus:bg-salYellow/50 data-[state=open]:bg-salYellow/50 sm:text-sm [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      inset && "pl-8",
      className,
    )}
    {...props}
  >
    {children}

    <ChevronDown className="rotate-icon fixed right-3 ml-auto size-3 transition-all duration-200 group-data-[state=open]/trigger:rotate-90" />
  </DropdownMenuPrimitive.SubTrigger>
));
DropdownMenuSubTrigger.displayName =
  DropdownMenuPrimitive.SubTrigger.displayName;

const DropdownMenuSubContent = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      "group z-[51] min-w-[8rem] overflow-hidden border-1.5 bg-popover p-1 text-popover-foreground shadow-lg data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1.5 data-[side=left]:rounded-l-md data-[side=right]:rounded-r-md data-[side=left]:rounded-br-md data-[side=right]:rounded-bl-md data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className,
    )}
    {...props}
  />
));
DropdownMenuSubContent.displayName =
  DropdownMenuPrimitive.SubContent.displayName;

const DropdownMenuContent = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content> & {
    thick?: boolean;
  }
>(
  (
    { thick, className, sideOffset = 4, alignOffset, children, ...props },
    ref,
  ) => (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        ref={ref}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        className={cn(
          "group/content z-50 min-w-[8rem] overflow-hidden rounded-md border-1.5 bg-popover p-1 text-popover-foreground shadow-md",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          thick && "border-2",
          className,
        )}
        {...props}
      >
        {children}
        {/* <div className="absolute group-data-[side=bottom]/content:top-[1.8px] group-data-[side=top]/content:bottom-[0px]"> */}
        <CustomArrow thick={thick} />
        {/* </div> */}
      </DropdownMenuPrimitive.Content>
    </DropdownMenuPrimitive.Portal>
  ),
);
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

const DropdownMenuItem = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "outline-hidden data-disabled:pointer-events-none data-disabled:opacity-50 relative flex select-none items-center gap-2 rounded-sm px-2 py-1.5 text-base transition-colors hover:cursor-pointer hover:bg-salPink/30 focus:bg-salPink/30 focus:text-accent-foreground sm:text-sm [&>svg]:size-4 [&>svg]:shrink-0",
      inset && "pl-8",
      className,
    )}
    {...props}
  />
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "outline-hidden data-disabled:pointer-events-none data-disabled:opacity-50 relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm transition-colors focus:bg-salPinkLt focus:text-foreground",
      className,
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
));
DropdownMenuCheckboxItem.displayName =
  DropdownMenuPrimitive.CheckboxItem.displayName;

const DropdownMenuRadioItem = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      "outline-hidden data-disabled:pointer-events-none data-disabled:opacity-50 relative flex select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm transition-colors focus:bg-salPinkLt focus:text-accent-foreground",
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Circle className="size-2 fill-current" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
));
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;

const DropdownMenuLabel = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-base font-semibold sm:text-sm",
      inset && "pl-8",
      className,
    )}
    {...props}
  />
));
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

const DropdownMenuSeparator = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
      {...props}
    />
  );
};
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
};
