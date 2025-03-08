import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FiChevronDown, FiChevronUp } from "react-icons/fi"

export const AccountToggle = () => {
  return (
    <div className='border-b mb-4 mt-2 pb-4 border-stone-300'>
      <button className='flex p-0.5 hover:bg-stone-200 rounded transition-colors relative gap-2 w-full items-center'>
        <Avatar className='h-8 w-8 rounded-full border border-stone-300'>
          <AvatarImage src='/avatar.png' alt='Avatar' />

          <AvatarFallback
            className='border border-stone-300 bg-stone-300/20 text-stone-500 font-bold dark:bg-stone-800 dark:text-stone-200'
            style={{ color: "white" }}>
            TO
          </AvatarFallback>
        </Avatar>
        <div className='text-start'>
          <span className='text-sm font-bold block'>Wonderbread</span>
          <span className='text-xs block text-stone-500'>
            ding@dongmail.com
          </span>
        </div>

        <FiChevronDown className='absolute right-2 top-1/2 translate-y-[calc(-50%+4px)] text-xs' />
        <FiChevronUp className='absolute right-2 top-1/2 translate-y-[calc(-50%-4px)] text-xs' />
      </button>
    </div>
  )
}
