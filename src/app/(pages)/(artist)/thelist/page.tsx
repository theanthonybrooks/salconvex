import EventCardPreview from "@/features/events/event-card-preview"

const TheList = () => {
  return (
    <div className='px-6 flex flex-col items-center '>
      <EventCardPreview path={"/artists/thelist/event"} />
      <EventCardPreview path={"/artists/thelist/event"} />
      <EventCardPreview path={"/artists/thelist/event"} />
      <EventCardPreview path={"/artists/thelist/event"} />
      <EventCardPreview path={"/artists/thelist/event"} />
      <EventCardPreview path={"/artists/thelist/event"} />
      <EventCardPreview path={"/artists/thelist/event"} />
      <EventCardPreview path={"/artists/thelist/event"} />
      <EventCardPreview path={"/artists/thelist/event"} />
    </div>
  )
}

export default TheList
