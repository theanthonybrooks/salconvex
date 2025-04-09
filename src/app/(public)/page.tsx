"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Link } from "@/components/ui/custom-link";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FaEnvelope, FaFacebook, FaGlobe, FaInstagram } from "react-icons/fa6";

// const font = Poppins({ subsets: ["latin"], weight: "600" })

export default function Home() {
  const searchParams = useSearchParams();
  const targetRef = useRef(null);

  const [currentSlide, setCurrentSlide] = useState(1);
  // const { scrollY } = useScroll()
  // const smoothScrollY = useSpring(scrollY, {
  //   stiffness: 100,
  //   damping: 20,
  //   mass: 0.4,
  // })
  // const borderRadius = useTransform(smoothScrollY, [0, 150, 450], [0, 0, 150])

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
    <motion.div ref={targetRef}>
      <motion.div
        initial={{ y: 0, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="relative mt-10 flex h-full flex-col items-center justify-center overflow-hidden rounded-3xl sm:mt-auto"
        style={{
          maxHeight: "calc(100dvh - 8.5rem)",
        }}
      >
        <h1
          className={cn(
            "absolute left-7 top-7 z-10 font-tanker lowercase tracking-wide text-background transition-all duration-700 ease-in-out [text-shadow:0_0_15px_rgba(0,0,0,0.5)]",
            currentSlide === 1 &&
              "text-6xl leading-9 md:text-[6.5rem] md:leading-[7rem] lg:text-[8.5rem] lg:leading-[8.5rem]",
            currentSlide === 2 &&
              "text-4xl lg:text-[8.5rem] lg:leading-[8.5rem]",
            currentSlide === 3 &&
              "text-4xl lg:text-[8.5rem] lg:leading-[8.5rem]",
          )}
        >
          CHUS
        </h1>
        {/* <motion.img
          src="/chus.jpg"
          alt="The Street Art List"
          loading="lazy"
          width={1920}
          height={1080}
          className="min-h-full min-w-full object-cover object-[50%_10%]"

          // style={{
          //   borderBottomLeftRadius: borderRadius,
          //   borderBottomRightRadius: borderRadius,
          // }}
        /> */}
        <Carousel className="h-full w-full">
          <CarouselContent>
            <CarouselItem className="relative w-full">
              <motion.img
                src="/artist-highlight/chus3.jpg"
                alt="The Street Art List"
                loading="lazy"
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
              <motion.img
                src="/artist-highlight/chus2.jpg"
                alt="The Street Art List"
                loading="lazy"
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
              <motion.img
                src="/artist-highlight/chus.jpg"
                alt="The Street Art List"
                loading="lazy"
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

        <Popover>
          <PopoverTrigger asChild>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute bottom-5 left-1/2 z-0 flex w-max -translate-x-1/2 flex-row gap-1 rounded-3xl bg-white px-8 py-2 text-foreground transition-all ease-in-out hover:cursor-pointer hover:bg-yellow-100 sm:left-5 sm:w-auto sm:translate-x-0 sm:px-10"
            >
              <span className="flex items-center gap-2">
                <i className="text-base">Marching Band Mural </i>
                {/* <span className="block sm:hidden">-</span>{" "} */}
                <span className="block text-xs">by</span>{" "}
                <span className="font-bold">CHUS</span>
              </span>
            </motion.span>
          </PopoverTrigger>
          <PopoverContent className="w-80 border-1.5" align="center">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h3 className="font-bold italic">Marching Band Mural</h3>
                <p className="text-sm text-muted-foreground">
                  Pieve Santo Stefano, Tuscany (IT)
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium leading-none">More info:</h4>
                <p className="text-sm text-muted-foreground">
                  Italian artist located in Copenhagen, Denmark
                </p>
              </div>
              <ul>
                <li className="flex items-center gap-x-4">
                  <FaInstagram />
                  <Link
                    href="https://instagram.com/chus.art"
                    className="text-sm text-muted-foreground"
                    target="_blank"
                  >
                    @chus.art
                  </Link>
                </li>
                <li className="flex items-center gap-x-4">
                  <FaFacebook />
                  <Link
                    href="https://www.facebook.com/mattiachus"
                    className="text-sm text-muted-foreground"
                    target="_blank"
                  >
                    @mattiachus
                  </Link>
                </li>
                <li className="flex items-center gap-x-4">
                  <FaGlobe />
                  <Link
                    href="https://chus.it"
                    className="text-sm text-muted-foreground"
                    target="_blank"
                  >
                    www.chus.it
                  </Link>
                </li>
                <li className="flex items-center gap-x-4">
                  <FaEnvelope />
                  <Link
                    href="mailto:mattia.chus@gmail.com"
                    className="text-sm text-muted-foreground"
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
    </motion.div>
  );
}
