"use client"

import { Card } from "@/components/ui/card"
import ApplyButton, {
  ApplyButtonShort,
} from "@/features/events/event-apply-btn"
import { CombinedEventCardData } from "@/hooks/use-combined-events"
import { formatEventDates, formatOpenCallDeadline } from "@/lib/dateFns"
import {
  formatCurrency,
  formatRate,
  getEventCategoryLabel,
  getEventTypeLabel,
} from "@/lib/eventFns"

import { cn } from "@/lib/utils"
import {
  CheckCircleIcon,
  CircleDollarSignIcon,
  Ellipsis,
  EyeOff,
  Info,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
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
} from "react-icons/fa6"
import { IoAirplane } from "react-icons/io5"
import {
  PiForkKnifeFill,
  PiHouseLineFill,
  PiPencilLineFill,
} from "react-icons/pi"
import { TbStairs } from "react-icons/tb"

export interface EventCardPreviewProps {
  event: CombinedEventCardData
  publicView?: boolean
}

const EventCardPreview = ({ event, publicView }: EventCardPreviewProps) => {
  const {
    dates,
    location,
    category,
    id,
    eventType,
    name,
    logo,
    tabs,
    bookmarked,
    hidden,
  } = event
  console.log("event status", event.status)
  const { opencall, organizer } = tabs

  // const { compensation, basicInfo, eligibility } = opencall
  // const { budget, categories } = compensation
  const compensation = event.hasActiveOpenCall
    ? opencall?.compensation
    : undefined
  const basicInfo = event.hasActiveOpenCall ? opencall?.basicInfo : undefined
  const eligibility = event.hasActiveOpenCall
    ? opencall?.eligibility
    : undefined
  const budget = compensation?.budget
  const categories = compensation?.categories ?? {}

  const { locale, city, stateAbbr, country, countryAbbr } = location

  const locationParts: string[] = []

  if (locale) locationParts.push(locale)

  if (city && stateAbbr) {
    locationParts.push(`${city}, ${stateAbbr}`)
  } else if (city) {
    locationParts.push(city)
  } else if (stateAbbr) {
    locationParts.push(stateAbbr)
  }

  if (countryAbbr === "UK" || countryAbbr === "USA") {
    locationParts.push(countryAbbr)
  } else if (country) {
    locationParts.push(country)
  }

  const locationString = locationParts.join(",\n")

  const [isBookmarked, setIsBookmarked] = useState(bookmarked)
  const [isHidden, setIsHidden] = useState(hidden)
  const [isManualApplied, setManualApplied] = useState(event.status)
  //Todo: This should technically override the status if cleared and remove any application status for that event for that user

  // const icsLink =
  //   callType === "Fixed" && dates.ocStart && dates.ocEnd
  //     ? generateICSFile(
  //         event.name,
  //         dates.ocStart,
  //         dates.ocEnd,
  //         locationString,
  //         eventTab.about,
  //         dates.eventStart ? dates.eventStart : "",
  //         dates.eventEnd,
  //         `${id}`
  //       )
  //     : null

  const hasBudget = !!(
    budget &&
    (budget.min > 0 || (budget.max && budget.max > 0))
  )
  const hasRate = !!(budget && budget.rate && budget.rate > 0)

  const isCurrentlyOpen =
    basicInfo && budget && eligibility && event.hasActiveOpenCall

  // const userCurrency = userPref?.currency ?? ""

  return (
    <>
      {/* //---------------------- (Mobile) Layout ---------------------- */}
      <Card className='lg:hidden bg-white/40 border-foreground/20 grid grid-cols-[75px_minmax(0,auto)_50px] min-w-[340px]  w-[90vw] max-w-[400px] gap-x-3 rounded-3xl mb-10 first:mt-6 px-1 py-2'>
        <div className='row-span-2 col-span-1 flex flex-col items-center justify-between pt-3 pb-3 pl-2'>
          <Link href={`/organization/${organizer.id}`} target='_blank'>
            <Image
              src={logo}
              alt='Event Logo'
              className={cn(
                "rounded-full  border border-black size-12 ",
                !publicView &&
                  (event.status === "accepted"
                    ? "ring-4  ring-offset-1 ring-emerald-500"
                    : event.status === "rejected"
                    ? "ring-4  ring-offset-1 ring-red-500"
                    : event.status === "pending"
                    ? "ring-4 ring-offset-1 ring-foreground/30"
                    : "")
              )}
              height={48}
              width={48}
            />
          </Link>
          <div
            className={cn(
              "border-dotted border-1.5 h-11 w-14 rounded-lg flex flex-col justify-center items-center py-[5px]",
              !isCurrentlyOpen && "opacity-0"
            )}>
            <span className='text-2xs leading-[0.85rem]'>Call Type</span>
            <span className='text-md font-bold font-foreground leading-[0.85rem]'>
              {basicInfo && basicInfo.callFormat}
            </span>
            {/* // todo: make this dynamic to show project, event, etc for the type */}
            <span className='text-2xs leading-[0.85rem]'>
              {getEventCategoryLabel(category)}
            </span>
          </div>
        </div>

        {/* <CardHeader>
            <CardTitle>The List</CardTitle>
          </CardHeader>*/}
        <div className='pt-3 pb-3 flex-col flex gap-y-3'>
          <div className='flex flex-col gap-y-1 mb-2'>
            <div className='flex flex-col gap-y-1 mb-2'>
              <p className='text-base font-semibold'>{event?.name}</p>
              <p className='text-sm'>{locationString}</p>
            </div>
            <p className='text-sm flex items-center gap-x-1'>
              {/* // todo: make this dynamic to show whether event, project, or... else. This won't necessarily be an event timeline, and I think it should default to painting dates rather than event dates */}
              <span className='font-semibold'>Dates:</span>
              {formatEventDates(dates?.eventStart || "", dates.eventEnd, true)}
            </p>
            {isCurrentlyOpen && (
              <p className={cn("text-sm  flex items-center gap-x-1")}>
                <span className={"font-semibold"}>
                  {basicInfo.callType === "Fixed" ? "Deadline" : "Status"}:
                </span>
                {publicView ? (
                  <span className='blur-[5px]'>This Year</span>
                ) : (
                  formatOpenCallDeadline(
                    basicInfo.dates?.ocEnd || "",
                    basicInfo.dates?.timezone,
                    basicInfo.callType,
                    true
                  )
                )}
              </p>
            )}
            {isCurrentlyOpen && (
              <p className={cn("text-sm flex items-center gap-x-1")}>
                <span className='font-semibold'>Budget:</span>
                {publicView ? (
                  <span className='blur-[5px]'>Sign in to view</span>
                ) : budget.min > 0 || (budget.max && budget.max > 0) ? (
                  formatCurrency(
                    budget.min,
                    budget.max,
                    budget.currency,
                    true,
                    budget.allInclusive
                    // userCurrency !== currency ? userCurrency : undefined
                  )
                ) : budget.rate && budget.rate > 0 ? (
                  formatRate(
                    budget.rate,
                    budget.unit,
                    budget.currency,
                    budget.allInclusive
                    // userCurrency !== currency ? userCurrency : undefined
                  )
                ) : (
                  "No Info"
                )}
              </p>
            )}
            {isCurrentlyOpen && (
              <p
                className={cn(
                  "text-sm flex items-center gap-x-1",
                  !event.hasActiveOpenCall && "hidden"
                )}>
                <span className='font-semibold'>Eligible:</span>
                {publicView ? (
                  <span className='blur-[5px]'>$3 per month</span>
                ) : (
                  <span
                    className={cn(
                      eligibility.type !== "International" && "text-red-600"
                    )}>
                    {eligibility.whom}
                    {eligibility.type !== "International" && " Artists*"}
                  </span>
                )}
              </p>
            )}
          </div>

          <ApplyButtonShort
            id={id}
            status={event.status}
            openCall={event.openCallStatus}
            publicView={publicView}
            appFee={basicInfo ? basicInfo.appFee : 0}
          />
        </div>
        <div className='flex flex-col items-center justify-between pt-5 pb-5 pr-2'>
          {event.status === null && !isManualApplied ? (
            <CircleDollarSignIcon
              className={cn(
                "size-6 text-red-600",
                !basicInfo?.appFee && "opacity-0"
              )}
            />
          ) : (
            <CheckCircleIcon
              className={cn("size-6 text-emerald-600", publicView && "hidden")}
            />
          )}
          <div className='flex gap-x-2 items-center justify-center'>
            {/* <EyeOff className='size-6' /> //NOTE: Move this to the detailed card view */}
            {/* TODO: Add publicView check to this as well (when the state is set up) */}
            {isBookmarked ? (
              <FaBookmark
                className='size-8 text-red-600 cursor-pointer'
                onClick={() => setIsBookmarked(!isBookmarked)}
              />
            ) : (
              <FaRegBookmark
                className='size-8 cursor-pointer'
                onClick={() => setIsBookmarked(!isBookmarked)}
              />
            )}
          </div>
        </div>
      </Card>
      {/* //---------------------- (Desktop) Layout ---------------------- */}
      <Card
        className={cn(
          "hidden bg-white/40 border-foreground/20 lg:grid grid-cols-[60px_minmax(0,auto)_15%_25%_25%] min-w-[640px] min-h-[15em] w-[90vw] max-w-7xl gap-x-3 rounded-3xl mb-10 first:mt-6 "
        )}>
        <div className='flex flex-col items-center justify-between  border-r border-foreground/20 pb-3 pt-5'>
          <div className='flex flex-col gap-y-3 items-center'>
            {isBookmarked ? (
              <FaBookmark
                className='size-7 text-red-600 cursor-pointer'
                onClick={() => setIsBookmarked(!isBookmarked)}
              />
            ) : (
              <FaRegBookmark
                className='size-7 cursor-pointer'
                onClick={() => setIsBookmarked(!isBookmarked)}
              />
            )}
            {isManualApplied === null ? (
              <CircleDollarSignIcon
                className={cn(
                  "size-6 text-red-600",
                  !basicInfo?.appFee && "hidden"
                )}
              />
            ) : (
              <CheckCircleIcon
                className={cn(
                  "size-6 text-emerald-600",
                  publicView && "hidden"
                )}
              />
            )}
            {isHidden && (
              <EyeOff
                className='size-6 cursor-pointer'
                onClick={() => setIsHidden(!isHidden)}
              />
            )}
            {/* TODO: Add publicView check to this as well (when the state is set up) */}
          </div>
          <Ellipsis className='size-7' />
        </div>

        <div className='pt-5 pb-3 pl-3 flex-col flex gap-y-3'>
          <div className='flex flex-col gap-y-1 mb-2 p-2'>
            <Link href={`/organization/${organizer.id}`} target='_blank'>
              <div className='flex gap-x-3 items-center mb-2'>
                <Image
                  src={logo}
                  alt='Event Logo'
                  className={cn(
                    "rounded-full  border border-black size-12 ",
                    !publicView &&
                      (event.status === "accepted"
                        ? "ring-4  ring-offset-1 ring-emerald-500"
                        : event.status === "rejected"
                        ? "ring-4  ring-offset-1 ring-red-500"
                        : event.status === "pending"
                        ? "ring-4 ring-offset-1 ring-foreground/30"
                        : "")
                  )}
                  height={48}
                  width={48}
                />
                <p className='text-base font-semibold'>{name}</p>
                {/* <p className='text-sm'>{locationString}</p> */}
              </div>
            </Link>
            <p className='text-sm flex items-center gap-x-1'>
              {/* // todo: make this dynamic to show whether event, project, or... else. This won't necessarily be an event timeline, and I think it should default to painting dates rather than event dates */}
              <span className='font-semibold'>Dates:</span>
              {formatEventDates(dates?.eventStart || "", dates.eventEnd, true)}
            </p>
            <p className='text-sm flex items-center gap-x-1'>
              <span className='font-semibold'>Category:</span>

              {getEventCategoryLabel(event.category)}
            </p>
            {event.category === "event" && eventType && (
              <p className='text-sm flex items-center gap-x-1'>
                <span className='font-semibold'>Type:</span>
                {eventType.map((type) => getEventTypeLabel(type)).join(" | ")}
              </p>
            )}
            {(event.adminNote || event.adminNoteOC) && (
              <p className='text-sm flex flex-col gap-y-1'>
                <span className='font-semibold'>Note:</span>
                {event.adminNoteOC && event.adminNoteOC}
                {event.adminNote && !event.adminNoteOC && event.adminNote}
              </p>
            )}
          </div>
        </div>
        <div className='pt-8 pb-3 flex-col flex gap-y-6 text-sm'>
          {/* // todo: make this dynamic to show whether event, project, or... else. This won't necessarily be an event timeline, and I think it should default to painting dates rather than event dates */}
          <span className='font-semibold'>Location:</span>
          <div>
            {locationString.split("\n").map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        </div>
        {isCurrentlyOpen ? (
          <div className='pt-8 pb-3 flex-col flex gap-y-6 text-sm'>
            <span className='font-semibold '>Open Call:</span>
            <div className='flex flex-col gap-y-2'>
              <p className={cn("text-sm  flex items-center gap-x-1")}>
                <span className={"font-semibold"}>
                  {basicInfo?.callType === "Fixed" ? "Deadline" : "Status"}:
                </span>
                {publicView ? (
                  <span className='blur-[5px]'>This Year</span>
                ) : (
                  <>
                    <span className='hidden xl:block'>
                      {formatOpenCallDeadline(
                        basicInfo.dates?.ocEnd || "",
                        basicInfo.dates?.timezone,
                        basicInfo.callType
                      )}
                    </span>
                    <span className='block xl:hidden'>
                      {formatOpenCallDeadline(
                        basicInfo.dates?.ocEnd || "",
                        basicInfo.dates?.timezone,
                        basicInfo.callType,
                        true
                      )}
                    </span>
                  </>
                )}
              </p>
              <p className={cn("text-sm flex items-center gap-x-1")}>
                <span className='font-semibold'>Eligible:</span>
                {publicView ? (
                  <span className='blur-[5px]'>$3 per month</span>
                ) : (
                  <span
                    className={cn(
                      eligibility.type !== "International" && "text-red-600"
                    )}>
                    {eligibility.type !== "International" &&
                      `${eligibility.type}: `}
                    {eligibility.whom}
                    {eligibility.type !== "International" && " Artists*"}
                  </span>
                )}
              </p>
              <p className='flex gap-x-2 items-center'>
                <span className='font-semibold '>Budget:</span>
                {publicView ? (
                  <span className='blur-[5px]'>Get paid for your work</span>
                ) : (
                  <>
                    {hasBudget &&
                      formatCurrency(
                        budget.min,
                        budget.max,
                        budget.currency,
                        false,
                        budget.allInclusive
                      )}
                    <span className='hidden xl:block'>
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
                    </span>
                    {!budget.allInclusive && <span className='text-sm'>*</span>}
                  </>
                )}
              </p>
              {!publicView && (
                <div
                  id='budget-icons-${id}'
                  className='col-span-2 mt-1 xl:flex gap-x-3 items-center justify-start max-w-full hidden'>
                  <span
                    className={cn(
                      "p-1 border-1.5  rounded-full",
                      categories.designFee && !budget.allInclusive
                        ? "  border-emerald-500 text-emerald-500"
                        : "border-foreground/20 text-foreground/20"
                    )}>
                    <PiPencilLineFill size={18} />
                  </span>
                  <span
                    className={cn(
                      "p-1 border-1.5  rounded-full ",
                      categories.accommodation && !budget.allInclusive
                        ? " border-emerald-500 text-emerald-500"
                        : "border-foreground/20 text-foreground/20"
                    )}>
                    <PiHouseLineFill size={18} />
                  </span>
                  <span
                    className={cn(
                      "p-1 border-1.5  rounded-full",
                      categories.food && !budget.allInclusive
                        ? "  border-emerald-500 text-emerald-500"
                        : "border-foreground/20 text-foreground/20"
                    )}>
                    <PiForkKnifeFill size={18} />
                  </span>
                  <span
                    className={cn(
                      "p-1 border-1.5  rounded-full",
                      categories.materials && !budget.allInclusive
                        ? " border-emerald-500 text-emerald-500 "
                        : "border-foreground/20 text-foreground/20"
                    )}>
                    <FaPaintRoller size={18} />
                  </span>
                  <span
                    className={cn(
                      "p-1 border-1.5  rounded-full",
                      categories.travelCosts && !budget.allInclusive
                        ? "  border-emerald-500 text-emerald-500"
                        : "border-foreground/20 text-foreground/20"
                    )}>
                    <IoAirplane size={18} />
                  </span>
                  <span
                    className={cn(
                      "p-1 border-1.5  rounded-full",
                      categories.equipment && !budget.allInclusive
                        ? "  border-emerald-500 text-emerald-500"
                        : "border-foreground/20 text-foreground/20"
                    )}>
                    <TbStairs size={18} />
                  </span>
                  <span
                    className={cn(
                      "p-1 border-1.5  rounded-full",
                      categories.other && !budget.allInclusive
                        ? "  border-emerald-500 text-emerald-500"
                        : "border-foreground/20 text-foreground/20"
                    )}>
                    <FaRegCommentDots size={18} />
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className='pt-8 pb-3 flex-col flex gap-y-6 text-sm'>
            <span className='font-semibold '>Event Links:</span>
            <div className='flex flex-col gap-y-2 '>
              {event.links.map((link, index) => {
                return (
                  <Link key={index} href={link.href} target='_blank'>
                    <div className='flex gap-x-2 items-center justify-start '>
                      {link.type === "website" && (
                        <FaGlobe className='size-5 hover:scale-110 ' />
                      )}
                      {link.type === "instagram" && (
                        <FaInstagram className='size-5 hover:scale-110 ' />
                      )}
                      {link.type === "facebook" && (
                        <FaFacebook className='size-5 hover:scale-110 ' />
                      )}
                      {link.type === "threads" && (
                        <FaThreads className='size-5 hover:scale-110 ' />
                      )}
                      {link.type === "email" && (
                        <FaEnvelope className='size-5 hover:scale-110 ' />
                      )}
                      <span className='hover:underline underline-offset-2'>
                        {link.type === "email" || link.type === "website"
                          ? link.href.split("www.").slice(-1)[0]
                          : link.handle}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
        <div className='py-6 flex-col flex gap-y-6 text-sm items-center justify-center'>
          {/* {openCall === "active" && (
            <div
              className={cn(
                "border-dotted border-1.5 h-11 w-14 rounded-lg flex flex-col justify-center items-center py-[5px]",
                !event.hasActiveOpenCall && "opacity-0"
              )}>
              <span className='text-2xs leading-[0.85rem]'>Call Type</span>
              <span className='text-md font-bold font-foreground leading-[0.85rem]'>
                {callFormat}
              </span>
              /~ // todo: make this dynamic to show project, event, etc for the type ~/
              <span className='text-2xs leading-[0.85rem]'>
                {getEventCategoryLabel(eventCategory)}
              </span>
            </div>
          )}*/}
          {event.openCallStatus !== null && (
            <>
              {event.openCallStatus === "coming-soon" ? (
                <p className='text-sm'>Open Call Coming Soon!</p>
              ) : event.openCallStatus === "ended" ? (
                <p className='text-sm'>Open Call Ended</p>
              ) : (
                ""
              )}
            </>
          )}
          {isCurrentlyOpen && basicInfo.appFee !== 0 && (
            <p className='text-sm flex items-center gap-x-1 text-red-600'>
              <span className='font-semibold flex items-center gap-x-1'>
                <Info /> Application Fee:
              </span>
              {`$${basicInfo.appFee}`}
            </p>
          )}

          <ApplyButton
            id={id}
            // status={status}
            openCall={event.openCallStatus}
            publicView={publicView}
            manualApplied={isManualApplied}
            setManualApplied={setManualApplied}
            isBookmarked={isBookmarked}
            setIsBookmarked={setIsBookmarked}
            isHidden={isHidden}
            setIsHidden={setIsHidden}
            eventCategory={event.category}
            isPreview={true}
            appFee={basicInfo ? basicInfo.appFee : 0}
          />
        </div>
      </Card>
    </>
  )
}

export default EventCardPreview
