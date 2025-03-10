import { cn } from "@/lib/utils"
import Link from "next/link"
import { FaInstagram, FaRegEnvelope, FaThreads } from "react-icons/fa6"
import { FiFacebook } from "react-icons/fi"
import { PiPatreonLogoBold } from "react-icons/pi"

interface SocialsRowProps {
  size?: number
  className?: string
}

export default function SocialsRow({ size = 8, className }: SocialsRowProps) {
  return (
    <div className='flex justify-center items-center gap-6'>
      <Link href='https://instagram.com/thestreetartlist'>
        <FaInstagram className={cn(`h-${size} w-${size}`, className)} />
      </Link>
      <Link href='https://facebook.com/thestreetartlist'>
        <FiFacebook className={cn(`h-${size} w-${size}`, className)} />
      </Link>
      <Link href='https://threads.net/thestreetartlist'>
        <FaThreads className={cn(`h-${size} w-${size}`, className)} />
      </Link>
      <Link href='mailto:info@thestreetartlist.com'>
        <FaRegEnvelope className={cn(`h-${size} w-${size}`, className)} />
      </Link>
      <Link href='https://patreon.com/thestreetartlist'>
        <PiPatreonLogoBold className={cn(`h-${size} w-${size}`, className)} />
      </Link>
    </div>
  )
}
