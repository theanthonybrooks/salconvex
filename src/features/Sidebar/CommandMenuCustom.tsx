import { DialogTitle } from "@/components/ui/dialog"
import { DashIcon } from "@radix-ui/react-icons"
import { Command } from "cmdk"
import { AnimatePresence, motion } from "framer-motion"
import { CircleX, X } from "lucide-react"
import Link from "next/link"
import { IoSearch } from "react-icons/io5"

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react"

export interface CommandItem {
  label?: string
  name?: string
  icon?: React.ComponentType<{ className?: string }>
  path?: string
  href?: string
  sectionCat?: string
  group?: string
  desc?: string
}

interface CommandMenuProps<T extends CommandItem> {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  isMobile?: boolean
  title: string
  source: T[] // Ensure all items in `source` match `CommandItem`
  shortcut?: string
  placeholder?: string
  setSearch: React.Dispatch<React.SetStateAction<string>>
}

export const CommandMenuCustom = <T extends CommandItem>({
  open,
  setOpen,
  title,
  source,
  shortcut = "/",
  isMobile = false,
  // groupName,
  placeholder = `Hello. Is it me you're looking for? Use ctrl + ${shortcut} to search faster.`,
  setSearch,
}: CommandMenuProps<T>) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState("")
  const shortcutRef = useRef(shortcut)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const router = useRouter()
  // Update the ref if shortcut changes
  useEffect(() => {
    shortcutRef.current = shortcut
  }, [shortcut])

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      }, 0)
    }
  }, [open])

  // Keyboard shortcut handler (depends only on setOpen)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === shortcutRef.current && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [setOpen])

  // Extract fields from source dynamically
  const extractedItems = source.map((item) => ({
    title: item.label || item.name,
    icon: item.icon || null,
    path: item.path || item.href || "#",
    group: item.sectionCat || item.group || "Other",
    desc: item.desc || "",
  }))

  const dialogVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: { duration: 0.5, ease: "easeInOut" },
    },
  }

  //TODO: FIGURE OUT WHY THE EXIT ANIMATION DOESN'T HAPPEN

  const searchTerm = value.toLowerCase()

  const handleValueChange = (newValue: string) => {
    setSearch(newValue)
    setValue(newValue)
  }

  const handleLinkClick = () => {
    setOpen(false)
  }

  // Group items by group name
  const groups = extractedItems.reduce<Record<string, typeof extractedItems>>(
    (acc, item) => {
      const grp = item.group
      if (!acc[grp]) acc[grp] = []
      acc[grp].push(item)
      return acc
    },
    {}
  )

  // Build groupedItems based on the search term:
  // If the group name includes the search term, include all items;
  // Otherwise, only include items whose title includes the search term.
  const groupedItems = Object.entries(groups).reduce<
    Record<string, typeof extractedItems>
  >((acc, [grpName, items]) => {
    if (grpName.toLowerCase().includes(searchTerm)) {
      acc[grpName] = items
    } else {
      const filtered = items.filter((item) =>
        item?.title?.toLowerCase().includes(searchTerm)
      )
      if (filtered.length > 0) acc[grpName] = filtered
    }
    return acc
  }, {})

  return isMobile ? (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent className='relative pt-4 pb-6 z-[9999] h-[90vh] max-h-[90vh] overflow-hidden'>
        <X
          className='size-7 absolute right-4 top-4 text-stone-600 hover:text-red-600'
          onClick={() => setOpen(false)}
        />
        <DrawerHeader>
          <DrawerTitle className='sr-only'>{title}</DrawerTitle>
        </DrawerHeader>

        <Command shouldFilter={false} className='flex flex-col h-full'>
          <div className='relative flex-shrink-0 flex items-center gap-1 border-b border-black/20 px-6'>
            <IoSearch className='z-20 p-1 text-3xl text-stone-400' />
            <Command.Input
              ref={inputRef}
              value={value}
              onValueChange={handleValueChange}
              placeholder={placeholder}
              className='relative z-10 w-full p-3 pr-12 text-lg truncate overflow-hidden whitespace-nowrap selection:italic selection:text-stone-400 placeholder:text-stone-400 focus:outline-hidden bg-background focus:bg-card'
            />
            {value.length > 0 && (
              <button
                onClick={() => {
                  setValue("")
                  setSearch("")
                  inputRef.current?.focus()
                }}
                className='absolute right-8 text-stone-400 hover:text-stone-600 transition-opacity z-20'>
                <CircleX className='size-7' />
              </button>
            )}
          </div>

          {/* Scrollable list */}
          <Command.List className='overflow-y-auto flex-1 px-6 py-2'>
            {Object.keys(groupedItems).length === 0 ? (
              <Command.Empty className='py-8 text-base text-center'>
                No results found for{" "}
                <span className='text-violet-500 italic'>
                  &quot;{value}&quot;
                </span>
              </Command.Empty>
            ) : (
              Object.entries(groupedItems).map(([groupKey, groupItems]) => (
                <Command.Group
                  key={groupKey}
                  heading={groupKey.toUpperCase()}
                  className='mb-5 text-base text-stone-400 border-t-1.5 border-black/20 first:border-t-0 last:mb-10 pt-2'>
                  {groupItems.map((item) => (
                    <Command.Item
                      key={item.path}
                      className='flex cursor-pointer items-center gap-2 rounded p-2 pl-5 text-base text-foreground transition-colors hover:bg-stone-100 hover:text-stone-900'
                      onMouseEnter={() => setHoveredItem(item.path)}
                      onMouseLeave={() => setHoveredItem(null)}
                      onSelect={() => {
                        setOpen(false)
                        router.push(item.path)
                      }}>
                      {item.icon && <item.icon className='h-4 w-4' />}
                      <Link
                        href={item.path}
                        prefetch={true}
                        onClick={handleLinkClick}>
                        <span>{item.title}</span>
                      </Link>
                    </Command.Item>
                  ))}
                </Command.Group>
              ))
            )}
          </Command.List>
        </Command>
      </DrawerContent>
    </Drawer>
  ) : (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      shouldFilter={false}
      label={title}
      className='fixed inset-0 flex items-center justify-center text-foreground z-999'
      onClick={() => setOpen(false)}>
      {/* Background overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            key='overlay'
            className='fixed inset-0 z-100'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }} // adjust to your liking
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }} // subtler overlay color
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {/* Dialog box */}
        {open && (
          <motion.div
            key='dialogBox'
            variants={dialogVariants}
            initial='hidden'
            animate='visible'
            exit='exit'
            className='relative flex max-w-[90vw] max-h-[80vh] w-full md:max-w-xl flex-col rounded-lg border border-stone-300 bg-card p-4 shadow-xl'
            onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setOpen(false)}
              className='absolute right-4 top-4 z-20 rounded p-1 hover:scale-125 active:scale-110'>
              <X className='h-7 w-7 md:h-5 md:w-5 text-stone-600' />
            </button>
            <DialogTitle className='sr-only'>{title}</DialogTitle>
            <div className='flex items-center gap-1 border-b border-stone-300'>
              <IoSearch className='z-20 p-1 text-3xl text-stone-400' />
              <Command.Input
                ref={inputRef}
                value={value}
                onValueChange={handleValueChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setOpen(false)
                  }
                  if (e.key === "Escape") {
                    setValue("")
                    setSearch("")
                    setOpen(false)
                  }
                }}
                placeholder={cn(placeholder, !isMobile && "  (Hint: Ctrl + /)")}
                className='relative z-10 w-full p-3 text-lg selection:italic selection:text-stone-400 placeholder:text-stone-400 focus:outline-hidden bg-card'
              />
            </div>
            <div className='max-h-60dvh search scrollable mini p-3'>
              <Command.List>
                {Object.keys(groupedItems).length === 0 ? (
                  <Command.Empty>
                    No results found for{" "}
                    <span className='text-violet-500 italic'>
                      &quot;{value}&quot;
                    </span>
                  </Command.Empty>
                ) : (
                  Object.entries(groupedItems).map(([groupKey, groupItems]) => (
                    <Command.Group
                      key={groupKey}
                      heading={groupKey.toUpperCase()}
                      className='mb-5 text-sm text-stone-400 border-t-1.5 border-stone-200 first:border-t-0 pt-2'>
                      {groupItems.map((item) => (
                        <Command.Item
                          key={item.path}
                          className='flex cursor-pointer items-center gap-2 rounded p-2 pl-5 text-sm text-foreground transition-colors hover:bg-stone-100 hover:text-stone-900'
                          onMouseEnter={() => setHoveredItem(item.path)}
                          onMouseLeave={() => setHoveredItem(null)}
                          onSelect={() => router.push(item.path)}>
                          {item.icon && <item.icon className='h-4 w-4' />}
                          <Link
                            href={item.path}
                            prefetch={true}
                            onClick={handleLinkClick}>
                            <span>{item.title}</span>
                          </Link>
                          {item.desc && !isMobile && (
                            <motion.span
                              initial={{ opacity: 0 }}
                              animate={{
                                opacity: hoveredItem === item.path ? 1 : 0,
                              }}
                              transition={{ duration: 0.1 }}
                              className='inline-flex items-center gap-2 text-stone-600'>
                              <DashIcon />
                              <span>{item.desc}</span>
                            </motion.span>
                          )}
                        </Command.Item>
                      ))}
                    </Command.Group>
                  ))
                )}
              </Command.List>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Command.Dialog>
  )
}
