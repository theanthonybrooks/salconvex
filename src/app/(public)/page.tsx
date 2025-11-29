"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useTheme } from "next-themes";

import { FaEnvelope, FaGlobe, FaInstagram } from "react-icons/fa6";
import { Plus } from "lucide-react";

import { AnimatedCounter } from "@/components/ui/animate-counter";
import {
  Carousel,
  CarouselContent,
  CarouselDots,
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
import { cn } from "@/helpers/utilsFns";
import { useDevice } from "@/providers/device-provider";

import { api } from "~/convex/_generated/api";
import { makeUseQueryWithStatus } from "convex-helpers/react";
import { useQueries } from "convex-helpers/react/cache";
import { usePreloadedQuery } from "convex/react";

// const font = Poppins({ subsets: ["latin"], weight: "600" })

export default function Home() {
  const searchParams = useSearchParams();
  const useQueryWithStatus = makeUseQueryWithStatus(useQueries);

  const { preloadedUserData, preloadedSubStatus } = useConvexPreload();
  const { theme, setTheme } = useTheme();
  const userData = usePreloadedQuery(preloadedUserData);
  const { userPref } = userData ?? {};
  const subStatus = usePreloadedQuery(preloadedSubStatus);

  const hasActiveSubscription = subStatus?.hasActiveSubscription;

  // const videoRef = useRef<HTMLVideoElement | null>(null);

  // const user = userData?.user ?? null;
  // const isAdmin = user?.role?.includes("admin");
  // useEffect(() => {
  //   if (userCurrency || !user) return;

  //   const updateCurrency = async () => {
  //     try {
  //       const result = await getUserInfo();
  //       console.log("result", result);
  //       if (!result) return;
  //       await updateUserPrefs({ currency: result.currency });
  //     } catch (error) {
  //       console.error("Failed to update user currency:", error);
  //     }
  //   };

  //   updateCurrency();
  // }, [getUserInfo, userCurrency, updateUserPrefs, user]);

  const { data: totalOpenCallsData } = useQueryWithStatus(
    api.openCalls.openCall.getTotalNumberOfOpenCalls,
  );

  const { data: totalEventsData } = useQueryWithStatus(
    api.events.event.getTotalNumberOfEvents,
  );
  // const [paused, setPaused] = useState(false);

  const [currentSlide, setCurrentSlide] = useState(1);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [titleOpacity, setTitleOpacity] = useState(0.85);
  const { scrollY } = useScroll();
  const smoothScrollY = useSpring(scrollY, {
    stiffness: 50,
    damping: 20,
    mass: 0.4,
  });

  // useMotionValueEvent(scrollY, "change", (latest) => {
  //   console.log(latest);
  // });

  const titleOpacityScrollProgress = useTransform(
    smoothScrollY,
    [0, 25, 200], //note-to-self: input range (scroll positions)
    [0.85, 0.85, 0], //note-to-self: output range (opacity values)
  );
  useMotionValueEvent(titleOpacityScrollProgress, "change", (latest) => {
    // console.log("Current opacity:", latest);
    if (popoverOpen) setPopoverOpen(false);
    setTitleOpacity(latest);
  });

  const { isMobile } = useDevice();

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
    const initial = searchParams.get("initial");
    if (initial) {
      if (userPref?.theme && theme !== userPref?.theme) {
        setTheme(userPref?.theme);
      }
      const url = new URL(window.location.href);
      url.searchParams.delete("initial");
      window.history.replaceState({}, "", url.toString());
      return;
    }
  });

  useEffect(() => {
    sessionStorage.removeItem("previousSalPage");
    if (typeof window === "undefined") return; // safety for SSR

    // document.cookie =
    //   "previousSalPage=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
    const redirect = localStorage.getItem("login_redirect");
    if (!redirect) return;

    localStorage.removeItem("login_redirect");

    setTimeout(() => {
      if (window.location.pathname !== redirect) {
        window.location.assign(redirect);
      }
    }, 100);
  }, []);

  // const handleVideoToggle = () => {
  //   const video = videoRef.current;
  //   if (!video) return;
  //   if (video.paused) {
  //     void video.play();
  //     setPaused(false);
  //   } else {
  //     void video.pause();
  //     setPaused(true);
  //   }
  // };

  return (
    <>
      {/* <div className="sticky inset-0 h-dvh">
     
      </div> */}
      <p className="sr-only" data-nosnippet={false}>
        The Street Art List is a global list of street art, graffiti, & mural
        projects. Open calls, event calendar, and global map, with organizer and
        artist dashboards. Created, regularly updated, and run by visual artist,
        Anthony Brooks (@anthonybrooksart), a Serbian-American artist based in
        Berlin, Germany.
      </p>

      <section className="home-page relative w-full">
        <div className="sticky top-0 z-0 h-[60dvh] overflow-hidden sm:h-dvh">
          <motion.div
            initial={{ y: 0, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="home-page relative flex h-full max-h-[90%] flex-col items-center justify-center sm:mt-auto sm:max-h-dvh"
          >
            <Carousel
              className="h-full w-full px-4 sm:px-0 [@media(max-width:720px)]:pt-20"
              onSelectIndexChange={setCurrentSlide}
            >
              <CarouselContent rounded="sm">
                {/* <CarouselItem className="relative w-full bg-transparent">
                  <video
                    ref={videoRef}
                    src="/artist-highlight/nov25/oldhues-video-edit2.mp4"
                    autoPlay={!paused}
                    playsInline
                    muted
                    loop
                    preload="metadata"
                    disablePictureInPicture
                    controlsList="nodownload nofullscreen noremoteplayback noplaybackrate"
                    className="absolute inset-0 h-full w-full object-cover object-[50%_32%]"
                  />
                </CarouselItem> */}
                <CarouselItem className="relative w-full bg-transparent">
                  <Image
                    src="/artist-highlight/nov25/oldhues-25.jpg"
                    alt="The Street Art List - Megan Oldhues @oldhues"
                    loading="eager"
                    width={1920}
                    height={1080}
                    className="h-full w-full object-cover object-[50%_51%]"
                  />
                </CarouselItem>
                <CarouselItem className="relative w-full bg-transparent">
                  <Image
                    src="/artist-highlight/nov25/oldhues-15.jpg"
                    alt="The Street Art List - Megan Oldhues @oldhues"
                    loading="eager"
                    width={1920}
                    height={1080}
                    className="h-full w-full object-cover object-[50%_66%] [@media(max-height:620px)]:object-[50%_30%]"
                  />
                </CarouselItem>

                <CarouselItem className="relative w-full bg-transparent">
                  <Image
                    src="/artist-highlight/nov25/oldhues-35.jpg"
                    alt="The Street Art List - Megan Oldhues @oldhues"
                    loading="eager"
                    width={1920}
                    height={1080}
                    className="h-full w-full object-cover object-[50%_51%]"
                  />
                </CarouselItem>

                <CarouselItem className="relative w-full bg-transparent">
                  <Image
                    src="/artist-highlight/nov25/oldhues-3.jpg"
                    alt="The Street Art List - Megan Oldhues @oldhues"
                    loading="eager"
                    width={1920}
                    height={1080}
                    className="h-full w-full object-cover object-[50%_51%]"
                  />
                </CarouselItem>
              </CarouselContent>

              <CarouselPrevious className="bg-transparent text-card hover:bg-card hover:text-foreground/50" />

              <CarouselNext className="bg-transparent text-card hover:bg-card hover:text-foreground/50" />

              <CarouselDots className="md:hidden" />
            </Carousel>
            {/* <Button
              variant="icon"
              onClick={handleVideoToggle}
              className={cn(
                "absolute bottom-[60px] right-8 z-10 hidden !text-sm text-card sm:inline-flex",
                currentSlide !== 1 && "sm:hidden",
              )}
            >
              {paused ? "Play" : "Pause"} Video
            </Button> */}

            <Popover onOpenChange={setPopoverOpen} open={popoverOpen}>
              <PopoverTrigger asChild>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="absolute bottom-5 right-1/2 flex w-max translate-x-1/2 flex-col gap-1 rounded-3xl bg-card px-6 py-2 text-foreground shadow-xl transition-all ease-in-out hover:cursor-pointer hover:bg-salYellowLt sm:right-10 sm:w-auto sm:translate-x-0 sm:px-6"
                >
                  <div className="group flex cursor-pointer flex-col items-center gap-2 sm:flex-row">
                    <span className={cn("flex items-center gap-2")}>
                      <i className={cn("text-base")}>
                        {currentSlide === 0
                          ? "Fireside (2025)"
                          : currentSlide === 1 || currentSlide === 2
                            ? "In Bloom (2023)"
                            : currentSlide === 3
                              ? "Mess Mess Mess (2024)"
                              : "Hua Sheng Supermarket (2023)"}
                      </i>
                      <span
                        className={cn(
                          "block text-xs sm:hidden",
                          currentSlide === 3 && "hidden",
                        )}
                      >
                        |
                      </span>{" "}
                      {currentSlide < 3 && (
                        <span className="font-bold sm:hidden">
                          {/* @oldhues */}
                          Megan Oldhues
                        </span>
                      )}
                    </span>
                    <Separator
                      thickness={2}
                      orientation={isMobile ? "horizontal" : "vertical"}
                      className={cn(
                        "mx-1 h-5",
                        "[@media(max-width:768px)]:hidden",
                      )}
                    />
                    <span
                      className={cn(
                        "flex items-center gap-1 text-sm hover:cursor-pointer group-hover:font-semibold",
                        "[@media(max-width:768px)]:hidden",
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
                </motion.span>
              </PopoverTrigger>
              <PopoverContent className="w-80 border-1.5" align="center">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">More info:</h4>
                    <p className="text-base text-muted-foreground">
                      Megan Oldhues is a Toronto-based painter specializing in
                      large-scale murals
                    </p>
                  </div>
                  <ul className="flex flex-col gap-2 sm:gap-1 [&*svg]:size-4">
                    <li className="flex items-center gap-x-3">
                      <FaInstagram />
                      <Link
                        href="https://instagram.com/oldhues"
                        className="text-base text-muted-foreground"
                        target="_blank"
                      >
                        @oldhues
                      </Link>
                    </li>

                    <li className="flex items-center gap-x-3">
                      <FaGlobe />
                      <Link
                        href="https://oldhues.com"
                        className="text-base text-muted-foreground"
                        target="_blank"
                      >
                        www.oldhues.com
                      </Link>
                    </li>
                    <li className="flex items-center gap-x-3">
                      <FaEnvelope />
                      <Link
                        href="https://www.oldhues.com/contact"
                        className="text-base text-muted-foreground"
                        target="_blank"
                      >
                        Contact
                      </Link>
                    </li>
                  </ul>
                </div>
              </PopoverContent>
            </Popover>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className={cn(
              "absolute bottom-5 left-5 z-10 hidden origin-bottom-left select-none flex-col items-start gap-1 font-tanker lowercase tracking-wide text-card transition-transform duration-700 ease-in-out [text-shadow:0_0_15px_rgba(0,0,0,1)] sm:left-7 sm:flex",

              currentSlide === 1
                ? "sm:scale-[1.2] lg:scale-[1.45] 2xl:scale-[2]"
                : "scale-[.6] lg:scale-100",
            )}
            style={{
              opacity: titleOpacity,
              // transition: "opacity 0.5s ease-in-out",
            }}
          >
            <div
              className={cn(
                "flex flex-col items-start transition-opacity ease-in-out [&_h1]:leading-[0.9]",
              )}
            >
              <h1 className={cn("text-[5.1rem]")}>Megan</h1>
              <h1 className={cn("text-[4rem]")}>Oldhues</h1>
            </div>
            <h2
              className={cn("mt-1 border-t-4 border-card text-center text-4xl")}
            >
              Nov / Dec 2025
            </h2>
          </motion.div>
        </div>

        <div className="relative z-10 bg-background pt-4 sm:pt-10">
          <h1 className="hidden px-4 pb-8 text-center font-tanker text-4xl lg:block">
            artist and organizer resource for everything street art, graffiti,
            and mural-related
          </h1>
          <div className="flex w-screen items-center justify-center gap-3 bg-foreground/90 p-6 font-tanker lowercase text-background">
            <div className="flex w-[clamp(300px,75vw,1500px)] flex-col items-center justify-around gap-3 sm:flex-row">
              <span className="flex flex-col items-center gap-2">
                <p className="text-[3.25em] leading-[3rem]">Currently,</p>
                <p className="text-2xl">on The Street Art List:</p>
              </span>
              <div className="flex w-full items-center justify-around gap-3">
                <span className="flex flex-col items-center gap-2 text-nowrap">
                  <AnimatedCounter
                    to={totalOpenCallsData?.activeOpenCalls ?? 0}
                    className="text-4xl sm:text-5xl md:text-[5em] md:leading-[4rem]"
                  />
                  <p className="font-spaceGrotesk text-sm font-semibold sm:text-base">
                    {" "}
                    Open Calls
                  </p>
                </span>
                <span className="flex flex-col items-center gap-2 text-nowrap">
                  <AnimatedCounter
                    to={
                      1131 +
                      ((totalEventsData?.activeEvents ?? 0) +
                        (totalEventsData?.archivedEvents ?? 0))
                    }
                    className="text-4xl sm:text-5xl md:text-[5em] md:leading-[4rem]"
                    duration={2}
                    plus={false}
                  />
                  <p className="font-spaceGrotesk text-sm font-semibold sm:text-base">
                    {" "}
                    Events & Projects
                  </p>
                </span>
                <span className="flex flex-col items-center gap-2 text-nowrap">
                  <AnimatedCounter
                    to={92}
                    duration={3}
                    className="text-4xl sm:text-5xl md:text-[5em] md:leading-[4rem]"
                  />
                  <p className="font-spaceGrotesk text-sm font-semibold sm:text-base">
                    {" "}
                    Countries
                  </p>
                </span>
              </div>
            </div>
          </div>

          <div
            className="mx-auto mt-10 flex w-full max-w-[clamp(300px,80vw,1000px)] flex-col items-start justify-center gap-2 py-4"
            data-nosnippet
          >
            <span className="inline items-center">
              <strong>The Street Art List&nbsp; </strong> is an initiative
              created and run by&nbsp;
              <Link
                href="https://instagram.com/anthonybrooksart"
                target="_blank"
                className="lg:text-base"
              >
                Anthony Brooks
              </Link>
              , a Serbian-American artist based in Berlin, Germany.
            </span>
            <p>
              {" "}
              The List is the result (years in the making) of my frustration
              with the lack of a centralized place to find open calls and to
              know what&apos;s happening elsewhere in the street art world — a
              real
              <i>
                &quot;If what you want doesn&apos;t exist, create it&quot;&nbsp;
              </i>
              sort of situation. It&apos;s been an ongoing project since 2019,
              and over time, has grown from an extensive spreadsheet to a
              fully-fledged database of street art-related projects and
              events.{" "}
            </p>
          </div>
          {!hasActiveSubscription && <Pricing />}
        </div>
      </section>

      {/* </>
      )} */}
    </>
  );
}
