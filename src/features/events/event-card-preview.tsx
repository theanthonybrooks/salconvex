"use client"

import { Card } from "@/components/ui/card"
import ApplyButton, {
  ApplyButtonShort,
} from "@/features/events/event-apply-btn"
import { formatEventDates, formatOpenCallDeadline } from "@/lib/dateFns"
import {
  formatCurrency,
  formatRate,
  getEventCategoryLabel,
  getEventTypeLabel,
} from "@/lib/eventFns"

import { cn } from "@/lib/utils"
import { EventData } from "@/types/event"
import { UserPref } from "@/types/user"
import {
  CheckCircleIcon,
  CircleDollarSignIcon,
  Ellipsis,
  EyeOff,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import {
  FaBookmark,
  FaPaintRoller,
  FaRegBookmark,
  FaRegCommentDots,
} from "react-icons/fa6"
import { IoAirplane } from "react-icons/io5"
import {
  PiForkKnifeFill,
  PiHouseLineFill,
  PiPencilLineFill,
} from "react-icons/pi"
import { TbStairs } from "react-icons/tb"

type EventCardPreviewProps = EventData & {
  publicView?: boolean
  userPref?: UserPref | null
}

const EventCardPreview = (props: EventCardPreviewProps) => {
  const {
    id,
    logo,
    status,
    callFormat,
    callType,
    eventType,
    eventCategory,
    adminNote,
    event,
    location,
    dates,
    budgetMin,
    budgetMax,
    currency,
    budgetRate,
    budgetRateUnit,
    allInclusive,
    eligibility,
    eligibilityType,
    openCall,
    appFee,
    bookmarked,
    hidden,
    publicView,
    tabs,

    // userPref,
  } = props
  const { opencall, organizer } = tabs
  const { locale, city, stateAbbr, country, countryAbbr } = location
  const {
    designFee,
    accommodation,
    food,
    travelCosts,
    materials,
    equipment,
    other,
  } = opencall.compensation

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
  const [isManualApplied, setManualApplied] = useState(status)
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

  const hasBudget = budgetMin > 0 || (budgetMax && budgetMax > 0)
  const hasRate = budgetRate && budgetRate > 0

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
                status === "accepted"
                  ? "ring-4  ring-offset-1 ring-emerald-500"
                  : status === "rejected"
                  ? "ring-4  ring-offset-1 ring-red-500"
                  : status === "pending"
                  ? "ring-4 ring-offset-1 ring-foreground/30"
                  : ""
              )}
              height={48}
              width={48}
            />
          </Link>
          <div
            className={cn(
              "border-dotted border-1.5 h-11 w-14 rounded-lg flex flex-col justify-center items-center py-[5px]",
              !openCall && "opacity-0"
            )}>
            <span className='text-2xs leading-[0.85rem]'>Call Type</span>
            <span className='text-md font-bold font-foreground leading-[0.85rem]'>
              {callFormat}
            </span>
            {/* // todo: make this dynamic to show project, event, etc for the type */}
            <span className='text-2xs leading-[0.85rem]'>
              {getEventCategoryLabel(eventCategory)}
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
            <p
              className={cn(
                "text-sm  flex items-center gap-x-1",
                !openCall && "hidden"
              )}>
              <span className={"font-semibold"}>
                {callType === "Fixed" ? "Deadline" : "Status"}:
              </span>
              {publicView ? (
                <span className='blur-[5px]'>This Year</span>
              ) : (
                formatOpenCallDeadline(
                  dates?.ocEnd || "",
                  dates?.timezone,
                  callType,
                  true
                )
              )}
            </p>
            <p
              className={cn(
                "text-sm flex items-center gap-x-1",
                !openCall && "hidden"
              )}>
              <span className='font-semibold'>Budget:</span>
              {publicView ? (
                <span className='blur-[5px]'>Sign in to view</span>
              ) : budgetMin > 0 || (budgetMax && budgetMax > 0) ? (
                formatCurrency(
                  budgetMin,
                  budgetMax,
                  currency,
                  true,
                  allInclusive
                  // userCurrency !== currency ? userCurrency : undefined
                )
              ) : budgetRate && budgetRate > 0 ? (
                formatRate(
                  budgetRate,
                  budgetRateUnit,
                  currency,
                  allInclusive
                  // userCurrency !== currency ? userCurrency : undefined
                )
              ) : (
                "No Info"
              )}
            </p>
            <p
              className={cn(
                "text-sm flex items-center gap-x-1",
                !openCall && "hidden"
              )}>
              <span className='font-semibold'>Eligible:</span>
              {publicView ? (
                <span className='blur-[5px]'>$3 per month</span>
              ) : (
                <span
                  className={cn(
                    eligibilityType !== "International" && "text-red-600"
                  )}>
                  {eligibility}
                  {eligibilityType !== "International" && " Artists*"}
                </span>
              )}
            </p>
          </div>

          <ApplyButtonShort
            id={id}
            status={status}
            openCall={openCall}
            publicView={publicView}
            appFee={appFee}
          />
        </div>
        <div className='flex flex-col items-center justify-between pt-5 pb-5 pr-2'>
          {status === null && !isManualApplied ? (
            <CircleDollarSignIcon
              className={cn("size-6 text-red-600", !appFee && "opacity-0")}
            />
          ) : (
            <CheckCircleIcon className={cn("size-6 text-emerald-600")} />
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
          "hidden bg-white/40 border-foreground/20 lg:grid grid-cols-[60px_minmax(0,auto)_15%_25%_25%] min-w-[640px] min-h-[15em] w-[90vw] max-w-[90vw] gap-x-3 rounded-3xl mb-10 first:mt-6 "
        )}>
        <div className='flex flex-col items-center justify-between  border-r border-foreground pb-3 pt-5'>
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
                className={cn("size-6 text-red-600", !appFee && "hidden")}
              />
            ) : (
              <CheckCircleIcon className={cn("size-6 text-emerald-600")} />
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
                    status === "accepted"
                      ? "ring-4  ring-offset-1 ring-emerald-500"
                      : status === "rejected"
                      ? "ring-4  ring-offset-1 ring-red-500"
                      : status === "pending"
                      ? "ring-4 ring-offset-1 ring-foreground/30"
                      : ""
                  )}
                  height={48}
                  width={48}
                />
                <p className='text-base font-semibold'>{event?.name}</p>
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

              {getEventCategoryLabel(eventCategory)}
            </p>
            {eventCategory === "event" && (
              <p className='text-sm flex items-center gap-x-1'>
                <span className='font-semibold'>Type:</span>

                {getEventTypeLabel(eventType)}
              </p>
            )}
            {adminNote && (
              <p className='text-sm flex flex-col gap-y-1'>
                <span className='font-semibold'>Note:</span>
                {adminNote}
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
        <div className='pt-8 pb-3 flex-col flex gap-y-6 text-sm'>
          <span className='font-semibold '>Open Call:</span>
          <div className='flex flex-col gap-y-2'>
            <p
              className={cn(
                "text-sm  flex items-center gap-x-1",
                !openCall && "hidden"
              )}>
              <span className={"font-semibold"}>
                {callType === "Fixed" ? "Deadline" : "Status"}:
              </span>
              {publicView ? (
                <span className='blur-[5px]'>This Year</span>
              ) : (
                <>
                  <span className='hidden xl:block'>
                    {formatOpenCallDeadline(
                      dates?.ocEnd || "",
                      dates?.timezone,
                      callType
                    )}
                  </span>
                  <span className='block xl:hidden'>
                    {formatOpenCallDeadline(
                      dates?.ocEnd || "",
                      dates?.timezone,
                      callType,
                      true
                    )}
                  </span>
                </>
              )}
            </p>
            <p
              className={cn(
                "text-sm flex items-center gap-x-1",
                !openCall && "hidden"
              )}>
              <span className='font-semibold'>Eligible:</span>
              {publicView ? (
                <span className='blur-[5px]'>$3 per month</span>
              ) : (
                <span
                  className={cn(
                    eligibilityType !== "International" && "text-red-600"
                  )}>
                  {eligibilityType !== "International" &&
                    `${eligibilityType}: `}
                  {eligibility}
                  {eligibilityType !== "International" && " Artists*"}
                </span>
              )}
            </p>
            <p className='flex gap-x-2 items-center'>
              <span className='font-semibold '>Budget:</span>

              {hasBudget &&
                formatCurrency(
                  budgetMin,
                  budgetMax,
                  currency,
                  false,
                  allInclusive
                )}
              <span className='hidden xl:block'>
                {hasBudget && hasRate && <span className='text-sm'> | </span>}

                {hasRate
                  ? formatRate(budgetRate, budgetRateUnit, currency, true)
                  : "No Info"}
              </span>
              {!allInclusive && <span className='text-sm'>*</span>}
            </p>
            <div
              id='budget-icons-${id}'
              className='col-span-2 mt-1 xl:flex gap-x-3 items-center justify-start max-w-full hidden'>
              <span
                className={cn(
                  "p-1 border-1.5  rounded-full",
                  designFee !== null && !allInclusive
                    ? "  border-emerald-500 text-emerald-500"
                    : "border-foreground/20 text-foreground/20"
                )}>
                <PiPencilLineFill size={18} />
              </span>
              <span
                className={cn(
                  "p-1 border-1.5  rounded-full ",
                  accommodation !== null && !allInclusive
                    ? " border-emerald-500 text-emerald-500"
                    : "border-foreground/20 text-foreground/20"
                )}>
                <PiHouseLineFill size={18} />
              </span>
              <span
                className={cn(
                  "p-1 border-1.5  rounded-full",
                  food !== null && !allInclusive
                    ? "  border-emerald-500 text-emerald-500"
                    : "border-foreground/20 text-foreground/20"
                )}>
                <PiForkKnifeFill size={18} />
              </span>
              <span
                className={cn(
                  "p-1 border-1.5  rounded-full",
                  materials !== null && !allInclusive
                    ? " border-emerald-500 text-emerald-500 "
                    : "border-foreground/20 text-foreground/20"
                )}>
                <FaPaintRoller size={18} />
              </span>
              <span
                className={cn(
                  "p-1 border-1.5  rounded-full",
                  travelCosts !== null && !allInclusive
                    ? "  border-emerald-500 text-emerald-500"
                    : "border-foreground/20 text-foreground/20"
                )}>
                <IoAirplane size={18} />
              </span>
              <span
                className={cn(
                  "p-1 border-1.5  rounded-full",
                  equipment !== null && !allInclusive
                    ? "  border-emerald-500 text-emerald-500"
                    : "border-foreground/20 text-foreground/20"
                )}>
                <TbStairs size={18} />
              </span>
              <span
                className={cn(
                  "p-1 border-1.5  rounded-full",
                  other !== null && !allInclusive
                    ? "  border-emerald-500 text-emerald-500"
                    : "border-foreground/20 text-foreground/20"
                )}>
                <FaRegCommentDots size={18} />
              </span>
            </div>
          </div>
        </div>
        <div className='py-6 flex-col flex gap-y-6 text-sm items-center justify-center'>
          {/* {openCall === "active" && (
            <div
              className={cn(
                "border-dotted border-1.5 h-11 w-14 rounded-lg flex flex-col justify-center items-center py-[5px]",
                !openCall && "opacity-0"
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
          {openCall !== null && (
            <>
              {openCall === "coming-soon" ? (
                <p className='text-sm'>Open Call Coming Soon!</p>
              ) : openCall === "ended" ? (
                <p className='text-sm'>Open Call Ended</p>
              ) : (
                ""
              )}
            </>
          )}

          {callType !== "Invite" && (
            <ApplyButton
              id={id}
              // status={status}
              openCall={openCall}
              publicView={publicView}
              manualApplied={isManualApplied}
              setManualApplied={setManualApplied}
              isBookmarked={isBookmarked}
              setIsBookmarked={setIsBookmarked}
              isHidden={isHidden}
              setIsHidden={setIsHidden}
              eventCategory={eventCategory}
              isPreview={true}
              appFee={appFee}
            />
          )}
        </div>
      </Card>
    </>
  )
}

export default EventCardPreview
