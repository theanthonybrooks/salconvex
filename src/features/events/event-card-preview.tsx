"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { formatEventDates, formatOpenCallDeadline } from "@/lib/dateFns"
import {
  formatCurrency,
  formatRate,
  getEventCategoryLabel,
} from "@/lib/eventFns"

import { cn } from "@/lib/utils"
import { EventData } from "@/types/event"
import { CircleDollarSignIcon } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { FaBookmark, FaRegBookmark } from "react-icons/fa6"

const EventCardPreview = (props: EventData) => {
  const router = useRouter()

  const {
    id,
    logo,
    callFormat,
    callType,
    eventCategory,
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
  } = props

  const { locale, city, stateAbbr, countryAbbr } = location

  const locationString = `${
    locale ? `${locale}, ` : ""
  }${city}, ${stateAbbr}, ${countryAbbr}`

  return (
    <Card className='bg-white/40 border-foreground/20 grid grid-cols-[75px_minmax(0,auto)_50px] min-w-[340px]  w-[90vw] max-w-[400px] gap-x-3 rounded-3xl mb-10 first:mt-6 px-1 py-2'>
      <div className='row-span-2 col-span-1 flex flex-col items-center justify-between pt-3 pb-3 pl-2'>
        <Image
          src={logo}
          alt='Event Logo'
          className='rounded-full border size-12 border-black'
          height={48}
          width={48}
        />

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
            <span className='font-semibold'>Event:</span>
            {formatEventDates(dates?.eventStart || "", dates.eventEnd, true)}
          </p>
          <p
            className={cn(
              "text-sm  flex items-center gap-x-1",
              !openCall && "hidden"
            )}>
            <span className={"font-semibold"}>Deadline:</span>
            {formatOpenCallDeadline(
              dates?.ocEnd || "",
              dates?.timezone,
              callType,
              true
            )}
          </p>
          <p
            className={cn(
              "text-sm flex items-center gap-x-1",
              !openCall && "hidden"
            )}>
            <span className='font-semibold'>Budget:</span>
            {budgetMin > 0 || (budgetMax && budgetMax > 0)
              ? formatCurrency(
                  budgetMin,
                  budgetMax,
                  currency,
                  true,
                  allInclusive
                )
              : budgetRate && budgetRate > 0
              ? formatRate(budgetRate, budgetRateUnit, currency, allInclusive)
              : "No Info"}
          </p>
          <p
            className={cn(
              "text-sm flex items-center gap-x-1",
              !openCall && "hidden"
            )}>
            <span className='font-semibold'>Eligible:</span>
            <span
              className={cn(
                eligibilityType !== "International" && "text-red-600"
              )}>
              {eligibility}
              {eligibilityType !== "International" && "*"}
            </span>
          </p>
        </div>
        <Button
          variant='salWithShadowHidden'
          size='lg'
          className='bg-white/60'
          onClick={() => router.push(`/thelist/event/${id}`)}>
          {openCall ? "Apply" : "View more"}
          {/* //note: this should also have "View more" for events/projects without active open call */}
        </Button>
      </div>
      <div className='flex flex-col items-center justify-between pt-5 pb-5 pr-2'>
        <CircleDollarSignIcon
          className={cn("h-6 w-6 text-red-600", !appFee && "opacity-0")}
        />
        <div className='flex gap-x-2 items-center justify-center'>
          {/* <EyeOff className='h-6 w-6' /> //NOTE: Move this to the detailed card view */}
          {bookmarked ? (
            <FaBookmark className='size-8 text-emerald-600' />
          ) : (
            <FaRegBookmark className='size-8' />
          )}
        </div>
      </div>
    </Card>
  )
}

export default EventCardPreview
