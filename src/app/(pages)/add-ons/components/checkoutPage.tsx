"use client";

import type { EventRegistrationValues } from "@/schemas/public";

import { useRouter } from "next/navigation";
import { EventRegistrationSchema } from "@/schemas/public";
import { getExternalRedirectHtml } from "@/utils/loading-page-html";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { CalendarClockIcon } from "lucide-react";

import type { Doc } from "~/convex/_generated/dataModel";
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
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { generateGeneralICSFile } from "@/helpers/addToCalendar";
import { autoHttps } from "@/helpers/linkFns";
import { RichTextDisplay } from "@/helpers/richTextFns";
import { cn } from "@/helpers/utilsFns";

import { api } from "~/convex/_generated/api";
import { makeUseQueryWithStatus } from "convex-helpers/react";
import { useQueries } from "convex-helpers/react/cache";
import { useAction, useMutation, usePreloadedQuery } from "convex/react";

type CheckoutPageProps = {
  event: Doc<"onlineEvents">;
};

export const CheckoutPage = ({ event }: CheckoutPageProps) => {
  const router = useRouter();
  const useQueryWithStatus = makeUseQueryWithStatus(useQueries);
  const { preloadedUserData, preloadedSubStatus } = useConvexPreload();
  const userData = usePreloadedQuery(preloadedUserData);
  const { user } = userData ?? {};
  //   const fontSizePref = getUserFontSizePref(userPref?.fontSize);

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
    user?._id ? { eventId: event._id, email } : "skip",
  );

  const { paid, canceled } = userIsRegistered ?? {};

  const registerForEvent = useMutation(
    api.userAddOns.onlineEvents.registerForOnlineEvent,
  );

  const cancelRegistration = useMutation(
    api.userAddOns.onlineEvents.cancelRegistration,
  );

  const renewRegistration = useMutation(
    api.userAddOns.onlineEvents.renewRegistration,
  );

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
  const handleCheckout = async (values: EventRegistrationValues) => {
    const registrationName = user?.name ?? values.name;
    const registrationEmail = user?.email ?? values.email;

    let url: string | undefined;
    let newTab: Window | null = null;

    try {
      if (!registrationName || !registrationEmail) {
        throw new Error("Name or email not provided");
      }
      if (paidEvent && !premiumPlan) {
        newTab = window.open("about:blank");
      }
      await registerForEvent({
        eventId: event._id,
        name: registrationName,
        email: registrationEmail,
        link: values.link,
      });
      if (premiumPlan || !paidEvent) {
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

        if (!newTab) {
          toast.error(
            "Stripe redirect blocked. Please enable popups for this site.",
          );
          console.error("Popup was blocked");
          return;
        }
        if (url) {
          newTab.document.write(getExternalRedirectHtml(url, 1));
          newTab.document.close();
          newTab.location.href = url;
          // onClick();
          // onClick()
        }
      }
      //   setTimeout(() => {
      //     // setOpen(false);
      //     window.location.href = `/thelist/event/${submissionUrl}`;
      //   }, 1000);
      form.reset();
    } catch (error) {
      console.error("Failed to submit form:", error);
      toast.error("Failed to submit form");
      if (!newTab?.closed) {
        newTab?.document.close();
      }
    }
  };

  const handleCancel = async () => {
    try {
      if (!user) return;
      await cancelRegistration({
        email: user?.email ?? "",
        eventId: event._id,
      });
      toast.success("Successfully cancelled registration!");
    } catch (error) {
      console.error("Failed to cancel registration:", error);
      toast.error("Failed to cancel registration");
    }
  };

  const handleRenew = async () => {
    try {
      if (!user) return;
      await renewRegistration({
        email: user?.email ?? "",
        eventId: event._id,
      });
      toast.success("Successfully renewed registration!");
    } catch (error) {
      console.error("Failed to renew registration:", error);
      toast.error("Failed to renew registration");
    }
  };

  const calendarLink = generateGeneralICSFile(
    event.name,
    isoStartDate,
    isoEndDate,
    event.description,
    event.slug,
  );
  if (isPending && user) return <FullPageLoading />;

  return (
    <div className="flex h-full w-full flex-col justify-center">
      <section className="mb-10 flex flex-col items-center gap-10">
        <h1 className="text-center font-tanker text-4xl lowercase tracking-wide md:text-[4rem]">
          {event.name}
        </h1>
        <h2 className="text-lg font-semibold">{dateOutput}</h2>
        <p className="font-medium">
          <strong>Price:</strong> ${eventPrice} or free for users with Banana or
          Fatcap memberships
        </p>
      </section>

      <section className="mx-auto mb-6">
        <Separator thickness={2} className="mb-6" />
        <RichTextDisplay
          html={event.description}
          className="my-4 max-w-xl"
          fontSize={"!text-base"}
        />
      </section>
      <section className="mb-10 flex flex-col items-center gap-2">
        {/* <p>Free for Premium Plan: {premiumPlan ? "Yes" : "No"}</p> */}
        {!user && (
          <>
            {" "}
            <Button
              variant="salWithShadowHidden"
              size="lg"
              className="w-fit"
              onClick={() => {
                localStorage.setItem(
                  "login_redirect",
                  `/add-ons/${event.slug}`,
                );
                router.push("/auth/sign-in");
              }}
            >
              Sign in to register
            </Button>
            <p className="flex items-center gap-x-3 text-sm text-foreground before:h-[1px] before:flex-1 before:bg-foreground after:h-[1px] after:flex-1 after:bg-foreground">
              or
            </p>
            <p>Register as a guest using the form below</p>
          </>
        )}

        {canceled ? (
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
              className="w-full"
              onClick={handleRenew}
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
                    download={`${event.name.replace(/\s+/g, "_")}.ics`}
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
              className="w-full"
              onClick={handleCancel}
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
              {user && (
                <section>
                  {/* <p className={cn("font-tanker text-2xl")}>Hey, {user.name}! </p> */}
                  <div className="mt-3 space-y-2">
                    <p className={cn("text-lg font-semibold")}>
                      Here&apos;s what you need to take part:
                    </p>
                    <ol className="list-inside list-decimal space-y-1">
                      {event.requirements?.map((req, i) => (
                        <li key={i + 1} className={cn("")}>
                          {req}
                        </li>
                      ))}
                    </ol>
                  </div>
                </section>
              )}
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
              >
                Register
              </Button>
            </form>
          </Form>
        )}
      </section>
    </div>
  );
};
