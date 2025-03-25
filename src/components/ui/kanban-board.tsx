"use client"

import { Id } from "convex/_generated/dataModel"
import { useMutation, useQuery } from "convex/react"
import { motion } from "framer-motion"
import { X } from "lucide-react"
import { useState } from "react"
import { FiPlus } from "react-icons/fi"
import { api } from "~/convex/_generated/api"

import { cn } from "@/lib/utils"
import { Pencil } from "lucide-react"

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
  return <Board userRole={userRole} />
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

  const [activeColumn, setActiveColumn] = useState<string | null>(null)

  const columnDisplayNames: Record<ColumnType, string> = {
    proposed: "Proposed",
    backlog: "Considering",
    todo: "To Do",
    doing: "In Progress",
    done: "Complete",
  }

  const baseColumns: ColumnType[] = ["backlog", "todo", "doing", "done"]
  const hasProposed = cards.some((card) => card.column === "proposed")

  const orderedColumns: ColumnType[] = hasProposed
    ? ["proposed", ...baseColumns]
    : baseColumns

  return (
    <div className='flex  w-full h-full max-h-[80vh] overflow-hidden gap-3 p-6'>
      {orderedColumns.map((column) => (
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
          activeColumn={activeColumn}
          setActiveColumn={setActiveColumn}
        />
      ))}
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
        // const offset = Math.round(e.clientY - (box.top + DISTANCE_OFFSET))

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
      className='w-56 shrink-0 flex flex-col h-full relative'
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDragEnd}>
      <div className='mb-3 sticky top-0 z-10 bg-background'>
        <div className='flex items-center justify-between relative'>
          <h3 className={cn("font-medium  p-4 rounded-lg z-10", headingColor)}>
            {title}
          </h3>
          {userRole === "admin" && (
            <AddCard
              column={column}
              addCard={addCard}
              userRole={userRole}
              setActiveColumn={setActiveColumn}
            />
          )}
          <span className='rounded text-sm text-foreground dark:text-primary-foreground pr-4'>
            {cards.length}
          </span>

          {/* Fade at bottom of header */}
          <div className='pointer-events-none absolute -bottom-6 left-0 w-full h-4 bg-gradient-to-b from-background to-transparent z-[9]' />
        </div>
      </div>

      <div
        className={cn(
          "flex flex-col gap-[2px] overflow-y-auto scrollable mini  transition-colors px-2 flex-1",
          "h-[calc(100vh-160px)] ",
          active
            ? "bg-[hsl(295,100%,71%)]/30"
            : "bg-[hsl(60, 100%, 99.6078431372549%)]/0"
        )}>
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
      </div>
    </div>
  )
}

const Card: React.FC<CardProps> = ({
  title,
  id,
  column,
  handleDragStart,
  deleteCard,
  priority,
}) => {
  const [newPriority, setNewPriority] = useState(priority || "medium")
  const [isHovered, setIsHovered] = useState(false)

  const editCard = useMutation(api.kanban.cards.editCard)

  // Delete function
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await deleteCard({ id: id as Id<"todoKanban">, userId: "admin" })
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
        title,
        priority: updatedPriority,
        userId: "admin",
      })

      return updatedPriority
    })
  }

  return (
    <motion.div layout className='relative flex flex-col'>
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
            <TaskDialog
              mode='edit'
              trigger={
                <Pencil
                  size={16}
                  className='text-gray-500 hover:text-gray-700 cursor-pointer'
                />
              }
              initialValues={{
                title,
                column,
                priority: (["low", "medium", "high"].includes(priority ?? "")
                  ? priority
                  : "medium") as "low" | "medium" | "high",
              }}
              onSubmit={(data) => {
                editCard({
                  id: id as Id<"todoKanban">,
                  ...data,
                  userId: "admin",
                })
                setNewPriority(data.priority)
              }}
            />

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
    </motion.div>
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

const AddCard: React.FC<{
  column: ColumnType
  addCard: (args: AddCardArgs) => void

  setActiveColumn: (col: string | null) => void
  userRole: string
}> = ({ column, addCard, userRole }) => {
  if (userRole !== "admin") return null

  return (
    <TaskDialog
      mode='add'
      trigger={
        <motion.button
          layout
          className='text-xs text-neutral-500 hover:text-neutral-600 flex gap-x-1 items-center'>
          Add <FiPlus />
        </motion.button>
      }
      initialValues={{ column, priority: "medium", order: "start", title: "" }}
      onSubmit={(data) => {
        addCard({
          ...data,
          userId: "admin",
        })
      }}
    />
  )
}

type BaseTaskValues = {
  title: string
  column: ColumnType
  priority: "low" | "medium" | "high"
}

type AddTaskDialogProps = {
  mode: "add"
  trigger: React.ReactNode
  initialValues?: BaseTaskValues & { order: "start" | "end" }
  onSubmit: (values: BaseTaskValues & { order: "start" | "end" }) => void
}

type EditTaskDialogProps = {
  mode: "edit"
  trigger: React.ReactNode
  initialValues?: BaseTaskValues
  onSubmit: (values: BaseTaskValues) => void
}

type TaskDialogProps = AddTaskDialogProps | EditTaskDialogProps

export const TaskDialog: React.FC<TaskDialogProps> = ({
  mode,
  trigger,
  initialValues,
  onSubmit,
}) => {
  const [title, setTitle] = useState(initialValues?.title || "")
  const [column, setColumn] = useState<ColumnType>(
    initialValues?.column || "todo"
  )
  const [priority, setPriority] = useState<"low" | "medium" | "high">(
    initialValues?.priority || "medium"
  )
  const [order, setOrder] = useState<"start" | "end">(
    mode === "add" && initialValues?.order ? initialValues.order : "start"
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    if (mode === "add") {
      onSubmit({ title: title.trim(), column, priority, order })
    } else {
      onSubmit({ title: title.trim(), column, priority })
    }
    setTitle("")
    setColumn(initialValues?.column || "todo")
    setPriority(initialValues?.priority || "medium")
    setOrder(
      mode === "add" && initialValues?.order ? initialValues.order : "end"
    )
  }

  const isEdit = mode === "edit"

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className='bg-card'>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Task" : "Add New Task"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update task details."
              : "Create a new task with priority and location."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <Label>Task</Label>
          <textarea
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder='Task title...'
            className='w-full rounded border border-violet-400 bg-violet-400/20 p-3 text-sm placeholder-violet-300 focus:outline-none'
          />

          <Label>Column</Label>
          <select
            value={column}
            onChange={(e) => setColumn(e.target.value as ColumnType)}
            className='border p-2 rounded bg-background text-foreground'>
            <option value='proposed'>Proposed</option>
            <option value='backlog'>Considering</option>
            <option value='todo'>To Do</option>
            <option value='doing'>In Progress</option>
            <option value='done'>Complete</option>
          </select>

          <Label>Priority</Label>
          <select
            value={priority}
            onChange={(e) =>
              setPriority(e.target.value as "low" | "medium" | "high")
            }
            className='border p-2 rounded bg-background text-foreground'>
            <option value='high'>High</option>
            <option value='medium'>Medium</option>
            <option value='low'>Low</option>
          </select>

          {!isEdit && (
            <>
              <Label>Order</Label>
              <select
                value={order}
                onChange={(e) => setOrder(e.target.value as "start" | "end")}
                className='border p-2 rounded bg-background text-foreground'>
                <option value='start'>Add to Beginning</option>
                <option value='end'>Add to End</option>
              </select>
            </>
          )}

          <DialogFooter className='flex justify-end gap-2'>
            <DialogClose asChild>
              <Button type='button' variant='salWithShadowHiddenYlw'>
                Cancel
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button type='submit' variant='salWithShadowHidden'>
                {isEdit ? "Save Changes" : "Add Task"}
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
