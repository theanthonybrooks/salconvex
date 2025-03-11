"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { BookmarkFilledIcon, BookmarkIcon } from "@radix-ui/react-icons"
import {
  CalendarClockIcon,
  Eye,
  EyeOff,
  Globe,
  MapPin,
  PaintRoller,
  Phone,
} from "lucide-react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/state-accordion"
import {
  FaEnvelope,
  FaFacebook,
  FaInstagram,
  FaRegCommentDots,
  FaThreads,
} from "react-icons/fa6"
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
    <Card className='bg-white/50 border-black/20 p-3   rounded-3xl mb-10 first:mt-6 max-w-[400px] min-w-[300px] grid grid-cols-[75px_auto] gap-x-3 '>
      {accepted !== undefined && (
        <span
          className={cn(
            "col-start-2 text-xs bg-white/70 px-2 py-1 rounded-full w-fit border-2 border-black/30",
            accepted === "accepted"
              ? "text-emerald-500 border-emerald-500/30"
              : accepted === "rejected"
              ? "text-red-500 border-red-500/30"
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
      <div className='col-span-full overflow-hidden w-full flex flex-col gap-y-3 justify-start items-start'>
        <Tabs
          defaultValue='opencall'
          className='w-full flex flex-col justify-center'>
          <TabsList className='w-full  raymond bg-white/60 justify-around h-12'>
            <TabsTrigger className='h-10' value='opencall'>
              Open Call
            </TabsTrigger>
            <TabsTrigger className='h-10' value='event'>
              {/* Project Details note-to-self: this should change automatically depending on the oc type */}
              Event Details
            </TabsTrigger>
            <TabsTrigger className='h-10' value='organizer'>
              Organizer
            </TabsTrigger>
          </TabsList>
          <TabsContent value='opencall'>
            <Card className=' w-full p-5 bg-white/60 border-black/20 rounded-xl'>
              <Accordion defaultValue='item-1'>
                <AccordionItem value='item-1'>
                  <AccordionTrigger title='Deadline & Eligibility:' />
                  <AccordionContent>
                    <div className='space-y-2'>
                      <p>
                        <span className='font-semibold underline underline-offset-2'>
                          Deadline:
                        </span>
                        <br />{" "}
                        <span className=' flex items-center gap-x-2'>
                          Mar 2 2025 @ 5:00pm (CST){" "}
                          <CalendarClockIcon className='h-4 w-4' />
                        </span>
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
                      <p>
                        <span className='font-semibold underline underline-offset-2'>
                          More Info:
                        </span>
                        <br /> Artists from xyz region, identity, and/or
                        location are eligible to apply.
                      </p>
                    </div>
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
                        <span className='p-1 border-1.5  border-emerald-500 text-emerald-500 rounded-full'>
                          <PiPencilLineDuotone size={18} />
                        </span>
                        <span className='p-1 border-1.5  border-emerald-500 text-emerald-500 rounded-full'>
                          {" "}
                          <PiHouseLine size={18} />
                        </span>
                        <span className='p-1 border-1.5  border-emerald-500 text-emerald-500 rounded-full'>
                          <IoFastFoodOutline size={18} />
                        </span>
                        <span className='p-1 border-1.5 border-black/20 text-black/20  rounded-full'>
                          <PaintRoller size={18} />
                        </span>
                        <span className='p-1 border-1.5  border-emerald-500 text-emerald-500 rounded-full'>
                          <IoAirplaneOutline size={18} />
                        </span>
                        <span className='p-1 border-1.5  border-emerald-500 text-emerald-500 rounded-full'>
                          <GoGear size={18} />
                        </span>
                        <span className='p-1 border-1.5  border-emerald-500 text-emerald-500 rounded-full'>
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
            <Card className='w-full max-w-[90vw] p-5 bg-white/60 border-black/20 rounded-xl'>
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
                  <AccordionTrigger title='Event Links:' />

                  <AccordionContent>
                    <ul>
                      <li>
                        <a href='#'>Website</a>
                      </li>
                      <li>
                        <a href='#'>Instagram</a>
                      </li>
                      <li>
                        <a href='#'>Email</a>
                      </li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value='item-4'>
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
            <Card
              className='max-w-full overflow-hidden w-full
   p-5 bg-white/60 border-black/20 rounded-xl space-y-6'>
              <div className='w-full grid grid-cols-[75px_minmax(0,1fr)] '>
                <div
                  className={cn(
                    "rounded-full bg-white border-2 h-15 w-15 relative col-span-1"
                  )}>
                  <p className='text-sm absolute left-0 top-0 translate-x-1/3 translate-y-[80%]'>
                    Logo
                  </p>
                </div>
                <div className='col-span-1'>
                  <p className='text-sm font-bold line-clamp-2'>
                    Organization/Individual Name (Organization)
                    Organization/Individual Name (Organization)
                    Organization/Individual Name (Organization)
                  </p>
                  <p className='text-sm font-medium'>Organization Location</p>
                </div>
              </div>
              <div className='w-full space-y-5'>
                <section>
                  <p className='font-semibold text-sm'>
                    About the Organization:
                  </p>
                  <p className='text-sm line-clamp-4'>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                    ullamco laboris nisi ut aliquip ex ea commodo consequat.{" "}
                  </p>
                </section>
                <section className='flex flex-col gap-y-2'>
                  <span>
                    <p className='font-semibold text-sm'>Organizer:</p>
                    <p className='text-sm line-clamp-4'>Name Namington XIII</p>
                  </span>
                  <span>
                    <p className='font-semibold text-sm'>Main Contact:</p>
                    <p className='text-sm line-clamp-4'>
                      Namester@namethisthing.com
                    </p>
                  </span>
                </section>
                <section>
                  <p className='font-semibold text-sm'>Links:</p>
                  <div className='flex gap-x-6 items-center justify-center pt-3'>
                    <Globe className='h-6 w-6' />
                    <FaEnvelope className='h-6 w-6' />
                    <Phone className='h-6 w-6' />
                    <FaInstagram className='h-6 w-6' />
                    <FaFacebook className='h-6 w-6' />
                    <FaThreads className='h-6 w-6' />
                  </div>
                </section>
              </div>

              {/* <div className='col-span-full'>
                  <h3>Other Events/Projects by this organizer:</h3>
                  <ul>
                    <li>
                      Event Name <Link href='#'>(link)</Link>
                    </li>
                    <li>
                      Event Name <Link href='#'>(link)</Link>
                    </li>
                  </ul>
                </div> */}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  )
}

export default EventCardDetail
