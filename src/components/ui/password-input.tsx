import { Input, InputProps } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import { ControllerRenderProps, FieldPath, FieldValues } from "react-hook-form";

export interface PasswordInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  field: ControllerRenderProps<TFieldValues, TName>;
  isPending: boolean;
  disabled?: boolean;
  tabIndex?: number;
  visibilityTabIndex?: number;
  placeholder?: {
    default: string;
    show: string;
  };
  className?: string;
  inputClassName?: string;
  inputHeight?: InputProps["inputHeight"];
}

export function PasswordInput<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  isPending,
  disabled,
  tabIndex,
  visibilityTabIndex = -1,
  inputHeight = "default",
  field,
  placeholder,
  className,
  inputClassName,
}: PasswordInputProps<TFieldValues, TName>) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div
      className={cn(
        "relative rounded-lg border-1.5 border-foreground focus-within:bg-white focus-within:ring-1 focus-within:ring-foreground",
        className,
      )}
    >
      <Input
        disabled={isPending || disabled}
        {...field}
        placeholder={
          placeholder &&
          (!showPassword ? placeholder?.default : placeholder?.show)
        }
        type={showPassword ? "text" : "password"}
        inputHeight={inputHeight}
        variant="basic"
        tabIndex={tabIndex}
        className={cn("border-none !shadow-none", inputClassName)}
        required
      />
      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        className="absolute inset-y-0 right-0 flex items-center pr-3"
        tabIndex={visibilityTabIndex}
      >
        {showPassword ? (
          <Eye className="size-4 text-foreground" />
        ) : (
          <EyeOff className="size-4 text-foreground" />
        )}
      </button>
    </div>
  );
}
