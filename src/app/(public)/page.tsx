"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Link } from "@/components/ui/custom-link";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import Pricing from "@/features/homepage/pricing";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { usePreloadedQuery } from "convex/react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaEnvelope, FaFacebook, FaGlobe, FaInstagram } from "react-icons/fa6";

// const font = Poppins({ subsets: ["latin"], weight: "600" })

export default function Home() {
  const searchParams = useSearchParams();
  const { preloadedSubStatus } = useConvexPreload();
  const subStatus = usePreloadedQuery(preloadedSubStatus);
  const hasActiveSubscription = subStatus?.hasActiveSubscription;

  const [currentSlide, setCurrentSlide] = useState(1);
  const [expanded, setExpanded] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const toggleReadMore = () => setExpanded((prev) => !prev);
  // const { scrollY } = useScroll()
  // const smoothScrollY = useSpring(scrollY, {
  //   stiffness: 100,
  //   damping: 20,
  //   mass: 0.4,
  // })
  // const borderRadius = useTransform(smoothScrollY, [0, 150, 450], [0, 0, 150])

  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    const errorDesc = searchParams.get("err");
    if (errorDesc) {
      if (errorDesc === "newUser") {
        const url = new URL(window.location.href);
        url.searchParams.delete("err");
        window.history.replaceState({}, "", url.toString());
        return;
      }
    }
  }, [searchParams]);

  useEffect(() => {
    sessionStorage.removeItem("previousSalPage");
  }, []);

  return (
    <>
      <motion.div
        initial={{ y: 0, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="relative flex h-full flex-col items-center justify-center overflow-hidden rounded-3xl sm:mt-auto"
        style={{
          maxHeight: "calc(100dvh - 8.5rem)",
        }}
      >
        <div
          className={cn(
            "absolute left-5 top-5 z-10 font-tanker lowercase tracking-wide text-background transition-transform duration-700 ease-in-out [text-shadow:0_0_10px_rgba(0,0,0,0.3)] md:left-7",

            currentSlide === 1
              ? "scale-100"
              : "-translate-x-[20%] -translate-y-3 scale-[.6] lg:-translate-y-0 lg:translate-x-0 lg:scale-100",
          )}
        >
          <h1
            className={cn(
              "text-[3.75rem] leading-[3.5rem] md:text-[6.5rem] md:leading-[7rem] lg:text-[8.5rem] lg:leading-[8.5rem]",
              currentSlide === 1
                ? "scale-100"
                : "-translate-x-[20%] -translate-y-3 scale-[.6] lg:-translate-y-0 lg:translate-x-0 lg:scale-100",
            )}
          >
            CHUS
          </h1>
          <h2
            className={cn(
              "text-center text-lg md:text-3xl lg:text-4xl",
              currentSlide === 1 ? "scale-100" : "hidden",
            )}
          >
            May / June 2025
          </h2>
        </div>

        <Carousel className="h-full w-full">
          <CarouselContent>
            <CarouselItem className="relative w-full">
              <Image
                src="/artist-highlight/chus3.jpg"
                alt="The Street Art List"
                loading="eager"
                width={1920}
                height={1080}
                className="h-full w-full object-cover object-[50%_42%]"

                // style={{
                //   borderBottomLeftRadius: borderRadius,
                //   borderBottomRightRadius: borderRadius,
                // }}
              />
            </CarouselItem>

            <CarouselItem className="relative w-full">
              <Image
                src="/artist-highlight/chus2.jpg"
                alt="The Street Art List"
                loading="eager"
                width={1920}
                height={1080}
                className="h-full w-full object-cover object-[50%_90%]"

                // style={{
                //   borderBottomLeftRadius: borderRadius,
                //   borderBottomRightRadius: borderRadius,
                // }}
              />
            </CarouselItem>
            <CarouselItem className="relative w-full">
              <Image
                src="/artist-highlight/chus.jpg"
                alt="The Street Art List"
                loading="eager"
                width={1920}
                height={1080}
                className="h-full w-full object-cover object-[50%_13%]"

                // style={{
                //   borderBottomLeftRadius: borderRadius,
                //   borderBottomRightRadius: borderRadius,
                // }}
              />
            </CarouselItem>
          </CarouselContent>
          <div onClick={() => setCurrentSlide(currentSlide - 1)}>
            <CarouselPrevious />
          </div>
          <div onClick={() => setCurrentSlide(currentSlide + 1)}>
            <CarouselNext />
          </div>
        </Carousel>

        <Popover onOpenChange={setPopoverOpen} open={popoverOpen}>
          <PopoverTrigger asChild>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute bottom-5 left-1/2 z-0 flex w-max -translate-x-1/2 flex-col gap-1 rounded-3xl bg-white px-6 py-2 text-foreground transition-all ease-in-out hover:cursor-pointer hover:bg-yellow-100 sm:left-5 sm:w-auto sm:translate-x-0 sm:px-6"
              // onClick={() => setPopoverOpen((prev) => !prev)}
            >
              <div className="flex flex-col items-center gap-2 sm:flex-row">
                <span className="flex items-center gap-2">
                  <i className="text-base">Marching Band Mural </i>
                  {/* <span className="block sm:hidden">-</span>{" "} */}
                  <span className="block text-xs">by</span>{" "}
                  <span className="font-bold">CHUS</span>
                </span>
                <Separator
                  thickness={2}
                  orientation={isMobile ? "horizontal" : "vertical"}
                  className={cn("mx-1 h-5", currentSlide !== 1 && "hidden")}
                />
                <span
                  className={cn(
                    "flex items-center gap-1 text-sm hover:cursor-pointer hover:font-semibold",
                    currentSlide !== 1 && "hidden",
                  )}
                >
                  {popoverOpen ? (
                    <>View less... </>
                  ) : (
                    <>
                      View more
                      <Plus className="size-4" />
                    </>
                  )}
                </span>
              </div>
              {/* <span
                className={cn(
                  "flex items-center justify-between gap-2",
                  currentSlide !== 1 && "hidden",
                )}
              >
                <p className="text-xs text-muted-foreground">Italy (2024)</p>

                <span className="flex items-center gap-1 text-xs italic underline-offset-2 hover:underline">
                  {popoverOpen ? (
                    <p> View less </p>
                  ) : (
                    <p>View more details... </p>
                  )}
                </span>
              </span> */}
            </motion.span>
          </PopoverTrigger>
          <PopoverContent className="w-80 border-1.5" align="center">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h3 className="italic">Marching Band Mural</h3>
                <p className="text-base text-muted-foreground">
                  Pieve Santo Stefano, Tuscany (IT)
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium leading-none">More info:</h4>
                <p className="text-base text-muted-foreground">
                  Italian artist located in Copenhagen, Denmark
                </p>
              </div>
              <ul className="flex flex-col gap-2 sm:gap-1 [&*svg]:size-4">
                <li className="flex items-center gap-x-3">
                  <FaInstagram />
                  <Link
                    href="https://instagram.com/chus.art"
                    className="text-base text-muted-foreground"
                    target="_blank"
                  >
                    @chus.art
                  </Link>
                </li>
                <li className="flex items-center gap-x-3">
                  <FaFacebook />
                  <Link
                    href="https://www.facebook.com/mattiachus"
                    className="text-base text-muted-foreground"
                    target="_blank"
                  >
                    @mattiachus
                  </Link>
                </li>
                <li className="flex items-center gap-x-3">
                  <FaGlobe />
                  <Link
                    href="https://chus.it"
                    className="text-base text-muted-foreground"
                    target="_blank"
                  >
                    www.chus.it
                  </Link>
                </li>
                <li className="flex items-center gap-x-3">
                  <FaEnvelope />
                  <Link
                    href="mailto:mattia.chus@gmail.com"
                    className="text-base text-muted-foreground"
                    target="_blank"
                  >
                    mattia.chus@gmail.com
                  </Link>
                </li>
              </ul>
            </div>
          </PopoverContent>
        </Popover>
      </motion.div>

      {!hasActiveSubscription && (
        <>
          <Card className="mx-auto mt-10 max-w-[90dvw] border-1.5 p-6 text-left shadow-md sm:max-w-[70dvw]">
            <CardContent className="space-y-4 !p-0 text-base text-foreground sm:!p-6">
              <h2 className="text-center font-tanker text-4xl text-foreground">
                Welcome!
              </h2>
              <div
                className={cn(
                  !expanded && "line-clamp-3 lg:line-clamp-none",
                  "transition-all",
                )}
              >
                <p>
                  For those that are new to The Street Art List, here&apos;s a
                  quick overview of what it is and how it works.
                </p>
                &nbsp;
                <p>
                  The Street Art List is a platform that I started in 2019 with
                  the goal of making a public archive/database of street
                  art-related projects and events. Over the years, that list
                  continued to grow until last year when I decided to bite the
                  bullet and code a site. Needless to say, it was a huge
                  undertaking, but was also a bit rushed and I really wanted to
                  make something better.
                </p>
                &nbsp;
                <p>
                  So, for the past year and a half, I&apos;ve been working on
                  this shiny new site that allows users to have an account, to
                  bookmark, to hide events, to keep track of applications, to
                  view deadlines in their local timezone, and much more! Lots of
                  functionalities that I have in the works, and I&apos;m happy
                  to finally get to share what so much of my time has gone into.
                </p>
                &nbsp;
                <p>
                  {" "}
                  If you used previous versions of The List (when it was a
                  spreadsheet), or the old version of the site, I promise that
                  this has just... so much more. Full detail pages with
                  breakdowns of the budget, mobile-friendly layouts, submission
                  forms that allow saving drafts and coming back to them later.
                  Organizer accounts. Really, just so much more. I&apos;m
                  excited to share this with you and hope you&apos;ll find it
                  useful :){" "}
                </p>
                &nbsp;
                <p>
                  P.s. Many of the new features are still in beta, so if you
                  come across any bugs, please let me know!
                </p>
              </div>
              <Button
                variant="salWithShadowHidden"
                onClick={toggleReadMore}
                className="mt-3 w-full lg:hidden"
              >
                {expanded ? "Read Less" : "Read More"}
              </Button>
            </CardContent>
          </Card>

          <Pricing />
        </>
      )}
    </>
  );
}
