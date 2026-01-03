import type { EmailChangeValues } from "@/schemas/auth";
import type { ReactNode } from "react";

import { useState } from "react";
import { getChangeEmailSchema } from "@/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useForm } from "react-hook-form";

import { LoaderCircle } from "lucide-react";

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
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { getUserFontSizePref } from "@/helpers/stylingFns";
import { cn } from "@/helpers/utilsFns";

import { api } from "~/convex/_generated/api";
import { useAction, useMutation, usePreloadedQuery } from "convex/react";
import { ConvexError } from "convex/values";

type ChangeEmailDialogProps = {
  className?: string;
};

export const ChangeEmailDialog = ({ className }: ChangeEmailDialogProps) => {
  const deletePendingEmail = useMutation(api.users.deletePendingEmail);
  const setPendingEmail = useAction(
    api.actions.resend.sendEmailVerificationCode,
  );
  const verifyEmail = useMutation(api.users.verifyEmail);
  const { preloadedUserData } = useConvexPreload();
  const userData = usePreloadedQuery(preloadedUserData);
  const { user, userPref, userId } = userData ?? {};
  const currentEmail = user?.email ?? "";
  const fontSizePref = getUserFontSizePref(userPref?.fontSize);
  const fontSize = fontSizePref?.body;

  const [step, setStep] = useState<1 | 2>(1);

  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string | ReactNode>("");
  const [pending, setPending] = useState(false);

  const finalSuccess = success === "Email successfully updated!";

  const form = useForm<EmailChangeValues>({
    resolver: zodResolver(getChangeEmailSchema(step)),
    defaultValues: {
      email: "",
      code: "",
    },
    mode: "onChange",
    delayError: 300,
  });

  const { reset, control } = form;

  // const newRepeatedPassword = watch("repeatNewPassword");
  // const currentPasswordState = getFieldState("oldPassword");
  // const newPasswordState = getFieldState("newPassword");
  // const currentPasswordValid =
  //   !currentPasswordState?.invalid && currentPasswordState?.isDirty;
  // const newPasswordValid =
  //   !newPasswordState?.invalid && newPasswordState?.isDirty;

  const handlePendingEmailSubmit = async (data: EmailChangeValues) => {
    setPending(true);
    setError("");

    if (!userId || !user) {
      throw new Error("No user found");
    }
    try {
      const result = await setPendingEmail({
        email: data.email,
      });
      if (result.success) {
        setSuccess(
          <p>
            Check your email for a verification code!
            <br />
            (It may be in your junk mail folder)
          </p>,
        );
        setError("");
        setStep(2);
        setPending(false);
      } else {
        throw new Error(result.message);
      }
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
  const handleVerifyEmail = async (data: EmailChangeValues) => {
    let clear = false;
    setPending(true);
    setSuccess("");
    setError("");

    if (!userId || !user) {
      throw new Error("No user found");
    }
    if (!data.code) {
      throw new Error("No code found");
    }
    try {
      const result = await verifyEmail({
        code: data.code,
      });
      if (result.success) {
        setPending(false);
        setSuccess("Email successfully updated!");
        setTimeout(() => {
          setOpen(false);
        }, 2000);
      } else {
        clear = result.clear;
        throw new Error(result.message);
      }
    } catch (err: unknown) {
      if (err instanceof ConvexError) {
        setError(err.data || "An unexpected error occurred.");
      } else if (err instanceof Error) {
        setError(err.message || "An unexpected error occurred.");
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      if (clear) handleBackStep();
      setPending(false);
    }
  };
  const handleBackStep = async () => {
    if (step === 1) return;
    setStep(1);
    setSuccess("");
    setError("");
    await deletePendingEmail();
  };
  return (
    <Dialog
      onOpenChange={async () => {
        if (!finalSuccess && step === 2) await handleBackStep();
        reset();
        setOpen((prev) => !prev);
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
      <DialogContent className={cn("sm:max-w-[420px]", className)}>
        <DialogHeader>
          <DialogTitle>Change your email</DialogTitle>
          <DialogDescription className="sr-only">
            New password must be at least 8 characters long and must include at
            least one number, one uppercase letter, and one lowercase letter.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form?.handleSubmit(
              step === 1 ? handlePendingEmailSubmit : handleVerifyEmail,
            )}
            className="space-y-2"
          >
            {error && <FormError message={error} />}
            {step === 1 && (
              <>
                <p className={cn("text-sm font-medium")}>Current Email: </p>
                <p className={cn("text-sm")}>{currentEmail}</p>
                <FormField
                  control={control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={cn("text-right", fontSize)}>
                        New Email
                      </FormLabel>

                      <FormControl>
                        <Input
                          disabled={pending}
                          placeholder="ex. email@example.com"
                          {...field}
                          type="email"
                          variant="basic"
                          tabIndex={1}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            {step === 2 && (
              <>
                {success && !error && <FormSuccess message={success} />}
                <FormField
                  control={control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={cn("text-right", fontSize)}>
                        Verification Code
                      </FormLabel>

                      <FormControl>
                        <InputOTP
                          value={field.value}
                          onChange={field.onChange}
                          disabled={pending}
                          tabIndex={2}
                          maxLength={6}
                          pattern={REGEXP_ONLY_DIGITS}
                        >
                          <InputOTPGroup>
                            <InputOTPSlot
                              index={0}
                              className="dark:bg-tab-a10 bg-white"
                              border="2"
                            />
                            <InputOTPSlot
                              index={1}
                              className="dark:bg-tab-a10 bg-white"
                              border="2"
                            />
                            <InputOTPSlot
                              index={2}
                              className="dark:bg-tab-a10 bg-white"
                              border="2"
                            />
                            <InputOTPSlot
                              index={3}
                              className="dark:bg-tab-a10 bg-white"
                              border="2"
                            />
                            <InputOTPSlot
                              index={4}
                              className="dark:bg-tab-a10 bg-white"
                              border="2"
                            />
                            <InputOTPSlot
                              index={5}
                              className="dark:bg-tab-a10 bg-white"
                              border="2"
                            />
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <DialogFooter>
              {step === 2 && (
                <Button
                  className="mt-3 w-full"
                  variant="salWithShadowHiddenPink"
                  type="button"
                  onClick={handleBackStep}
                >
                  Back
                </Button>
              )}
              <Button
                className="mt-3 w-full"
                variant={
                  form.formState?.isValid
                    ? "salWithShadow"
                    : "salWithShadowHidden"
                }
                type="submit"
                disabled={!form.formState?.isValid || finalSuccess}
              >
                {pending ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : step === 1 ? (
                  "Send Verification Code"
                ) : finalSuccess ? (
                  "Success!"
                ) : (
                  "Update Email"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
