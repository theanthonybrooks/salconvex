"use client"

import { Id } from "convex/_generated/dataModel"
import { useMutation, useQuery } from "convex/react"
import { motion } from "framer-motion"
import { Dot, X } from "lucide-react"
import { useRef, useState } from "react"
import { FaFire } from "react-icons/fa"
import { FiPlus, FiTrash } from "react-icons/fi"
import { api } from "~/convex/_generated/api"

import { cn } from "@/lib/utils"
import { Pencil } from "lucide-react" // Using Pencil icon for edit

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type ColumnType = "proposed" | "backlog" | "todo" | "doing" | "done"

interface Card {
  title: string
  id: string
  column: ColumnType
  priority?: string
}

interface MoveCardArgs {
  id: Id<"todoKanban">
  column: ColumnType
  beforeId?: Id<"todoKanban"> | undefined
  userId: string
}

interface AddCardArgs {
  title: string
  column: ColumnType
  userId: string
  order?: "start" | "end"
  priority?: string
}

interface DeleteCardArgs {
  id: Id<"todoKanban">
  userId: string
}

// type ConvexCard = Omit<Card, "id"> & { _id: string }

interface ColumnProps {
  title: string
  headingColor: string
  column: ColumnType
  cards: Card[]
  userRole: string
  moveCard: (args: MoveCardArgs) => void
  addCard: (args: AddCardArgs) => void
  deleteCard: (args: DeleteCardArgs) => void
}

interface CardProps {
  title: string
  id: string
  column: ColumnType
  priority?: string
  handleDragStart: (e: React.DragEvent<HTMLDivElement>, card: Card) => void
  handleDragEnd: (e: React.DragEvent<HTMLDivElement>, card: Card) => void
  deleteCard: (args: DeleteCardArgs) => void
}

interface DropIndicatorProps {
  beforeId: string | undefined
  column: ColumnType
}

// interface BurnBarrelProps {
//   userRole: string
// }

interface AddCardProps {
  column: ColumnType
  userRole: string
}

interface KanbanBoardProps {
  userRole?: string
}

const getColumnColor = (column: ColumnType) => {
  const colors: Record<ColumnType, string> = {
    proposed: "bg-purple-300",
    backlog: "bg-neutral-200",
    todo: "bg-yellow-200",
    doing: "bg-blue-200",
    done: "bg-emerald-200",
  }
  return colors[column] || "bg-neutral-500"
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  userRole = "user",
}) => {
  return (
    <div className='h-screen w-full bg-background text-foreground dark:text-primary-foreground'>
      <Board userRole={userRole} />
    </div>
  )
}

const Board: React.FC<{ userRole: string }> = ({ userRole }) => {
  const rawCards =
    useQuery(api.kanban.cards.getCards) ||
    ([] as {
      _id: Id<"todoKanban">
      title: string
      column: ColumnType
      order: number
      priority?: string
    }[])
  const priorityLevels: Record<string, number> = { high: 1, medium: 2, low: 3 }

  const cards = rawCards
    .map(({ _id, ...rest }) => ({ id: _id, ...rest })) // Convert `_id` to `id`
    .sort((a, b) => {
      // Get priority levels, default to "medium" if undefined
      const priorityA = priorityLevels[a.priority || "medium"]
      const priorityB = priorityLevels[b.priority || "medium"]

      // Sort by priority first, then by order
      return priorityA - priorityB || a.order - b.order
    })

  const addCard = useMutation(api.kanban.cards.addCard)
  const moveCard = useMutation(api.kanban.cards.moveCard)
  const deleteCard = useMutation(api.kanban.cards.deleteCard)

  const [activeColumn, setActiveColumn] = useState<string | null>(null) // Track active add form

  const columnDisplayNames: Record<ColumnType, string> = {
    proposed: "Proposed",
    backlog: "Considering",
    todo: "To Do",
    doing: "In Progress",
    done: "Complete",
  }

  return (
    <div className='flex flex-col items-center gap-6'>
      {/* Submission Form */}
      {userRole === "admin" && <TaskSubmissionForm addCard={addCard} />}
      <div className='flex h-full w-full gap-3 overflow-auto scrollable invis p-12'>
        {(["proposed", "backlog", "todo", "doing", "done"] as ColumnType[]).map(
          (column) => (
            <Column
              key={column}
              title={columnDisplayNames[column]}
              column={column}
              headingColor={getColumnColor(column)}
              cards={cards.filter((card) => card.column === column)}
              userRole={userRole}
              moveCard={moveCard}
              addCard={addCard}
              deleteCard={deleteCard}
              activeColumn={activeColumn} // Pass activeColumn state
              setActiveColumn={setActiveColumn} // Function to update activeColumn
            />
          )
        )}

        <BurnBarrel deleteCard={deleteCard} userRole={userRole} />
      </div>
    </div>
  )
}

const Column: React.FC<
  ColumnProps & {
    moveCard: (args: MoveCardArgs) => void
    addCard: (args: AddCardArgs) => void
    deleteCard: (args: DeleteCardArgs) => void
    activeColumn: string | null
    setActiveColumn: (col: string | null) => void
  }
> = ({
  title,
  headingColor,
  column,
  cards,
  userRole,
  deleteCard,
  moveCard,
  addCard,
  activeColumn,
  setActiveColumn,
}) => {
  const [active, setActive] = useState(false)

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, card: Card) => {
    if (userRole !== "admin") return
    e.dataTransfer.setData("cardId", card.id)
    setActive(true)
  }

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    if (userRole !== "admin") return

    const cardId = e.dataTransfer.getData("cardId")
    if (!cardId) return

    setActive(false)
    clearHighlights()

    const indicators = getIndicators()
    const { element } = getNearestIndicator(e, indicators)
    let beforeId =
      element.dataset.before !== "-1"
        ? (element.dataset.before as Id<"todoKanban">)
        : undefined

    if (cards.length === 0) {
      beforeId = undefined
    }

    moveCard({
      id: cardId as Id<"todoKanban">,
      column,
      beforeId,
      userId: "admin",
    })
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (userRole !== "admin") return
    e.preventDefault()
    highlightIndicator(e)
    setActive(true)
  }

  const handleDragLeave = () => {
    clearHighlights()
    setActive(false)
  }

  const clearHighlights = (els?: HTMLElement[]) => {
    const indicators = els || getIndicators()
    indicators.forEach((i) => (i.style.opacity = "0"))
  }

  const highlightIndicator = (e: React.DragEvent<HTMLDivElement>) => {
    const indicators = getIndicators()
    clearHighlights(indicators)
    const el = getNearestIndicator(e, indicators)
    el.element.style.opacity = "1"
  }

  const getNearestIndicator = (
    e: React.DragEvent<HTMLDivElement>,
    indicators: HTMLElement[]
  ) => {
    const DISTANCE_OFFSET = 50

    return indicators.reduce<{ offset: number; element: HTMLElement }>(
      (closest, child) => {
        const box = child.getBoundingClientRect()
        const offset = e.clientY - (box.top + DISTANCE_OFFSET)

        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child }
        } else {
          return closest
        }
      },
      {
        offset: Number.NEGATIVE_INFINITY,
        element: indicators[indicators.length - 1],
      }
    )
  }

  const getIndicators = () => {
    return Array.from(
      document.querySelectorAll(`[data-column="${column}"]`)
    ) as HTMLElement[]
  }

  return (
    <div
      className='w-56 shrink-0'
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDragEnd}>
      <div className='mb-3 flex items-center justify-between'>
        <h3 className={`font-medium ${headingColor} p-4 rounded-lg`}>
          {title}
        </h3>
        <span className='rounded text-sm text-foreground dark:text-primary-foreground'>
          {cards.length}
        </span>
      </div>
      <div
        className={`h-full w-full transition-colors ${
          active
            ? "bg-[hsl(45,100%,71%)]/30"
            : "bg-[hsl(60, 100%, 99.6078431372549%)]/0"
        }`}>
        {cards.map((c) => (
          <Card
            key={c.id}
            {...c}
            deleteCard={deleteCard}
            handleDragStart={handleDragStart}
            handleDragEnd={handleDragEnd}
          />
        ))}

        <DropIndicator beforeId={undefined} column={column} />

        {userRole === "admin" && (
          <AddCard
            column={column}
            addCard={addCard}
            userRole={userRole}
            activeColumn={activeColumn}
            setActiveColumn={setActiveColumn}
          />
        )}
      </div>
    </div>
  )
}

// const Card: React.FC<CardProps> = ({
//   title,
//   id,
//   column,
//   handleDragStart,
//   deleteCard,
// }) => {
//   const handleDelete = async (e: React.DragEvent<HTMLDivElement>) => {
//     const cardId = e.dataTransfer.getData("cardId")
//     if (!cardId) return

//     await deleteCard({ id: cardId as Id<"todoKanban">, userId: "admin" })
//   }
//   return (
//     <>
//       <DropIndicator beforeId={id} column={column} />
//       <motion.div
//         layout
//         layoutId={id}
//         draggable='true'
//         onDragStart={(e) =>
//           handleDragStart(e as unknown as React.DragEvent<HTMLDivElement>, {
//             title,
//             id,
//             column,
//           })
//         }
//         className={`cursor-grab rounded border border-foreground/20 relative  ${getColumnColor(
//           column
//         )} p-3 active:cursor-grabbing`}>
//         <X
//           onClick={handleDelete}
//           className='absolute top-2 right-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300'
//         />
//         <p className='text-sm text-foreground dark:text-primary-foreground'>
//           {title}
//         </p>
//       </motion.div>
//     </>
//   )
// }

const Card: React.FC<CardProps> = ({
  title,
  id,
  column,
  handleDragStart,
  deleteCard,
  priority,
}) => {
  const [newTitle, setNewTitle] = useState(title)
  const [newPriority, setNewPriority] = useState(priority || "medium")
  const [isHovered, setIsHovered] = useState(false)

  const editCard = useMutation(api.kanban.cards.editCard)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Delete function
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await deleteCard({ id: id as Id<"todoKanban">, userId: "admin" })
  }

  // Save edited title
  const handleSave = async () => {
    if (!newTitle.trim() || (newTitle === title && newPriority === priority)) {
      return
    }

    await editCard({
      id: id as Id<"todoKanban">,
      title: newTitle,
      priority: newPriority,
      userId: "admin",
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave()
  }

  const handleTogglePriority = async () => {
    setNewPriority((prevPriority) => {
      let updatedPriority
      if (prevPriority === "high") {
        updatedPriority = "low"
      } else if (prevPriority === "low") {
        updatedPriority = "medium"
      } else {
        updatedPriority = "high"
      }

      editCard({
        id: id as Id<"todoKanban">,
        title: newTitle,
        priority: updatedPriority,
        userId: "admin",
      })

      return updatedPriority
    })
  }

  return (
    <>
      <DropIndicator beforeId={id} column={column} />
      <motion.div
        layout
        layoutId={id}
        draggable='true'
        onDragStart={(e) =>
          handleDragStart(e as unknown as React.DragEvent<HTMLDivElement>, {
            title,
            id,
            column,
            priority,
          })
        }
        className={`cursor-grab text-primary-foreground rounded-lg border border-foreground/20  relative p-3 active:cursor-grabbing grid grid-cols-[30px_minmax(0,1fr)] ${getColumnColor(
          column
        )}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}>
        {isHovered && (
          <div className='absolute top-0 right-0 bg-card/90 dark:bg-foreground border border-primary p-3 rounded-lg flex gap-x-2 items-center justify-center'>
            <Dialog>
              <DialogTrigger asChild>
                <Pencil
                  size={16}
                  className=' text-gray-500 hover:text-gray-700 cursor-pointer'
                />
              </DialogTrigger>
              <DialogContent
                className='sm:max-w-[425px] bg-card'
                onOpenAutoFocus={(event) => {
                  event.preventDefault()
                  inputRef.current?.focus()
                }}>
                <DialogHeader>
                  <DialogTitle>Edit Task</DialogTitle>
                  <DialogDescription>
                    Edit task description and priority
                  </DialogDescription>
                </DialogHeader>

                <div className='flex gap-x-4 items-start'>
                  <div className='flex flex-col items-start gap-2 flex-1'>
                    <Label htmlFor='name'>Task:</Label>
                    <textarea
                      ref={inputRef}
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      onKeyDown={handleKeyDown}
                      autoFocus
                      className='text-sm w-full border rounded p-1 h-full bg-card scrollable mini'
                    />
                  </div>
                  <div className='flex flex-col items-start gap-2'>
                    <Label htmlFor='username'>Priority:</Label>
                    <Select
                      value={newPriority}
                      onValueChange={(val) => setNewPriority(val)}>
                      <SelectTrigger className='min-w-[100px]'>
                        <SelectValue placeholder='Theme' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='high'>
                          <span className='flex items-center gap-x-1'>
                            <Dot className='text-green-500' size={24} />
                            High
                          </span>
                        </SelectItem>
                        <SelectItem value='medium'>
                          <span className='flex items-center gap-x-1'>
                            <Dot className='text-yellow-500' size={24} />
                            Medium
                          </span>
                        </SelectItem>
                        <SelectItem value='low'>
                          <span className='flex items-center gap-x-1'>
                            <Dot className='text-red-500' size={24} />
                            Low
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter>
                  <DialogClose>
                    <Button type='submit' onClick={handleSave}>
                      Save changes
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <X
              size={16}
              onClick={handleDelete}
              className=' text-red-500 hover:text-red-700 cursor-pointer'
            />
          </div>
        )}
        <span
          onClick={handleTogglePriority}
          className={cn(
            "rounded-full h-2 w-2 p-[5px] mt-1 hover:cursor-pointer",
            newPriority === "high"
              ? "bg-green-500"
              : newPriority === "low"
              ? "bg-red-500"
              : "bg-yellow-500"
          )}
        />

        <p className='text-sm text-foreground dark:text-primary-foreground'>
          {title}
        </p>
      </motion.div>
    </>
  )
}

const DropIndicator: React.FC<DropIndicatorProps> = ({ beforeId, column }) => {
  return (
    <div
      data-before={beforeId || "-1"}
      data-column={column}
      className='my-0.5 h-0.5 w-full bg-violet-400 opacity-0'
    />
  )
}

const BurnBarrel: React.FC<{
  deleteCard: (args: DeleteCardArgs) => void
  userRole: string
}> = ({ deleteCard, userRole }) => {
  const [active, setActive] = useState(false)

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (userRole !== "admin") return
    e.preventDefault()
    setActive(true)
  }

  const handleDragLeave = () => {
    setActive(false)
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    if (userRole !== "admin") return

    const cardId = e.dataTransfer.getData("cardId")
    if (!cardId) return

    await deleteCard({ id: cardId as Id<"todoKanban">, userId: "admin" })
    setActive(false)
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`mt-10 grid h-56 w-56 shrink-0 place-content-center rounded border text-3xl transition-colors ${
        active
          ? "border-red-800 bg-red-800/20 text-red-500"
          : "border-neutral-500 bg-neutral-500/20 text-neutral-500"
      }`}>
      {active ? <FaFire className='animate-bounce' /> : <FiTrash />}
    </div>
  )
}

const AddCard: React.FC<
  AddCardProps & {
    addCard: (args: AddCardArgs) => void
    activeColumn: string | null
    setActiveColumn: (col: string | null) => void
  }
> = ({ column, addCard, userRole, activeColumn, setActiveColumn }) => {
  const [text, setText] = useState("")
  const isOpen = activeColumn === column // Check if this column is the active one

  if (userRole !== "admin") return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim().length) return

    await addCard({ title: text.trim(), column, userId: "admin" })
    setText("")
    setActiveColumn(null) // Close the form after submission
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault() // Prevent new lines in textarea
      handleSubmit(e)
    }
  }

  return (
    <>
      {isOpen ? (
        <motion.form layout onSubmit={handleSubmit}>
          <textarea
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown} // Capture Enter key
            autoFocus
            placeholder='Add new task...'
            className='w-full rounded border border-violet-400 bg-violet-400/20 p-3 text-sm text-violet-800/60 placeholder-violet-300 focus:outline-0'
          />
          <div className='mt-1.5 flex items-center justify-end gap-1.5'>
            <button
              type='button'
              onClick={() => setActiveColumn(null)}
              className='px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-600'>
              Close
            </button>
            <button
              type='submit'
              className='flex items-center gap-1.5 rounded bg-neutral-50 px-3 py-1.5 text-xs text-neutral-950 transition-colors hover:bg-neutral-300'>
              <span>Add</span>
              <FiPlus />
            </button>
          </div>
        </motion.form>
      ) : (
        <motion.button
          layout
          onClick={() => setActiveColumn(column)} // Set this column as active
          className='flex w-full items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-500 transition-colors hover:text-neutral-600'>
          <span>Add card</span>
          <FiPlus />
        </motion.button>
      )}
    </>
  )
}

const TaskSubmissionForm: React.FC<{
  addCard: (args: AddCardArgs) => void
}> = ({ addCard }) => {
  const [title, setTitle] = useState("")
  const [column, setColumn] = useState<ColumnType>("todo") // Default to "To Do"
  const [order, setOrder] = useState<"start" | "end">("end") // Default to adding at the end
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    addCard({ title, column, userId: "admin", order, priority })
    setTitle("")
  }

  return (
    <form
      onSubmit={handleSubmit}
      className='flex flex-col gap-3 p-4 border rounded-lg bg-white shadow-md w-1/3'>
      <h3 className='text-lg font-semibold'>Add New Task</h3>

      {/* Task Name Input */}
      <textarea
        placeholder='Task name...'
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className='border p-2 rounded-lg w-full bg-card'
      />

      {/* Column Selection */}
      <select
        value={column}
        onChange={(e) => setColumn(e.target.value as ColumnType)}
        className='border p-2 rounded-lg bg-card'>
        <option value='proposed'>Proposed</option>
        <option value='backlog'>Backlog</option>
        <option value='todo'>To Do</option>
        <option value='doing'>In Progress</option>
        <option value='done'>Complete</option>
      </select>

      {/* Order Selection */}
      <select
        value={order}
        onChange={(e) => setOrder(e.target.value as "start" | "end")}
        className='border p-2 rounded-lg bg-card'>
        <option value='start'>Add to the Beginning</option>
        <option value='end'>Add to the End</option>
      </select>

      {/* Priority Selection */}
      <select
        value={priority}
        onChange={(e) =>
          setPriority(e.target.value as "low" | "medium" | "high")
        }
        className='border p-2 rounded-lg bg-card'>
        <option value='high'>High</option>
        <option value='medium'>Medium</option>
        <option value='low'>Low</option>
      </select>

      {/* Submit Button */}
      <button
        type='submit'
        className='bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition'>
        Add Task
      </button>
    </form>
  )
}
