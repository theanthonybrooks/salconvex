"use client"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  CalendarClockIcon,
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
  FaRegBookmark,
  FaThreads,
  FaVk,
} from "react-icons/fa6"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { LazyMap } from "@/features/wrapper-elements/map/lazy-map"
import { CombinedEventCardData } from "@/hooks/use-combined-events"
import { generateICSFile } from "@/lib/addToCalendar"
import { formatEventDates, isValidIsoDate } from "@/lib/dateFns"
import { getEventCategoryLabel, getEventTypeLabel } from "@/lib/eventFns"
import { motion } from "framer-motion"
import Image from "next/image"
import { useState } from "react"

interface EventCardDetailProps {
  event: CombinedEventCardData
}

const EventCardDetail = (props: EventCardDetailProps) => {
  const {
    event,

    // organizer,
  } = props
  const {
    id: eventId,
    logo: eventLogo,
    category: eventCategory,
    eventType,
    location,
    tabs,
    // hasActiveOpenCall: hasOpenCall,
    // adminNote,
    dates,
    bookmarked,
    hidden,
    appFee,
  } = event

  const { locale, city, stateAbbr, country, countryAbbr } = location
  const { organizer } = tabs

  const latitude = location.coordinates?.latitude ?? 0
  const longitude = location.coordinates?.longitude ?? 0

  const { eventStart, eventEnd } = dates

  const [isBookmarked, setIsBookmarked] = useState(bookmarked)
  const [isHidden, setIsHidden] = useState(hidden)
  const [activeTab, setActiveTab] = useState("event")

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
    isValidIsoDate(eventStart) && isValidIsoDate(eventEnd)
      ? generateICSFile(
          event.name,
          eventStart,
          eventEnd,
          locationString,
          event.about,
          event.category,
          false,
          isValidIsoDate(dates.eventStart) ? dates.eventStart! : "",
          isValidIsoDate(dates.eventEnd) ? dates.eventEnd! : "",
          `${eventId}`
        )
      : null

  return (
    <Card className='bg-white/50 border-foreground/20 p-3   rounded-3xl mb-10 first:mt-6 max-w-[400px] w-full min-w-[340px] grid grid-cols-[75px_auto] gap-x-3 '>
      <div className='w-full grid col-span-full  grid-cols-[75px_auto]  gap-x-3 mb-4'>
        <div className='col-span-1 flex flex-col items-center justify-around space-y-6 pt-3 pb-3'>
          <Image
            src={eventLogo}
            alt='Event Logo'
            width={60}
            height={60}
            className={cn("rounded-full  border-2 size-[60px] ")}
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
              {formatEventDates(dates?.eventStart || "", dates.eventEnd)}{" "}
              {icsLink && (
                <a
                  href={icsLink}
                  download={`${event.name.replace(/\s+/g, "_")}.ics`}>
                  <CalendarClockIcon className='size-5 md:size-4' />
                </a>
              )}
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
            {["event", "organizer"].map((tab) => (
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

export default EventCardDetail
