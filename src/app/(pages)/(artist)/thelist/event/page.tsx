import EventCardDetail from "@/features/events/event-card-detail"
import Link from "next/link"
import { IoIosArrowRoundBack } from "react-icons/io"

const Event = () => {
  return (
    <div className='px-6 flex flex-col items-center '>
      <Link
        href='/thelist'
        className='flex gap-x-2 items-center justify-start py-6'>
        <IoIosArrowRoundBack className='h-6 w-6' /> back to open calls
      </Link>
      <EventCardDetail accepted='accepted' bookmarked={true} hidden={false} />
      <EventCardDetail accepted='rejected' bookmarked={false} hidden={true} />
      <EventCardDetail accepted='pending' bookmarked={true} hidden={false} />
    </div>
  )
}

export default Event
