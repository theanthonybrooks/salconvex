"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { cn } from "@/lib/utils";
import {
  NewsletterStatusValues,
  newsletterStatusSchema,
} from "@/schemas/public";
import { zodResolver } from "@hookform/resolvers/zod";
import { makeUseQueryWithStatus } from "convex-helpers/react";
import { useQueries } from "convex-helpers/react/cache/hooks";
import { useAction, usePreloadedQuery } from "convex/react";

import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { SelectSimple } from "@/components/ui/select";
import {
  NewsletterFrequency,
  newsletterFrequencyOptions,
} from "@/constants/newsletter";
import { ConvexError } from "convex/values";
import { LoaderCircle } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";

const NewsletterPage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const existingNewsletterSubscription =
    (searchParams?.get("subscription") as Id<"newsletter">) ?? undefined;
  const useQueryWithStatus = makeUseQueryWithStatus(useQueries);

  const { preloadedUserData } = useConvexPreload();
  const userData = usePreloadedQuery(preloadedUserData);
  const userId = userData?.userId ?? null;
  const user = userData?.user;
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [frequency, setFrequency] = useState<NewsletterFrequency>("monthly");
  const [success, setSuccess] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const sendEmail = useAction(
    api.actions.resend.sendNewsletterUpdateConfirmation,
  );

  const form = useForm<NewsletterStatusValues>({
    resolver: zodResolver(newsletterStatusSchema),
    defaultValues: {
      email: user?.email ?? "",
    },
    mode: "onChange",
  });

  const { handleSubmit, watch, getFieldState } = form;

  const email = watch("email");
  const emailState = getFieldState("email");
  const emailValid = !emailState?.invalid;
  const emailDirty = emailState?.isDirty;

  const {
    data: newsletterStatusData,
    isPending: newsletterStatusPending,

    // isError,
    error: newsletterStatusError,
  } = useQueryWithStatus(
    api.newsletter.subscriber.getNewsletterStatus,
    (existingNewsletterSubscription || (emailValid && emailDirty) || user) &&
      !Boolean(success)
      ? {
          email,
          userId: userId ?? undefined,
          subscriberId: existingNewsletterSubscription,
        }
      : "skip",
  );
  const newsletterSubEmail = newsletterStatusData?.email;
  const newsletterSubFrequency = newsletterStatusData?.frequency;
  const newsletterSubStatusActive = newsletterStatusData?.newsletter === true;

  // if (newsletterStatusError instanceof ConvexError) {
  //   const ErrorData = newsletterStatusError.data;
  //   if (ErrorData?.includes("No newsletter subscription found")) {
  //     setError(
  //       "No newsletter subscription found. Please sign up to receive newsletters.",
  //     );
  //   } else if (ErrorData?.includes("Log in to update")) {
  //     setError("Please log in to update your newsletter preferences.");
  //   } else {
  //     setError("Unknown error. Please contact support.");
  //   }
  // }
  const errorMessage = (() => {
    if (newsletterStatusError instanceof ConvexError) {
      const data = newsletterStatusError.data;
      if (data?.includes("No newsletter subscription found")) {
        return "No newsletter subscription found. Subscribe to receive newsletters.";
      }
      if (data?.includes("Log in to update")) {
        return "Please log in to update your newsletter preferences.";
      }
      return "Unknown error. Please contact support.";
    }
    if (newsletterStatusError) {
      return "Unexpected error. Please contact support.";
    }
    return null;
  })();

  useEffect(() => {
    if (newsletterStatusData && error) {
      setError("");
    }
  }, [newsletterStatusData, error]);

  const handleUpdateSubscription = async (
    newsletterActive: boolean = true,
    newsletterSubFrequency: NewsletterFrequency = "monthly",
    email: string,
  ) => {
    setPending(true);
    try {
      const result = await sendEmail({
        newsletter: newsletterActive,
        frequency: newsletterSubFrequency,
        email: newsletterSubEmail ?? email ?? "",
        userPlan: user?.plan ?? 0,
      });
      if (result?.canceled) {
        setSuccess("Unsubscribed from all newsletters");
      } else if (result?.frequency) {
        setSuccess("Updated newsletter preferences");
      }

      setTimeout(() => {
        setSuccess("");
      }, 4000);
    } catch (err) {
      console.error("Failed to update newsletter subscription:", err);
    } finally {
      setPending(false);
    }
  };

  useEffect(() => {
    if (newsletterSubFrequency && newsletterSubFrequency !== frequency) {
      setFrequency(newsletterSubFrequency);
    }
  }, [newsletterSubFrequency, frequency]);

  return (
    <div className="mx-auto my-12 flex h-full w-full max-w-[1300px] flex-col items-center justify-center gap-4">
      <div className="flex h-full w-full flex-col items-center gap-x-2 px-6 md:px-8">
        <section
          className={cn(
            "mx-auto flex max-w-[90vw] flex-col items-center gap-3 md:max-w-sm",
          )}
        >
          <p className="w-full text-xl font-medium text-foreground">
            Update your newsletter preferences
          </p>
          <span className="text-foreground">
            {newsletterStatusPending && !success ? (
              <span className="flex items-center gap-1">
                Loading... <LoaderCircle className="size-4 animate-spin" />
              </span>
            ) : newsletterSubStatusActive ? (
              "Select your desired frequency or click unsubscribe to stop receiving emails."
            ) : !user ? (
              "Login or enter your email address to update your preferences."
            ) : (
              "You don't have a newsletter subscription. Fill out the form at the bottom of the page to subscribe."
            )}
          </span>
          {!newsletterSubStatusActive && !existingNewsletterSubscription && (
            <Form {...form}>
              <form
                ref={formRef}
                className="mt-4 flex w-full max-w-sm flex-col gap-4"
                onSubmit={handleSubmit(() => {})}
              >
                {!userId && (
                  <>
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>

                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              placeholder="ex. email@mail.com"
                              className={cn("w-full border-foreground bg-card")}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </form>
            </Form>
          )}

          {newsletterSubStatusActive && (
            <div className="mt-4 flex w-full max-w-sm flex-col gap-4">
              <Label htmlFor="frequency">
                How often would you like to receive newsletters?
              </Label>
              <SelectSimple
                options={[...newsletterFrequencyOptions]}
                value={frequency}
                onChangeAction={(value) => {
                  handleUpdateSubscription(
                    true,
                    value as NewsletterFrequency,
                    newsletterSubEmail ?? "",
                  );
                  setFrequency(value as NewsletterFrequency);
                }}
                placeholder="Select a category"
                className="w-full bg-card placeholder:text-foreground sm:h-11"
                itemClassName="justify-center"
              />
              <p className="flex items-center gap-x-3 text-sm text-foreground before:h-[1px] before:flex-1 before:bg-foreground after:h-[1px] after:flex-1 after:bg-foreground">
                or
              </p>
              <Button
                disabled={pending}
                variant="salWithShadowHidden"
                onClick={() => {
                  handleUpdateSubscription(
                    false,
                    frequency,
                    newsletterSubEmail ?? "",
                  );
                  setTimeout(() => {
                    router.replace(pathname);
                  }, 3500);
                }}
              >
                {pending ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  " Unsubscribe from all newsletters"
                )}
              </Button>
            </div>
          )}
          {success && (
            <FormSuccess
              message={success}
              className="text-success mx-auto mb-14 w-full py-6 text-center"
            />
          )}
          {errorMessage && !success && (
            <FormError
              message={error}
              className="mx-auto mb-14 text-center text-red-700"
            />
          )}
        </section>
      </div>
    </div>
  );
};

export default NewsletterPage;
