"use client"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { motion } from "framer-motion"
import { useRef } from "react"
import { FaEnvelope, FaGlobe, FaInstagram } from "react-icons/fa6"

// const font = Poppins({ subsets: ["latin"], weight: "600" })

export default function Home() {
  const targetRef = useRef(null)
  // const { scrollY } = useScroll()
  // const smoothScrollY = useSpring(scrollY, {
  //   stiffness: 100,
  //   damping: 20,
  //   mass: 0.4,
  // })
  // const borderRadius = useTransform(smoothScrollY, [0, 150, 450], [0, 0, 150])

  return (
    <motion.div ref={targetRef}>
      <motion.div
        initial={{ y: 0, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className='hidden  sm:flex flex-col h-full items-center justify-center relative rounded-3xl overflow-hidden'
        style={{
          maxHeight: "calc(100dvh - 8.5rem)",
        }}>
        <motion.img
          src='/chus.jpg'
          alt='The Street Art List'
          loading='lazy'
          width={1920}
          height={1080}
          className=' min-w-full min-h-full object-cover object-[50%_10%]'

          // style={{
          //   borderBottomLeftRadius: borderRadius,
          //   borderBottomRightRadius: borderRadius,
          // }}
        />
        <Popover>
          <PopoverTrigger asChild>
            <motion.span className='absolute bottom-5 left-5 flex flex-row gap-1 px-10 py-2 rounded-3xl  text-foreground bg-white hover:cursor-pointer'>
              <span>
                <i className='text-base'>Silent Rhythm </i> by{" "}
                <span className='font-bold'>Anthony Brooks</span>
              </span>
            </motion.span>
          </PopoverTrigger>
          <PopoverContent className='w-80'>
            <div className='grid gap-4'>
              <div className='space-y-2'>
                <h3 className='font-bold italic'>Artwork Name</h3>
                <p className='text-sm text-muted-foreground'>
                  Painted in 2024 for event/project name.
                  Description/size/materials/etc.
                </p>
                <h4 className='font-medium leading-none'>More info:</h4>
                <p className='text-sm text-muted-foreground'>
                  Artist located in Copenhagen, Denmark
                </p>
              </div>
              <ul>
                <li className='flex gap-x-4 items-center'>
                  <FaInstagram />{" "}
                  <a
                    href='https://instagram.com/anthonybrooksart'
                    className='text-sm text-muted-foreground hover:underline underline-offset-2'>
                    @anthonybrooksart
                  </a>
                </li>
                <li className='flex gap-x-4 items-center'>
                  <FaGlobe />
                  <a
                    href='https://anthonybrooksart.com'
                    className='text-sm text-muted-foreground hover:underline underline-offset-2'>
                    anthonybrooksart.com
                  </a>
                </li>
                <li className='flex gap-x-4 items-center'>
                  <FaEnvelope />
                  <a
                    href='mailto:info@thestreetartlist.com'
                    className='text-sm text-muted-foreground hover:underline underline-offset-2'>
                    info@thestreetartlist.com
                  </a>
                </li>
              </ul>
            </div>
          </PopoverContent>
        </Popover>
      </motion.div>
      <div className='h-[300vh] w-full '></div>
    </motion.div>
  )
}
