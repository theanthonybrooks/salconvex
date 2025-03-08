import {
  CommandItem,
  CommandMenuCustom,
} from "@/features/Sidebar/CommandMenuCustom"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { FiCommand, FiSearch } from "react-icons/fi"

interface SearchProps<T extends CommandItem> {
  title: string
  source: T[]
  shortcut?: string
  // groupName: string
  className?: string
  placeholder?: string
}

export const Search = <T extends CommandItem>({
  title,
  source,
  shortcut = "/",
  // groupName,
  className,
  placeholder,
}: SearchProps<T>) => {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("Search")

  return (
    <>
      <div
        className={cn(
          "relative flex items-center rounded-lg border-stone-300 bg-primary/10 px-2 py-1.5 text-sm text-black hover:bg-primary/20",
          className
        )}>
        <FiSearch
          className='mr-2 h-5 w-5 cursor-pointer'
          onClick={() => setOpen(true)}
        />
        <input
          onFocus={(e) => {
            e.target.blur()
            setOpen(true)
          }}
          type='text'
          placeholder='Search'
          defaultValue={value}
          className='w-full bg-transparent placeholder:text-stone-400 focus:outline-none '
        />

        <span
          className='absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center gap-0.5 rounded p-1 text-xs shadow hover:scale-105 hover:cursor-pointer active:scale-90 bg-background hover:bg-primary/10'
          onClick={() => setOpen(true)}>
          <FiCommand /> + {shortcut}
        </span>
      </div>

      {/* Pass props dynamically */}
      <CommandMenuCustom
        open={open}
        setOpen={setOpen}
        title={title}
        source={source}
        shortcut={shortcut}
        // groupName={groupName}
        placeholder={placeholder}
        setSearch={setValue}
      />
    </>
  )
}
