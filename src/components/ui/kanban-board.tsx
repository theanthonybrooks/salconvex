"use client"

import { useMutation, useQuery } from "convex/react"
import { motion } from "framer-motion"
import { useState } from "react"
import { FaFire } from "react-icons/fa"
import { FiPlus, FiTrash } from "react-icons/fi"
import { api } from "../../../convex/_generated/api"

type ColumnType = "backlog" | "todo" | "doing" | "done"

interface Card {
  title: string
  id: string
  column: ColumnType
}

type ConvexCard = Omit<Card, "id"> & { _id: string }

interface ColumnProps {
  title: string
  headingColor: string
  column: ColumnType
  cards: Card[]
  userRole: string
  moveCard: any // ✅ Add these
  addCard: any
  deleteCard: any // ✅ Fix the missing prop
}

interface CardProps {
  title: string
  id: string
  column: ColumnType
  handleDragStart: (e: React.DragEvent<HTMLDivElement>, card: Card) => void
  handleDragEnd: () => void
}

interface DropIndicatorProps {
  beforeId: string | null
  column: ColumnType
}

interface BurnBarrelProps {
  userRole: string
}

interface AddCardProps {
  column: ColumnType
  userRole: string
}

interface KanbanBoardProps {
  userRole?: string
}

const getColumnColor = (column: ColumnType) => {
  const colors: Record<ColumnType, string> = {
    backlog: "text-neutral-500",
    todo: "text-yellow-200",
    doing: "text-blue-200",
    done: "text-emerald-200",
  }
  return colors[column] || "text-neutral-500" // Default color
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  userRole = "user",
}) => {
  // const userRole: "admin" | "user" = "admin" // Change this dynamically if needed

  return (
    <div className='h-screen w-full bg-neutral-900 text-neutral-50'>
      <Board userRole={userRole} />
    </div>
  )
}

const Board: React.FC<{ userRole: string }> = ({ userRole }) => {
  const rawCards = useQuery(api.kanban.cards.getCards) || []
  const cards = rawCards.map(({ _id, ...rest }) => ({ id: _id, ...rest })) // ✅ Fix `_id` to `id`
  const addCard = useMutation(api.kanban.cards.addCard)
  const moveCard = useMutation(api.kanban.cards.moveCard)
  const deleteCard = useMutation(api.kanban.cards.deleteCard)

  //TODO: Fix the column names to what they're supposed to be, not this bs.
  return (
    <div className='flex h-full w-full gap-3 overflow-scroll p-12'>
      {["backlog", "todo", "doing", "done"].map((column) => (
        <Column
          key={column}
          title={column.charAt(0).toUpperCase() + column.slice(1)}
          column={column as ColumnType}
          headingColor={getColumnColor(column as ColumnType)}
          cards={cards.filter((card) => card.column === column)} // ✅ Ensure correct column filtering
          userRole={userRole}
          moveCard={moveCard}
          addCard={addCard}
          deleteCard={deleteCard}
        />
      ))}
      <BurnBarrel deleteCard={deleteCard} userRole={userRole} />
    </div>
  )
}

const Column: React.FC<
  ColumnProps & { moveCard: any; addCard: any; deleteCard: any }
> = ({ title, headingColor, column, cards, userRole, moveCard, addCard }) => {
  const [active, setActive] = useState(false)

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, card: Card) => {
    if (userRole !== "admin") return
    e.dataTransfer.setData("cardId", card.id)
    // setActive(true) // ✅ Shows the card being moved
  }

  const handleDragEnd = () => {
    if (userRole !== "admin") return // Prevent non-admins from moving cards
    setActive(false) // ✅ Restore normal state after drag
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    if (userRole !== "admin") return

    const cardId = e.dataTransfer.getData("cardId")
    if (!cardId) return

    await moveCard({ id: cardId, column, userId: "admin" }) // ✅ Move in Convex
    setActive(false)
  }

  return (
    <div
      className='w-56 shrink-0'
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}>
      <div className='mb-3 flex items-center justify-between'>
        <h3 className={`font-medium ${headingColor}`}>{title}</h3>
        <span className='rounded text-sm text-neutral-400'>{cards.length}</span>
      </div>
      <div
        className={`h-full w-full transition-colors ${
          active ? "bg-neutral-800/50" : "bg-neutral-800/0"
        }`}>
        {cards.map((c) => (
          <Card
            key={c.id}
            {...c}
            handleDragStart={handleDragStart}
            handleDragEnd={handleDragEnd} // ✅ Fix disappearing issue
          />
        ))}
        {userRole === "admin" && (
          <AddCard column={column} addCard={addCard} userRole={userRole} />
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
        className='cursor-grab rounded border border-neutral-700 bg-neutral-800 p-3 active:cursor-grabbing'>
        <p className='text-sm text-neutral-100'>{title}</p>
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

const AddCard: React.FC<AddCardProps & { addCard: any }> = ({
  column,
  addCard,
  userRole,
}) => {
  const [text, setText] = useState("")
  const [adding, setAdding] = useState(false)

  if (userRole !== "admin") return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim().length) return

    await addCard({ title: text.trim(), column, userId: "admin" }) // ✅ Add to Convex
    setAdding(false)
  }

  return (
    <>
      {adding ? (
        <motion.form layout onSubmit={handleSubmit}>
          <textarea
            onChange={(e) => setText(e.target.value)}
            autoFocus
            placeholder='Add new task...'
            className='w-full rounded border border-violet-400 bg-violet-400/20 p-3 text-sm text-neutral-50 placeholder-violet-300 focus:outline-0'
          />
          <div className='mt-1.5 flex items-center justify-end gap-1.5'>
            <button
              type='button'
              onClick={() => setAdding(false)}
              className='px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-50'>
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
          onClick={() => setAdding(true)}
          className='flex w-full items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-50'>
          <span>Add card</span>
          <FiPlus />
        </motion.button>
      )}
    </>
  )
}

const DEFAULT_CARDS2 = [
  // BACKLOG
  { title: "Look into render bug in dashboard", id: "1", column: "backlog" },
  { title: "SOX compliance checklist", id: "2", column: "backlog" },
  { title: "[SPIKE] Migrate to Azure", id: "3", column: "backlog" },
  { title: "Document Notifications service", id: "4", column: "backlog" },
  // TODO
  {
    title: "Research DB options for new microservice",
    id: "5",
    column: "todo",
  },
  { title: "Postmortem for outage", id: "6", column: "todo" },
  { title: "Sync with product on Q3 roadmap", id: "7", column: "todo" },

  // DOING
  {
    title: "Refactor context providers to use Zustand",
    id: "8",
    column: "doing",
  },
  { title: "Add logging to daily CRON", id: "9", column: "doing" },
  // DONE
  {
    title: "Set up DD dashboards for Lambda listener",
    id: "10",
    column: "done",
  },
]

const DEFAULT_CARDS: Card[] = [
  { title: "Look into render bug in dashboard", id: "1", column: "backlog" },
  { title: "SOX compliance checklist", id: "2", column: "backlog" },
  { title: "[SPIKE] Migrate to Azure", id: "3", column: "backlog" },
  { title: "Document Notifications service", id: "4", column: "backlog" },
  {
    title: "Research DB options for new microservice",
    id: "5",
    column: "todo",
  },
  { title: "Postmortem for outage", id: "6", column: "todo" },
  { title: "Sync with product on Q3 roadmap", id: "7", column: "todo" },
  {
    title: "Refactor context providers to use Zustand",
    id: "8",
    column: "doing",
  },
  { title: "Add logging to daily CRON", id: "9", column: "doing" },
  {
    title: "Set up DD dashboards for Lambda listener",
    id: "10",
    column: "done",
  },
]
