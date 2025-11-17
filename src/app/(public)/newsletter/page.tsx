"use client";

import {
  NewsletterFrequency,
  newsletterFrequencyOptions,
  NewsletterType,
} from "@/constants/newsletterConsts";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  newsletterStatusSchema,
  NewsletterStatusValues,
  newsletterUpdateSchema,
  NewsletterUpdateValues,
} from "@/schemas/public";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { LoaderCircle } from "lucide-react";

import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "@/components/ui/custom-link";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectSimple } from "@/components/ui/select";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { cn } from "@/helpers/utilsFns";

import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";
import { makeUseQueryWithStatus } from "convex-helpers/react";
import { useQueries } from "convex-helpers/react/cache/hooks";
import {
  useAction,
  useConvex,
  useMutation,
  usePreloadedQuery,
} from "convex/react";
import { ConvexError } from "convex/values";

const NewsletterPage = () => {
  const convex = useConvex();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const existingNewsletterSubscription = searchParams?.get("subscription")
    ? (searchParams?.get("subscription") as Id<"newsletter">)
    : undefined;
  const subUpdateRef = useRef<HTMLFormElement>(null);
  const resetTimerRef = useRef<NodeJS.Timeout | null>(null);

  const useQueryWithStatus = makeUseQueryWithStatus(useQueries);

  const { preloadedUserData, preloadedSubStatus } = useConvexPreload();
  const subData = usePreloadedQuery(preloadedSubStatus);
  const userData = usePreloadedQuery(preloadedUserData);
  const userId = userData?.userId ?? null;
  const user = userData?.user;
  const userPlan = subData?.subPlan ?? 0;
  const [pending, setPending] = useState(false);

  const [emailSubscriptionActive, setEmailSubscriptionActive] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const unsubscribe = useAction(
    api.actions.resend.sendNewsletterUpdateConfirmation,
  );
  const updateNewsletterSubscription = useMutation(
    api.newsletter.subscriber.updateNewsletterStatus,
  );
  const updateNotifications = useMutation(api.users.updateUserNotifications);

  const {
    data: userNewsletterSub,
    error: userNewsletterSubError,
    isPending: userNewsletterSubPending,
  } = useQueryWithStatus(
    api.newsletter.subscriber.getNewsletterStatus,
    userId ? { userId } : "skip",
  );

  const subSearchForm = useForm<NewsletterStatusValues>({
    resolver: zodResolver(newsletterStatusSchema),
    defaultValues: {
      email: user?.email ?? "",
    },
    mode: "onChange",
    delayError: 1000,
  });

  const {
    handleSubmit: handleSearchSubmit,
    watch: watchSearch,
    // getFieldState: getFieldStateSearch,
    formState: { isValid: isValidSearch },
  } = subSearchForm;

  const email = watchSearch("email");
  // const emailState = getFieldStateSearch("email");
  // const emailValid = !emailState?.invalid;
  // const emailDirty = emailState?.isDirty;

  const {
    data: newsletterStatusData,
    isPending: newsletterStatusPending,
    error: newsletterStatusError,
  } = useQueryWithStatus(
    api.newsletter.subscriber.getNewsletterStatus,
    existingNewsletterSubscription && !Boolean(success) && !email
      ? {
          subscriberId: existingNewsletterSubscription,
        }
      : "skip",
  );

  const subUpdateform = useForm<NewsletterUpdateValues>({
    resolver: zodResolver(newsletterUpdateSchema),
    // defaultValues: {
    //   frequency: userNewsletterSub?.frequency ?? "monthly",
    //   type: userNewsletterSub?.type ?? ["general"],
    // },
    defaultValues: async () => {
      let result = {
        frequency: "monthly" as NewsletterFrequency,
        type: ["general"] as NewsletterType[],
      };
      if (userId) {
        result = await convex.query(
          api.newsletter.subscriber.getNewsletterStatus,
          { userId },
        );
      } else if (existingNewsletterSubscription) {
        result = await convex.query(
          api.newsletter.subscriber.getNewsletterStatus,
          { subscriberId: existingNewsletterSubscription },
        );
      }
      return {
        frequency: result?.frequency ?? "monthly",
        type: result?.type ?? ["general"],
      };
    },
    mode: "onChange",
    shouldUnregister: false,
    delayError: 1000,
  });

  const {
    handleSubmit: handleUpdateSubmit,
    // watch: watchUpdate,
    // getFieldState: getFieldStateUpdate,
    formState: {
      isValid: isValidUpdate,
      isDirty: isDirtyUpdate,
      // errors: errorUpdate,
    },
  } = subUpdateform;

  // const currentFrequency = subUpdateform.getValues("frequency");
  const currentType = subUpdateform.getValues("type");

  const userNewsletterSubStatusActive = userNewsletterSub?.newsletter === true;
  const newsletterSubEmail = newsletterStatusData?.email;
  const emailDifferent = userNewsletterSub?.email !== user?.email;
  console.log(user?.email, newsletterSubEmail, emailDifferent);
  const newsletterSubStatusActive = newsletterStatusData?.newsletter === true;
  const noActiveSubscription =
    !newsletterSubStatusActive &&
    !userNewsletterSubStatusActive &&
    !emailSubscriptionActive;
  const activeSubscription =
    newsletterSubStatusActive ||
    userNewsletterSubStatusActive ||
    emailSubscriptionActive;

  const errorMessage = (() => {
    const newsletterError = newsletterStatusError instanceof ConvexError;
    const userError = userNewsletterSubError instanceof ConvexError;
    if (newsletterError || userError) {
      const data = newsletterError
        ? newsletterStatusError.data
        : userError
          ? userNewsletterSubError?.data
          : null;
      if (data?.includes("No newsletter subscription found")) {
        return "No newsletter subscription found. Subscribe to receive newsletters.";
      }
      if (data?.includes("Log in to update")) {
        return "Please log in to update your newsletter preferences.";
      }
      return "Unknown error. Please contact support.";
    }
    if (newsletterStatusError || userNewsletterSubError) {
      return "Unexpected error. Please contact support.";
    }
    return null;
  })();

  const handleUnsubscribe = async () => {
    handleResetMessages();
    setPending(true);
    try {
      const emailValue = email ?? newsletterSubEmail ?? user?.email;
      if (!emailValue) throw new Error("No email found");
      const result = await unsubscribe({
        newsletter: false,
        email: emailValue,
      });
      if (result?.canceled) {
        setSuccess("Unsubscribed from all newsletters");
        await updateNotifications({
          newsletter: false,
        });
      }
      if (emailSubscriptionActive) setEmailSubscriptionActive(false);
      subSearchForm.reset();
    } catch (err) {
      console.error("Failed to update newsletter subscription:", err);
    } finally {
      setPending(false);
      if (searchParams?.get("subscription")) {
        router.replace(pathname);
      } else {
        scheduleResetMessages();
      }
    }
  };

  const handleUpdateSubscription = async (values: NewsletterUpdateValues) => {
    handleResetMessages();
    setPending(true);
    try {
      await updateNewsletterSubscription({
        email: newsletterSubEmail ?? user?.email ?? "",
        newsletter: true,
        frequency: values.frequency ?? "monthly",
        type: values.type ?? ["general"],
        userPlan: user?.plan ?? 0,
        updateEmail: values.updateEmail ?? false,
      });
      setSuccess("Successfully updated newsletter preferences");
    } catch (err) {
      if (err instanceof ConvexError) {
        if (err.data.includes("Log in to update")) {
          setError("Please log in to update your newsletter preferences");
        } else {
          setError("An unknown error occurred. Please contact support.");
        }
      }
    } finally {
      setPending(false);
      scheduleResetMessages();
    }
  };

  const handleSearchSubscription = async (values: NewsletterStatusValues) => {
    handleResetMessages();
    setPending(true);
    try {
      const result = await convex.query(
        api.newsletter.subscriber.getNewsletterStatus,
        { email: values.email },
      );
      if (!result?.newsletter) {
        throw new ConvexError(
          "No newsletter subscription found. Please sign up to receive newsletters.",
        );
      }
      setEmailSubscriptionActive(result.newsletter);
      subUpdateform.reset({
        frequency: result.frequency ?? "monthly",
        type: result.type ?? ["general"],
      });
    } catch (err) {
      if (err instanceof ConvexError) {
        if (err.data.includes("Log in to update")) {
          setError("Please log in to update your newsletter preferences");
        } else if (err.data.includes("No newsletter subscription found")) {
          setError(
            "No newsletter subscription found. Please sign up to receive newsletters.",
          );
        } else {
          setError("An unknown error occurred. Please contact support.");
        }
      }
    } finally {
      setPending(false);
      scheduleResetMessages(10000);
    }
  };

  const handleResetMessages = () => {
    setError("");
    setSuccess("");
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
  };

  const scheduleResetMessages = (delay = 5000) => {
    // clear any existing timer before scheduling a new one
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    resetTimerRef.current = setTimeout(() => {
      handleResetMessages();
    }, delay);
  };

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="mx-auto my-12 flex h-full w-full max-w-[1300px] flex-col items-center justify-center gap-4">
      <div className="flex h-full w-full flex-col items-center gap-x-2 px-6 md:px-8">
        <section
          className={cn("mx-auto flex max-w-[90vw] flex-col gap-3 md:max-w-sm")}
        >
          <p className="w-full text-xl font-medium text-foreground">
            Update your newsletter preferences
          </p>
          <span className="text-sm text-foreground">
            {activeSubscription ? (
              userPlan > 1 ? (
                "Select your desired frequency and newsletter type(s)."
              ) : null
            ) : !user ? (
              "Login or enter your email address to update your preferences."
            ) : ((existingNewsletterSubscription && newsletterStatusPending) ||
                userNewsletterSubPending) &&
              !success ? (
              <span className="flex w-full items-center justify-center gap-1">
                Loading... <LoaderCircle className="size-4 animate-spin" />
              </span>
            ) : (
              "You don't have a newsletter subscription. Fill out the form at the bottom of the page to subscribe."
            )}
          </span>
          {!user && noActiveSubscription && (
            <Form {...subSearchForm}>
              <form
                className="mb-2 flex w-full max-w-sm flex-col gap-4"
                onSubmit={handleSearchSubmit(handleSearchSubscription)}
              >
                <>
                  <FormField
                    control={subSearchForm.control}
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

                <Button
                  variant={
                    isValidSearch ? "salWithShadow" : "salWithShadowHidden"
                  }
                  type="submit"
                  size="lg"
                  className="w-full bg-white py-6 text-base focus-visible:bg-salPinkLt sm:py-0 md:bg-salYellow"
                  disabled={pending || !isValidSearch}
                >
                  {pending ||
                  (newsletterStatusPending &&
                    existingNewsletterSubscription) ? (
                    <span className="flex items-center gap-1">
                      Checking for subscription...
                      <LoaderCircle className="size-4 animate-spin" />
                    </span>
                  ) : (
                    "Load Subscription"
                  )}
                </Button>
              </form>
            </Form>
          )}
          {success && !pending && (
            <FormSuccess
              message={success}
              className="text-success mx-auto w-full py-6 text-center"
            />
          )}
          {(errorMessage || error) && !success && !pending && (
            <FormError
              message={errorMessage || error}
              className="mx-auto text-center text-red-700"
            />
          )}
          {activeSubscription && (
            <div className={cn("flex w-full max-w-sm flex-col gap-4")}>
              {userPlan > 1 ? (
                <>
                  <Form {...subUpdateform}>
                    <form
                      ref={subUpdateRef}
                      className="flex w-full max-w-sm flex-col gap-4"
                      onSubmit={handleUpdateSubmit(handleUpdateSubscription)}
                    >
                      <FormField
                        control={subUpdateform.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem emptyError>
                            <fieldset className="mb-5 flex flex-col gap-3">
                              <legend className="mb-4 text-sm font-medium">
                                Which newsletter(s) would you like to receive?
                              </legend>

                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="newsletter-openCall"
                                  checked={field.value?.includes("openCall")}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      field.onChange([
                                        ...field.value,
                                        "openCall",
                                      ]);
                                    } else {
                                      field.onChange(
                                        field.value.filter(
                                          (t) => t !== "openCall",
                                        ),
                                      );
                                    }
                                  }}
                                />
                                <Label htmlFor="newsletter-openCall">
                                  Open Calls
                                </Label>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="newsletter-general"
                                  checked={field.value?.includes("general")}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      field.onChange([
                                        ...field.value,
                                        "general",
                                      ]);
                                    } else {
                                      field.onChange(
                                        field.value.filter(
                                          (t) => t !== "general",
                                        ),
                                      );
                                    }
                                  }}
                                />
                                <Label htmlFor="newsletter-general">
                                  General Updates
                                </Label>
                              </div>
                            </fieldset>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={subUpdateform.control}
                        name="frequency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              How often would you like to receive newsletters?
                            </FormLabel>
                            <FormControl>
                              <SelectSimple
                                disabled={!currentType?.length}
                                options={[...newsletterFrequencyOptions]}
                                value={field.value}
                                onChangeAction={field.onChange}
                                placeholder="Select frequency"
                                className="w-full bg-card placeholder:text-foreground sm:h-11"
                                itemClassName="justify-center"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {emailDifferent && (
                        <div
                          className={cn(
                            "mt-4 rounded border-1.5 border-foreground bg-card/20 p-6",
                          )}
                        >
                          <FormField
                            control={subUpdateform.control}
                            name="updateEmail"
                            render={({ field }) => (
                              <FormItem>
                                <fieldset className="mb-2 flex flex-col gap-3">
                                  <legend className="mb-4 text-sm font-medium">
                                    Your newsletter sub email is different from
                                    your account email. Would you like to update
                                    your newsletter subscription with your
                                    account email?
                                  </legend>

                                  <div className="flex items-center space-x-2">
                                    <FormControl>
                                      <Checkbox
                                        id="newsletter-update-email"
                                        checked={field.value ?? false}
                                        onCheckedChange={(checked) =>
                                          field.onChange(!!checked)
                                        }
                                      />
                                    </FormControl>
                                    <Label
                                      htmlFor="newsletter-update-email"
                                      className="text-sm font-medium text-foreground"
                                    >
                                      Yes, update my subscription to match!
                                    </Label>
                                  </div>
                                </fieldset>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}

                      <Button
                        disabled={pending || !isValidUpdate || !isDirtyUpdate}
                        variant={
                          isValidUpdate && isDirtyUpdate && !pending
                            ? "salWithShadow"
                            : "salWithShadowHidden"
                        }
                      >
                        {pending ? (
                          <LoaderCircle className="size-4 animate-spin" />
                        ) : (
                          " Update preferences"
                        )}
                      </Button>
                    </form>
                  </Form>
                  <p className="my-4 flex items-center gap-x-3 text-sm text-foreground before:h-[1px] before:flex-1 before:bg-foreground after:h-[1px] after:flex-1 after:bg-foreground">
                    or
                  </p>
                  <p className="text-sm">
                    If you&apos;re not interested in receiving any newsletters
                    anymore, you can unsubscribe below.
                  </p>
                </>
              ) : (
                <span className="mb-2 flex flex-col gap-2 text-sm italic text-foreground">
                  <p>
                    There currently aren&apos;t any additional options for free
                    newsletters.
                  </p>
                  <p>
                    Sign up for a Banana or Fatcap membership if you want more
                    (especially those related to open calls)
                  </p>

                  <Link href="/pricing">
                    <Button variant="salWithShadow" className="mt-4 w-full">
                      Choose a membership{" "}
                    </Button>
                  </Link>

                  <p className="my-4 flex items-center gap-x-3 text-sm text-foreground before:h-[1px] before:flex-1 before:bg-foreground after:h-[1px] after:flex-1 after:bg-foreground">
                    or
                  </p>
                  <p className="text-sm">
                    If you&apos;re not interested in receiving any newsletters
                    anymore, you can unsubscribe below.
                  </p>
                </span>
              )}

              <Button
                disabled={pending}
                variant="salWithShadowHiddenPink"
                onClick={() => {
                  handleUnsubscribe();
                }}
                className="group bg-salPinkLt"
              >
                {pending ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <>
                    {/* Default text */}
                    {/* <span className="block group-hover:hidden"> */}
                    Unsubscribe from all newsletters
                    {/*          </span>
                    /~ Hover text ~/
                    <span className="hidden items-center gap-x-1 group-hover:flex group-active:hidden">
                      Really?
                      <IoMdSad className="size-4 opacity-0 transition-opacity group-hover:opacity-100" />
                    </span>
                    <span className="hidden group-hover:hidden group-active:block">
                      Ok bye!
                    </span>*/}
                  </>
                )}
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default NewsletterPage;
