"use client";

//TODO: Add the userPref check to this component (and others) to ensure that the fontSize is set to the user's preference
import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { IconType } from "react-icons";

import {
  Check,
  ChevronDown,
  ChevronUp,
  DollarSign,
  LucideIcon,
} from "lucide-react";

import { cn } from "@/helpers/utilsFns";

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & {
    fontSize?: string;
  }
>(({ className, children, fontSize, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "shadow-xs group flex h-11 w-full items-center justify-between whitespace-nowrap rounded-md border border-foreground px-3 py-2 text-base ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:border-foreground/50 disabled:opacity-50 sm:h-9 sm:text-sm [&>span]:line-clamp-1 [&>span]:w-full [&[data-placeholder]>div]:text-foreground/50 [&[data-placeholder]>span]:text-foreground/50",
      className,
    )}
    {...props}
  >
    <div className={cn("flex w-full justify-center", fontSize)}>{children}</div>
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="size-4 opacity-50 group-data-[state=open]:rotate-180" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className,
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className,
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> & {
    fit?: boolean;
  }
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-96 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",

        className,
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]",
          // className,
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold", className)}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> & {
    indicator?: boolean;
    fit?: boolean;
    center?: boolean;
    fontSize?: string;
  }
>(
  (
    { className, children, indicator = true, center, fit, fontSize, ...props },
    ref,
  ) => (
    <SelectPrimitive.Item
      ref={ref}
      className={cn(
        "outline-hidden data-disabled:pointer-events-none data-disabled:opacity-50 relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 text-base focus:bg-salPinkLt focus:text-accent-foreground data-[state=checked]:bg-salPinkLt/50 data-[state=checked]:font-bold sm:text-sm",
        indicator && !fit ? "pr-8" : fit ? "pr-2" : "justify-center pr-2",
        center && "justify-center",
        className,
        fontSize,
      )}
      {...props}
    >
      {indicator && (
        <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
          <SelectPrimitive.ItemIndicator>
            <Check className="size-4" />
          </SelectPrimitive.ItemIndicator>
        </span>
      )}
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  ),
);
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};

interface SelectSimpleProps {
  options: {
    label: React.ReactNode;
    value: string;
    icon?: IconType | LucideIcon;
    disabled?: boolean;
    premium?: boolean;
    group?: string;
    className?: string;
  }[];
  onChangeAction: (value: string) => void;
  value: string;
  id?: string;
  placeholder: string;
  className?: string;
  contentClassName?: string;
  itemClassName?: string;
  tabIndex?: number;
  invalid?: boolean;
  disabled?: boolean;
  fontSize?: string;
  hasReset?: boolean;
  center?: boolean;
}

export const SelectSimple = ({
  options,
  onChangeAction,
  value,
  className,
  contentClassName,
  itemClassName,
  placeholder,
  tabIndex = 0,
  invalid,
  disabled,
  id,
  fontSize,
  hasReset,
  center,
}: SelectSimpleProps) => {
  const selectOptions = [
    ...options,
    ...(hasReset && value !== "-" && value
      ? [{ value: "-", label: "--Reset--" }]
      : []),
  ];
  const groupedOptions = selectOptions.reduce<
    Record<string, typeof selectOptions>
  >((acc, option) => {
    const key = option.group || "_ungrouped";
    if (!acc[key]) acc[key] = [];
    acc[key].push(option);
    return acc;
  }, {});
  return (
    <Select
      value={value}
      onValueChange={(val) => {
        console.log(val);
        if (val === "-") {
          onChangeAction("");
          return;
        }
        onChangeAction(val);
      }}
    >
      <SelectTrigger
        id={id}
        disabled={disabled}
        className={cn(
          "*:data-[slot=select-value]:pr-4",

          invalid && "invalid-field",
          className,
        )}
        fontSize={fontSize}
        tabIndex={tabIndex}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className={cn("z-top max-h-64", contentClassName)}>
        {Object.entries(groupedOptions).map(([groupName, opts]) => (
          <div key={groupName}>
            {groupName !== "_ungrouped" && (
              <div
                className={cn(
                  "px-4 py-1 text-sm font-medium text-foreground/30",
                  fontSize,
                )}
              >
                {groupName}
              </div>
            )}

            {opts.map((option, i) => (
              <SelectItem
                key={option.value + i}
                value={option.value}
                disabled={option.disabled}
                className={cn(
                  itemClassName,
                  option.disabled &&
                    "pointer-events-none rounded-sm opacity-50",
                  option.value === "-" && "bg-salPinkLt/30 text-destructive",
                  option.group && "pl-8",
                  option.className,
                )}
                center={center}
                fontSize={fontSize}
              >
                <span className="flex items-center gap-x-1">
                  {option.premium && (
                    <span className="flex items-center gap-0">
                      (<DollarSign className="size-3" />)
                    </span>
                  )}
                  {option.icon && <option.icon className="size-4" />}
                  <p className={cn(option.disabled && "line-through")}>
                    {option.label}
                  </p>
                </span>
              </SelectItem>
            ))}
          </div>
        ))}
      </SelectContent>
    </Select>
  );
};
