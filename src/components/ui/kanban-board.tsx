/* eslint-disable @typescript-eslint/no-unused-vars */

"use client"

import { Id } from "convex/_generated/dataModel"
import { useMutation, useQuery } from "convex/react"
import { motion } from "framer-motion"
import { useState } from "react"
import { FaFire } from "react-icons/fa"
import { FiPlus, FiTrash } from "react-icons/fi"
import { api } from "../../../convex/_generated/api"

type ColumnType = "proposed" | "backlog" | "todo" | "doing" | "done"

interface Card {
  title: string
  id: string
  column: ColumnType
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
  handleDragStart: (e: React.DragEvent<HTMLDivElement>, card: Card) => void
  handleDragEnd: (e: React.DragEvent<HTMLDivElement>, card: Card) => void
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
    <div className='h-screen w-full bg-background text-black'>
      <Board userRole={userRole} />
    </div>
  )
}

const Board: React.FC<{ userRole: string }> = ({ userRole }) => {
  const rawCards = useQuery(api.kanban.cards.getCards) || []
  const cards = rawCards
    .map(({ _id, ...rest }) => ({ id: _id, ...rest }))
    .sort((a, b) => a.order - b.order)
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
  )
}

const Column: React.FC<
  ColumnProps & {
    moveCard: any
    addCard: any
    deleteCard: any
    activeColumn: string | null
    setActiveColumn: (col: string | null) => void
  }
> = ({
  title,
  headingColor,
  column,
  cards,
  userRole,
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
      element.dataset.before !== "-1" ? element.dataset.before : undefined

    if (cards.length === 0) {
      beforeId = undefined
    }

    moveCard({ id: cardId, column, beforeId, userId: "admin" })
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

  // 🛠️ Restore getIndicators function
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
        <span className='rounded text-sm text-black'>{cards.length}</span>
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

const Card: React.FC<CardProps> = ({ title, id, column, handleDragStart }) => {
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
          })
        }
        className={`cursor-grab rounded border border-black/20  ${getColumnColor(
          column
        )} p-3 active:cursor-grabbing`}>
        <p className='text-sm text-black'>{title}</p>
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

const BurnBarrel: React.FC<{ deleteCard: any; userRole: string }> = ({
  deleteCard,
  userRole,
}) => {
  const [active, setActive] = useState(false)

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (userRole !== "admin") return
    e.preventDefault()
    setActive(true) // ✅ Icon changes when hovering
  }

  const handleDragLeave = () => {
    setActive(false) // ✅ Restore normal state
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    if (userRole !== "admin") return

    const cardId = e.dataTransfer.getData("cardId")
    if (!cardId) return

    await deleteCard({ id: cardId, userId: "admin" }) // ✅ Delete from Convex
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
    addCard: any
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
              onClick={() => setActiveColumn(null)} // Close only this form
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
