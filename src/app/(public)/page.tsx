"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { FaEnvelope, FaFacebook, FaGlobe, FaInstagram } from "react-icons/fa6";

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
        className="relative mt-10 flex h-full flex-col items-center justify-center overflow-hidden rounded-3xl sm:mt-auto"
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
                  Painted in Pieve Santo Stefano, Tuscany (Italy)
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
                    href="https://instagram.com/chus.art"
                    className="text-sm text-muted-foreground underline-offset-2 hover:underline"
                  >
                    @chus.art
                  </a>
                </li>
                <li className="flex items-center gap-x-4">
                  <FaFacebook />{" "}
                  <a
                    href="https://www.facebook.com/mattiachus"
                    className="text-sm text-muted-foreground underline-offset-2 hover:underline"
                  >
                    @mattiachus
                  </a>
                </li>
                <li className="flex items-center gap-x-4">
                  <FaGlobe />
                  <a
                    href="https://chus.it"
                    className="text-sm text-muted-foreground underline-offset-2 hover:underline"
                  >
                    www.chus.it
                  </a>
                </li>
                <li className="flex items-center gap-x-4">
                  <FaEnvelope />
                  <a
                    href="mailto:mattia.chus@gmail.com"
                    className="text-sm text-muted-foreground underline-offset-2 hover:underline"
                  >
                    mattia.chus@gmail.com
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
