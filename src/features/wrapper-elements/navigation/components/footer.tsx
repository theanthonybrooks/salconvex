"use client";

import {
  FOOTER_LINKS as footerLinks,
  SOCIAL_MEDIA_LINKS,
} from "@/constants/links";
import { infoEmail } from "@/constants/siteInfo";
import { footerCRText } from "@/constants/text";

import { useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { NewsletterFormValues, newsletterSignupSchema } from "@/schemas/public";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { FaRegEnvelope } from "react-icons/fa";
import { PiHeartBold } from "react-icons/pi";
import { ArrowRight, CheckCircle, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/custom-link";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { getUserFontSizePref } from "@/helpers/stylingFns";
import { cn } from "@/helpers/utilsFns";
import { showToast } from "@/lib/toast";

import { api } from "~/convex/_generated/api";
import { useQuery } from "convex-helpers/react/cache";
import { useMutation, usePreloadedQuery } from "convex/react";

export default function Footer({ className }: { className?: string }) {
  const pathname = usePathname();
  const isNewsletterPage = pathname === "/newsletter";
  const { preloadedUserData } = useConvexPreload();
  const userData = usePreloadedQuery(preloadedUserData);
  const { userPref } = userData || {};
  const { fontSize: userFontSize, notifications } = userPref || {};
  const newsletterSub = notifications?.newsletter ?? false;
  const fontSizePref = getUserFontSizePref(userFontSize);
  const fontSize = fontSizePref?.body;
  const form = useForm<NewsletterFormValues>({
    resolver: zodResolver(newsletterSignupSchema),
    defaultValues: {
      email: "",
      firstName: "",
    },
    mode: "onChange",
    delayError: 1000,
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
    watch,
    formState: { isValid },
    getFieldState,
  } = form;
  const emailValue = watch("email");
  const emailState = getFieldState("email");
  const emailValid = !emailState?.invalid;
  const emailDirty =
    emailState?.isDirty && /^.{3,}@.{2,}\..{2,}$/.test(emailValue);

  const links = footerLinks;
  const footerText = footerCRText();
  const numColumns = Object.keys(links).length;
  const [subAction, setSubAction] = useState("cta");
  const subscription = useQuery(api.subscriptions.getUserSubscription);
  // const updateNotifications = useMutation(api.users.updateUserNotifications);
  //   await updateNotifications({
  //       newsletter: true,
  //     });
  // const subscribeToNewsletter = useMutation(
  //   api.newsletter.subscriber.subscribeToNewsletter,
  // );
  const subscribeToNewsletter = useMutation(
    api.newsletter.subscriber.subscribeToNewsletter,
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
      if (result?.status.includes("too_many_attempts")) {
        showToast(
          "error",
          result.status.includes("is_verified")
            ? "You've already subscribed. Please update your notification preferences in the dashboard."
            : "You still need to verify your email address. Please check your junk mail folder.",
          {
            autoClose: 4000,
          },
        );
      } else if (result?.status === "already_subscribed") {
        showToast("success", "You're already subscribed to the newsletter.", {
          autoClose: 4000,
        });
        setSubAction("subscribed");
      } else if (result?.status === "already_subscribed diff email") {
        showToast(
          "info",
          "You're already subscribed with a different email. Please update your notification preferences in the dashboard and check your junk mail folder.",
        );
        setSubAction("cta");
      } else if (result?.status === "diff user has email") {
        showToast(
          "error",
          "This email is already in use. Please use a different email or contact support.",
        );
        setSubAction("cta");
      } else if (result?.status === "unknown_error") {
        showToast(
          "error",
          "An unknown error occurred. Please try again later.",
        );
        setSubAction("cta");
      } else {
        showToast(
          "success",
          "We just sent you a verification email! (Please check your junk mail)",
          { autoClose: 4000 },
        );

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

  return (
    <footer
      className={cn(
        "flex max-w-screen justify-center border-t border-border bg-background",
        className,
      )}
    >
      <div className="mx-auto w-full px-4 py-6 sm:px-6 lg:px-8 lg:pt-16 xl:max-w-full xl:px-6">
        <div className="mx-auto xl:grid xl:gap-8 3xl:max-w-[max(60vw,1500px)]">
          {/* Links */}
          <div className="mt-5 grid gap-8 px-6 md:grid-cols-[63%_5px_auto] xl:mt-0 xl:grid-cols-[1fr_5px_auto]">
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
                  <p
                    className={cn(
                      "text-sm font-semibold capitalize text-foreground",
                      fontSize,
                    )}
                  >
                    {section.charAt(0).toUpperCase() + section.slice(1)}
                  </p>
                  <ul className="mt-4 space-y-4">
                    {items.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className="text-sm text-foreground underline-offset-2"
                          fontSize={fontSize}
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <Separator
              thickness={1}
              orientation="vertical"
              className="my-4 hidden border-foreground md:block"
            />
            <div
              data-type="newsletter"
              className="mx-auto flex w-full flex-col justify-center sm:px-10"
            >
              {newsletterSub ? (
                <Link
                  href="/newsletter"
                  className={cn(isNewsletterPage && "pointer-events-none")}
                >
                  <Button
                    variant="salWithShadowHiddenBg"
                    disabled={isNewsletterPage}
                    className="w-full sm:w-auto"
                  >
                    {isNewsletterPage
                      ? "You're already subscribed!"
                      : "View Newsletter Preferences"}
                  </Button>
                </Link>
              ) : (
                <Form {...form}>
                  <form
                    onSubmit={handleSubmit(handleSubscribe)}
                    className="mt-4 flex flex-col gap-4 md:w-full md:max-w-md xl:flex-row"
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
                    <div className="">
                      <Button
                        type="submit"
                        variant={
                          isValid
                            ? "salWithShadowHidden"
                            : "salWithShadowHiddenBg"
                        }
                        className="flex w-full items-center justify-center gap-2 font-bold xl:w-[150px]"
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
              )}
              <Image
                src="/newsletter_bubble.png"
                alt="Newsletter sign up. Sign up to receive updates and news about the Street Art List."
                width={250}
                height={150}
                className="mt-4 h-auto w-full md:w-64"
              />
            </div>
          </div>
        </div>
        {/* Under footer bar */}
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
