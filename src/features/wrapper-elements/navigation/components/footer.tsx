"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  FOOTER_LINKS as footerLinks,
  getGridColsClass,
} from "@/constants/links"
import { landingPageLogo } from "@/constants/logos"
import { footerCRText } from "@/constants/text"
import { cn } from "@/lib/utils"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { FaInstagram, FaUser } from "react-icons/fa"

export default function Footer() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm()

  const onSubmit = async (data: any) => {
    // Handle newsletter submission
    console.log(data)
    reset()
  }

  const links = footerLinks
  const { image, alt, width, height, text, path } = landingPageLogo[0]
  const footerText = footerCRText()
  const numColumns = Object.keys(links).length
  const gridColsClass = getGridColsClass(numColumns)

  return (
    <footer className='flex justify-center border-t border-border'>
      <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:pt-16 xl:w-full xl:max-w-full xl:px-6'>
        <div className='xl:grid xl:grid-cols-2 xl:gap-8'>
          {/* Links */}
          <div className='px-6 mt-5 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0'>
            <div
              className={cn(
                "text-start md:grid md:gap-8 md:pl-8",
                gridColsClass ? gridColsClass : "md:grid-cols-4"
              )}>
              {Object.entries(links).map(([section, items]) => (
                <div key={section}>
                  <h3 className='text-sm font-semibold text-gray-900 dark:text-white'>
                    {section.charAt(0).toUpperCase() + section.slice(1)}
                  </h3>
                  <ul className='mt-4 space-y-4'>
                    {items.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className='text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'>
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div
              data-type='newsletter'
              className='width-full mx-auto flex flex-col justify-center border-l-[1px] border-border pl-[5rem]'>
              <div>
                <h3 className='text-sm font-semibold text-gray-900 dark:text-white'>
                  Stay Updated
                </h3>
                <p className='mb-8 mt-4 text-sm text-gray-600 dark:text-gray-400'>
                  Subscribe to our newsletter for updates, tips, and special
                  offers.
                </p>
              </div>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className='mt-4 sm:flex sm:max-w-md md:w-full'>
                <div className='flex-1'>
                  <Input
                    {...register("email", { required: true })}
                    type='email'
                    placeholder='Enter your email'
                    className='w-full min-w-0 rounded-lg border-black'
                  />
                </div>
                <div className='mt-3 sm:ml-3 sm:mt-0'>
                  <Button
                    type='submit'
                    variant='salWithShadow'
                    className='font-bold'>
                    Subscribe
                    <ArrowRight className='ml-2 h-4 w-4' />
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className='mt-12 border-t border-border pt-8 dark:border-gray-800'>
          <div className='px-6 grid grid-cols-3 items-center'>
            <div className='flex space-x-4'>
              <Link href='https://theanthonybrooks.com' target='_blank'>
                <Button variant='ghost' size='icon'>
                  <FaUser className='h-5 w-5' />
                </Button>
              </Link>
              <Link
                href='https://instagram.com/thestreetartlist'
                target='_blank'>
                <Button variant='ghost' size='icon'>
                  <FaInstagram className='h-5 w-5' />
                </Button>
              </Link>
            </div>
            <div className='text-center text-sm text-gray-600 dark:text-gray-400'>
              {footerText.text}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
