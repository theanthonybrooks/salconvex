"use client";

import { newsletterFrequencyOptions } from "@/constants/newsletterConsts";

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

import { IoAlert } from "react-icons/io5";
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
import { getUserFontSizePref } from "@/helpers/stylingFns";
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
  const useQueryWithStatus = makeUseQueryWithStatus(useQueries);
  const { preloadedUserData, preloadedSubStatus } = useConvexPreload();

  // Convex Actions & Mutations
  const unsubscribe = useAction(
    api.actions.newsletter.sendNewsletterUpdateConfirmation,
  );
  const updateNewsletterSubscription = useMutation(
    api.newsletter.subscriber.updateNewsletterStatus,
  );
  const requestVerificationEmail = useMutation(
    api.newsletter.subscriber.requestVerificationEmail,
  );
  const updateNotifications = useMutation(api.users.updateUserNotifications);

  const subUpdateRef = useRef<HTMLFormElement>(null);
  //!! Todo: Do I actually need this?
  const resetTimerRef = useRef<NodeJS.Timeout | null>(null);

  const subscriberId = searchParams?.get(
    "subscription",
  ) as Id<"newsletter"> | null;
  const subData = usePreloadedQuery(preloadedSubStatus);
  const userData = usePreloadedQuery(preloadedUserData);

  const { userId, user, userPref } = userData ?? {};
  const { subPlan } = subData ?? {};
  const userPlan = subPlan ?? 0;
  const fontSizePref = getUserFontSizePref(userPref?.fontSize);
  const fontSize = fontSizePref?.body;

  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [formEmail, setFormEmail] = useState("");

  const { data: newsletterSub, isPending: newsletterSubPending } =
    useQueryWithStatus(
      api.newsletter.subscriber.getNewsletterStatus,
      userId
        ? { userId }
        : subscriberId
          ? { subscriberId }
          : formEmail
            ? { email: formEmail }
            : "skip",
    );

  const {
    subId,
    newsletter: subStatus,
    email: subEmail,
    frequency,
    type,
    verified,
  } = newsletterSub ?? {};

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
    // getFieldState: getFieldStateSearch,
    formState: { isValid: isValidSearch },
  } = subSearchForm;

  // const email = watchSearch("email");

  const subUpdateform = useForm<NewsletterUpdateValues>({
    resolver: zodResolver(newsletterUpdateSchema),
    // defaultValues: {
    //   frequency: newsletterSub?.frequency ?? "monthly",
    //   type: newsletterSub?.type ?? ["general"],
    // },
    defaultValues: async () => {
      return {
        frequency: frequency ?? "monthly",
        type: type ?? ["general"],
      };
    },
    mode: "onChange",
    shouldUnregister: false,
    delayError: 1000,
  });

  const {
    handleSubmit: handleUpdateSubmit,
    watch: watchUpdate,
    // getFieldState: getFieldStateUpdate,
    formState: {
      isValid: isValidUpdate,
      isDirty: isDirtyUpdate,
      // errors: errorUpdate,
    },
  } = subUpdateform;

  const currentType = watchUpdate("type");

  const subStatusActive = subStatus === "active";
  const subStatusPending = subStatus === "pending";

  const emailDifferent = subEmail !== user?.email;
  const noActiveSubscription = !subStatusActive;
  const activeSubscription = subStatusActive && verified !== false;

  // const errorMessage = (() => {
  //   const userError = newsletterSubError instanceof ConvexError;
  //   if (userError) {
  //     const data = userError ? newsletterSubError?.data : null;
  //     if (data?.includes("No newsletter subscription found")) {
  //       return "No newsletter subscription found. Subscribe to receive newsletters.";
  //     }
  //     if (data?.includes("Log in to update")) {
  //       return "Please log in to update your newsletter preferences.";
  //     }
  //     return "Unknown error. Please contact support.";
  //   }
  //   if (newsletterSubError) {
  //     return "Unexpected error. Please contact support.";
  //   }
  //   return null;
  // })();

  const handleUnsubscribe = async () => {
    handleResetMessages();
    setPending(true);
    try {
      const emailValue = subEmail ?? user?.email;
      if (!emailValue) throw new Error("No email found");
      const result = await unsubscribe({
        newsletter: "inactive",
        email: emailValue,
      });
      if (result?.canceled) {
        setSuccess("Unsubscribed from all newsletters");
        await updateNotifications({
          newsletter: false,
        });
      }

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
        email: subEmail ?? user?.email ?? "",
        newsletter: "active",
        frequency: values.frequency ?? "monthly",
        type: values.type ?? ["general"],
        userPlan,
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
      const {
        newsletter: resultStatus,
        frequency: resultFreq,
        type: resultType,
      } = result ?? {};
      if (!resultStatus) {
        console.log("meow, I'm false");
        throw new Error(
          "No newsletter subscription found. Please sign up to receive newsletters.",
        );
      }
      setFormEmail(values.email);
      subUpdateform.reset({
        frequency: resultFreq ?? "monthly",
        type: resultType ?? ["general"],
      });
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes("Log in to update")) {
          setError("Please log in to update your newsletter preferences");
        } else if (err.message.includes("No newsletter subscription found")) {
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

  const handleRequestVerificationEmail = async () => {
    if (!subId) return;
    try {
      setPending(true);
      const result = await requestVerificationEmail({
        subId,
      });
      if (result.success) {
        setSuccess("Verification email sent!");
      } else {
        setError("An unknown error occurred. Please contact support.");
      }
    } catch (error) {
      console.error("Failed to request verification email:", error);
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
        {subStatusPending && !verified && (
          <div
            className={cn(
              "mb-10 flex items-center gap-2 rounded-lg border-1.5 p-6",
            )}
          >
            <IoAlert className="size-10 shrink-0" />
            <p>
              Please{" "}
              <span
                className="cursor-pointer font-bold underline decoration-2 underline-offset-2 hover:underline-offset-1 active:underline-offset-0"
                onClick={handleRequestVerificationEmail}
              >
                verify your email address
              </span>
              <br />
              to receive the newsletter.
            </p>
          </div>
        )}
        {!subStatusPending && (
          <section
            className={cn(
              "mx-auto flex max-w-[90vw] flex-col gap-3 md:max-w-md",
            )}
          >
            <p className="w-full text-xl font-medium text-foreground">
              {user
                ? "Update your newsletter preferences"
                : "Manage your newsletter subscription"}
            </p>
            <span className="text-sm text-foreground">
              {activeSubscription ? (
                userPlan > 1 ? (
                  "Select your desired frequency and newsletter type(s)."
                ) : null
              ) : !user ? (
                "Sign in or enter your email in the field below"
              ) : (subscriberId || newsletterSubPending) && !success ? (
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
                    fontSize={fontSize}
                  >
                    {pending || subscriberId ? (
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
            {error && !success && !pending && (
              <FormError
                message={error}
                className="mx-auto text-center text-red-700"
              />
            )}
            {subStatusActive && (
              <div className={cn("flex w-full max-w-sm flex-col gap-4")}>
                {verified !== false && (
                  <>
                    {userId ? (
                      <>
                        {userPlan > 1 ? (
                          <Form {...subUpdateform}>
                            <form
                              ref={subUpdateRef}
                              className="flex w-full max-w-sm flex-col gap-4"
                              onSubmit={handleUpdateSubmit(
                                handleUpdateSubscription,
                              )}
                            >
                              <FormField
                                control={subUpdateform.control}
                                name="type"
                                render={({ field }) => (
                                  <FormItem emptyError>
                                    <fieldset className="mb-5 flex flex-col gap-3">
                                      <legend className="mb-4 text-sm font-medium">
                                        Which newsletter(s) would you like to
                                        receive?
                                      </legend>

                                      <div className="flex items-center space-x-2">
                                        <Checkbox
                                          id="newsletter-openCall"
                                          checked={field.value?.includes(
                                            "openCall",
                                          )}
                                          onCheckedChange={(checked) => {
                                            const current = field.value ?? [];
                                            if (checked) {
                                              field.onChange([
                                                ...current,
                                                "openCall",
                                              ]);
                                            } else {
                                              field.onChange(
                                                current.filter(
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
                                          checked={field.value?.includes(
                                            "general",
                                          )}
                                          onCheckedChange={(checked) => {
                                            const current = field.value ?? [];
                                            if (checked) {
                                              field.onChange([
                                                ...current,
                                                "general",
                                              ]);
                                            } else {
                                              field.onChange(
                                                current.filter(
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

                              {currentType &&
                                currentType.includes("openCall") && (
                                  <FormField
                                    control={subUpdateform.control}
                                    name="frequency"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>
                                          How often would you like to receive
                                          newsletters?
                                        </FormLabel>
                                        <FormControl>
                                          <SelectSimple
                                            disabled={!currentType?.length}
                                            options={[
                                              ...newsletterFrequencyOptions,
                                            ]}
                                            value={field.value ?? ""}
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
                                )}
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
                                            Your newsletter sub email is
                                            different from your account email.
                                            Would you like to update your
                                            newsletter subscription with your
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
                                              Yes, update my subscription to
                                              match!
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
                                disabled={
                                  pending || !isValidUpdate || !isDirtyUpdate
                                }
                                variant={
                                  isValidUpdate && isDirtyUpdate && !pending
                                    ? "salWithShadow"
                                    : "salWithShadowHidden"
                                }
                                fontSize={fontSize}
                              >
                                {pending ? (
                                  <LoaderCircle className="size-4 animate-spin" />
                                ) : (
                                  " Update preferences"
                                )}
                              </Button>
                            </form>
                          </Form>
                        ) : (
                          <span className="mb-2 flex flex-col gap-2 text-sm italic text-foreground">
                            <p>
                              There currently aren&apos;t any additional options
                              for free newsletters.
                            </p>
                            <p>
                              Sign up for a Banana or Fatcap membership if you
                              want more (especially those related to open calls)
                            </p>

                            <Link href="/pricing">
                              <Button
                                variant="salWithShadow"
                                className="mt-4 w-full"
                                fontSize={fontSize}
                              >
                                Choose a membership{" "}
                              </Button>
                            </Link>
                          </span>
                        )}
                      </>
                    ) : (
                      <p className={fontSize}>
                        You can change your full preferences by signing in.
                      </p>
                    )}
                  </>
                )}

                <p className="my-4 flex items-center gap-x-3 text-sm text-foreground before:h-[1px] before:flex-1 before:bg-foreground after:h-[1px] after:flex-1 after:bg-foreground">
                  or
                </p>
                <p className={fontSize}>
                  If you&apos;d like to take a break from receiving newsletters,
                  you can unsubscribe below.
                </p>

                <Button
                  disabled={pending}
                  variant="salWithShadowHiddenPink"
                  onClick={() => {
                    handleUnsubscribe();
                  }}
                  className="group bg-salPinkLt"
                  fontSize={fontSize}
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
        )}
      </div>
    </div>
  );
};

export default NewsletterPage;
