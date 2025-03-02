"use client"

import { Button } from "@/components/ui/button"
import { motion as m } from "framer-motion"
import { useTheme } from "next-themes"

export default function ThemeToggle() {
  const { setTheme, theme } = useTheme()

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
  }

  const rayVariant = {
    hidden: {
      pathLength: 0,
      opacity: 0,
      scale: 0,
    },
    visible: {
      pathLength: 1,
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
  }

  const shineVariant = {
    hidden: {
      opacity: 0,
      scale: 1.75,
      strokeDasharray: "20, 1000",
      strokeDashoffset: 0,
      filter: "blur(0px)",
    },
    visible: {
      opacity: [0, 1, 0],
      strokeDashoffset: [0, -50, -100],
      filter: ["blur(2px)", "blur(2px)", "blur(0px)"],
      transition: {
        duration: 0.75,
        ease: "linear",
      },
    },
  }

  const sunPath =
    "M70 49.5C70 60.8218 60.8218 70 49.5 70C38.1782 70 29 60.8218 29 49.5C29 38.1782 38.1782 29 49.5 29C60 29 69.5 38 70 49.5Z"
  const moonPath =
    "M70 49.5C70 60.8218 60.8218 70 49.5 70C38.1782 70 29 60.8218 29 49.5C29 38.1782 38.1782 29 49.5 29C39 45 49.5 59.5 70 49.5Z"

  return (
    <div className='flex items-center justify-center'>
      <Button
        variant='ghost2'
        onClick={() =>
          theme === "saltheme" ? setTheme("light") : setTheme("saltheme")
        }>
        <m.svg
          strokeWidth='4'
          strokeLinecap='round'
          width={25}
          height={25}
          viewBox='0 0 100 100'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
          className='relative'>
          <m.path
            variants={shineVariant}
            d={moonPath}
            className={"stroke-blue-100"}
            initial='hidden'
            animate={theme === "saltheme" ? "visible" : "hidden"}
          />

          <m.g
            variants={raysVariants}
            initial='hidden'
            animate={theme === "light" ? "visible" : "hidden"}
            className='stroke-6 stroke-yellow-600'
            style={{ strokeLinecap: "round", strokeWidth: 8 }}>
            <m.path
              className='origin-center'
              variants={rayVariant}
              d='M50 2V11'
            />
            <m.path variants={rayVariant} d='M85 15L78 22' />
            <m.path variants={rayVariant} d='M98 50H89' />
            <m.path variants={rayVariant} d='M85 85L78 78' />
            <m.path variants={rayVariant} d='M50 98V89' />
            <m.path variants={rayVariant} d='M23 78L16 84' />
            <m.path variants={rayVariant} d='M11 50H2' />
            <m.path variants={rayVariant} d='M23 23L16 16' />
          </m.g>

          <m.path
            d={sunPath} // Set a default d attribute
            fill='transparent'
            transition={{ duration: 1, type: "spring" }}
            initial={{
              d: sunPath, // Ensure an initial valid path
              fillOpacity: 0,
              strokeOpacity: 0,
              transformOrigin: "50% 50%",
              strokeWidth: 6,
            }}
            animate={{
              d: theme === "saltheme" ? moonPath : sunPath, // Ensuring d is always valid
              rotate: theme === "saltheme" ? -360 : 0,
              strokeWidth: theme === "saltheme" ? 3 : 6,
              stroke: theme === "saltheme" ? "#60A5FA" : "#D97706",
              fill: theme === "saltheme" ? "#60A5FA" : "#D97706",
              fillOpacity: 0.35,
              strokeOpacity: 1,
              scale: theme === "saltheme" ? 1.75 : 1,
            }}
          />
        </m.svg>
      </Button>
    </div>
  )
}
