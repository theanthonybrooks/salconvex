"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
  FormProvider,
  useFormContext,
} from "react-hook-form";

import { FormError } from "@/components/form-error";
import { Label } from "@/components/ui/label";
import { cn } from "@/helpers/utilsFns";

const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue,
);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState, getValues } = useFormContext();

  const fieldState = getFieldState(fieldContext.name, formState);
  const value = getValues(fieldContext.name);

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const { id, emptyError } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    value,
    emptyError,
    ...fieldState,
  };
};

type FormItemContextValue = {
  id: string;
  emptyError?: boolean;
};

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue,
);

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    emptyError?: boolean;
  }
>(({ className, emptyError = false, ...props }, ref) => {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id, emptyError }}>
      <div ref={ref} className={cn("space-y-2", className)} {...props} />
    </FormItemContext.Provider>
  );
});
FormItem.displayName = "FormItem";

const FormLabel = React.forwardRef<
  React.ComponentRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { error, formItemId, value, emptyError } = useFormField();

  const hasErrorAndValue =
    error && ((!emptyError && String(value)?.length > 0) || emptyError);

  return (
    <Label
      ref={ref}
      className={cn(
        "leading-normal",
        hasErrorAndValue && "rounded text-destructive",
        className,
      )}
      htmlFor={formItemId}
      {...props}
    />
  );
});
FormLabel.displayName = "FormLabel";

const FormControl = React.forwardRef<
  React.ComponentRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const {
    value,
    error,
    formItemId,
    formDescriptionId,
    formMessageId,
    emptyError,
  } = useFormField();

  const hasErrorAndValue =
    error && ((!emptyError && String(value)?.length > 0) || emptyError);

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      className={cn(hasErrorAndValue && "invalid-field rounded-lg")}
      {...props}
    />
  );
});
FormControl.displayName = "FormControl";

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField();

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn("text-[0.8rem] text-muted-foreground", className)}
      {...props}
    />
  );
});
FormDescription.displayName = "FormDescription";

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId, value, emptyError } = useFormField();
  // if (!error || typeof error !== "object") return null;

  // if (error) console.log(error, value, emptyError, error.root);
  // const hasErrorAndValue =
  //   (!emptyError && String(value)?.length > 0) || emptyError;
  // const body =
  //   error && hasErrorAndValue ? String(error.message) : children || "";
  // if (!body || !children) return null;

  if (!error || typeof error !== "object") return null;

  // Recursively extract the first available error message
  const extractMessage = (err: unknown): string | null => {
    if (!err || typeof err !== "object") return null;
    if ("message" in err && typeof err.message === "string") return err.message;

    // Search nested keys (depth-first)
    for (const key of Object.keys(err)) {
      const nested = extractMessage((err as Record<string, unknown>)[key]);
      if (nested) return nested;
    }

    return null;
  };

  const message = extractMessage(error);
  // console.log(extractMessage(error));
  const hasErrorAndValue =
    (!emptyError && String(value)?.length > 0) || emptyError;
  const body = message || children || "";

  // console.log(emptyError, hasErrorAndValue);
  if ((!body && !children) || !hasErrorAndValue) return null;

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn("text-[0.8rem] font-medium text-destructive", className)}
      {...props}
    >
      {body}
    </p>
  );
});
FormMessage.displayName = "FormMessage";

const FormErrors = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { formState, getValues } = useFormContext();
  const errors = formState.errors;

  if (!errors || Object.keys(errors).length === 0) return null;

  // First error entry
  const [firstField, firstError] = Object.entries(errors)[0];

  // Current value of the errored field
  const value = getValues(firstField);

  // See if emptyError was set on this field’s FormItem (optional context lookup)
  // If you want to support per-field emptyError here, you’ll need to extend
  // your FormItem/FormField context to expose it globally.
  const shouldShow = String(value)?.length > 0 || /* fallback */ false;

  if (!shouldShow) return null;

  return (
    <FormError
      message={
        <div ref={ref} className={cn(className)} {...props}>
          {String(firstError?.message ?? `${firstField} is invalid`)}
        </div>
      }
      icon={false}
    />
  );
});
FormErrors.displayName = "FormErrors";

export {
  Form,
  FormControl,
  FormDescription,
  FormErrors,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
};
