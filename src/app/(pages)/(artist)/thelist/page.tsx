import { mockEventData } from "@/data/mockEventData"
import ClientEventList from "@/features/events/event-list-client"

const TheList = () => {
  return (
    <div className='px-6 flex flex-col items-center '>
      {/* Map through mockEventData to render EventCardPreview components */}
      {/* {mockEventData.map((event, index) => (
        <EventCardPreview key={index} {...event} />
      ))} */}

      <ClientEventList initialEvents={mockEventData} />
    </div>
  )
}

export default TheList
