"use client";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/custom-link";
import { Input } from "@/components/ui/input";
import {
  FOOTER_LINKS as footerLinks,
  SOCIAL_MEDIA_LINKS,
} from "@/constants/links";
import { footerCRText } from "@/constants/text";
import { cn } from "@/lib/utils";
import { useQuery } from "convex-helpers/react/cache";
import { useAction } from "convex/react";
import { ConvexError } from "convex/values";
import { ArrowRight, CheckCircle, LoaderCircle } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { infoEmail } from "@/constants/siteInfo";
import { NewsletterFormValues, newsletterSignupSchema } from "@/schemas/public";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaRegEnvelope } from "react-icons/fa";
import { PiHeartBold } from "react-icons/pi";
import { toast } from "react-toastify";
import { api } from "~/convex/_generated/api";

export default function Footer({ className }: { className?: string }) {
  const form = useForm<NewsletterFormValues>({
    resolver: zodResolver(newsletterSignupSchema),
    defaultValues: {
      email: "",
      firstName: "",
    },
    mode: "onChange",
  });
  // const {
  //   register,
  //   handleSubmit,
  //   watch,
  //   // formState: { errors },
  //   reset,
  // } = useForm<NewsletterFormProps>({ mode: "onChange" });
  const {
    handleSubmit,
    reset,
    formState: { isValid },
    getFieldState,
  } = form;

  const emailState = getFieldState("email");
  const emailValid = !emailState?.invalid;
  const emailDirty = emailState?.isDirty;
  const links = footerLinks;
  const footerText = footerCRText();
  const numColumns = Object.keys(links).length;
  const [subAction, setSubAction] = useState("cta");
  const subscription = useQuery(api.subscriptions.getUserSubscription);
  const getDashboardUrl = useAction(api.subscriptions.getStripeDashboardUrl);
  // const subscribeToNewsletter = useMutation(
  //   api.newsletter.subscriber.subscribeToNewsletter,
  // );
  const subscribeToNewsletter = useAction(
    api.actions.resend.sendNewsletterConfirmation,
  );

  const subStatus = subscription?.status || "none";
  const filteredLinks = links
    .map(({ section, items }) => ({
      section,
      items: items.filter((item) => !item.sub || item.sub.includes(subStatus)),
    }))
    .filter(({ items }) => items.length > 0);

  const handleSubscribe = async (data: NewsletterFormValues) => {
    if (!data.email) return;

    try {
      setSubAction("subbing");
      const result = await subscribeToNewsletter({
        email: data.email,
        firstName: data.firstName,
      });
      if (result?.status === "too_many_attempts") {
        toast.error(
          "You've already subscribed to the newsletter with this email. Please check your spam folder or contact support.",
        );
      } else if (result?.status === "already_subscribed") {
        toast.success("You're already subscribed to the newsletter.");
        setSubAction("subscribed");
      } else if (result?.status === "already_subscribed diff email") {
        toast.info(
          "You're already subscribed with a different email. Please check your spam folder.",
        );
        setSubAction("cta");
      } else if (result?.status === "diff user has email") {
        toast.error(
          "This email is already in use. Please use a different email or contact support.",
        );
        setSubAction("cta");
      } else if (result?.status === "unknown_error") {
        toast.error("An unknown error occurred. Please try again later.");
        setSubAction("cta");
      } else {
        toast.success("You're now subscribed to the newsletter!");
        setSubAction("subscribed");
      }
    } catch (err: unknown) {
      console.error(err);
      toast.error(
        "Unable to sign up. Please contact support or try again later.",
      );
    } finally {
      setTimeout(() => {
        setSubAction("cta");
        reset();
      }, 2000);
    }
  };

  const handleManageSubscription = async () => {
    if (!subscription?.customerId) {
      toast.error(
        "No membership found. Please contact support if this is incorrect.",
      );
      return;
    }

    try {
      const result = await getDashboardUrl({
        customerId: subscription.customerId,
      });
      if (result?.url) {
        window.location.href = result.url;
      }
    } catch (err: unknown) {
      if (err instanceof ConvexError) {
        toast.error(
          typeof err.data === "string" &&
            err.data.toLowerCase().includes("no such customer")
            ? "Your account was canceled. Contact support for assistance."
            : err.data || "An unexpected error occurred.",
        );
      } else if (err instanceof Error) {
        toast.error(
          typeof err.message === "string" &&
            err.message.toLowerCase().includes("no such customer")
            ? "Your account was canceled. Contact support for assistance."
            : err.message || "An unexpected error occurred.",
        );
      } else {
        toast.error("An unknown error occurred.", { autoClose: 1000 });
      }
      return;
    }
  };

  return (
    <footer
      className={cn(
        "flex max-w-screen justify-center border-t border-border bg-background",
        className,
      )}
    >
      <div className="mx-auto w-full px-4 py-6 sm:px-6 lg:px-8 lg:pt-16 xl:max-w-full xl:px-6">
        <div className="mx-auto xl:grid xl:grid-cols-2 xl:gap-8 3xl:max-w-[max(80vw,1500px)]">
          {/* Links */}
          <div className="mt-5 grid gap-8 px-6 xl:col-span-2 xl:mt-0 xl:grid-cols-[1fr_5px_auto]">
            <div
              className={cn(
                "hidden text-start md:grid md:justify-items-center lg:gap-8",
              )}
              style={{
                gridTemplateColumns: `repeat(${numColumns}, minmax(0, 1fr))`,
              }}
            >
              {filteredLinks.map(({ section, items }) => (
                <div key={section}>
                  <p className="text-sm font-semibold capitalize text-foreground">
                    {section.charAt(0).toUpperCase() + section.slice(1)}
                  </p>
                  <ul className="mt-4 space-y-4">
                    {items.map((item) => (
                      <li key={item.name}>
                        {item.name === "Manage" ? (
                          <Button
                            variant="link"
                            size="link"
                            type="button"
                            onClick={handleManageSubscription}
                            className="font-normal"
                          >
                            {item.name}
                          </Button>
                        ) : (
                          <Link
                            href={item.href}
                            className="text-sm text-foreground underline-offset-2"
                          >
                            {item.name}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <Separator
              thickness={1}
              orientation="vertical"
              className="my-4 hidden border-foreground xl:block"
            />
            <div
              data-type="newsletter"
              className="mx-auto flex w-full flex-col justify-center sm:px-10 lg:hidden xl:flex"
            >
              {/* <div>
                <p className="text-sm font-semibold text-foreground">
                  Stay Updated
                </p>
                <p className="mb-4 mt-4 text-sm text-foreground md:mb-8">
                  Subscribe to the newsletter for regular updates
                </p>
              </div> */}
              <Form {...form}>
                <form
                  onSubmit={handleSubmit(handleSubscribe)}
                  className="mt-4 sm:flex md:w-full md:max-w-md"
                >
                  <div className="flex flex-1 flex-col gap-3">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              placeholder="Enter your email"
                              className="h-11 w-full min-w-64 rounded-lg border-foreground bg-background text-foreground placeholder:text-foreground focus:bg-card"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {emailValid && emailDirty && (
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                {...field}
                                type="text"
                                placeholder="Enter your first name"
                                className="h-11 w-full min-w-64 rounded-lg border-foreground bg-background text-foreground placeholder:text-foreground focus:bg-card"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                  <div className="mt-3 sm:ml-3 sm:mt-0">
                    <Button
                      type="submit"
                      variant="salWithShadowHidden"
                      className="flex w-full items-center justify-center gap-2 font-bold md:w-[150px]"
                      disabled={subAction === "subbing" || !isValid}
                    >
                      {subAction === "cta"
                        ? "Subscribe"
                        : subAction === "subbing"
                          ? "Subscribing..."
                          : "Subscribed"}
                      {subAction === "cta" ? (
                        <ArrowRight className="ml-2 size-4" />
                      ) : subAction === "subbing" ? (
                        <LoaderCircle className="size-4 animate-spin" />
                      ) : (
                        <CheckCircle className="size-4" />
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
              <Image
                src="/newsletter_bubble.png"
                alt="Newsletter sign up. Sign up to receive updates and news about the Street Art List."
                width={250}
                height={150}
                className="mt-4 [@media(max-width:768px)]:w-full"
              />
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-border pt-4 dark:border-gray-800">
          <div className="flex flex-col items-center justify-between gap-y-2 px-12 md:flex-row">
            <div className="mb-2 flex space-x-6 md:mb-0 md:space-x-3">
              {SOCIAL_MEDIA_LINKS.filter(
                ({ label }) => label !== "Patreon",
              ).map(({ label, icon: Icon, path }) => (
                <Link href={path} key={label} target="_blank">
                  <Button variant="icon" size="icon" aria-label={label}>
                    <Icon className="size-7 md:size-5" />
                  </Button>
                </Link>
              ))}

              <Link href={`mailto:${infoEmail}`} target="_blank">
                <Button variant="icon" size="icon" aria-label="Email">
                  <FaRegEnvelope className="size-7 md:size-5" />
                </Button>
              </Link>
            </div>
            <div className="flex items-center space-x-1 text-sm">
              <p className="inline-flex items-center gap-x-1">
                Made with <PiHeartBold className="size-4" /> by
              </p>
              <Link href="https://theanthonybrooks.com" target="_blank">
                Anthony Brooks
              </Link>
            </div>
            <div className="text-center text-sm text-foreground">
              {footerText.text}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
