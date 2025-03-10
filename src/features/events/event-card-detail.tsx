"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { BookmarkFilledIcon, BookmarkIcon } from "@radix-ui/react-icons"
import { Eye, EyeOff, MapPin, PaintRoller } from "lucide-react"
import Link from "next/link"
import { IoIosArrowRoundBack } from "react-icons/io"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/state-accordion"
import { FaRegCommentDots } from "react-icons/fa6"
import { GoGear } from "react-icons/go"
import { IoAirplaneOutline, IoFastFoodOutline } from "react-icons/io5"
import { PiHouseLine, PiPencilLineDuotone } from "react-icons/pi"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
    <Card className='bg-white/50 border-black/20 p-3   rounded-3xl mb-10 first:mt-6 max-w-[90vw] min-w-[300px] grid grid-cols-[75px_auto] gap-x-3 '>
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
        <div className='col-span-1 flex flex-col items-center justify-around space-y-6 pt-3 pb-3'>
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
                className='text-red-500 mt-3'
              />
            ) : (
              <BookmarkIcon height={32} width={32} className='mt-3' />
            )}
            {hidden && <EyeOff className='h-6 w-6' />}
          </div>
        </div>

        <div className='pt-3 pb-3 pr-3 gap-y-3 flex-col flex justify-between '>
          <div className='flex flex-col gap-y-1'>
            <p className='text-base font-semibold  mb-1'>
              Event Name in full that spans two rows
            </p>

            <p className='text-sm inline-flex items-end gap-x-1'>
              City, (state), Country
              <MapPin />
            </p>
          </div>
          <div className='flex flex-col justify-between gap-y-1'>
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
          </div>
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
      <div className='col-span-full w-full flex flex-col gap-y-3 justify-start items-start'>
        <Tabs
          defaultValue='opencall'
          className='w-full flex flex-col justify-center'>
          <TabsList className='w-fit mx-auto raymond bg-white/60'>
            <TabsTrigger value='opencall'>Open Call</TabsTrigger>
            <TabsTrigger value='event'>Event Details</TabsTrigger>
            <TabsTrigger value='organizer'>Organizer</TabsTrigger>
          </TabsList>
          <TabsContent value='opencall'>
            <Card className='w-full p-5 bg-white/60 border-black/20 rounded-xl'>
              <Accordion>
                <AccordionItem value='item-1'>
                  <AccordionTrigger title='Deadline & Eligibility:' hasPreview>
                    <p>
                      <span className='font-semibold underline underline-offset-2'>
                        Deadline:
                      </span>
                      <br /> Mar 2 2025 @ 5:00pm (CST)
                    </p>
                    <p>
                      <span className='font-semibold underline underline-offset-2'>
                        Eligible:
                      </span>
                      <br />
                      <span className='text-red-600'>
                        National: US Artists*
                      </span>
                    </p>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p>
                      <span className='font-semibold underline underline-offset-2'>
                        More Info:
                      </span>
                      <br /> Artists from xyz region, identity, and/or location
                      are eligible to apply.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value='item-2'>
                  <AccordionTrigger
                    title=' Budget & Compensation:'
                    hasPreview
                    hidePreview>
                    <section className='flex flex-col justify-center items-center w-full'>
                      <br />
                      {/* ----------------- Preview Section ------------------/ */}

                      <div
                        id='budget-icons-${id}'
                        className='col-span-2 flex gap-x-3 items-center justify-center max-w-full'>
                        <span className='p-1 border-1.5 border-black rounded-full'>
                          <PiPencilLineDuotone size={18} />
                        </span>
                        <span className='p-1 border-1.5 border-black rounded-full'>
                          {" "}
                          <PiHouseLine size={18} />
                        </span>
                        <span className='p-1 border-1.5 border-black rounded-full'>
                          <IoFastFoodOutline size={18} />
                        </span>
                        <span className='p-1 border-1.5 border-red-600 text-red-600 rounded-full'>
                          <PaintRoller size={18} />
                        </span>
                        <span className='p-1 border-1.5 border-black rounded-full'>
                          <IoAirplaneOutline size={18} />
                        </span>
                        <span className='p-1 border-1.5 border-black rounded-full'>
                          <GoGear size={18} />
                        </span>
                        <span className='p-1 border-1.5 border-black rounded-full'>
                          <FaRegCommentDots size={18} />
                        </span>
                      </div>
                    </section>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className=' flex flex-col space-y-3  pb-3 mb-4'>
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
                      <div className=' flex flex-col gap-y-3 justify-between'>
                        <div className='flex justify-between items-center border-b border-dashed border-black/20'>
                          <p className='font-medium'>Design Fee:</p>
                          <p className='text-right'> $750</p>
                        </div>

                        <div className='flex justify-between items-center border-b border-dashed border-black/20'>
                          <p className='font-medium'>Accommodation:</p>
                          <p className='text-right'>Provided</p>
                        </div>
                        <div className='flex justify-between items-center border-b border-dashed border-black/20'>
                          <p className='font-medium'>Food:</p>
                          <p className='text-right'>$40/day</p>
                        </div>
                        <div className='flex justify-between items-center border-b border-dashed border-black/20'>
                          <p className='font-medium'>Travel Costs:</p>
                          <p className='text-right'> Up to $500</p>
                        </div>
                        <div className='flex justify-between items-center border-b border-dashed border-black/20'>
                          <p className='font-medium'>Materials:</p>
                          <p className='text-right text-red-500 italic'>
                            (not provided)
                          </p>
                        </div>
                        {/* NOTE: this is a good thought. To add the ability for organizers to just check that it's included in the overall budget so artists don't think it's an additional amount.  */}
                        <div className='flex justify-between items-center border-b border-dashed border-black/20'>
                          {" "}
                          <p className='font-medium'>Equipment:</p>
                          <p className='text-right'>(provided)</p>
                        </div>
                        <div className='flex justify-between items-center border-b border-dashed border-black/20'>
                          <p className='font-medium'>Other:</p>
                          <p className='text-right'> ...details details</p>
                        </div>
                        {/* <li>Must have liability insurance</li> */
                        /* Note-to-self: this is something that coold/should be later. These sort of requirements*/}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value='item-3'>
                  <AccordionTrigger title='Application Requirements' />
                  <AccordionContent>
                    <div className='flex flex-col space-y-3  pb-3 mb-4'>
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
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value='item-4'>
                  <AccordionTrigger title='Other info:' />
                  <AccordionContent>
                    <div className='grid grid-cols-[1fr_auto]  border-black/20 pb-3 mb-4'>
                      <p className='list-decimal list-inside px-4'>
                        Only one application per artist; artist teams should
                        only submit one application. Yada yada yada. More more
                        more details.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              <div className='col-span-full mt-4 flex items-center justify-center px-4'>
                <Button
                  variant='salWithShadowHidden'
                  size='lg'
                  className='rounded-r-none border-r w-full min-w-[100px]'>
                  Apply
                </Button>
                <Button
                  variant='salWithShadowHidden'
                  size='lg'
                  className='rounded-none border-x w-fit sm:px-3 px-3'>
                  {bookmarked ? (
                    <BookmarkFilledIcon className='text-red-500 size-6' />
                  ) : (
                    <BookmarkIcon height={32} width={32} />
                  )}
                </Button>
                <Button
                  variant='salWithShadowHidden'
                  size='lg'
                  className='rounded-l-none border-l w-fit sm:px-2 px-2'>
                  {hidden ? (
                    <EyeOff height={24} width={24} className='text-red-500' />
                  ) : (
                    <Eye height={32} width={32} />
                  )}
                </Button>
              </div>
            </Card>
          </TabsContent>
          <TabsContent value='event'>
            <Card className='w-full p-5 bg-white/60 border-black/20 rounded-xl'>
              <Accordion defaultValue='item-1'>
                <AccordionItem value='item-1'>
                  <AccordionTrigger title='Event Location:' />

                  <AccordionContent>
                    <div className='w-full h-[200px] bg-orange-500/50 rounded-xl relative'>
                      <h1 className='text-3xl absolute top-0 right-0 -translate-x-1/2 translate-y-1/2'>
                        Map Here
                      </h1>
                    </div>
                    <p>
                      Get directions{" "}
                      <span className='underline underline-offset-2'>here</span>
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value='item-2'>
                  <AccordionTrigger title='About the Event:' />

                  <AccordionContent>
                    <div className=' flex flex-col space-y-3  pb-3 mb-4'>
                      <p>
                        This is some random text about the event. When it is,
                        where it is, how it is. Why it is. Blahblahblah blah
                        blah blah blah blah blah blah.
                        <br />
                        Oh, new line. Okay, blah blah blah.
                        <br />
                        Again? Wow, blah blah blah.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value='item-3'>
                  <AccordionTrigger title='Other info:' />
                  <AccordionContent>
                    <p>
                      Event may be postponed or canceled due to weather or other
                      unforeseen circumstances. As organizers, we&apos;ll do our
                      best to keep you informed of any changes.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              <div className='col-span-full mt-4 flex items-center justify-center px-4'>
                <Button
                  variant='salWithShadowHidden'
                  size='lg'
                  className='rounded-r-none border-r w-full min-w-[100px]'>
                  Apply
                </Button>
                <Button
                  variant='salWithShadowHidden'
                  size='lg'
                  className='rounded-none border-x w-fit sm:px-3 px-3'>
                  {bookmarked ? (
                    <BookmarkFilledIcon className='text-red-500 size-6' />
                  ) : (
                    <BookmarkIcon height={32} width={32} />
                  )}
                </Button>
                <Button
                  variant='salWithShadowHidden'
                  size='lg'
                  className='rounded-l-none border-l w-fit sm:px-2 px-2'>
                  {hidden ? (
                    <EyeOff height={24} width={24} className='text-red-500' />
                  ) : (
                    <Eye height={32} width={32} />
                  )}
                </Button>
              </div>
            </Card>
          </TabsContent>
          <TabsContent value='organizer'>
            <Card className='w-full p-5 bg-white/60 border-black/20 rounded-xl'>
              <Accordion>
                <AccordionItem value='item-1'>
                  <AccordionTrigger title='Deadline & Eligibility:' hasPreview>
                    <p>
                      <span className='font-semibold underline underline-offset-2'>
                        Deadline:
                      </span>
                      <br /> Mar 2 2025 @ 5:00pm (CST)
                    </p>
                    <p>
                      <span className='font-semibold underline underline-offset-2'>
                        Eligible:
                      </span>
                      <br />
                      <span className='text-red-600'>
                        National: US Artists*
                      </span>
                    </p>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p>
                      <span className='font-semibold underline underline-offset-2'>
                        More Info:
                      </span>
                      <br /> Artists from xyz region, identity, and/or location
                      are eligible to apply.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value='item-2'>
                  <AccordionTrigger
                    title=' Budget & Compensation:'
                    hasPreview
                    hidePreview>
                    <section className='flex flex-col justify-center items-center w-full'>
                      <br />
                      {/* ----------------- Preview Section ------------------/ */}

                      <div
                        id='budget-icons-${id}'
                        className='col-span-2 flex gap-x-3 items-center justify-center max-w-full'>
                        <span className='p-1 border-1.5 border-black rounded-full'>
                          <PiPencilLineDuotone size={18} />
                        </span>
                        <span className='p-1 border-1.5 border-black rounded-full'>
                          {" "}
                          <PiHouseLine size={18} />
                        </span>
                        <span className='p-1 border-1.5 border-black rounded-full'>
                          <IoFastFoodOutline size={18} />
                        </span>
                        <span className='p-1 border-1.5 border-red-600 text-red-600 rounded-full'>
                          <PaintRoller size={18} />
                        </span>
                        <span className='p-1 border-1.5 border-black rounded-full'>
                          <IoAirplaneOutline size={18} />
                        </span>
                        <span className='p-1 border-1.5 border-black rounded-full'>
                          <GoGear size={18} />
                        </span>
                        <span className='p-1 border-1.5 border-black rounded-full'>
                          <FaRegCommentDots size={18} />
                        </span>
                      </div>
                    </section>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className=' flex flex-col space-y-3  pb-3 mb-4'>
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
                      <div className=' flex flex-col gap-y-3 justify-between'>
                        <div className='flex justify-between items-center border-b border-dashed border-black/20'>
                          <p className='font-medium'>Design Fee:</p>
                          <p className='text-right'> $750</p>
                        </div>

                        <div className='flex justify-between items-center border-b border-dashed border-black/20'>
                          <p className='font-medium'>Accommodation:</p>
                          <p className='text-right'>Provided</p>
                        </div>
                        <div className='flex justify-between items-center border-b border-dashed border-black/20'>
                          <p className='font-medium'>Food:</p>
                          <p className='text-right'>$40/day</p>
                        </div>
                        <div className='flex justify-between items-center border-b border-dashed border-black/20'>
                          <p className='font-medium'>Travel Costs:</p>
                          <p className='text-right'> Up to $500</p>
                        </div>
                        <div className='flex justify-between items-center border-b border-dashed border-black/20'>
                          <p className='font-medium'>Materials:</p>
                          <p className='text-right text-red-500 italic'>
                            (not provided)
                          </p>
                        </div>
                        {/* NOTE: this is a good thought. To add the ability for organizers to just check that it's included in the overall budget so artists don't think it's an additional amount.  */}
                        <div className='flex justify-between items-center border-b border-dashed border-black/20'>
                          {" "}
                          <p className='font-medium'>Equipment:</p>
                          <p className='text-right'>(provided)</p>
                        </div>
                        <div className='flex justify-between items-center border-b border-dashed border-black/20'>
                          <p className='font-medium'>Other:</p>
                          <p className='text-right'> ...details details</p>
                        </div>
                        {/* <li>Must have liability insurance</li> */
                        /* Note-to-self: this is something that coold/should be later. These sort of requirements*/}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value='item-3'>
                  <AccordionTrigger title='Application Requirements' />
                  <AccordionContent>
                    <div className='flex flex-col space-y-3  pb-3 mb-4'>
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
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value='item-4'>
                  <AccordionTrigger title='Other info:' />
                  <AccordionContent>
                    <div className='grid grid-cols-[1fr_auto]  border-black/20 pb-3 mb-4'>
                      <p className='list-decimal list-inside px-4'>
                        Only one application per artist; artist teams should
                        only submit one application. Yada yada yada. More more
                        more details.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              <div className='col-span-full mt-4 flex items-center justify-center px-4'>
                <Button
                  variant='salWithShadowHidden'
                  size='lg'
                  className='rounded-r-none border-r w-full min-w-[100px]'>
                  Apply
                </Button>
                <Button
                  variant='salWithShadowHidden'
                  size='lg'
                  className='rounded-none border-x w-fit sm:px-3 px-3'>
                  {bookmarked ? (
                    <BookmarkFilledIcon className='text-red-500 size-6' />
                  ) : (
                    <BookmarkIcon height={32} width={32} />
                  )}
                </Button>
                <Button
                  variant='salWithShadowHidden'
                  size='lg'
                  className='rounded-l-none border-l w-fit sm:px-2 px-2'>
                  {hidden ? (
                    <EyeOff height={24} width={24} className='text-red-500' />
                  ) : (
                    <Eye height={32} width={32} />
                  )}
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  )
}

export default EventCardDetail
