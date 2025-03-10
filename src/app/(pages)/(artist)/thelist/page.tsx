import EventCardDetail from "@/features/events/event-card-detail"
import EventCardPreview from "@/features/events/event-card-preview"

const TheList = () => {
  return (
    <div className='px-6 flex flex-col items-center '>
      <EventCardPreview />
      <EventCardDetail />
      <EventCardDetail accepted='accepted' bookmarked={true} hidden={false} />
      <EventCardDetail accepted='rejected' bookmarked={false} hidden={true} />
      <EventCardDetail accepted='pending' bookmarked={true} hidden={false} />
    </div>
  )
}

export default TheList
