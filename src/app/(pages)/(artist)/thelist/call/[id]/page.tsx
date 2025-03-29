"use client"

import { mockEventData } from "@/features/events/data/mockEventData"
import EventCardDetail from "@/features/events/event-card-detail"
import Link from "next/link"
import { useParams } from "next/navigation"
import { IoIosArrowRoundBack } from "react-icons/io"

const Call = () => {
  const { id } = useParams()
  const event = mockEventData.find((e) => e.id === Number(id))

  return (
    <div className='px-4 flex flex-col items-center'>
      <Link
        href='/thelist'
        className='flex gap-x-2 items-center justify-start py-6 hover:underline underline-offset-2 '>
        <IoIosArrowRoundBack className='h-6 w-6' /> back to The List
      </Link>
      {event ? (
        <EventCardDetail {...event} />
      ) : (
        <p className='text-red-600 text-lg font-semibold'>
          Open Call not found.
        </p>
      )}
    </div>
  )
}

export default Call
