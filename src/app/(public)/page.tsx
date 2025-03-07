"use client"

import { motion, useScroll, useSpring, useTransform } from "framer-motion"
import { Poppins } from "next/font/google"
import Link from "next/link"
import { useRef } from "react"

const font = Poppins({ subsets: ["latin"], weight: "600" })

export default function Home() {
  const targetRef = useRef(null)
  const { scrollY } = useScroll()

  // useMotionValueEvent(scrollY, "change", (latest) => {
  //   console.log("Page scroll: ", latest)
  // })

  const smoothScrollY = useSpring(scrollY, {
    stiffness: 100,
    damping: 20,
    mass: 0.4,
  })
  const borderRadius = useTransform(smoothScrollY, [0, 150, 450], [0, 0, 150])
  // const left = useTransform(smoothScrollY, [0, 150, 450], ["0%", "0%", "50%"])
  // const transX = useTransform(
  //   smoothScrollY,
  //   [0, 150, 450],
  //   ["0%", "0%", "-50%"]
  // )
  return (
    <motion.div ref={targetRef}>
      <motion.div
        initial={{ y: 0, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className=' hidden sm:flex flex-col h-full items-center justify-center relative'>
        <motion.img
          src='/herotest2.jpg'
          alt='The Street Art List'
          loading='lazy'
          width={1920}
          height={1080}
          className='object-cover w-screen mt-[-7%]'
          style={{
            borderBottomLeftRadius: borderRadius,
            borderBottomRightRadius: borderRadius,
          }}
        />
        <motion.span className='absolute bottom-0  flex flex-row gap-1 left-1/2 -translate-x-1/2  px-10 py-2 rounded-t-2xl border-t-1.5 border-x-1.5 border-r-black border-b-black text-foreground bg-background'>
          <i className='text-base'>Silent Rhythm</i>
          <span>
            by{" "}
            <Link
              href='https://www.instagram.com/anthonybrooksart/'
              className='font-bold'>
              Anthony Brooks
            </Link>
          </span>
        </motion.span>
      </motion.div>
      <div className='h-[50vh] w-full' />
    </motion.div>
  )
}
