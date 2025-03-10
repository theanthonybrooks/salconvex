"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { BookmarkFilledIcon, BookmarkIcon } from "@radix-ui/react-icons"
import { Eye, EyeOff, MapPin, Minus } from "lucide-react"
import Link from "next/link"
import { IoIosArrowRoundBack } from "react-icons/io"

interface EventCardDetailProps {
  accepted?: "accepted" | "rejected" | "pending" | undefined
  bookmarked?: boolean
  hidden?: boolean
}

const EventCardDetail = ({
  accepted = undefined,
  bookmarked = false,
  hidden = false,
}: EventCardDetailProps) => {
  return (
    <Card className='bg-white/50 border-black/20 p-3   rounded-3xl mb-10 first:mt-6 max-w-[400px] min-w-[300px] grid grid-cols-[75px_auto] gap-x-3 '>
      <Link
        href='/thelist'
        className='col-span-full pl-3 flex gap-x-2 items-center justify-start py-2'>
        <IoIosArrowRoundBack className='h-6 w-6' /> back to open calls
      </Link>
      {accepted !== undefined && (
        <span
          className={cn(
            "col-start-2 text-xs",
            accepted === "accepted"
              ? "text-emerald-500"
              : accepted === "rejected"
              ? "text-red-500"
              : accepted === "pending"
              ? "italic text-black/50"
              : ""
          )}>
          Application status:{" "}
          <span className='font-bold'>
            {accepted === "accepted"
              ? "Accepted"
              : accepted === "rejected"
              ? "Rejected"
              : "Pending"}
          </span>
        </span>
      )}
      <div className='w-full grid col-span-full  grid-cols-[75px_auto]  gap-x-3 mb-4'>
        <div className='col-span-1 flex flex-col items-center justify-start space-y-6 pt-3 pb-3'>
          <div
            className={cn(
              "rounded-full bg-white border-2 h-15 w-15 relative ",
              accepted === "accepted"
                ? "ring-4  ring-offset-1 ring-emerald-500"
                : accepted === "rejected"
                ? "ring-4  ring-offset-1 ring-red-500"
                : accepted === "pending"
                ? "ring-4 ring-offset-1 ring-black/20"
                : ""
            )}>
            <p className='text-sm absolute left-0 top-0 translate-x-1/3 translate-y-[80%]'>
              Logo
            </p>
          </div>
          <div className='flex flex-col space-y-4 items-center'>
            {bookmarked ? (
              <BookmarkFilledIcon
                height={32}
                width={32}
                className='text-red-500'
              />
            ) : (
              <BookmarkIcon height={32} width={32} />
            )}
            {hidden && <EyeOff className='h-6 w-6' />}
          </div>
        </div>

        <div className='pt-3 pb-3 pr-3 flex-col flex gap-y-3 '>
          <div className='flex flex-col gap-y-1 mb-2'>
            <p className='text-base font-semibold  mb-1'>
              Event Name in full that wraps two rows if needed
            </p>

            <p className='text-sm inline-flex items-end gap-x-1 mb-1'>
              City, (state), Country
              <MapPin />
            </p>
            <p className='text-sm'>
              <span className='font-semibold'>Event Dates:</span> June 5-18,
              2025
            </p>
            <p className='text-sm'>
              <span className='font-semibold'>Category:</span> Event
            </p>
            <p className='text-sm'>
              <span className='font-semibold'>Type:</span> Street Art Festival
            </p>
            {/* NOTE: Make these dynamic and perhaps make a dropdown menu or popover or something for them. Not sure if they're really necessary right here.  */}
            {/* <div className='flex gap-x-4 mt-3 items-center justify-start'>
              <MailIcon size={24} />
              <Globe size={24} />
              <FaInstagram size={24} />
              <FiFacebook size={24} />
              <FaVk size={24} />
            </div> */}
          </div>
        </div>
      </div>
      <div className='col-span-full w-full flex flex-col gap-y-3 justify-start items-start'>
        <h3 className='text-left indent-2'>Open Call Details:</h3>
        <Card className='w-full p-3 bg-white/60 border-black/20 rounded-xl'>
          <div className='flex flex-col space-y-3 border-b-2 border-dotted border-black/20 pb-3 mb-4 relative'>
            <div className='absolute top-0 right-2'>
              <Minus />
            </div>
            <p>
              <span className='font-semibold'>Deadline:</span>
              <br /> Mar 2 2025 @ 5:00pm (CST)
            </p>
            <p>
              <span className='font-semibold'>Eligible:</span>
              <br />
              <span className='text-red-600'>National: US Artists</span>
            </p>
            <p>
              <span className='font-semibold'>More Info:</span>
              <br /> Artists from xyz region, identity, and/or location are
              eligible to apply.
            </p>
          </div>
          <div className='relative flex flex-col space-y-3 border-b-2 border-dotted border-black/20 pb-3 mb-4'>
            <div className='absolute top-0 right-2'>
              <Minus />
            </div>
            <p className='font-semibold underline underline-offset-2'>
              Application Requirements:
            </p>
            <ol className='list-decimal list-inside px-4'>
              <li>Must be a US citizen or permanent resident</li>
              <li>Must be at least 18 years old</li>
              <li>3 years of experience in public art</li>
              <li>Artist statement</li>
              <li>Up to 10 photos of recent works</li>
              <li>Google Form</li>
              {/* <li>Must have liability insurance</li> */
              /* Note-to-self: this is something that coold/should be later. These sort of requirements*/}
            </ol>
            <p>
              Send applications to{" "}
              <a href='mailto:info@thestreetartlist.com'>
                person@thestreetartlist.com
              </a>{" "}
              and feel free to reach out with any questions
            </p>
          </div>
          <div className='relativeflex flex-col space-y-3 border-b-2 border-dotted border-black/20 pb-3 mb-4'>
            <div className='absolute top-0 right-2'>
              <Minus />
            </div>
            <p>
              <span className='font-semibold underline underline-offset-2'>
                Budget:
              </span>
              <br />
              up to $10,000 | $50/ft²
            </p>
            <p className='font-semibold underline underline-offset-2'>
              Compensation Includes:
            </p>
            {/* NOTE: How to better display this? It's a bit jarring at the moment
            when viewing it. */}
            <div className=' grid grid-cols-2 justify-between'>
              <p className='font-medium'>Design Fee:</p>
              <p className='text-right'> $750</p>
              <p className='font-medium'>Accommodation:</p>
              <p className='text-right'>Provided</p>
              <p className='font-medium'>Food:</p>
              <p className='text-right'>$40/day</p>
              <p className='font-medium'>Travel Costs:</p>
              <p className='text-right'> Up to $500</p>
              <p className='font-medium'>Materials:</p>
              <p className='text-right text-red-500 italic'>(not provided)</p>
              {/* NOTE: this is a good thought. To add the ability for organizers to just check that it's included in the overall budget so artists don't think it's an additional amount.  */}
              <p className='font-medium'>Equipment:</p>
              <p className='text-right'>(provided)</p>
              <p className='font-medium'>Other:</p>
              <p className='text-right'> ...details details</p>
              {/* <li>Must have liability insurance</li> */
              /* Note-to-self: this is something that coold/should be later. These sort of requirements*/}
              {/* ----------------- Preview Section ------------------/ */}
              {/*            <div
                id='budget-icons-${id}'
                className='col-span-2 flex gap-x-3 items-center justify-center'>
                <span className='p-1 border-1.5 border-black rounded-full'>
                  <PiPencilCircle size={20} />
                </span>
                <span className='p-1 border-1.5 border-black rounded-full'>
                  {" "}
                  <FaHouse size={20} />
                </span>
                <span className='p-1 border-1.5 border-black rounded-full'>
                  <PiBowlFood size={20} />
                </span>
                <span className='p-1 border-1.5 border-black rounded-full'>
                  <PaintRoller size={20} />
                </span>
                <span className='p-1 border-1.5 border-black rounded-full'>
                  <FaPlane size={20} />
                </span>
                <span className='p-1 border-1.5 border-black rounded-full'>
                  <FaGear size={20} />
                </span>
                <span className='p-1 border-1.5 border-black rounded-full'>
                  <FaInfo size={20} />
                </span>
              </div>*/}
            </div>
          </div>
          <div className='grid grid-cols-[1fr_auto]  border-black/20 pb-3 mb-4'>
            <p className='font-semibold underline underline-offset-2'>Other:</p>
            <p className='list-decimal list-inside px-4'>
              Only one application per artist; artist teams should only submit
              one application. Yada yada yada. More more more details.
            </p>
            <div className='col-span-full mt-4 flex items-center justify-center px-4'>
              <Button
                variant='salWithShadowHidden'
                size='lg'
                className='rounded-r-none border-r w-full'>
                Apply
              </Button>
              <Button
                variant='salWithShadowHidden'
                size='lg'
                className='rounded-none border-x w-fit px-3'>
                {bookmarked ? (
                  <BookmarkFilledIcon
                    height={24}
                    width={24}
                    className='text-red-500'
                  />
                ) : (
                  <BookmarkIcon height={32} width={32} />
                )}
              </Button>
              <Button
                variant='salWithShadowHidden'
                size='lg'
                className='rounded-l-none border-l w-fit px-2'>
                {hidden ? (
                  <EyeOff height={24} width={24} className='text-red-500' />
                ) : (
                  <Eye height={32} width={32} />
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </Card>
  )
}

export default EventCardDetail
