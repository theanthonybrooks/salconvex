import { mockEventData } from "@/data/mockEventData"
import ClientEventList from "@/features/events/event-list-client"

const TheList = () => {
  return (
    <div className='px-4 flex flex-col items-center max-w-screen'>
      <ClientEventList initialEvents={mockEventData} />
    </div>
  )
}

export default TheList
