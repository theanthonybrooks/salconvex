import { cn } from "@/lib/utils";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

export type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];
const defaultSvg = "[&_svg]:size-5 [&_svg]:pointer-events-none";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium  transition-colors   disabled:pointer-events-none disabled:opacity-50 ",
  {
    variants: {
      variant: {
        richTextButton:
          "bg-white text-foreground border-foreground/20 hover:bg-salYellow/30 border [&_svg]:size-4 [&_svg]:pointer-events-none",
        icon: "bg-transparent text-foreground hover:scale-110  [&_svg]:shrink-0 ",
        default: `bg-white text-foreground hover:bg-salYellow/30 border ${defaultSvg}`,
        destructive: `bg-destructive text-destructive-foreground hover:bg-destructive/90 ${defaultSvg}`,
        outline: `border-1.5 border-foreground bg-background hover:bg-white/30 ${defaultSvg}`,
        secondary: `bg-secondary text-secondary-foreground hover:bg-secondary/80 ${defaultSvg}`,
        ghost: `hover:scale-110 active:scale-95 border border-transparent ${defaultSvg}`,
        ghost2: `hover:bg-none hover:text-accent-foreground hover:scale-105 ${defaultSvg}`,
        link: `text-primary underline-offset-2 hover:underline ${defaultSvg}`,
        expandIcon: `group relative text-primary-foreground bg-primary hover:bg-primary/90 ${defaultSvg}`,
        ringHover: `bg-primary text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:ring-2 hover:ring-primary/90 hover:ring-offset-2 ${defaultSvg}`,
        shine: `text-primary-foreground animate-shine bg-linear-to-r from-primary via-primary/75 to-primary bg-[length:400%_100%]  ${defaultSvg}`,
        gooeyRight: `text-primary-foreground relative bg-primary z-0 overflow-hidden transition-all duration-500 before:absolute before:inset-0 before:-z-10 before:translate-x-[150%] before:translate-y-[150%] before:scale-[2.5] before:rounded-[100%] before:bg-linear-to-r from-zinc-400 before:transition-transform before:duration-1000  hover:before:translate-x-[0%] hover:before:translate-y-[0%]  ${defaultSvg}`,
        gooeyLeft: `text-primary-foreground relative bg-primary z-0 overflow-hidden transition-all duration-500 after:absolute after:inset-0 after:-z-10 after:translate-x-[-150%] after:translate-y-[150%] after:scale-[2.5] after:rounded-[100%] after:bg-linear-to-l from-zinc-400 after:transition-transform after:duration-1000  hover:after:translate-x-[0%] hover:after:translate-y-[0%]  ${defaultSvg}`,
        linkHover1: `relative after:absolute after:bg-primary after:bottom-2 after:h-[1px] after:w-2/3 after:origin-bottom-left after:scale-x-100 hover:after:origin-bottom-right hover:after:scale-x-0 after:transition-transform after:ease-in-out after:duration-300 ${defaultSvg}`,
        linkHover2: `relative after:absolute after:bg-primary after:bottom-2 after:h-[1px] after:w-2/3 after:origin-bottom-right after:scale-x-0 hover:after:origin-bottom-left hover:after:scale-x-100 after:transition-transform after:ease-in-out after:duration-300 ${defaultSvg}`,
        salWithShadow: `bg-white text-foreground border-2 border-foreground font-medium shadow-slg transition-all duration-300 linear hover:shadow-slgHover hover:translate-x-[-1px]  active:shadow-none active:translate-x-[-3px] active:translate-y-[3px]   dark:border-primary-foreground dark:text-primary-foreground ${defaultSvg}`,
        salWithShadowHidden: `bg-white text-foreground border-2 border-foreground font-medium shadow-none transition-all duration-300 linear hover:shadow-slg hover:translate-x-[3px] hover:translate-y-[-3px] active:shadow-none active:translate-x-0 active:translate-y-0 dark:border-primary-foreground dark:text-primary-foreground ${defaultSvg}`,
        salWithShadowHiddenLeft: `bg-white text-foreground border-2 border-foreground font-medium shadow-none transition-all duration-300 linear hover:shadow-llg hover:-translate-x-[3px] hover:translate-y-[-3px] active:shadow-none active:translate-x-0 active:translate-y-0 dark:border-primary-foreground dark:text-primary-foreground `,
        salWithShadowHiddenVert: `bg-white text-foreground border-2 border-foreground font-medium shadow-none transition-all duration-300 linear hover:shadow-vlg  hover:translate-y-[-3px] active:shadow-none  active:translate-y-0 dark:border-primary-foreground dark:text-primary-foreground `,
        salWithoutShadow: `bg-white text-foreground  hover:bg-salYellow/80 active:bg-salYellow/70 border-2 border-foreground focus:bg-salyellow/70 dark:border-primary-foreground dark:text-primary-foreground ${defaultSvg}`,
        salWithShadowYlw: `bg-salyellow text-foreground border-2 hover:bg-salYellowLt hover:shadow-slgHover hover:translate-x-[-1px] border-foreground font-medium shadow-slg transition-all duration-300 linear  active:shadow-none active:translate-x-[-3px] active:translate-y-[3px] dark:border-primary-foreground dark:text-primary-foreground ${defaultSvg}`,
        salWithShadowHiddenYlw: `bg-salYellow  text-foreground border-2 border-foreground font-medium shadow-none transition-all duration-300 linear hover:shadow-slg hover:translate-x-[3px] hover:translate-y-[-3px] active:shadow-none active:translate-x-0 active:translate-y-0  dark:border-primary-foreground dark:text-primary-foreground ${defaultSvg}`,
        salWithShadowPink: `bg-salPink hover:shadow-slgHover hover:bg-salPinkLt hover:translate-x-[-1px] text-foreground border-2 border-foreground font-medium shadow-slg transition-all duration-300 linear  active:shadow-none active:translate-x-[-3px] active:translate-y-[3px]  dark:border-primary-foreground dark:text-primary-foreground ${defaultSvg}`,
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-6 sm:px-8 text-base sm:text-sm",
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
}

export type ButtonIconProps = IconProps | IconRefProps;

const Button = React.forwardRef<
  HTMLButtonElement,
  ButtonProps & ButtonIconProps
>(
  (
    {
      className,
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
        className={cn(buttonVariants({ variant, size, className }))}
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
