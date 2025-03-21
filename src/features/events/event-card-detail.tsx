"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  CalendarClockIcon,
  Download,
  Eye,
  EyeOff,
  Globe,
  MapPin,
  Phone,
} from "lucide-react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/state-accordion"
import {
  FaBookmark,
  FaEnvelope,
  FaFacebook,
  FaInstagram,
  FaPaintRoller,
  FaRegBookmark,
  FaRegCommentDots,
  FaThreads,
} from "react-icons/fa6"
import { IoAirplane } from "react-icons/io5"
import {
  PiForkKnifeFill,
  PiHouseLineFill,
  PiPencilLineFill,
} from "react-icons/pi"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EventData } from "@/types/event"
import { TbStairs } from "react-icons/tb"

import { generateICSFile } from "@/lib/addToCalendar"
import { formatEventDates, formatOpenCallDeadline } from "@/lib/dateFns"
import {
  formatCurrency,
  formatRate,
  getEventCategoryLabel,
  getEventTypeLabel,
} from "@/lib/eventFns"
import Image from "next/image"
import { useState } from "react"

const EventCardDetail = (props: EventData) => {
  const {
    // id,
    logo,

    callType,
    eventType,
    eventCategory,
    location,
    dates,
    eligibility,
    eligibilityType,
    eligibilityDetails,
    budgetMin,
    budgetMax,
    currency,
    budgetRate,
    budgetRateUnit,
    allInclusive,
    openCall,
    appFee,
    status,
    bookmarked,

    hidden,
    event,
    tabs,
    // organizer,
  } = props

  const { locale, city, stateAbbr, countryAbbr } = location
  const {
    designFee,
    accommodation,
    food,
    travelCosts,
    materials,
    equipment,
    other,
  } = tabs.opencall.compensation

  const [isBookmarked, setIsBookmarked] = useState(bookmarked)
  const [isHidden, setIsHidden] = useState(hidden)

  const locationString = `${
    locale ? `${locale}, ` : ""
  }${city}, ${stateAbbr}, ${countryAbbr}`

  const icsLink =
    dates.eventStart && dates.eventEnd
      ? generateICSFile(
          event.name,
          dates.eventStart,
          dates.eventEnd,
          locationString,
          tabs.event.about
        )
      : null

  const hasBudget = budgetMin > 0 || (budgetMax && budgetMax > 0)
  const hasRate = budgetRate && budgetRate > 0

  return (
    <Card className='bg-white/50 border-foreground/20 p-3   rounded-3xl mb-10 first:mt-6 max-w-[400px] w-[90vw] min-w-[340px] grid grid-cols-[75px_auto] gap-x-3 '>
      {status !== undefined && (
        <span
          className={cn(
            "col-start-2 text-xs bg-white/70 px-2 py-1 rounded-full w-fit border-2 border-foreground/30",
            status === "accepted"
              ? "text-emerald-600 border-emerald-500/50"
              : status === "rejected"
              ? "text-red-500 border-red-500/30"
              : status === "pending"
              ? "italic text-foreground/50"
              : ""
          )}>
          Application status:{" "}
          <span className='font-bold'>
            {status === "accepted"
              ? "Accepted"
              : status === "rejected"
              ? "Rejected"
              : "Pending"}
          </span>
        </span>
      )}
      <div className='w-full grid col-span-full  grid-cols-[75px_auto]  gap-x-3 mb-4'>
        <div className='col-span-1 flex flex-col items-center justify-around space-y-6 pt-3 pb-3'>
          <Image
            src={logo}
            alt='Event Logo'
            width={60}
            height={60}
            className={cn(
              "rounded-full  border-2 size-[60px] ",
              status === "accepted"
                ? "ring-4  ring-offset-1 ring-emerald-500"
                : status === "rejected"
                ? "ring-4  ring-offset-1 ring-red-500"
                : status === "pending"
                ? "ring-4 ring-offset-1 ring-foreground/20"
                : ""
            )}
          />

          <div className='flex flex-col space-y-4 items-center'>
            {isBookmarked ? (
              <FaBookmark
                className='size-8 text-emerald-600 mt-3'
                onClick={() => setIsBookmarked(false)}
              />
            ) : (
              <FaRegBookmark
                className='size-8 mt-3'
                onClick={() => setIsBookmarked(true)}
              />
            )}
            {isHidden && (
              <EyeOff
                className='h-6 w-6'
                onClick={() => setIsHidden(!isHidden)}
              />
            )}
          </div>
        </div>

        <div className='pt-3 pb-3 pr-3 gap-y-3 flex-col flex justify-between '>
          <div className='flex flex-col gap-y-1'>
            <p className='text-base font-semibold  mb-1'>{event?.name}</p>

            <p className='text-sm inline-flex items-end gap-x-1'>
              {locationString}
              <MapPin />
            </p>
          </div>
          <div className='flex flex-col justify-between gap-y-1'>
            <p className='text-sm flex items-center gap-x-1'>
              <span className='font-semibold'>Dates:</span>
              {formatEventDates(dates?.eventStart || "", dates.eventEnd)}
            </p>
            <p className='text-sm flex items-center gap-x-1'>
              <span className='font-semibold'>Category:</span>
              {getEventCategoryLabel(eventCategory)}
            </p>
            {eventCategory === "event" && (
              <p className='text-sm flex items-center gap-x-1'>
                <span className='font-semibold'>Type:</span>{" "}
                {getEventTypeLabel(eventType)}
              </p>
            )}
            {appFee !== 0 && (
              <p className='text-sm flex items-center gap-x-1 text-red-600'>
                <span className='font-semibold'>Application Fee:</span>
                {`$${appFee}`}
              </p>
            )}
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
          defaultValue={openCall ? "opencall" : "event"}
          className='w-full flex flex-col justify-center'>
          <TabsList className='w-full  raymond bg-white/60 justify-around h-12'>
            {openCall && (
              <TabsTrigger className='h-10' value='opencall'>
                Open Call
              </TabsTrigger>
            )}
            <TabsTrigger className='h-10' value='event'>
              {/* Project Details note-to-self: this should change automatically depending on the oc type */}
              {getEventCategoryLabel(eventCategory)} Details
            </TabsTrigger>
            <TabsTrigger className='h-10' value='organizer'>
              Organizer
            </TabsTrigger>
          </TabsList>
          <TabsContent value='opencall'>
            <Card className=' w-full p-5 bg-white/60 border-foreground/20 rounded-xl'>
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
                          {formatOpenCallDeadline(
                            dates?.ocEnd || "",
                            dates?.timezone,
                            callType
                          )}
                          {icsLink && (
                            <a
                              href={icsLink}
                              download={`${event.name.replace(
                                /\s+/g,
                                "_"
                              )}.ics`}>
                              <CalendarClockIcon className='h-4 w-4' />
                            </a>
                          )}
                        </span>
                      </p>
                      <p>
                        <span className='font-semibold underline underline-offset-2'>
                          Eligible:
                        </span>
                        <br />
                        <span
                          className={cn(
                            eligibilityType !== "International" &&
                              "text-red-600"
                          )}>
                          {eligibilityType !== "International"
                            ? `${eligibilityType}: ${eligibility} Artists*`
                            : eligibility}
                        </span>
                      </p>
                      {eligibilityDetails && (
                        <p>
                          <span className='font-semibold underline underline-offset-2'>
                            More Info:
                          </span>
                          <br /> {eligibilityDetails}
                        </p>
                      )}
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
                        <span
                          className={cn(
                            "p-1 border-1.5  rounded-full",
                            designFee !== null
                              ? "  border-emerald-500 text-emerald-500"
                              : "border-foreground/20 text-foreground/20"
                          )}>
                          <PiPencilLineFill size={18} />
                        </span>
                        <span
                          className={cn(
                            "p-1 border-1.5  rounded-full ",
                            accommodation !== null
                              ? " border-emerald-500 text-emerald-500"
                              : "border-foreground/20 text-foreground/20"
                          )}>
                          <PiHouseLineFill size={18} />
                        </span>
                        <span
                          className={cn(
                            "p-1 border-1.5  rounded-full",
                            food !== null
                              ? "  border-emerald-500 text-emerald-500"
                              : "border-foreground/20 text-foreground/20"
                          )}>
                          <PiForkKnifeFill size={18} />
                        </span>
                        <span
                          className={cn(
                            "p-1 border-1.5  rounded-full",
                            materials !== null
                              ? " border-emerald-500 text-emerald-500 "
                              : "border-foreground/20 text-foreground/20"
                          )}>
                          <FaPaintRoller size={18} />
                        </span>
                        <span
                          className={cn(
                            "p-1 border-1.5  rounded-full",
                            travelCosts !== null
                              ? "  border-emerald-500 text-emerald-500"
                              : "border-foreground/20 text-foreground/20"
                          )}>
                          <IoAirplane size={18} />
                        </span>
                        <span
                          className={cn(
                            "p-1 border-1.5  rounded-full",
                            equipment !== null
                              ? "  border-emerald-500 text-emerald-500"
                              : "border-foreground/20 text-foreground/20"
                          )}>
                          <TbStairs size={18} />
                        </span>
                        <span
                          className={cn(
                            "p-1 border-1.5  rounded-full",
                            other !== null
                              ? "  border-emerald-500 text-emerald-500"
                              : "border-foreground/20 text-foreground/20"
                          )}>
                          <FaRegCommentDots size={18} />
                        </span>
                      </div>
                    </section>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className=' flex flex-col space-y-3  pb-3 mb-4 '>
                      <p>
                        <span className='font-semibold underline underline-offset-2'>
                          Budget:
                        </span>
                        <br />
                        {hasBudget &&
                          formatCurrency(
                            budgetMin,
                            budgetMax,
                            currency,
                            false,
                            allInclusive
                          )}

                        {hasBudget && hasRate && (
                          <span className='text-sm'> | </span>
                        )}

                        {hasRate
                          ? formatRate(
                              budgetRate,
                              budgetRateUnit,
                              currency,
                              true
                            )
                          : "No Info"}
                      </p>
                      <p className='font-semibold underline underline-offset-2'>
                        Compensation Includes:
                      </p>
                      {/* NOTE: How to better display this? It's a bit jarring at the moment
              when viewing it. */}
                      <div className=' flex flex-col gap-y-3 pr-[1px] justify-between'>
                        <div className='flex justify-between items-center border-b border-dashed border-foreground/20'>
                          <p className='font-medium'>Design Fee:</p>
                          <p className='text-right'>
                            {designFee !== null ? (
                              formatCurrency(designFee, null, currency)
                            ) : (
                              <span className='text-red-500 italic'>
                                (not provided)
                              </span>
                            )}
                          </p>
                        </div>

                        <div className='flex justify-between items-center border-b border-dashed border-foreground/20'>
                          <p className='font-medium'>Accommodation:</p>
                          <p className='text-right'>
                            {accommodation !== null ? (
                              accommodation
                            ) : (
                              <span className='text-red-500 italic'>
                                (not provided)
                              </span>
                            )}
                          </p>
                        </div>
                        <div className='flex justify-between items-center border-b border-dashed border-foreground/20'>
                          <p className='font-medium'>Food:</p>
                          <p className='text-right'>
                            {food !== null ? (
                              food
                            ) : (
                              <span className='text-red-500 italic'>
                                (not provided)
                              </span>
                            )}
                          </p>
                        </div>
                        <div className='flex justify-between items-center border-b border-dashed border-foreground/20'>
                          <p className='font-medium'>Travel Costs:</p>
                          <p className='text-right'>
                            {travelCosts !== null ? (
                              travelCosts
                            ) : (
                              <span className='text-red-500 italic'>
                                (not provided)
                              </span>
                            )}
                          </p>
                        </div>
                        <div className='flex justify-between items-center border-b border-dashed border-foreground/20'>
                          <p className='font-medium'>Materials:</p>
                          {materials !== null ? (
                            materials
                          ) : (
                            <span className='text-red-500 italic'>
                              (not provided)
                            </span>
                          )}
                        </div>
                        {/* NOTE: this is a good thought. To add the ability for organizers to just check that it's included in the overall budget so artists don't think it's an additional amount.  */}
                        <div className='flex justify-between items-center border-b border-dashed border-foreground/20'>
                          <p className='font-medium'>Equipment:</p>
                          <p className='text-right'>
                            {equipment !== null ? (
                              equipment
                            ) : (
                              <span className='text-red-500 italic'>
                                (not provided)
                              </span>
                            )}
                          </p>
                        </div>
                        <div className='flex flex-col justify-between items-start gap-y-2 '>
                          <p className='font-medium'>Other:</p>
                          <p>
                            {other !== null ? (
                              other
                            ) : (
                              <span className='text-red-500 italic'>
                                (not provided)
                              </span>
                            )}
                          </p>
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
                        {tabs.opencall.requirements.map(
                          (requirement, index) => (
                            <li key={index}>{requirement}</li>
                          )
                        )}

                        {/* <li>Must have liability insurance</li> */
                        /* TODO: this is something that could/should be later. These sort of requirements*/}
                      </ol>
                      <p className='text-sm'>
                        {tabs.opencall.requirementsMore.map(
                          (requirement, index) => (
                            <span key={index} className='py-1 mr-1'>
                              {requirement}
                            </span>
                          )
                        )}
                      </p>
                      <p className=''>
                        Send applications to
                        <a
                          href={`mailto:${tabs.opencall.requirementDestination}?subject=${event.name} Open Call`}
                          className='mx-1 underline'>
                          {tabs.opencall.requirementDestination}
                        </a>
                        and feel free to reach out with any questions
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value='item-4'>
                  <AccordionTrigger title='Documents:' />
                  <AccordionContent>
                    <ol className='list-decimal list-outside px-4 pl-6'>
                      {tabs.opencall.documents.map((document, index) => (
                        <li key={index} className='py-2'>
                          <a
                            href={document.href}
                            target='_blank'
                            className='flex items-center gap-x-2'>
                            {document.title}
                            <Download className='size-5 hover:scale-110' />
                          </a>
                        </li>
                      ))}
                    </ol>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value='item-5'>
                  <AccordionTrigger title='Other info:' />
                  <AccordionContent>
                    <div className='grid grid-cols-[1fr_auto]  border-foreground/20 pb-3 mb-4'>
                      <ol className='list-decimal list-inside px-4'>
                        {tabs.opencall.otherInfo.map((info, index) => (
                          <li key={index} className='py-1'>
                            {info}
                          </li>
                        ))}
                      </ol>
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
                  className='rounded-none border-x w-fit sm:px-3 px-3'
                  onClick={() => setIsBookmarked(!isBookmarked)}>
                  {isBookmarked ? (
                    <FaBookmark className='size-6 text-emerald-600 ' />
                  ) : (
                    <FaRegBookmark className='size-6 ' />
                  )}
                </Button>
                <Button
                  variant='salWithShadowHidden'
                  size='lg'
                  className='rounded-l-none border-l w-fit sm:px-2 px-2'
                  onClick={() => setIsHidden(!isHidden)}>
                  {isHidden ? (
                    <EyeOff className='size-8 text-red-500' />
                  ) : (
                    <Eye className='size-8' />
                  )}
                </Button>
              </div>
            </Card>
          </TabsContent>
          <TabsContent value='event'>
            <Card className='w-full max-w-[90vw] p-5 bg-white/60 border-foreground/20 rounded-xl'>
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
            </Card>
          </TabsContent>
          <TabsContent value='organizer'>
            <Card
              className='max-w-full overflow-hidden w-full
   p-5 bg-white/60 border-foreground/20 rounded-xl space-y-6'>
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
