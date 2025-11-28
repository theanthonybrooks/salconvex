import type { UpdatePasswordSchemaValues } from "@/schemas/auth";

import { useState } from "react";
import { UpdatePasswordSchema } from "@/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PasswordChecklist } from "@/components/ui/password-checklist";
import { PasswordInput } from "@/components/ui/password-input";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { getUserFontSizePref } from "@/helpers/stylingFns";
import { cn } from "@/helpers/utilsFns";

import { api } from "~/convex/_generated/api";
import { useMutation, usePreloadedQuery } from "convex/react";
import { ConvexError } from "convex/values";

type ResetPasswordDialogProps = {
  className?: string;
};

export const ResetPasswordDialog = ({
  className,
}: ResetPasswordDialogProps) => {
  const updatePassword = useMutation(api.users.updatePassword);
  const { preloadedUserData } = useConvexPreload();
  const userData = usePreloadedQuery(preloadedUserData);
  const { user, userPref, userId } = userData ?? {};
  const fontSizePref = getUserFontSizePref(userPref?.fontSize);
  const fontSize = fontSizePref?.body;

  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [pending, setPending] = useState(false);
  const passwordForm = useForm<UpdatePasswordSchemaValues>({
    resolver: zodResolver(UpdatePasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      repeatNewPassword: "",
    },
    mode: "onChange",
    delayError: 300,
  });

  const { getFieldState, watch, reset } = passwordForm;
  const newPassword = watch("newPassword");
  const newRepeatedPassword = watch("repeatNewPassword");
  const currentPasswordState = getFieldState("oldPassword");
  const newPasswordState = getFieldState("newPassword");
  const currentPasswordValid =
    !currentPasswordState?.invalid && currentPasswordState?.isDirty;
  const newPasswordValid =
    !newPasswordState?.invalid && newPasswordState?.isDirty;

  const handleUpdatePasswordSubmit = async (
    data: UpdatePasswordSchemaValues,
  ) => {
    setPending(true);
    setError("");

    if (!userId || !user) {
      throw new Error("No user found");
    }
    try {
      await updatePassword({
        email: user.email,
        password: data.newPassword,
        currentPassword: data.oldPassword,
        userId,
        method: "userUpdate",
      });

      setPending(false);
      setSuccess("Password updated!");
      passwordForm?.reset();

      setTimeout(() => {
        setSuccess("");
        setError("");
        setOpen(false);
      }, 2000);
    } catch (err: unknown) {
      if (err instanceof ConvexError) {
        setError(err.data || "An unexpected error occurred.");
      } else if (err instanceof Error) {
        setError(err.message || "An unexpected error occurred.");
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setPending(false);
    }
  };
  return (
    <Dialog
      onOpenChange={() => {
        reset();
        setOpen((prev) => !prev);

        setError("");
        setSuccess("");
      }}
      open={open}
    >
      <DialogTrigger asChild>
        <Button
          variant="salWithShadowHiddenYlw"
          className="w-full min-w-[150px] sm:w-auto"
        >
          Update
        </Button>
      </DialogTrigger>
      <DialogContent className={cn("sm:max-w-[425px]", className)}>
        <DialogHeader>
          <DialogTitle>Edit password</DialogTitle>
          <DialogDescription className="sr-only">
            New password must be at least 8 characters long and must include at
            least one number, one uppercase letter, and one lowercase letter.
          </DialogDescription>
        </DialogHeader>

        <Form {...passwordForm}>
          <form
            onSubmit={passwordForm?.handleSubmit(handleUpdatePasswordSubmit)}
            className="space-y-2"
          >
            {success && success === "Password updated!" && (
              <FormSuccess message={success} />
            )}
            {error && <FormError message={error} />}
            <FormField
              control={passwordForm.control}
              name="oldPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={cn("text-right", fontSize)}>
                    Current Password
                  </FormLabel>

                  <FormControl>
                    <PasswordInput
                      isPending={pending}
                      tabIndex={1}
                      field={field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={passwordForm.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={cn("text-right", fontSize)}>
                    New Password
                  </FormLabel>

                  <FormControl>
                    <PasswordInput
                      disabled={!currentPasswordValid}
                      isPending={pending}
                      tabIndex={2}
                      field={field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={passwordForm.control}
              name="repeatNewPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={cn("text-right", fontSize)}>
                    Repeat New Password
                  </FormLabel>

                  <FormControl>
                    <PasswordInput
                      disabled={!newPasswordValid || !currentPasswordValid}
                      isPending={pending}
                      tabIndex={3}
                      field={field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {currentPasswordValid && (
              <PasswordChecklist
                password={newPassword ?? ""}
                checkPassword={newRepeatedPassword ?? ""}
                type="update"
              />
            )}

            <DialogFooter>
              <Button
                className="mt-3 w-full"
                variant={
                  passwordForm.formState?.isValid
                    ? "salWithShadow"
                    : "salWithShadowHidden"
                }
                type="submit"
                disabled={!passwordForm.formState?.isValid}
              >
                Update Password
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
