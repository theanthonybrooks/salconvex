import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

const inputVariants = cva(
  "w-full flex rounded-md border  px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        basic:
          "border-black bg-white text-black border-[1.5px] focus:outline focus:ring-1 focus:bg-white",

        default: "border-gray-300 bg-white text-black",
        outline: "border-black bg-transparent",
        ghost: "bg-transparent border-none",
        destructive: "border-red-500 text-red-600 bg-red-100",
      },
      inputHeight: {
        sm: "h-10 sm:h-8 ",
        default: "h-10 ",
        lg: "h-12  text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      inputHeight: "default",
    },
  }
)

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ variant, inputHeight, className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, inputHeight }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }
