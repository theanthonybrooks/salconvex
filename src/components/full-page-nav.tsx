"use client";

import MenuToggle from "@/components/ui/hamburger-icon";
import { Separator } from "@/components/ui/separator";
import SocialsRow from "@/components/ui/socials";
import ThemeToggle from "@/components/ui/theme-toggle";
import { mainMenuItems } from "@/constants/menu";
import { footerCRText } from "@/constants/text";
import SignOutBtn from "@/features/auth/components/sign-out-btn";
import { cn } from "@/lib/utils";
import { User } from "@/types/user";
import { Authenticated, Unauthenticated } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { PiHeartBold } from "react-icons/pi";

interface FullPageNavProps {
  // userId?: string | undefined
  isScrolled?: boolean;
  user?: User | null;
  isMobile?: boolean;
  // className?: string
  isDashboard?: boolean;
  // userPref?: UserPref | null
  // subStatus?: string | undefined
}

const menuVariants = {
  open: {
    width: [0, "100vw", "100vw", "100vw"],
    height: [60, 80, "50vw", "100vh"],
    top: [17, 0, 0, 0],
    right: [41, 0, 0, 0],
    borderRadius: [40, 40, 20, 0],
    transition: {
      duration: 0.75,
      ease: [0.1, 0, 0.36, 1],
      times: [0, 0.2, 0.6, 1],
    },
    opacity: [0, 1, 1, 1],
  },
  // closed: {
  //   width: ["100vw", "100vw", 0],
  //   height: ["100vh", 40, 40],
  //   top: [0, 17, 17],
  //   right: [0, 0, 41],
  //   borderRadius: [0, 20, 40],
  //   // transition: { duration: 0.75, ease: [0.83, 0, 0.1, 1] },
  //   transition: {
  //     duration: 0.75,
  //     ease: [0.68, -0.55, 0.27, 1.55],
  //     // ease: [0.1, 0, 0.36, 1],
  //     times: [0, 0.2, 1],
  //   },

  //   opacity: [1, 1, 0],
  // },
  closed: {
    width: ["100vw", "100vw", "100vw", 0, 0], // Shrinks width last
    height: ["100vh", "100vh", 60, 60, 60], // Shrinks height first
    top: [0, 0, 17, 17, 17],
    right: [0, 0, 0, 41, 41],
    borderRadius: [0, 20, 40, 40, 40],

    transition: {
      duration: 0.75,
      ease: [0.68, -0.55, 0.27, 1.55],
      times: [0, 0.2, 0.4, 0.9, 1], // Keeps width large longer before snapping shut
    },

    // ✨ Keep opacity at 1 until the last moment ✨
    opacity: [1, 1, 1, 1, 0], // Only fades at the very end
  },

  initial: {
    width: [0],
    height: [0],
    top: [17],
    right: [35],
    borderRadius: [40],
    transition: { duration: 0, ease: [0.76, 0, 0.24, 1] },
    opacity: [0],
  },
};

const getMobileMenuVariants = (isScrolled: boolean | undefined) => ({
  open: {
    width: ["4em", "100vw", "100vw", "100vw"],
    height: isScrolled
      ? ["40px", "80px", "80px", "100vh"]
      : ["40px", "100px", "100px", "100vh"],
    top: isScrolled ? [17, 0, 0, 0] : [20, 0, 0, 0],
    right: [41, 0, 0, 0],
    borderRadius: [40, 40, 20, 0],
    transition: {
      duration: 1,
      ease: [0.5, 1, 0.56, 0.81],
      times: [0, 0.2, 0.4, 1],
    },
    opacity: [1, 1, 1, 1],
  },
  closed: {
    width: "100vw",
    height: 0,
    top: 0,
    right: 0,
    borderRadius: 0,
    opacity: 1,
    transition: {
      duration: 0.75,
      ease: [0.6, 0.05, 0.1, 1],
      type: "spring",
      stiffness: 120,
      damping: 20,
    },
  },
  mobileInitial: {
    width: [0],
    height: [0],
    top: [20],
    right: [35],
    borderRadius: [40],
    transition: { duration: 0, ease: [0.76, 0, 0.24, 1] },
    opacity: [0],
  },
});

// const mobileMenuVariants = {
//   open: {
//     width: ["4em", "100vw", "100vw", "100vw"],
//     // height: [40, 100, 100, 100, "100vh"],
//     height: ["40px", "100px", "100px", "100vh"],
//     // transform: ["translateX(0)"],
//     top: [17, 0, 0, 0],
//     right: [41, 0, 0, 0],
//     borderRadius: [40, 40, 20, 0],
//     transition: {
//       duration: 1,
//       ease: [0.5, 1, 0.56, 0.81],
//       times: [0, 0.2, 0.4, 1],
//     },
//     opacity: [1, 1, 1, 1],
//   },
//   // closed: {
//   //   width: ["100vw", "99vw", "98vw", "4em"],
//   //   height: ["100vh", 40, 40, 39],
//   //   top: [0, 17, 17, 17],
//   //   right: [0, 0, 41, 41],
//   //   borderRadius: [0, 20, 40, 40],
//   //   // transition: { duration: 0.75, ease: [0.83, 0, 0.1, 1] },
//   //   transition: { duration: 0.75, ease: [0.68, -0.55, 0.27, 1.55] },

//   //   opacity: [1, 1, 1, 1],
//   // },
//   // closed: {
//   //   width: ["100vw", "100vw", "100vw", "100vw", "4em"],
//   //   height: ["100vh", "75vh", "50vh", "25vh", "40px"], // More gradual reduction
//   //   top: [0, 0, 0, 0, 17],
//   //   right: [0, 0, 0, 0, 41],
//   //   borderRadius: [0, 0, 20, 40, 40],
//   //   opacity: [1, 1, 1, 1, 1],

//   //   transition: { duration: 1.25, ease: [0.6, 0.05, 0.1, 1] }, // Smoother curve
//   // },

//   closed: {
//     width: "100vw",
//     height: 0,
//     top: 0,
//     right: 0,
//     borderRadius: 0,
//     opacity: 1,
//     transition: {
//       duration: 0.75,
//       ease: [0.6, 0.05, 0.1, 1],
//       type: "spring",
//       stiffness: 120, // Adjust this for bounciness
//       damping: 20, // Smooths the stop at the final height
//     },
//   },

//   // closed: {
//   //   width: ["100vw"],
//   //   height: ["100px"],
//   //   top: [0],
//   //   right: [0],
//   //   // transform: ["translateX(-50%)"],
//   //   borderRadius: [0],
//   //   opacity: [1],

//   //   // transition: { duration: 0.75, ease: [0.83, 0, 0.1, 1] },
//   //   transition: { duration: 1.25, ease: [0.5, 1, 0.56, 0.81] },
//   // },
//   mobileInitial: {
//     width: [0],
//     height: [0],
//     top: [20],
//     right: [35],
//     borderRadius: [40],
//     transition: { duration: 0, ease: [0.76, 0, 0.24, 1] },
//     opacity: [0],
//   },
// }
const mobileTextVariants = {
  open: {
    opacity: 1,

    height: "100%",
    transition: {
      delay: 0.4,
      duration: 0.6,
      ease: "easeInOut",
    },
  },
  closed: {
    opacity: 0,

    height: 0,
    transition: {
      duration: 0.4,
      ease: "easeInOut",
    },
  },
};

const mobileImageVariants = {
  open: {
    opacity: 1,
    transition: { duration: 0.75, ease: "easeInOut" },
  },
  closed: {
    opacity: 0,

    transition: { duration: 0.3, ease: "easeInOut" },
  },
};

// const mobileHeaderVariants = {
//   open: {
//     display: "block",

//     transition: { duration: 0.75, ease: "easeInOut" },
//   },
//   closed: {
//     display: "none",

//     transition: { duration: 0.3, ease: "easeInOut" },
//   },
// }

const screenOverlayVariants = {
  overlayInitial: {
    display: "none",
    opacity: 0,
    height: "100vh",
    width: "100vw",
  },
  open: {
    display: ["block", "block", "block"],
    opacity: [1, 1, 1],
    height: ["100vh", "100vh", "100vh"],
    width: ["100vw", "100vw", "100vw"],
    transition: { duration: 0.75, ease: [0.83, 0, 0.1, 1] },
  },
  closed: {
    display: ["block", "block", "none"],
    opacity: [1, 1, 0],
    height: ["100vh", "100vh", "100vh"],
    width: ["100vw", "100vw", "100vw"],
    transition: { duration: 1.15, ease: [0.68, -0.55, 0.27, 1.55] },
  },
};

const FullPageNav = ({
  user,
  isScrolled,
  isMobile = false,
  isDashboard = false,
}: FullPageNavProps) => {
  const footerText = footerCRText();
  // const { theme } = useTheme()
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState("initial");
  const [freshOpen, setFreshOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(
    mainMenuItems.find((section) =>
      section.items.some((item) => item.path === pathname),
    )?.title || "The List",
  );
  const activeMenuItems = mainMenuItems.find(
    (section) => section.title === activeCategory,
  );

  const isPricingPage = pathname.startsWith("/pricing");

  useEffect(() => {
    if (isOpen === "open") {
      setFreshOpen(true);
      document.body.classList.add("no-scroll");
      setActiveCategory(
        () =>
          mainMenuItems.find((section) =>
            section.items.some((item) => item.path === pathname),
          )?.title || "The List",
      );
    } else {
      document.body.classList.remove("no-scroll");
      setActiveCategory("");
      setFreshOpen(false);
    }
    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, [isOpen, pathname]);

  const onHandleLinkClick = () => {
    setTimeout(() => {
      setIsOpen("closed");
    }, 750);
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial="overlayInitial"
          variants={screenOverlayVariants}
          animate={isOpen}
          className="absolute right-0 top-0 h-dvh w-screen origin-top-right bg-foreground/20 backdrop-blur-md"
        />
      </AnimatePresence>

      {/* Menu Button + Theme Toggle*/}
      <div
        className={cn(
          "z-20 flex flex-row items-center justify-between gap-x-4",
        )}
      >
        {/* <ThemeToggle userPref={themePref} /> */}

        {/* //NOTE: Add sliding up animation later; will require making a button
          lookalike with two divs/spans inside that move up and down and have an
          overflow of hidden */}
        <AnimatePresence>
          {isOpen === "open" && (
            <>
              <motion.section
                initial={{ opacity: 0 }}
                variants={mobileImageVariants}
                animate={isOpen}
                transition={{ duration: 0.25, ease: [0.83, 0, 0.1, 1] }}
                className={cn("absolute left-5 top-5 md:hidden")}
              >
                <Link href="/">
                  <Image
                    src="/logotransparency.png"
                    alt="The Street Art List"
                    width={isScrolled || isDashboard ? 40 : 60}
                    height={isScrolled || isDashboard ? 40 : 60}
                    priority={true}
                  />
                </Link>
              </motion.section>
              <ThemeToggle />
            </>
          )}
        </AnimatePresence>
        <div className="flex items-center gap-x-4">
          <MenuToggle
            menuState={isOpen === "initial" ? "closed" : isOpen}
            setState={setIsOpen}
          />
        </div>
        {/* <Button
            variant='salWithShadowHidden'
            onClick={() =>
              setIsOpen(
                isOpen === "initial"
                  ? "open"
                  : isOpen === "open"
                  ? "closed"
                  : "open"
              )
            }
            className={cn(
              "w-[6em] bg-background font-bold",
              isOpen === "open" ? "bg-salPink" : "bg-background"
            )}>
            {isOpen === "open" ? "CLOSE" : "MENU"}
          </Button> */}
      </div>

      {/* /~ Fullscreen Menu Overlay ~/ */}
      <AnimatePresence>
        {/* Expanding content */}
        {/* *
         *
         *
         *
         * */}
        {/* //---------------------- Block/Flex? (Mobile) Layout ---------------------- */}
        {/* *
         *
         *
         *
         * */}

        <motion.div
          id="mobile-menu"
          key="mobile-menu"
          className={cn(
            "fixed right-5 top-5 box-border h-full w-full bg-background xl:hidden",
          )}
          variants={getMobileMenuVariants(isScrolled)}
          animate={isOpen}
          initial="mobileInitial"
          exit="mobileInitial"
          // initial={{ width: "4em", height: 30 }}
        >
          <motion.div
            initial={{ display: "none" }}
            animate={
              isOpen === "open" ? { display: "grid" } : { display: "none" }
            }
            transition={{
              delay: 0.2,
              duration: 0.75,
              ease: [0.83, 0, 0.1, 1],
            }}
            className={cn(
              "grid h-dvh w-screen grid-cols-1",
              isScrolled || isDashboard
                ? "grid-rows-[80px_auto]"
                : "grid-rows-[100px_auto]",
            )}
          >
            {/* <motion.section
              initial={{ display: "none" }}
              variants={mobileHeaderVariants}
              animate={isOpen}
              transition={{ duration: 0.25, ease: [0.83, 0, 0.1, 1] }}
              className='w-full border-b-2 border-foreground '
            /> */}
            <AnimatePresence mode="wait">
              {isOpen === "open" && (
                <motion.section
                  key="border"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.83, 0, 0.1, 1] }}
                  className="relative w-full"
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    exit={{ width: 0 }}
                    transition={{ duration: 0.4, ease: [0.83, 0, 0.1, 1] }}
                    className="absolute bottom-0 right-0 h-[1.5px] bg-foreground"
                  />
                </motion.section>
              )}
            </AnimatePresence>

            <motion.div
              className="scrollable invis flex h-full w-full flex-col justify-start"
              initial={{ opacity: 0, height: 0 }}
              variants={mobileTextVariants}
              animate={isOpen}
              // exit={{
              //   opacity: 0,
              //   y: 20,
              //   height: 0,
              // }}
            >
              <ul
                className={cn(
                  "font-foreground m-x-auto w-full font-tanker text-[4rem] lowercase",
                )}
              >
                {mainMenuItems.map((section) => {
                  const isExpanded =
                    activeCategory === section.title && !freshOpen;
                  const filteredItems = section.items.filter((item) => {
                    const itemUserType = item?.userType;
                    const isPublic = itemUserType?.includes("public");
                    const typeMatch = user?.accountType?.some((type) =>
                      itemUserType?.some(
                        (userType) =>
                          userType.toLowerCase() === type.toLowerCase(),
                      ),
                    );

                    return isPublic || typeMatch;
                  });

                  if (filteredItems.length === 0) return null;

                  return (
                    <li
                      key={`${section.title}-mobileCat`}
                      className="w-full border-b-2 border-foreground"
                    >
                      <div
                        onClick={() => {
                          return (
                            setFreshOpen(false),
                            setActiveCategory(isExpanded ? null : section.title)
                          );
                        }}
                        className={cn(
                          "flex cursor-pointer justify-start px-9 py-4",
                          activeCategory === section.title &&
                            "bg-foreground text-background unstroked",
                          // activeCategory === section.title &&
                          //   theme === "default" &&
                          //   "text-white",
                          // activeCategory === section.title &&
                          //   theme === "light" &&
                          //   "text-salYellow"
                        )}
                      >
                        {section.title}
                      </div>

                      {/* Animate the dropdown items */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{
                              duration: 0.4,
                              ease: "easeInOut",
                            }}
                            className="overflow-hidden pl-6 text-[2.5rem]"
                          >
                            <ul>
                              {filteredItems
                                .filter(
                                  (item) =>
                                    !(pathname === "/" && item.path === "/"),
                                )

                                .map((item) => (
                                  <li
                                    key={`${item.title}-${item.category}-mobileItem`}
                                    className="pl-4"
                                  >
                                    <Link
                                      href={item.path}
                                      onClick={onHandleLinkClick}
                                      className={cn(
                                        "block cursor-pointer py-2 transition-all duration-200 ease-in-out focus:underline focus:decoration-[5px] focus:underline-offset-4",
                                        pathname === item.path &&
                                          "text-foreground underline decoration-[6px] underline-offset-4",
                                        // item.path.includes("dashboard") &&
                                        //   "text-salPink"
                                      )}
                                    >
                                      {item.title}
                                    </Link>
                                  </li>
                                ))}
                            </ul>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </li>
                  );
                })}
              </ul>
              <Unauthenticated>
                {!isPricingPage && (
                  <div
                    className={cn(
                      "font-foreground m-x-auto w-full border-b-2 border-foreground py-5 pl-8 font-tanker text-[4rem] lowercase",
                    )}
                  >
                    <Link
                      onClick={onHandleLinkClick}
                      href={"/pricing"}
                      className="focus:underline focus:decoration-[5px] focus:underline-offset-4 active:underline active:decoration-[5px] active:underline-offset-4"
                    >
                      Pricing
                    </Link>
                  </div>
                )}
                <div
                  className={cn(
                    "font-foreground m-x-auto w-full border-b-2 border-foreground py-6 pl-8 font-tanker text-[3rem] lowercase",
                  )}
                >
                  <Link
                    onClick={onHandleLinkClick}
                    href={"/auth/sign-in"}
                    className="focus:underline focus:decoration-[5px] focus:underline-offset-4 active:underline active:decoration-[5px] active:underline-offset-4"
                  >
                    Login | Register
                  </Link>
                </div>
              </Unauthenticated>
              <Authenticated>
                <SignOutBtn>
                  <div
                    onClick={() => {
                      setTimeout(() => setIsOpen("closed"), 1000);
                    }}
                    className={cn(
                      "font-foreground m-x-auto w-full py-6 pl-8 font-tanker text-[3rem] lowercase",
                    )}
                  >
                    log out
                  </div>
                </SignOutBtn>
              </Authenticated>
              <motion.div
                // className=' h-[55px] flex flex-col col-span-3 border-t-1.5 border-foreground text-foreground w-full'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1, duration: 0.4 }}
                className="flex flex-col items-center justify-center space-y-5 py-6"
              >
                <SocialsRow />
                <div className="flex items-center space-x-1 text-sm">
                  <p className="inline-flex items-center gap-x-1">
                    Made with <PiHeartBold className="size-4" /> by
                  </p>
                  <Link
                    href="https://theanthonybrooks.com"
                    target="_blank"
                    className="m-0 cursor-pointer p-0 decoration-foreground hover:underline hover:underline-offset-2 focus:underline focus:decoration-foreground focus:decoration-2 focus-visible:underline-offset-2"
                  >
                    Anthony Brooks
                  </Link>
                </div>
                {footerText.text}
              </motion.div>
            </motion.div>
            {/* Fixed Bottom Row */}
          </motion.div>
        </motion.div>

        {/* *
         *
         *
         *
         * */}
        {/* //---------------------- Grid (Desktop) Layout ---------------------- */}
        {/* *
         *
         *
         *
         * */}
        {!isMobile && (
          <motion.div
            key="desktop-menu"
            className={cn(
              "fixed right-5 top-5 box-border hidden h-dvh w-full bg-background xl:block",
              isOpen === "open" || isOpen === "closed"
                ? "bg-background"
                : "bg-none",
              "bg-background",
            )}
            variants={menuVariants}
            initial="initial"
            // initial={{ width: "4em", height: 30 }}
            animate={isOpen}
            exit="initial"
          >
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "100%" }}
              transition={{ duration: 0.4, ease: "easeInOut", delay: 0.6 }}
              className="grid-row-1 hidden h-full w-full md:grid md:grid-rows-[auto_70px]"
            >
              {isOpen === "open" && (
                <>
                  <div className="row-span-1 grid w-screen grid-cols-1 divide-x-1.5 divide-solid divide-foreground overflow-hidden px-5 md:grid-cols-3">
                    {/* Column 1 - Main Titles */}
                    <motion.div
                      className="scrollable mini darkbar flex items-start justify-center p-4 py-8"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7, duration: 0.4 }}
                    >
                      <ul
                        className={cn(
                          "font-foreground m-auto space-y-3 text-[3rem] lg:text-[4.5rem] 3xl:text-[6rem]",
                          "select-none font-tanker lowercase",
                        )}
                      >
                        {mainMenuItems.map((section) => {
                          const filteredItems = section.items.filter((item) => {
                            const itemUserType = item?.userType;
                            const isPublic = itemUserType?.includes("public");
                            const typeMatch = user?.accountType?.some((type) =>
                              itemUserType?.some(
                                (userType) =>
                                  userType.toLowerCase() === type.toLowerCase(),
                              ),
                            );

                            return isPublic || typeMatch;
                          });

                          if (filteredItems.length === 0) return null;

                          return (
                            <li
                              key={`${section.title}-desktopCat`}
                              className="cursor-pointer"
                            >
                              <div
                                onClick={() => setActiveCategory(section.title)}
                                className={cn(
                                  "cursor-pointer transition-transform duration-300 ease-in-out hover:translate-x-3",
                                  activeCategory === section.title &&
                                    "text-white stroked wshadow",
                                  // activeCategory === section.title &&
                                  //   theme === "default" &&
                                  //   "text-white",
                                  // activeCategory === section.title &&
                                  //   theme === "light" &&
                                  //   "text-white"
                                )}
                              >
                                {/* {activeCategory === section.title && (
                                      <GoDotFill className='text-foreground size-8 md:size-14' />
                                    )} */}
                                {section.title}
                              </div>
                            </li>
                          );
                        })}
                        {!user && (
                          <Link onClick={onHandleLinkClick} href={"/pricing"}>
                            Pricing
                          </Link>
                        )}
                      </ul>
                    </motion.div>

                    {/* Column 2 - Secondary Titles */}
                    <motion.div
                      className="scrollable mini darkbar flex items-start justify-center p-4 py-8"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9, duration: 0.4 }}
                    >
                      <ul className="font-foreground m-auto select-none space-y-3 font-tanker text-[1.2rem] lowercase lg:text-[3rem] 3xl:text-[5rem]">
                        {activeMenuItems?.items
                          .filter((item) => {
                            const itemUserType = item?.userType;
                            const isPublic = itemUserType?.includes("public");
                            const typeMatch = user?.accountType?.some((type) =>
                              itemUserType?.some(
                                (userType) =>
                                  userType.toLowerCase() === type.toLowerCase(),
                              ),
                            );

                            return isPublic || typeMatch;
                          })
                          .map((item) => (
                            <li
                              key={`${item.title}-${item.category}-desktopItem`}
                            >
                              <div
                                className={cn(
                                  "cursor-pointer transition-all duration-100 ease-in-out hover:translate-x-2",
                                  pathname === item.path && "text-background",
                                  // item.path.includes("dashboard") &&
                                  //   "text-salPink"
                                )}
                              >
                                <Link
                                  onClick={onHandleLinkClick}
                                  href={item.path}
                                  className={cn(
                                    "cursor-pointer",
                                    pathname === item.path &&
                                      "decoration-6 translate-x-2 text-foreground underline underline-offset-4",
                                    // item.path.includes("dashboard") &&
                                    //   "text-salPink"
                                  )}
                                >
                                  {item.title}
                                </Link>
                              </div>
                            </li>
                          ))}
                      </ul>
                    </motion.div>

                    {/* Column 3 */}
                    <motion.div
                      className="flex flex-col items-center justify-end gap-y-4 p-4 pb-8"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.1, duration: 0.4 }}
                    >
                      <div className="scrollable mini flex h-[30%] w-[80%] flex-col rounded-lg border-1.5 border-dotted border-foreground p-8">
                        <p>User Notifications</p>
                        <Separator />
                        <p className="text-sm italic">
                          Nothing to see here yet
                        </p>
                      </div>
                      <div className="flex h-[50%] w-[80%] flex-col rounded-lg border-1.5 border-dotted border-foreground p-8">
                        <p>Applications</p>
                        <Separator className="mb-2" />
                        <ol className="flex flex-col gap-y-3">
                          <li className="flex gap-x-4 text-emerald-500">
                            <p className="text-sm">Blah Event</p> -{" "}
                            <span className="flex gap-x-2 text-sm">
                              <CheckCircle />
                              Accepted
                            </span>
                            <span className="flex gap-x-2 text-sm">
                              1-25-2025
                            </span>
                          </li>
                          <li className="flex gap-x-4 text-emerald-500">
                            <p className="text-sm">Blah Event</p> -{" "}
                            <span className="flex gap-x-2 text-sm">
                              <CheckCircle />
                              Accepted
                            </span>
                            <span className="flex gap-x-2 text-sm">
                              1-16-2025
                            </span>
                          </li>
                          <li className="flex gap-x-4 text-red-500">
                            <p className="text-sm">Blah Event</p> -{" "}
                            <span className="flex gap-x-2 text-sm">
                              <XCircle />
                              Rejected
                            </span>
                            <span className="flex gap-x-2 text-sm">
                              1-8-2025
                            </span>
                          </li>
                          <li className="flex gap-x-4 text-red-500">
                            <p className="text-sm">Blah Event</p> -{" "}
                            <span className="flex gap-x-2 text-sm">
                              <XCircle />
                              Rejected
                            </span>
                            <span className="flex gap-x-2 text-sm">
                              1-2-2025
                            </span>
                          </li>
                        </ol>
                      </div>
                    </motion.div>
                  </div>

                  {/* Fixed Bottom Row */}
                  <motion.div
                    className="col-span-3 row-span-1 flex items-center justify-between border-t-1.5 border-foreground px-8 text-foreground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9, duration: 0.4 }}
                  >
                    <div className="flex items-center space-x-2">
                      <SocialsRow size={7} />
                    </div>
                    <div className="flex items-center space-x-1 text-sm">
                      <p className="inline-flex items-center gap-x-1">
                        Made with <PiHeartBold className="size-4" /> by
                      </p>
                      <Link
                        href="https://theanthonybrooks.com"
                        target="_blank"
                        className="cursor-pointer decoration-foreground hover:underline hover:underline-offset-2 focus:underline focus:decoration-foreground focus:decoration-2 focus-visible:underline-offset-2"
                      >
                        Anthony Brooks
                      </Link>
                    </div>
                    <div className="flex items-center gap-x-2 text-center text-sm text-foreground">
                      {footerText.text}
                      <Image
                        src="/logotransparency.png"
                        alt="The Street Art List"
                        width={40}
                        height={40}
                        className=""
                        priority={true}
                      />
                    </div>
                  </motion.div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FullPageNav;
