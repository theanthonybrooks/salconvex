import { useState } from "react";
import { ControllerRenderProps, FieldPath, FieldValues } from "react-hook-form";

import { Eye, EyeOff } from "lucide-react";

import { Input, InputProps } from "@/components/ui/input";
import { PasswordChecklist } from "@/components/ui/password-checklist";
import { cn } from "@/helpers/utilsFns";

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
  showChecklist?: boolean;
  type?: "register" | "update" | "forgot";
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
  showChecklist = false,
  type,
}: PasswordInputProps<TFieldValues, TName>) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={cn("flex flex-col gap-2")}>
      <div
        className={cn(
          "relative rounded-lg border-1.5 border-foreground focus-within:bg-white focus-within:ring-1 focus-within:ring-foreground",
          (isPending || disabled) &&
            "pointer-events-none border-foreground/50 opacity-50",
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
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            field.onBlur();
            setIsFocused(false);
          }}
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
      {showChecklist && isFocused && (
        <PasswordChecklist password={field.value ?? ""} type={type} />
      )}
    </div>
  );
}
