"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { FaEnvelope, FaGlobe, FaInstagram } from "react-icons/fa6";

// const font = Poppins({ subsets: ["latin"], weight: "600" })

export default function Home() {
  const searchParams = useSearchParams();
  const targetRef = useRef(null);
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

  return (
    <motion.div ref={targetRef}>
      <motion.div
        initial={{ y: 0, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="relative flex h-full flex-col items-center justify-center overflow-hidden rounded-3xl"
        style={{
          maxHeight: "calc(100dvh - 8.5rem)",
        }}
      >
        <motion.img
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
        />
        <Popover>
          <PopoverTrigger asChild>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute bottom-5 left-5 flex flex-row gap-1 rounded-3xl bg-white px-10 py-2 text-foreground hover:cursor-pointer"
            >
              <span>
                <i className="text-base">Silent Rhythm </i> by{" "}
                <span className="font-bold">Anthony Brooks</span>
              </span>
            </motion.span>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h3 className="font-bold italic">Artwork Name</h3>
                <p className="text-sm text-muted-foreground">
                  Painted in 2024 for event/project name.
                  Description/size/materials/etc.
                </p>
                <h4 className="font-medium leading-none">More info:</h4>
                <p className="text-sm text-muted-foreground">
                  Artist located in Copenhagen, Denmark
                </p>
              </div>
              <ul>
                <li className="flex items-center gap-x-4">
                  <FaInstagram />{" "}
                  <a
                    href="https://instagram.com/anthonybrooksart"
                    className="text-sm text-muted-foreground underline-offset-2 hover:underline"
                  >
                    @anthonybrooksart
                  </a>
                </li>
                <li className="flex items-center gap-x-4">
                  <FaGlobe />
                  <a
                    href="https://anthonybrooksart.com"
                    className="text-sm text-muted-foreground underline-offset-2 hover:underline"
                  >
                    anthonybrooksart.com
                  </a>
                </li>
                <li className="flex items-center gap-x-4">
                  <FaEnvelope />
                  <a
                    href="mailto:info@thestreetartlist.com"
                    className="text-sm text-muted-foreground underline-offset-2 hover:underline"
                  >
                    info@thestreetartlist.com
                  </a>
                </li>
              </ul>
            </div>
          </PopoverContent>
        </Popover>
      </motion.div>
    </motion.div>
  );
}
