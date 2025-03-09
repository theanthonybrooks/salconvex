import Link from "next/link"
import { FaInstagram, FaRegEnvelope, FaThreads } from "react-icons/fa6"
import { FiFacebook } from "react-icons/fi"
import { PiPatreonLogoBold } from "react-icons/pi"

export default function SocialsRow() {
  return (
    <div className='flex justify-center items-center gap-6 mb-4'>
      <Link href='https://instagram.com/thestreetartlist'>
        <FaInstagram className='h-8 w-8' />
      </Link>
      <Link href='https://facebook.com/thestreetartlist'>
        <FiFacebook className='h-8 w-8' />
      </Link>
      <Link href='https://threads.net/thestreetartlist'>
        <FaThreads className='h-8 w-8' />
      </Link>
      <Link href='mailto:info@thestreetartlist.com'>
        <FaRegEnvelope className='h-8 w-8' />
      </Link>
      <Link href='https://patreon.com/thestreetartlist'>
        <PiPatreonLogoBold className='h-8 w-8' />
      </Link>
    </div>
  )
}
