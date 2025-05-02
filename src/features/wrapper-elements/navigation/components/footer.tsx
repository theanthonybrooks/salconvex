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
import { ArrowRight, CheckCircle, LoaderPinwheel } from "lucide-react";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaRegEnvelope } from "react-icons/fa";
import { PiHeartBold } from "react-icons/pi";
import { api } from "~/convex/_generated/api";

interface NewsletterFormProps {
  email: string;
}

export default function Footer({ className }: { className?: string }) {
  const {
    register,
    handleSubmit,
    // formState: { errors },
    reset,
  } = useForm<NewsletterFormProps>();

  const links = footerLinks;
  const footerText = footerCRText();
  const numColumns = Object.keys(links).length;
  const [subAction, setSubAction] = useState("cta");
  const subscription = useQuery(api.subscriptions.getUserSubscription);
  const subStatus = subscription?.status || "none";
  const filteredLinks = links
    .map(({ section, items }) => ({
      section,
      items: items.filter((item) => !item.sub || item.sub.includes(subStatus)),
    }))
    .filter(({ items }) => items.length > 0);

  const onSubscribe = async (data: NewsletterFormProps) => {
    setSubAction("subbing");
    setTimeout(() => {
      setSubAction("done");
    }, 2000);
    //todo: Handle newsletter submission
    console.log(data);
    setTimeout(() => {
      setSubAction("cta");
      reset();
    }, 4000);
  };

  return (
    <footer
      className={cn(
        "max-w-screen flex justify-center border-t border-border bg-background",
        className,
      )}
    >
      <div className="mx-auto w-full px-4 py-6 sm:px-6 lg:px-8 lg:pt-16 xl:max-w-full xl:px-6">
        <div className="xl:grid xl:grid-cols-2 xl:gap-8">
          {/* Links */}
          <div className="mt-5 grid gap-8 px-6 lg:grid-cols-2 xl:col-span-2 xl:mt-0">
            <div
              className={cn("hidden text-start lg:grid lg:gap-8 lg:pl-8")}
              style={{
                gridTemplateColumns: `repeat(${numColumns}, minmax(0, 1fr))`,
              }}
            >
              {filteredLinks.map(({ section, items }) => (
                <div key={section}>
                  <h3 className="text-sm font-semibold capitalize text-foreground">
                    {section.charAt(0).toUpperCase() + section.slice(1)}
                  </h3>
                  <ul className="mt-4 space-y-4">
                    {items.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className="text-sm text-foreground underline-offset-2"
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div
              data-type="newsletter"
              className="width-full mx-auto flex flex-col justify-center border-border md:border-l-[1px] md:pl-[5rem]"
            >
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Stay Updated
                </h3>
                <p className="mb-4 mt-4 text-sm text-foreground md:mb-8">
                  Subscribe to the newsletter for regular updates
                </p>
              </div>
              <form
                onSubmit={handleSubmit(onSubscribe)}
                className="mt-4 sm:flex sm:max-w-md md:w-full"
              >
                <div className="flex-1">
                  <Input
                    {...register("email", { required: true })}
                    type="email"
                    placeholder="Enter your email"
                    className="w-full min-w-0 rounded-lg border-foreground bg-background text-foreground placeholder:text-foreground"
                  />
                </div>
                <div className="mt-3 sm:ml-3 sm:mt-0">
                  <Button
                    type="submit"
                    variant="salWithShadowHidden"
                    className="flex w-full items-center justify-center gap-2 font-bold md:w-[150px]"
                  >
                    {subAction === "cta"
                      ? "Subscribe"
                      : subAction === "subbing"
                        ? "Subscribing..."
                        : "Subscribed"}
                    {subAction === "cta" ? (
                      <ArrowRight className="ml-2 size-4" />
                    ) : subAction === "subbing" ? (
                      <LoaderPinwheel className="size-4 animate-spin" />
                    ) : (
                      <CheckCircle className="size-4" />
                    )}
                  </Button>
                </div>
              </form>
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

              <Link href="mailto:info@thestreetartlist.com" target="_blank">
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
