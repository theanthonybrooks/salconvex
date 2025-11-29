import { BaseFeedbackOptions, Feedback } from "@/constants/stripe";

import React, { useEffect, useState } from "react";
import { useManageSubscription } from "@/hooks/use-manage-subscription";
import {
  CancelSubDialogSchema,
  CancelSubDialogSchemaValues,
} from "@/schemas/subscription";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { LoaderCircle } from "lucide-react";

import { FormError } from "@/components/form-error";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
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
import { SelectSimple } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { getUserFontSizePref } from "@/helpers/stylingFns";
import { getSubscriptionStatusVals } from "@/helpers/subscriptionFns";
import { cn } from "@/helpers/utilsFns";

import { api } from "~/convex/_generated/api";
import { useAction, usePreloadedQuery } from "convex/react";

type ManageSubDialogProps = {
  dialog: {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  };
  children: React.ReactNode;
  onSubmit?: () => void;
};

export const SubDialog = ({
  dialog,
  children,
  onSubmit,
}: ManageSubDialogProps) => {
  const { preloadedSubStatus, preloadedUserData } = useConvexPreload();
  const subData = usePreloadedQuery(preloadedSubStatus);
  const userData = usePreloadedQuery(preloadedUserData);
  const userPref = userData?.userPref;
  const fontSizePref = getUserFontSizePref(userPref?.fontSize);
  const fontSize = fontSizePref?.body;
  const { subscription, hasActiveSubscription } = subData;
  const subDetails = getSubscriptionStatusVals(subscription);
  const { status, cancelDetails } = subDetails ?? {};

  const { open, setOpen } = dialog;
  const [error, setError] = useState<string>("");

  const [pending, setPending] = useState(false);

  const cancelSubscription = useAction(
    api.stripe.stripeSubscriptions.cancelSubscription,
  );
  const handleManageSubscription = useManageSubscription({ subscription });
  const form = useForm<CancelSubDialogSchemaValues>({
    resolver: zodResolver(CancelSubDialogSchema),
    defaultValues: {
      reason: "",
      comment: "",
    },
    mode: "onChange",
    delayError: 300,
  });

  const { watch, formState, reset } = form;

  const reason = watch("reason");
  const hasReason = reason.length > 0;

  const handleCancelSubscription = async (
    data: CancelSubDialogSchemaValues,
  ) => {
    setPending(true);
    setError("");

    const validFeedback = BaseFeedbackOptions.some(
      (option) => option.value === data.reason,
    );

    try {
      await cancelSubscription({
        atPeriodEnd: true,
        detail: {
          feedback: validFeedback ? data.reason : "other",
          comment: `${data.reason} ${data.comment ? `: ${data.comment}` : ""}`,
        },
      });
      toast.success("Successfully canceled your subscription!");

      reset();
      setTimeout(() => {
        setOpen(false);
        onSubmit?.();
      }, 2000);
    } catch (err) {
      console.error("Failed to cancel subscription:", err);
      toast.error("Failed to cancel subscription");
      setError("Failed to cancel subscription");
    } finally {
      setPending(false);
      setError("");
    }
  };

  useEffect(() => {
    reset();
  }, [open, reset]);

  const descText = status?.isCanceled
    ? "You don't have a membership. Please choose a plan to continue using the paid features of the site"
    : "You can update your plan or payment method and access your membership invoices at any time";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="h-dvh sm:h-auto">
        <DialogHeader>
          <DialogTitle>Manage Membership</DialogTitle>

          <DialogDescription className="sr-only">{descText}</DialogDescription>

          {error && <FormError message={error} />}
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form?.handleSubmit(handleCancelSubscription)}
            className="space-y-3"
          >
            <p
              className={cn(
                "text-sm text-foreground",
                fontSize,
                hasReason && "hidden",
              )}
            >
              {descText}
            </p>
            <Button
              className={cn("mt-3 w-full max-w-lg")}
              onClick={handleManageSubscription}
              variant="salWithShadowHidden"
              fontSize={fontSize}
            >
              {status?.isPastDue || cancelDetails?.willCancel
                ? "Resume Membership"
                : status?.isCanceled
                  ? "Choose Plan"
                  : "Update Membership"}
            </Button>
            {hasActiveSubscription && !cancelDetails?.hasCanceled && (
              <>
                <p
                  className={cn(
                    "flex items-center gap-x-3 py-8 text-sm text-foreground before:h-[1px] before:flex-1 before:bg-foreground after:h-[1px] after:flex-1 after:bg-foreground",
                    hasReason && "py-3 sm:py-5",
                  )}
                >
                  or
                </p>
                <p className={cn("text-sm text-foreground", fontSize)}>
                  You can also cancel your membership and resume it again later.
                  Canceled memberships will continue until the end of the
                  current billing cycle.
                </p>
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason</FormLabel>

                      <FormControl>
                        <SelectSimple
                          hasReset
                          options={[...BaseFeedbackOptions]}
                          value={field.value}
                          onChangeAction={(value) =>
                            field.onChange(value as Feedback)
                          }
                          placeholder="Select one"
                          className={cn(
                            "w-full min-w-15 border-1.5 bg-card text-center sm:h-11",
                          )}
                          fontSize={fontSize}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {hasReason && (
                  <FormField
                    control={form.control}
                    name="comment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Feedback</FormLabel>

                        <FormControl>
                          <Textarea
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Any feedback is greatly appreciated!"
                            className={cn(
                              "min-h-24 resize-none border-1.5 border-foreground bg-card placeholder:text-foreground/40",
                              fontSize,
                            )}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <DialogFooter className="!mt-6 flex w-full flex-row justify-end gap-3">
                  <DialogClose asChild>
                    <Button
                      className="w-fit px-6"
                      variant="salWithShadowHiddenBg"
                      onClick={() => {
                        reset();
                        setOpen(false);
                      }}
                      type="button"
                      disabled={!formState?.isValid || pending}
                    >
                      Cancel
                    </Button>
                  </DialogClose>

                  <Button
                    disabled={!formState?.isValid || reason === "-"}
                    type="submit"
                    variant={
                      formState?.isValid
                        ? "salWithShadow"
                        : "salWithShadowHidden"
                    }
                    tabIndex={7}
                    className="min-w-30 flex-1 focus:scale-95 focus:bg-salYellow/20 sm:flex-auto"
                  >
                    {pending ? (
                      <LoaderCircle className="size-5 animate-spin" />
                    ) : (
                      "Confirm"
                    )}
                  </Button>
                </DialogFooter>
              </>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

//!! TODO: The confirmation dialog should have:
//!! 1. A cancel button that closes the dialog
//!! 2. A confirm button that calls the onSubmit function
//!! 3. A tertiary button that allows them to update their subscription (thinking that perhaps this isn't a cancel-only dialog, but just the update sub dialog).
//!! 4. A select element with a dropdown of cancellation reasons (if they are canceling)
//!! 5. A textarea for them to add an optional comment
