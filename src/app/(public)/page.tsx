"use client"

import { Poppins } from "next/font/google"
import Image from "next/image"

const font = Poppins({ subsets: ["latin"], weight: "600" })

export default function Home() {
  return (
    <div className='flex flex-col items-center justify-center'>
      <Image
        src='/herotest.jpg'
        alt='The Street Art List'
        width={800}
        height={400}
        priority={true}
        className='ml-2'
      />
    </div>
  )
}
