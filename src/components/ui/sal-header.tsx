import SocialsRow from "@/components/ui/socials"
import Image from "next/image"
import Link from "next/link"

const SalHeader = () => {
  return (
    <div className='flex flex-col justify-center items-center gap-2'>
      <Image
        src='/saltext.png'
        alt='The Street Art List'
        width={250}
        height={100}
        priority={true}
      />
      <p className='text-center text-sm mb-4'>
        List of street art, graffiti, & mural projects.
        <br /> Info gathered and shared by{" "}
        <Link
          href='https://instagram.com/anthonybrooksart'
          target='_blank'
          className='font-semibold'>
          @anthonybrooksart
        </Link>
      </p>
      <SocialsRow className='mb-4 size-8 md:size-7' />
    </div>
  )
}

export default SalHeader
