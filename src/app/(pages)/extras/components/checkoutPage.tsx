"use client";

import type { EventRegistrationValues } from "@/schemas/public";
import type { Preloaded } from "convex/react";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { EventRegistrationSchema } from "@/schemas/public";
import { zodResolver } from "@hookform/resolvers/zod";
import { capitalize } from "lodash";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { CalendarClockIcon } from "lucide-react";

import { FormSuccess } from "@/components/form-success";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useQueries, useQuery } from "convex-helpers/react/cache";
import { useAction, useMutation, usePreloadedQuery } from "convex/react";
import { ConvexError } from "convex/values";

type CheckoutPageProps = {
  preloaded: Preloaded<typeof api.userAddOns.onlineEvents.getOnlineEvent>;
};

export const CheckoutPage = ({ preloaded }: CheckoutPageProps) => {
  const router = useRouter();
  const queryResult = usePreloadedQuery(preloaded);
  const event = queryResult?.data;
  const eventIsDraft = event?.state === "draft";

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

  const { data: userIsRegistered, isPending } = useQueryWithStatus(
    api.userAddOns.onlineEvents.checkRegistration,
    user?._id && event?._id
      ? { eventId: event._id, email: user.email }
      : "skip",
  );
  const voucher = useQuery(
    api.userAddOns.onlineEvents.getUserVoucher,
    user ? { userId: user?._id } : "skip",
  );
  const voucherTotal = voucher?.amount ?? 0;
  const voucherCoversPrice = voucherTotal >= eventPrice;
  // console.log({ voucherTotal, eventPrice, voucherCoversPrice });
  const { paid, canceled, registration } = userIsRegistered ?? {};
  const activeRegistration = paid && !canceled;
  const canceledRegistration = paid && canceled;

  const form = useForm<EventRegistrationValues>({
    resolver: zodResolver(EventRegistrationSchema),
    defaultValues: {
      email: user?.email ?? "",
      name: user?.name ?? "",
      link: registration?.link ?? "",
      termsAgreement: false,
    },
    mode: "onChange",
    delayError: 1000,
  });

  const {
    handleSubmit,
    watch,
    formState: { isValid },
  } = form;

  const termsAgreement = watch("termsAgreement");

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
    organizerBio,
  } = event;
  const remainingCapacity = capacity.max - capacity.current;
  const remainingSpace = remainingCapacity > 0;
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

    try {
      if (!registrationName || !registrationEmail) {
        throw new Error("Name or email not provided");
      }
      if (!registration) {
        await registerForEvent({
          eventId: event._id,
          name: registrationName,
          email: registrationEmail,
          link: values.link,
        });
      }
      if (premiumPlan || !paidEvent) {
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
        email: user.email,
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
        toast.success("Successfully cancelled!");
      } else {
        toast.dismiss();
        toast.success("Successfully renewed your registration!");
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
      {eventIsDraft && (
        <p className="mx-auto mb-6 w-max rounded-lg border-1.5 bg-white/30 p-6 text-center text-red-600">
          This event is a draft. Publish it via the dashboard
        </p>
      )}
      <section className="mb-10 flex flex-col items-center gap-10">
        {event.img && (
          <Image
            src={event.img}
            alt={name}
            width={300}
            height={150}
            className=""
          />
        )}
        <h1
          className={cn(
            "text-center font-tanker text-4xl lowercase tracking-wide md:text-[4rem]",
            event.img && "sr-only",
          )}
        >
          {name}
        </h1>
        <h2 className="text-lg font-semibold">{`${datePart} @ ${timePart}`}</h2>

        {remainingCapacity <= 3 && remainingSpace && (
          <p className="-mt-6 text-balance text-center font-bold text-red-600">
            Only {remainingCapacity} space{remainingCapacity > 1 ? "s" : ""}{" "}
            left!
          </p>
        )}
        {!remainingSpace && (
          <p className="-mt-6 text-balance text-center font-bold text-red-600">
            This event is fully booked!
          </p>
        )}
        <p className="text-balance text-center font-medium">
          <strong>Price:</strong> Free for users with Banana or Fatcap
          memberships. ${eventPrice} otherwise.
        </p>
      </section>
      <div className={cn("grid gap-5 px-8 pb-10 sm:grid-cols-[60%_50px_auto]")}>
        <Accordion type="multiple" defaultValue={["about"]}>
          <AccordionItem value="about">
            <AccordionTrigger title="Details:" fontSize={fontSize} />
            <AccordionContent className="pb-3" fontSize={fontSize}>
              <RichTextDisplay
                html={description}
                className="my-4"
                fontSize={fontSize}
              />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="requirements">
            <AccordionTrigger title="Requirements:" fontSize={fontSize} />
            <AccordionContent fontSize={fontSize} className={cn("space-y-2")}>
              <p className={cn("font-semibold")}>
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
              <strong>Registration Deadline:</strong>
              <p> {deadlineOutput}</p>

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
              <span>
                <strong>Location:</strong>
                <p>
                  The event will take place online via{" "}
                  {capitalize(event.location)}
                </p>
              </span>
              <br />
              <span>
                <strong>When:</strong>
                <p> {dateOutput}</p>
              </span>

              <p className="text-sm italic">
                All times are displayed in your local timezone.
              </p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="organizer">
            <AccordionTrigger title="Organizer:" fontSize={fontSize} />
            <AccordionContent fontSize={fontSize}>
              <RichTextDisplay html={organizerBio} fontSize={fontSize} />
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
          {!remainingSpace && !activeRegistration ? (
            <div className={cn("flex flex-col items-center gap-6")}>
              <Image
                src="/gifs/at-capacity.gif"
                alt="Fully booked event"
                width={400}
                height={400}
                className="rounded-full"
              />
              <p>
                All spaces are booked for this event. Keep an eye on our socials
                and the newsletter for upcoming events, or check back later in
                case there are any cancellations.
              </p>
            </div>
          ) : !user ? (
            <div
              className={cn(
                "mx-auto flex h-full max-w-sm flex-col items-center gap-8",
              )}
            >
              <p>An account is required to register for this event.</p>
              <div className="flex w-full items-center gap-6">
                <Button
                  variant="salWithShadowHidden"
                  size="lg"
                  className="w-full flex-1"
                  onClick={() => {
                    localStorage.setItem("login_redirect", `/extras/${slug}`);
                    router.push("/auth/sign-in");
                  }}
                  fontSize={fontSize}
                >
                  Sign in
                </Button>{" "}
                or{" "}
                <Button
                  variant="salWithShadowHidden"
                  size="lg"
                  className="w-full flex-1"
                  onClick={() => {
                    localStorage.setItem("login_redirect", `/extras/${slug}`);
                    router.push("/auth/register");
                  }}
                  fontSize={fontSize}
                >
                  Sign up
                </Button>
              </div>
              <p className="text-sm">
                Registering for an account is free, and if you decide to sign up
                for a membership, all memberships have a 2 week free trial
                period during which you can cancel at any time.
              </p>
            </div>
          ) : (
            <>
              {canceledRegistration && voucherCoversPrice ? (
                <>
                  {/* <FormError
                    message={
                      <p className={cn("inline")}>
                        You&apos;ve cancelled your registration!{" "}
                      </p>
                    }
                    className={cn("mb-4 w-full")}
                  /> */}
                  <Image
                    src="/gifs/its-done.gif"
                    alt="Your registration is cancelled"
                    width={250}
                    height={250}
                    className="mb-6 rounded-full"
                  />
                  <p className={cn("mb-2 text-balance text-center", fontSize)}>
                    You&apos;ve cancelled your registration for this event.
                  </p>
                  {remainingSpace ? (
                    <>
                      <p
                        className={cn(
                          "mb-2 text-balance text-center",
                          fontSize,
                        )}
                      >
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
                  ) : (
                    <p className="mb-2">
                      You&apos;ve cancelled your registration for this event.
                      All spaces are currently booked, though your account
                      balance can still be used for another event.
                    </p>
                  )}
                </>
              ) : activeRegistration ? (
                <>
                  <Image
                    // src="/gifs/see-you-there.gif"
                    src="/gifs/cant-wait.gif"
                    alt="Registration complete!"
                    width={400}
                    height={400}
                    className="mb-6 rounded-full"
                  />
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
                    className={cn("mb-4 w-full")}
                  />
                  <p className={cn("mb-2 text-balance text-center", fontSize)}>
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
                    <FormField
                      control={form.control}
                      name="termsAgreement"
                      render={({ field }) => (
                        <FormItem className="my-2 flex items-center gap-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value || false}
                              onCheckedChange={field.onChange}
                              className="text-base"
                            />
                          </FormControl>
                          <FormLabel className="hover:cursor-pointer">
                            I have read and agree to the terms of this event
                            <sup>*</sup>
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    {/* <Label
                      htmlFor="termsAgreement"
                      className="inline-flex items-center gap-2"
                    >
                      {" "}
                      <Checkbox
                        checked={termsAgreement}
                        onCheckedChange={(checked) =>
                          setTermsAgreement(checked === true)
                        }
                      />{" "}
                      I have read and agree to the terms of this event
                    </Label> */}

                    <Button
                      variant="salWithShadowHidden"
                      size="lg"
                      className="w-full"
                      disabled={!isValid || !termsAgreement}
                      fontSize={fontSize}
                    >
                      Register
                    </Button>
                  </form>
                  <p className="text-sm">
                    Please ensure that you&apos;re available during the event
                    time(s) and have submitted the required info.
                  </p>
                  <p className="text-sm">
                    Any charges related to events will not be refunded unless
                    cancellations are made by the organizer. If cancelled at
                    least 72 hours before the event, you will be refunded in the
                    form of a voucher.
                  </p>
                </Form>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
};
