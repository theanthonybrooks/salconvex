"use client";

import type { EventRegistrationValues } from "@/schemas/public";
import type { Preloaded } from "convex/react";

import { useRouter } from "next/navigation";
import { EventRegistrationSchema } from "@/schemas/public";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { CalendarClockIcon } from "lucide-react";

import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { Button } from "@/components/ui/button";
import { DebouncedControllerInput } from "@/components/ui/debounced-form-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import FullPageLoading from "@/components/ui/loading-screen";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/state-accordion-test";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { generateGeneralICSFile } from "@/helpers/addToCalendar";
import { autoHttps } from "@/helpers/linkFns";
import { RichTextDisplay } from "@/helpers/richTextFns";
import { getUserFontSizePref } from "@/helpers/stylingFns";
import { cn } from "@/helpers/utilsFns";

import { api } from "~/convex/_generated/api";
import { makeUseQueryWithStatus } from "convex-helpers/react";
import { useQueries } from "convex-helpers/react/cache";
import {
  useAction,
  useConvex,
  useMutation,
  usePreloadedQuery,
} from "convex/react";
import { ConvexError } from "convex/values";

type CheckoutPageProps = {
  preloaded: Preloaded<typeof api.userAddOns.onlineEvents.getOnlineEvent>;
};

export const CheckoutPage = ({ preloaded }: CheckoutPageProps) => {
  const convex = useConvex();
  const router = useRouter();
  const event = usePreloadedQuery(preloaded);

  const useQueryWithStatus = makeUseQueryWithStatus(useQueries);
  const { preloadedUserData, preloadedSubStatus } = useConvexPreload();
  const userData = usePreloadedQuery(preloadedUserData);
  const { user, userPref } = userData ?? {};
  const fontSizePref = getUserFontSizePref(userPref?.fontSize ?? "large");
  const fontSize = fontSizePref?.body;

  const isAdmin = user?.role?.includes("admin");
  const subStatus = usePreloadedQuery(preloadedSubStatus);
  const { hasActiveSubscription, subPlan } = subStatus ?? {};
  const premiumPlan =
    hasActiveSubscription && subPlan && subPlan >= 2 && !isAdmin;
  const getCheckoutUrl = useAction(
    api.stripe.stripeAddOns.createStripeAddOnCheckoutSession,
  );
  const eventPrice = event?.price ?? 0;
  const paidEvent = eventPrice > 0;

  const form = useForm<EventRegistrationValues>({
    resolver: zodResolver(EventRegistrationSchema),
    defaultValues: {
      email: user?.email ?? "",
      name: user?.name ?? "",
    },
    mode: "onChange",
    delayError: 1000,
  });

  const {
    handleSubmit,
    watch,
    formState: { isValid },
  } = form;

  const email = watch("email");

  const { data: userIsRegistered, isPending } = useQueryWithStatus(
    api.userAddOns.onlineEvents.checkRegistration,
    user?._id && event?._id ? { eventId: event._id, email } : "skip",
  );

  const { paid, canceled } = userIsRegistered ?? {};

  const registerForEvent = useMutation(
    api.userAddOns.onlineEvents.registerForOnlineEvent,
  );

  const updateRegistration = useMutation(
    api.userAddOns.onlineEvents.updateRegistration,
  );

  if ((isPending && user) || !event) return <FullPageLoading />;
  const {
    capacity,
    name,
    description,
    slug,
    requirements,
    terms,
    regDeadline,
  } = event;
  const remainingCapacity = capacity.max - capacity.current;
  console.log(remainingCapacity);
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  const isoStartDate = startDate.toISOString();
  const isoEndDate = endDate.toISOString();
  const datePart = startDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timePart = startDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  const endDatePart = endDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const endTimePart = endDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  const endDateOutput =
    endDatePart === datePart ? endTimePart : `${endDatePart} @ ${endTimePart}`;
  const dateOutput = `${datePart} @ ${timePart} - ${endDateOutput}`;
  const deadline = new Date(regDeadline);
  const deadlineDate = deadline.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const deadlineTime = deadline.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  const deadlineOutput =
    deadlineDate === datePart
      ? deadlineTime
      : `${deadlineDate} @ ${deadlineTime}`;

  const handleCheckout = async (values: EventRegistrationValues) => {
    const registrationName = user?.name ?? values.name;
    const registrationEmail = user?.email ?? values.email;

    let url: string | undefined;
    let signedOutPremium = false;

    try {
      if (!user) {
        const result = await convex.query(
          api.subscriptions.checkSubscriptionWithEmail,
          {
            email: registrationEmail,
          },
        );
        if (
          result?.hasActiveSubscription &&
          result?.subPlan &&
          result.subPlan >= 2
        ) {
          signedOutPremium = true;
        }
      }
      if (!registrationName || !registrationEmail) {
        throw new Error("Name or email not provided");
      }

      await registerForEvent({
        eventId: event._id,
        name: registrationName,
        email: registrationEmail,
        link: values.link,
      });
      if (premiumPlan || !paidEvent || signedOutPremium) {
        toast.dismiss();
        toast.success("Successfully registered!", {
          onClick: () => toast.dismiss(),
        });
      } else {
        const result = await getCheckoutUrl({
          name: registrationName,
          email: registrationEmail,
          eventId: event._id,
          price: event.price ?? 0,
        });
        url = result.url;
        if (url) {
          window.location.href = url;
        }
      }

      form.reset();
    } catch (error) {
      toast.dismiss();
      if (error instanceof ConvexError) {
        const data = error.data as { message: string; contactUrl: string };

        toast.error(data.message);
      } else {
        console.error("Failed to submit form:", error);
        toast.error("Failed to submit form");
      }
    }
  };

  const handleUpdateRegistration = async (action: "cancel" | "renew") => {
    try {
      if (!user) return;
      const result = await updateRegistration({
        email: user?.email ?? "",
        eventId: event._id,
        action,
      });

      if (result?.error) {
        toast.dismiss();
        toast.error(result.error);
        return;
      }
      if (action === "cancel") {
        toast.dismiss();
        toast.success("Successfully cancelled registration!");
      } else {
        toast.dismiss();
        toast.success("Successfully renewed registration!");
      }
    } catch (error) {
      toast.dismiss();
      if (error instanceof ConvexError) {
        const data = error.data as { message: string };

        toast.error(data.message);
      } else {
        console.error("Failed to update registration:", error);
        toast.error("Failed to update registration");
      }
    }
  };

  const calendarLink = generateGeneralICSFile(
    name,
    isoStartDate,
    isoEndDate,
    description,
    slug,
  );

  return (
    <div className="mx-auto flex h-full w-full flex-col justify-center sm:max-w-[90vw]">
      <section className="mb-10 flex flex-col items-center gap-10">
        <h1 className="text-center font-tanker text-4xl lowercase tracking-wide md:text-[4rem]">
          {name}
        </h1>
        <h2 className="text-lg font-semibold">{`${datePart} @ ${timePart}`}</h2>
        <p className="text-balance text-center font-medium">
          <strong>Price:</strong> ${eventPrice} or free for users with Banana or
          Fatcap memberships
        </p>
      </section>
      <div className={cn("grid gap-5 px-8 pb-10 sm:grid-cols-[60%_50px_auto]")}>
        <Accordion type="multiple" defaultValue={["about"]}>
          <AccordionItem value="about">
            <AccordionTrigger title="Details:" fontSize={fontSize} />
            <AccordionContent className="pb-3" fontSize={fontSize}>
              <RichTextDisplay
                html={description}
                className="my-4 max-w-xl"
                fontSize={fontSize}
              />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="requirements">
            <AccordionTrigger title="Requirements:" fontSize={fontSize} />
            <AccordionContent fontSize={fontSize} className={cn("space-y-2")}>
              <p className={cn("text-lg font-semibold")}>
                Here&apos;s what you need to take part:
              </p>
              <ol className="list-inside list-decimal space-y-1">
                {requirements?.map((req, i) => (
                  <li key={i + 1} className={cn("")}>
                    {req}
                  </li>
                ))}
              </ol>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="deadline">
            <AccordionTrigger title="Deadline & Terms:" fontSize={fontSize} />
            <AccordionContent fontSize={fontSize} className={cn("space-y-2")}>
              <strong>Registration Deadline:</strong> {deadlineOutput}
              <br />
              <strong>Terms:</strong>
              <ol className={cn("list-inside list-decimal space-y-1 pl-4")}>
                {terms?.map((term, i) => (
                  <li key={i + 1} className={cn("")}>
                    {term}
                  </li>
                ))}
              </ol>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="whereAndWhen">
            <AccordionTrigger title="Where & When:" fontSize={fontSize} />
            <AccordionContent fontSize={fontSize} className={cn("space-y-2")}>
              <strong>Location:</strong> The event will take place online via
              Google Meets.
              <br />
              <strong>When:</strong> {dateOutput}
              <br />
              <p className="text-sm italic">
                All times are displayed in your local timezone.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        {/* <section className="mx-auto mb-6">
        
        </section> */}
        <Separator
          thickness={2}
          orientation="vertical"
          className="mx-auto hidden sm:block"
        />
        <section className="mb-20 mt-10 flex flex-col items-center gap-2">
          {/* <p>Free for Premium Plan: {premiumPlan ? "Yes" : "No"}</p> */}
          {!user && (
            <>
              {" "}
              <Button
                variant="salWithShadowHidden"
                size="lg"
                className="w-fit"
                onClick={() => {
                  localStorage.setItem("login_redirect", `/add-ons/${slug}`);
                  router.push("/auth/sign-in");
                }}
                fontSize={fontSize}
              >
                Sign in to register
              </Button>
              <p className="flex items-center gap-x-3 text-foreground before:h-[1px] before:flex-1 before:bg-foreground after:h-[1px] after:flex-1 after:bg-foreground">
                or
              </p>
              <p>Register as a guest using the form below</p>
            </>
          )}

          {canceled && paid ? (
            <>
              <FormError
                message={
                  <p className={cn("inline")}>
                    You&apos;ve cancelled your registration!{" "}
                  </p>
                }
                className={cn("mb-4")}
              />
              <p className="mb-2">
                Had a change of schedule? Renew your registration.
              </p>
              <Button
                variant="salWithShadowHiddenPink"
                size="lg"
                className="mt-2 w-max text-base sm:text-base"
                onClick={() => handleUpdateRegistration("renew")}
                fontSize={fontSize}
              >
                Renew Registration
              </Button>
            </>
          ) : paid ? (
            <>
              <FormSuccess
                message={
                  <p className={cn("inline")}>
                    You&apos;re registered!{" "}
                    <a
                      href={calendarLink}
                      download={`${name.replace(/\s+/g, "_")}.ics`}
                      className="inline-flex items-center gap-1"
                    >
                      Add it to your calendar!{" "}
                      <CalendarClockIcon className="size-7 md:size-4" />
                    </a>
                  </p>
                }
                className={cn("mb-4")}
              />
              <p className="mb-2">
                Can&apos;t attend? You can cancel your registration below.
              </p>
              <Button
                variant="salWithShadowHiddenPink"
                size="lg"
                className="mt-2 w-max text-base sm:text-base"
                onClick={() => handleUpdateRegistration("cancel")}
                fontSize={fontSize}
              >
                Cancel Registration
              </Button>
            </>
          ) : (
            <Form {...form}>
              <form
                onSubmit={handleSubmit(handleCheckout)}
                className="mb-2 flex w-full max-w-xl flex-col gap-4"
              >
                {!user && (
                  <>
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="ex. Bob Bobson"
                              className="w-full border-foreground bg-card text-base focus:outline-none focus:ring-1 focus:ring-ring focus:ring-offset-1 focus:ring-offset-ring"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="ex. email@example.com"
                              className="w-full border-foreground bg-card text-base focus:outline-none focus:ring-1 focus:ring-ring focus:ring-offset-1 focus:ring-offset-ring"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
                <FormField
                  control={form.control}
                  name="link"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Portfolio Link</FormLabel>
                      <FormControl>
                        <DebouncedControllerInput
                          transform={autoHttps}
                          field={field}
                          placeholder="ex. example.com"
                          className="w-full border-foreground bg-card text-base focus:outline-none focus:ring-1 focus:ring-ring focus:ring-offset-1 focus:ring-offset-ring"
                          debounceMs={50}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  variant="salWithShadowHidden"
                  size="lg"
                  className="w-full"
                  disabled={!isValid}
                  fontSize={fontSize}
                >
                  Register
                </Button>
              </form>
            </Form>
          )}
        </section>
      </div>
    </div>
  );
};
