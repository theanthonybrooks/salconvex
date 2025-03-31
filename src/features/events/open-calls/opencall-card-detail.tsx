"use client"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  CalendarClockIcon,
  Download,
  EyeOff,
  Globe,
  MapIcon,
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
  FaGlobe,
  FaInstagram,
  FaPaintRoller,
  FaRegBookmark,
  FaRegCommentDots,
  FaThreads,
  FaVk,
} from "react-icons/fa6"
import { IoAirplane } from "react-icons/io5"
import {
  PiForkKnifeFill,
  PiHouseLineFill,
  PiPencilLineFill,
} from "react-icons/pi"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TbStairs } from "react-icons/tb"

import ApplyButton from "@/features/events/event-apply-btn"
import { LazyMap } from "@/features/wrapper-elements/map/lazy-map"
import { CombinedEventCardData } from "@/hooks/use-combined-events"
import { generateICSFile } from "@/lib/addToCalendar"
import {
  formatEventDates,
  formatOpenCallDeadline,
  isValidIsoDate,
} from "@/lib/dateFns"
import {
  formatCurrency,
  formatRate,
  getEventCategoryLabel,
  getEventTypeLabel,
} from "@/lib/eventFns"
import { motion } from "framer-motion"
import Image from "next/image"
import { useState } from "react"

interface OpenCallCardDetailProps {
  event: CombinedEventCardData
  eventOnly?: boolean
}

const OpenCallCardDetail = (props: OpenCallCardDetailProps) => {
  const {
    event,
    eventOnly,
    // organizer,
  } = props
  const {
    // id: eventId,
    logo: eventLogo,
    category: eventCategory,
    eventType,
    location,
    tabs,
    //todo: now that this is dynamically calculated in the combine function, utilize it as a simpler way to show/hide info
    // hasActiveOpenCall: hasOpenCall,
    status,
    // adminNote,
    openCallStatus,
    bookmarked,
    hidden,
    appFee,
    dates,
  } = event

  const { locale, city, stateAbbr, country, countryAbbr } = location
  const { opencall: openCallTab, organizer } = tabs
  const {
    compensation,
    basicInfo,
    eligibility,
    requirements,
    id: openCallId,
  } = openCallTab
  const {
    type: eligibilityType,
    whom: eligibilityWhom,
    details: eligibilityDetails,
  } = eligibility
  const { budget, categories } = compensation
  const {
    designFee,
    accommodation,
    food,
    travelCosts,
    materials,
    equipment,
    other,
  } = categories
  const {
    min: budgetMin,
    max: budgetMax,
    currency,
    rate: budgetRate,

    allInclusive,
  } = budget
  const {
    requirements: reqs,
    more: reqsMore,
    destination: reqsDestination,
    documents: reqsDocs,
  } = requirements

  const { callType, dates: callDates } = basicInfo
  const { ocStart, ocEnd, timezone } = callDates

  const latitude = location.coordinates?.latitude ?? 0
  const longitude = location.coordinates?.longitude ?? 0
  const hasOpenCall = openCallStatus === "active"

  // console.log("has open call", hasOpenCall)

  const [isBookmarked, setIsBookmarked] = useState(bookmarked)
  const [isHidden, setIsHidden] = useState(hidden)
  const [activeTab, setActiveTab] = useState(hasOpenCall ? "opencall" : "event")
  const [isManualApplied, setManualApplied] = useState(status)

  const locationString = `${locale ? `${locale}, ` : ""}${city}, ${
    stateAbbr ? stateAbbr + ", " : ""
  }${countryAbbr === "UK" || countryAbbr === "USA" ? countryAbbr : country}`

  const orgLocationString = `${
    organizer.location.locale ? `${organizer.location.locale}, ` : ""
  }${organizer.location.city}, ${
    organizer.location.stateAbbr ? organizer.location.stateAbbr + ", " : ""
  }${
    organizer.location.countryAbbr === "UK" ||
    organizer.location.countryAbbr === "USA" ||
    organizer.location.country === "United States"
      ? organizer.location.countryAbbr
      : organizer.location.country
  }`

  const icsLink =
    callType === "Fixed" &&
    isValidIsoDate(dates.eventStart) &&
    isValidIsoDate(dates.eventEnd) &&
    isValidIsoDate(ocStart) &&
    isValidIsoDate(ocEnd)
      ? generateICSFile(
          event.name,
          ocStart,
          ocEnd,
          locationString,
          event.about,
          event.category,
          true,
          isValidIsoDate(dates.eventStart) ? dates.eventStart! : "",
          isValidIsoDate(dates.eventEnd) ? dates.eventEnd! : "",
          `${openCallId}`
        )
      : null

  const hasBudget = budgetMin > 0 || (budgetMax && budgetMax > 0)
  const hasRate = budgetRate && budgetRate > 0

  return (
    <Card className='bg-white/50 border-foreground/20 p-3   rounded-3xl mb-10 first:mt-6 max-w-[400px] w-full min-w-[340px] grid grid-cols-[75px_auto] gap-x-3 '>
      {hasOpenCall && status !== null && (
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
            src={eventLogo}
            alt='Event Logo'
            width={60}
            height={60}
            className={cn(
              "rounded-full  border-2 size-[60px] ",
              hasOpenCall &&
                (status === "accepted"
                  ? "ring-4  ring-offset-1 ring-emerald-500"
                  : status === "rejected"
                  ? "ring-4  ring-offset-1 ring-red-500"
                  : status === "pending"
                  ? "ring-4 ring-offset-1 ring-foreground/20"
                  : "")
            )}
          />

          <div className='flex flex-col space-y-4 items-center'>
            {isBookmarked ? (
              <FaBookmark
                className='size-8 text-red-500 mt-3 cursor-pointer'
                onClick={() => setIsBookmarked(false)}
              />
            ) : (
              <FaRegBookmark
                className='size-8 mt-3 cursor-pointer'
                onClick={() => setIsBookmarked(true)}
              />
            )}
            {isHidden && (
              <EyeOff
                className='h-6 w-6 cursor-pointer'
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
              <MapPin
                onClick={() => setActiveTab("event")}
                className='cursor-pointer hover:scale-105 transition-transform duration-150'
              />
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
            {eventType && eventCategory === "event" && (
              <p className='text-sm flex items-center gap-x-1'>
                <span className='font-semibold'>Type:</span>{" "}
                {eventType.map((type) => getEventTypeLabel(type)).join(" | ")}
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
          onValueChange={(value) => setActiveTab(value)}
          value={activeTab}
          defaultValue={activeTab}
          className='w-full flex flex-col justify-center'>
          <TabsList className='relative w-full bg-white/60 justify-around h-12 flex rounded-xl '>
            {["opencall", "event", "organizer"]
              .filter((tab) => !eventOnly || tab !== "opencall")
              .map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className={cn(
                    "relative z-10 h-10 px-4 flex items-center justify-center w-full text-sm font-medium",
                    activeTab === tab ? "text-black" : "text-muted-foreground"
                  )}>
                  {activeTab === tab && (
                    <motion.div
                      layoutId='tab-bg'
                      className='absolute inset-0 bg-background shadow-sm rounded-md z-0'
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className='relative z-10'>
                    {tab === "opencall" && "Open Call"}
                    {tab === "event" && getEventCategoryLabel(eventCategory)}
                    {tab === "organizer" && "Organizer"}
                  </span>
                </TabsTrigger>
              ))}
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
                            ocEnd || "",
                            timezone,
                            callType
                          )}
                          {icsLink && callType === "Fixed" && (
                            <a
                              href={icsLink}
                              download={`${event.name.replace(
                                /\s+/g,
                                "_"
                              )}.ics`}>
                              <CalendarClockIcon className='size-7 md:size-4' />
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
                            ? `${eligibilityType}: ${eligibilityWhom} Artists*`
                            : eligibilityWhom}
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
                    hidePreview
                    className='mx-auto'>
                    <section className='flex flex-col justify-center items-center w-full'>
                      <br />
                      {/* ----------------- Preview Section ------------------/ */}

                      <div
                        id='budget-icons-${id}'
                        className='col-span-2 flex gap-x-3 items-center justify-center max-w-full'>
                        <span
                          className={cn(
                            "p-1 border-1.5  rounded-full",
                            designFee
                              ? "  border-emerald-500 text-emerald-500"
                              : "border-foreground/20 text-foreground/20"
                          )}>
                          <PiPencilLineFill size={18} />
                        </span>
                        <span
                          className={cn(
                            "p-1 border-1.5  rounded-full ",
                            accommodation
                              ? " border-emerald-500 text-emerald-500"
                              : "border-foreground/20 text-foreground/20"
                          )}>
                          <PiHouseLineFill size={18} />
                        </span>
                        <span
                          className={cn(
                            "p-1 border-1.5  rounded-full",
                            food
                              ? "  border-emerald-500 text-emerald-500"
                              : "border-foreground/20 text-foreground/20"
                          )}>
                          <PiForkKnifeFill size={18} />
                        </span>
                        <span
                          className={cn(
                            "p-1 border-1.5  rounded-full",
                            materials
                              ? " border-emerald-500 text-emerald-500 "
                              : "border-foreground/20 text-foreground/20"
                          )}>
                          <FaPaintRoller size={18} />
                        </span>
                        <span
                          className={cn(
                            "p-1 border-1.5  rounded-full",
                            travelCosts
                              ? "  border-emerald-500 text-emerald-500"
                              : "border-foreground/20 text-foreground/20"
                          )}>
                          <IoAirplane size={18} />
                        </span>
                        <span
                          className={cn(
                            "p-1 border-1.5  rounded-full",
                            equipment
                              ? "  border-emerald-500 text-emerald-500"
                              : "border-foreground/20 text-foreground/20"
                          )}>
                          <TbStairs size={18} />
                        </span>
                        <span
                          className={cn(
                            "p-1 border-1.5  rounded-full",
                            other
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

                        {hasRate &&
                          formatRate(
                            budget.rate,
                            budget.unit,
                            budget.currency,
                            true
                          )}
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
                            {designFee && !allInclusive ? (
                              // formatCurrency(designFee, null, currency)
                              designFee
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
                            {accommodation && !allInclusive ? (
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
                            {food && !allInclusive ? (
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
                            {travelCosts && !allInclusive ? (
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
                          {materials && !allInclusive ? (
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
                            {equipment && !allInclusive ? (
                              equipment
                            ) : (
                              <span className='text-red-500 italic'>
                                (not provided)
                              </span>
                            )}
                          </p>
                        </div>
                        {categories && other && (
                          <div className='flex flex-col justify-between items-start gap-y-2 '>
                            <p className='font-medium'>Other:</p>
                            <p>
                              {other && !allInclusive ? (
                                other
                              ) : (
                                <span className='text-red-500 italic'>
                                  (not provided)
                                </span>
                              )}
                            </p>
                          </div>
                        )}
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
                        {reqs.map((requirement, index) => (
                          <li key={index}>{requirement}</li>
                        ))}

                        {/* <li>Must have liability insurance</li> */
                        /* TODO: this is something that could/should be later. These sort of requirements*/}
                      </ol>
                      <p className='text-sm'>
                        {reqsMore.map((requirement, index) => (
                          <span key={index} className='py-1 mr-1'>
                            {requirement}
                          </span>
                        ))}
                      </p>
                      <p className=''>
                        Send applications to
                        <a
                          href={`mailto:${reqsDestination}?subject=${event.name} Open Call`}
                          className='mx-1 underline'>
                          {reqsDestination}
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
                      {reqsDocs?.map((document, index) => (
                        <li key={index} className='py-2'>
                          <div className='flex items-center gap-x-2'>
                            {document.title}
                            <a href={document.href} download={document.title}>
                              <Download className='size-5 hover:scale-110' />
                            </a>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </AccordionContent>
                </AccordionItem>
                {openCallTab.requirements?.otherInfo && (
                  <AccordionItem value='item-5'>
                    <AccordionTrigger title='Other info:' />
                    <AccordionContent>
                      <div className='grid grid-cols-[1fr_auto]  border-foreground/20 pb-3 mb-4'>
                        <ol className='list-decimal list-inside px-4'>
                          {openCallTab.requirements?.otherInfo?.map(
                            (info, index) => (
                              <li key={index} className='py-1'>
                                {info}
                              </li>
                            )
                          )}
                        </ol>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
              <ApplyButton
                id={openCallId}
                // status={status}
                openCall={event.openCallStatus}
                manualApplied={isManualApplied}
                setManualApplied={setManualApplied}
                isBookmarked={isBookmarked}
                setIsBookmarked={setIsBookmarked}
                isHidden={isHidden}
                setIsHidden={setIsHidden}
                eventCategory={eventCategory}
                appFee={appFee ?? 0}
                className='w-full'
                detailCard
              />
            </Card>
          </TabsContent>
          <TabsContent value='event'>
            <Card className='w-full max-w-[95vw] p-5 bg-white/60 border-foreground/20 rounded-xl'>
              <Accordion defaultValue='item-1'>
                {location.coordinates && (
                  <AccordionItem value='item-1'>
                    <AccordionTrigger title='Location:' />

                    <AccordionContent>
                      <LazyMap
                        latitude={latitude}
                        longitude={longitude}
                        label={event.name}
                        className='w-full h-[200px] overflow-hidden rounded-xl z-0 mb-4'
                      />
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`}
                        className='text-sm font-medium flex items-center justify-center gap-x-1 hover:underline underline-offset-2'>
                        Get directions
                        <MapIcon className='size-5 md:size-4' />
                      </a>
                    </AccordionContent>
                  </AccordionItem>
                )}

                <AccordionItem value='item-2'>
                  <AccordionTrigger title='About:' />

                  <AccordionContent>
                    <div className=' flex flex-col space-y-3  pb-3 mb-4'>
                      <p>{event.about}</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                {event.links && (
                  <AccordionItem value='item-3'>
                    <AccordionTrigger title='Links:' />

                    <AccordionContent>
                      <ul className='flex flex-col gap-y-2'>
                        {event.links.map((link, index) => (
                          <li key={index}>
                            <a
                              href={
                                link.type === "email"
                                  ? `mailto:${link.href}?subject=${event.name}`
                                  : link.href
                              }
                              target='_blank'
                              className='flex items-center gap-x-2 hover:underline underline-offset-2'>
                              {link.type === "website" && (
                                <FaGlobe className='size-4' />
                              )}
                              {link.type === "instagram" && (
                                <FaInstagram className='size-4' />
                              )}
                              {link.type === "facebook" && (
                                <FaFacebook className='size-4' />
                              )}
                              {link.type === "threads" && (
                                <FaThreads className='size-4' />
                              )}
                              {link.type === "email" && (
                                <FaEnvelope className='size-4' />
                              )}
                              {link.type === "email" || link.type === "website"
                                ? link.href
                                : link.handle}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {event.otherInfo && (
                  <AccordionItem value='item-4'>
                    <AccordionTrigger title='Other info:' />
                    <AccordionContent>
                      {event.otherInfo.map((info, index) => (
                        <p key={index}>{info}</p>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </Card>
          </TabsContent>
          <TabsContent value='organizer'>
            <Card
              className='max-w-full overflow-hidden w-full
   p-5 bg-white/60 border-foreground/20 rounded-xl space-y-6'>
              <div className='w-full grid grid-cols-[75px_minmax(0,1fr)] items-center '>
                <Image
                  src={organizer.logo}
                  alt='Event Logo'
                  width={60}
                  height={60}
                  className={cn("rounded-full  border-2 size-[60px] ")}
                />
                <div className='col-span-1'>
                  <p className='text-sm font-bold line-clamp-2'>
                    {organizer.name}
                  </p>
                  <p className='text-sm font-medium'>{orgLocationString}</p>
                </div>
              </div>
              <div className='w-full space-y-5'>
                <section>
                  <p className='font-semibold text-sm'>
                    About the Organization:
                  </p>
                  <p className='text-sm line-clamp-4'>{organizer.about}</p>
                </section>
                <section className='flex flex-col gap-y-2'>
                  <span>
                    <p className='font-semibold text-sm'>Organizer:</p>
                    <p className='text-sm line-clamp-4'>
                      {organizer.contact.organizer}
                    </p>
                  </span>
                  <span>
                    <p className='font-semibold text-sm'>Main Contact:</p>
                    <div className='flex items-center gap-x-2'>
                      {organizer.contact.primaryContact.email ? (
                        <FaEnvelope />
                      ) : organizer.contact.primaryContact.phone ? (
                        <Phone />
                      ) : (
                        <Globe />
                      )}

                      <a
                        href={
                          organizer.contact.primaryContact.email
                            ? `mailto:${organizer.contact.primaryContact.email}`
                            : organizer.contact.primaryContact.href
                            ? organizer.contact.primaryContact.href
                            : `tel:${organizer.contact.primaryContact.phone}`
                        }
                        className='text-sm line-clamp-4 hover:underline underline-offset-2'>
                        {organizer.contact.primaryContact.phone
                          ? organizer.contact.primaryContact.phone
                          : organizer.contact.primaryContact.href
                          ? organizer.contact.primaryContact.href
                          : organizer.contact.primaryContact.email}
                      </a>
                    </div>
                  </span>
                </section>
                <section>
                  <p className='font-semibold text-sm'>Links:</p>
                  <div className='flex gap-x-6 items-center justify-start pt-3'>
                    {organizer.links.website && (
                      <a
                        href={organizer.links.website}
                        className='h-6 w-6 hover:scale-110 '>
                        <Globe className='h-6 w-6' />
                      </a>
                    )}
                    {organizer.links.email && (
                      <a
                        href={`mailto:${organizer.links.email}`}
                        className='h-6 w-6 hover:scale-110 '>
                        <FaEnvelope className='h-6 w-6' />
                      </a>
                    )}
                    {organizer.links.phone && (
                      <a
                        href={`tel:${organizer.links.phone}`}
                        className='h-6 w-6 hover:scale-110 '>
                        <Phone className='h-6 w-6' />
                      </a>
                    )}
                    {organizer.links.instagram && (
                      <a
                        href={organizer.links.instagram}
                        className='h-6 w-6 hover:scale-110 '>
                        <FaInstagram className='h-6 w-6' />
                      </a>
                    )}
                    {organizer.links.facebook && (
                      <a
                        href={organizer.links.facebook}
                        className='h-6 w-6 hover:scale-110 '>
                        <FaFacebook className='h-6 w-6' />
                      </a>
                    )}
                    {organizer.links.threads && (
                      <a
                        href={organizer.links.threads}
                        className='h-6 w-6 hover:scale-110 '>
                        <FaThreads className='h-6 w-6' />
                      </a>
                    )}
                    {organizer.links.vk && (
                      <a
                        href={organizer.links.vk}
                        className='h-6 w-6 hover:scale-110 '>
                        <FaVk className='h-6 w-6' />
                      </a>
                    )}
                  </div>
                  <a
                    className='text-sm line-clamp-4 text-center mt-6 hover:underline underline-offset-2'
                    href={`/organizer/${organizer.id}`}>
                    Check out {organizer.name}&apos;s other events
                  </a>
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

export default OpenCallCardDetail
