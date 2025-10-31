import type { VariantProps } from "class-variance-authority";

import * as React from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { cn } from "@/helpers/utilsFns";

export type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];
export type ButtonSize = VariantProps<typeof buttonVariants>["size"];

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        richTextButton:
          "border border-foreground/20 bg-white text-foreground hover:bg-salYellow/30 [&_svg]:pointer-events-none [&_svg]:size-4",
        icon: "bg-transparent text-foreground hover:scale-105 [&_svg]:shrink-0",
        default: `border bg-white text-foreground hover:bg-salYellow/30`,
        destructive: `bg-destructive text-destructive-foreground hover:bg-destructive/90`,
        outline: `border-1.5 border-foreground bg-background hover:bg-white/30`,
        secondary: `bg-secondary text-secondary-foreground hover:bg-secondary/80`,
        ghost: `border border-transparent hover:scale-105 active:scale-95`,
        ghost2: `hover:scale-105 hover:bg-none hover:text-accent-foreground active:scale-95`,
        link: `link-btn text-primary underline-offset-2 hover:underline`,
        expandIcon: `group relative bg-primary text-primary-foreground hover:bg-primary/90`,
        ringHover: `bg-primary text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:ring-2 hover:ring-primary/90 hover:ring-offset-2`,
        shine: `animate-shine bg-linear-to-r from-primary via-primary/75 to-primary bg-[length:400%_100%] text-primary-foreground`,
        gooeyRight: `before:bg-linear-to-r relative z-0 overflow-hidden bg-primary from-zinc-400 text-primary-foreground transition-all duration-500 before:absolute before:inset-0 before:-z-10 before:translate-x-[150%] before:translate-y-[150%] before:scale-[2.5] before:rounded-[100%] before:transition-transform before:duration-1000 hover:before:translate-x-[0%] hover:before:translate-y-[0%]`,
        gooeyLeft: `after:bg-linear-to-l relative z-0 overflow-hidden bg-primary from-zinc-400 text-primary-foreground transition-all duration-500 after:absolute after:inset-0 after:-z-10 after:translate-x-[-150%] after:translate-y-[150%] after:scale-[2.5] after:rounded-[100%] after:transition-transform after:duration-1000 hover:after:translate-x-[0%] hover:after:translate-y-[0%]`,
        linkHover1: `relative after:absolute after:bottom-2 after:h-[1px] after:w-2/3 after:origin-bottom-left after:scale-x-100 after:bg-primary after:transition-transform after:duration-300 after:ease-in-out hover:after:origin-bottom-right hover:after:scale-x-0`,
        linkHover2: `relative after:absolute after:bottom-2 after:h-[1px] after:w-2/3 after:origin-bottom-right after:scale-x-0 after:bg-primary after:transition-transform after:duration-300 after:ease-in-out hover:after:origin-bottom-left hover:after:scale-x-100`,
        salWithShadow: `linear border-2 border-foreground bg-white font-medium text-foreground shadow-slg transition-all duration-300 hover:translate-x-[-1px] hover:shadow-slgHover focus:translate-x-[-1px] focus:shadow-slgHover active:translate-x-[-3px] active:translate-y-[3px] active:shadow-none dark:border-primary-foreground dark:text-primary-foreground`,
        salWithShadowHidden: `linear border-2 border-foreground bg-white font-medium text-foreground shadow-none transition-all duration-300 hover:translate-x-[3px] hover:translate-y-[-3px] hover:shadow-slg active:translate-x-0 active:translate-y-0 active:shadow-none dark:border-primary-foreground dark:text-primary-foreground`,
        salWithShadowHiddenPink: `linear border-2 border-foreground bg-salPink font-medium text-foreground shadow-none transition-all duration-300 hover:translate-x-[3px] hover:translate-y-[-3px] hover:shadow-slg active:translate-x-0 active:translate-y-0 active:shadow-none dark:border-primary-foreground dark:text-primary-foreground`,
        salWithShadowHiddenBg: `linear border-2 border-foreground bg-background font-medium text-foreground shadow-none transition-all duration-300 hover:translate-x-[3px] hover:translate-y-[-3px] hover:shadow-slg active:translate-x-0 active:translate-y-0 active:shadow-none dark:border-primary-foreground dark:text-primary-foreground`,
        salWithShadowHiddenLeft: `linear !rounded-r-none border-2 border-r border-foreground bg-white font-medium text-foreground shadow-none transition-all duration-300 hover:-translate-x-[3px] hover:translate-y-[-3px] hover:shadow-llg active:translate-x-0 active:translate-y-0 active:shadow-none dark:border-primary-foreground dark:text-primary-foreground`,
        salWithShadowHiddenVert: `linear border-2 border-foreground bg-white font-medium text-foreground shadow-none transition-all duration-300 hover:translate-y-[-3px] hover:shadow-vlg active:translate-y-0 active:shadow-none dark:border-primary-foreground dark:text-primary-foreground`,
        salWithoutShadow: `focus:bg-salyellow/70 border-2 border-foreground bg-white text-foreground hover:bg-salYellow/80 active:bg-salYellow/70 dark:border-primary-foreground dark:text-primary-foreground`,
        salWithShadowYlw: `linear border-2 border-foreground bg-salYellow font-medium text-foreground shadow-slg transition-all duration-300 hover:translate-x-[-1px] hover:bg-salYellowLt hover:shadow-slgHover focus:translate-x-[-1px] focus:bg-salYellowLt focus:shadow-slgHover active:translate-x-[-3px] active:translate-y-[3px] active:shadow-none dark:border-primary-foreground dark:text-primary-foreground`,
        salWithShadowHiddenYlw: `linear border-2 border-foreground bg-salYellow font-medium text-foreground shadow-none transition-all duration-300 hover:translate-x-[3px] hover:translate-y-[-3px] hover:shadow-slg active:translate-x-0 active:translate-y-0 active:shadow-none white:bg-white dark:border-primary-foreground dark:text-primary-foreground`,
        salWithShadowPink: `linear border-2 border-foreground bg-salPink font-medium text-foreground shadow-slg transition-all duration-300 hover:translate-x-[-1px] hover:bg-salPinkLt hover:shadow-slgHover focus:translate-x-[-1px] focus:bg-salPinkLt focus:shadow-slgHover active:translate-x-[-3px] active:translate-y-[3px] active:shadow-none dark:border-primary-foreground dark:text-primary-foreground`,
      },
      size: {
        default: "h-13 px-4 py-2 text-base sm:h-11 sm:text-sm",
        sm: "h-9 rounded-md px-3",
        lg: "h-14 rounded-md px-6 text-base sm:h-11 sm:px-8 sm:text-sm",
        icon: "h-10 w-10",
        richText: "h-auto p-1",
        link: "h-auto p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

interface IconProps {
  Icon: React.ElementType;
  iconPlacement: "left" | "right";
}

interface IconRefProps {
  Icon?: never;
  iconPlacement?: undefined;
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  fontSize?: string;
}

export type ButtonIconProps = IconProps | IconRefProps;

const Button = React.forwardRef<
  HTMLButtonElement,
  ButtonProps & ButtonIconProps
>(
  (
    {
      className,
      fontSize,
      variant,
      size,
      asChild = false,
      Icon,
      iconPlacement,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }), fontSize)}
        ref={ref}
        {...props}
      >
        {Icon && iconPlacement === "left" && (
          <div className="group-hover:translate-x-100 w-0 translate-x-[0%] pr-0 opacity-0 transition-all duration-200 group-hover:w-5 group-hover:pr-2 group-hover:opacity-100">
            <Icon />
          </div>
        )}
        <Slottable>{props.children}</Slottable>
        {Icon && iconPlacement === "right" && (
          <div className="w-0 translate-x-[100%] pl-0 opacity-0 transition-all duration-200 group-hover:w-5 group-hover:translate-x-0 group-hover:pl-2 group-hover:opacity-100">
            <Icon />
          </div>
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
