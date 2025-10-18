"use client";

import { cn } from "@/helpers/utilsFns";
import { User, UserPref } from "@/types/user";
import { motion as m, Variants } from "framer-motion";
import { useTheme } from "next-themes";

interface ThemeToggleProps {
  className?: string;
  user: User | null;
  userPref: UserPref | null;
}

export default function ThemeToggle({
  className,
  user,
  // userPref,
}: ThemeToggleProps) {
  const { setTheme, theme } = useTheme();
  const isAdmin = user?.role?.includes("admin");

  const handleClick = async (nextTheme: string) => {
    setTheme(nextTheme);
  };

  const raysVariants = {
    hidden: {
      strokeOpacity: 0,
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
    visible: {
      strokeOpacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const rayVariant: Variants = {
    hidden: {
      pathLength: 0,
      opacity: 0,
      scale: 0,
    },
    visible: {
      pathLength: 2,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        pathLength: { duration: 0.3 },
        opacity: { duration: 0.2 },
        scale: { duration: 0.3 },
      },
    },
  };

  const sunPath =
    "M70 49.5C70 60.8218 60.8218 70 49.5 70C38.1782 70 29 60.8218 29 49.5C29 38.1782 38.1782 29 49.5 29C60 29 69.5 38 70 49.5Z";
  const moonPath =
    "M70 49.5C70 60.8218 60.8218 70 49.5 70C38.1782 70 29 60.8218 29 49.5C29 38.1782 38.1782 29 49.5 29C39 45 49.5 59.5 70 49.5Z";

  return (
    <div className="flex items-center justify-center">
      <div
        className={cn(className, "cursor-pointer active:scale-90")}
        onClick={() => {
          let nextTheme: string;
          if (theme === "default") nextTheme = "light";
          else if (theme === "light") nextTheme = "white";
          else if (theme === "white" && isAdmin) nextTheme = "dark";
          else nextTheme = "default";
          handleClick(nextTheme);
        }}
      >
        <m.svg
          strokeWidth="4"
          strokeLinecap="round"
          width={30}
          height={30}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative size-[30px] overflow-visible md:size-7"
        >
          <m.g
            variants={raysVariants}
            initial="hidden"
            animate={theme === "default" ? "visible" : "hidden"}
            className="stroke-6 stroke-foreground"
            style={{ strokeLinecap: "round", strokeWidth: 8 }}
          >
            <m.path
              className="origin-center"
              variants={rayVariant}
              d="M50 2V11"
            />
            <m.path variants={rayVariant} d="M85 15L78 22" />
            <m.path variants={rayVariant} d="M98 50H89" />
            <m.path variants={rayVariant} d="M85 85L78 78" />
            <m.path variants={rayVariant} d="M50 98V89" />
            <m.path variants={rayVariant} d="M23 78L16 84" />
            <m.path variants={rayVariant} d="M11 50H2" />
            <m.path variants={rayVariant} d="M23 23L16 16" />
          </m.g>

          <m.path
            d={sunPath}
            fill="transparent"
            transition={{ duration: 1, type: "spring" }}
            initial={{
              d: sunPath,
              fillOpacity: 0,
              strokeOpacity: 0,
              transformOrigin: "50% 50%",
              strokeWidth: 6,
            }}
            animate={
              theme === "dark"
                ? {
                    d: moonPath,
                    rotate: -360,
                    strokeWidth: 3,
                    stroke: "var(--foreground-hex)",
                    fill: "transparent",
                    fillOpacity: 0.35,
                    strokeOpacity: 1,

                    scale: 2.25,
                  }
                : theme === "default"
                  ? {
                      d: sunPath,
                      rotate: 0,
                      strokeWidth: 6,
                      stroke: "var(--foreground-hex)",
                      fill: "transparent",
                      fillOpacity: 0.35,
                      strokeOpacity: 1,

                      scale: 1,
                    }
                  : theme === "light"
                    ? {
                        d: sunPath,
                        rotate: 0,
                        strokeWidth: 4,
                        stroke: "var(--foreground-hex)",
                        fill: "transparent",
                        fillOpacity: 0.35,
                        strokeOpacity: 1,

                        scale: 2.3,
                      }
                    : {
                        d: sunPath,
                        rotate: 0,
                        strokeWidth: 6,
                        stroke: "var(--foreground-hex)",
                        fill: "transparent",
                        fillOpacity: 0.35,
                        strokeOpacity: 1,

                        scale: 1,
                      }
            }
          />
        </m.svg>
      </div>
    </div>
  );
}
