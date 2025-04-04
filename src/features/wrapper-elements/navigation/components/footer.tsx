"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FOOTER_LINKS as footerLinks,
  getGridColsClass,
} from "@/constants/links";
import { footerCRText } from "@/constants/text";
import { cn } from "@/lib/utils";
import { ArrowRight, CheckCircle, LoaderPinwheel } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaInstagram, FaRegEnvelope } from "react-icons/fa";
import { FaFacebookF, FaThreads } from "react-icons/fa6";

interface NewsletterFormProps {
  email: string;
}

export default function Footer() {
  const {
    register,
    handleSubmit,
    // formState: { errors },
    reset,
  } = useForm<NewsletterFormProps>();

  const links = footerLinks;
  // const { image, alt, width, height, text, path } = landingPageLogo[0]
  const footerText = footerCRText();
  const numColumns = Object.keys(links).length;
  const gridColsClass = getGridColsClass(numColumns);
  const [subAction, setSubAction] = useState("cta");

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
    <footer className="max-w-screen flex justify-center overflow-hidden border-t border-border">
      <div className="mx-auto px-4 py-6 sm:px-6 lg:px-8 lg:pt-16 xl:w-full xl:max-w-full xl:px-6">
        <div className="xl:grid xl:grid-cols-2 xl:gap-8">
          {/* Links */}
          <div className="mt-5 grid gap-8 px-6 md:grid-cols-2 xl:col-span-2 xl:mt-0">
            <div
              className={cn(
                "hidden text-start md:grid md:gap-8 md:pl-8",
                gridColsClass ? gridColsClass : "md:grid-cols-4",
              )}
            >
              {Object.entries(links).map(([section, items]) => (
                <div key={section}>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {section.charAt(0).toUpperCase() + section.slice(1)}
                  </h3>
                  <ul className="mt-4 space-y-4">
                    {items.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className="text-sm text-gray-600 underline-offset-2 transition-colors hover:text-gray-900 hover:underline dark:text-gray-400 dark:hover:text-white"
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
                    className="w-full min-w-0 rounded-lg border-foreground bg-background"
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
                      <ArrowRight className="ml-2 h-4 w-4" />
                    ) : subAction === "subbing" ? (
                      <LoaderPinwheel className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-border pt-4 dark:border-gray-800">
          <div className="flex flex-col items-center justify-between gap-y-2 px-6 md:flex-row">
            <div className="mb-2 flex space-x-4 md:mb-0">
              <Link
                href="https://facebook.com/thestreetartlist"
                target="_blank"
              >
                <Button variant="ghost" size="icon">
                  <FaFacebookF className="h-5 w-5" />
                </Button>
              </Link>
              <Link
                href="https://instagram.com/thestreetartlist"
                target="_blank"
              >
                <Button variant="ghost" size="icon">
                  <FaInstagram className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="https://threads.net/thestreetartlist" target="_blank">
                <Button variant="ghost" size="icon">
                  <FaThreads className="h-5 w-5" />
                </Button>
              </Link>
              {/* <Link href='https://patreon.com/thestreetartlist' target='_blank'>
                <Button variant='ghost' size='icon'>
                  <FaPatreon className='h-5 w-5' />
                </Button>
              </Link> */}
              <Link href="mailto:info@thestreetartlist.com" target="_blank">
                <Button variant="ghost" size="icon">
                  <FaRegEnvelope className="h-5 w-5" />
                </Button>
              </Link>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <p>Made with ❤️ by</p>
              <Link
                href="https://theanthonybrooks.com"
                target="_blank"
                className="cursor-pointer decoration-foreground hover:underline hover:underline-offset-2 focus:underline focus:decoration-foreground focus:decoration-2 focus-visible:underline-offset-2"
              >
                Anthony Brooks
              </Link>
            </div>
            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              {footerText.text}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
