"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { FaFire } from "react-icons/fa"
import { FiPlus, FiTrash } from "react-icons/fi"

type ColumnType = "backlog" | "todo" | "doing" | "done"

interface Card {
  title: string
  id: string
  column: ColumnType
}

interface ColumnProps {
  title: string
  headingColor: string
  column: ColumnType
  cards: Card[]
  setCards: React.Dispatch<React.SetStateAction<Card[]>>
}

interface CardProps {
  title: string
  id: string
  column: ColumnType
  handleDragStart: (e: React.DragEvent<HTMLDivElement>, card: Card) => void
}

interface DropIndicatorProps {
  beforeId: string | null
  column: ColumnType
}

interface BurnBarrelProps {
  setCards: React.Dispatch<React.SetStateAction<Card[]>>
}

interface AddCardProps {
  column: ColumnType
  setCards: React.Dispatch<React.SetStateAction<Card[]>>
}

interface KanbanBoardProps {
  userRole?: "admin" | "user"
}

export const KanbanBoard: React.FC = ({
  userRole = "user",
}: KanbanBoardProps) => {
  // const userRole: "admin" | "user" = "admin" // Change this dynamically if needed

  return (
    <div className='h-screen w-full bg-neutral-900 text-neutral-50'>
      <Board userRole={userRole} />
    </div>
  )
}

const Board: React.FC<{ userRole: "admin" | "user" }> = ({ userRole }) => {
  const [cards, setCards] = useState<Card[]>(DEFAULT_CARDS)

  return (
    <div className='flex h-full w-full gap-3 overflow-scroll p-12'>
      <Column
        title='Backlog'
        column='backlog'
        headingColor='text-neutral-500'
        cards={cards}
        setCards={setCards}
        userRole={userRole}
      />
      <Column
        title='TODO'
        column='todo'
        headingColor='text-yellow-200'
        cards={cards}
        setCards={setCards}
        userRole={userRole}
      />
      <Column
        title='In progress'
        column='doing'
        headingColor='text-blue-200'
        cards={cards}
        setCards={setCards}
        userRole={userRole}
      />
      <Column
        title='Complete'
        column='done'
        headingColor='text-emerald-200'
        cards={cards}
        setCards={setCards}
        userRole={userRole}
      />
      <BurnBarrel setCards={setCards} userRole={userRole} />
    </div>
  )
}

interface ColumnProps {
  title: string
  headingColor: string
  column: ColumnType
  cards: Card[]
  setCards: React.Dispatch<React.SetStateAction<Card[]>>
  userRole: "admin" | "user" // Restrict actions based on role
}

const Column: React.FC<ColumnProps> = ({
  title,
  headingColor,
  cards,
  column,
  setCards,
  userRole,
}) => {
  const [active, setActive] = useState(false)

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, card: Card) => {
    if (userRole !== "admin") return // Prevent non-admins from dragging
    e.dataTransfer.setData("cardId", card.id)
  }

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    if (userRole !== "admin") return // Prevent non-admins from moving cards

    const cardId = e.dataTransfer.getData("cardId")

    setActive(false)
    clearHighlights()

    const indicators = getIndicators()
    const { element } = getNearestIndicator(e, indicators)

    const before = element.dataset.before || "-1"

    if (before !== cardId) {
      let copy = [...cards]

      let cardToTransfer = copy.find((c) => c.id === cardId)
      if (!cardToTransfer) return
      cardToTransfer = { ...cardToTransfer, column }

      copy = copy.filter((c) => c.id !== cardId)
      const moveToBack = before === "-1"

      if (moveToBack) {
        copy.push(cardToTransfer)
      } else {
        const insertAtIndex = copy.findIndex((el) => el.id === before)
        if (insertAtIndex === undefined) return
        copy.splice(insertAtIndex, 0, cardToTransfer)
      }

      setCards(copy)
    }
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

  // 🛠️ Restore clearHighlights
  const clearHighlights = (els?: HTMLElement[]) => {
    const indicators = els || getIndicators()
    indicators.forEach((i) => {
      i.style.opacity = "0"
    })
  }

  // 🛠️ Restore highlightIndicator
  const highlightIndicator = (e: React.DragEvent<HTMLDivElement>) => {
    const indicators = getIndicators()
    clearHighlights(indicators)
    const el = getNearestIndicator(e, indicators)
    el.element.style.opacity = "1"
  }

  // 🛠️ Restore getNearestIndicator
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

  // 🛠️ Restore getIndicators
  const getIndicators = () => {
    return Array.from(
      document.querySelectorAll(`[data-column="${column}"]`)
    ) as HTMLElement[]
  }

  const filteredCards = cards.filter((c) => c.column === column)

  return (
    <div className='w-56 shrink-0'>
      <div className='mb-3 flex items-center justify-between'>
        <h3 className={`font-medium ${headingColor}`}>{title}</h3>
        <span className='rounded text-sm text-neutral-400'>
          {filteredCards.length}
        </span>
      </div>
      <div
        onDrop={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`h-full w-full transition-colors ${
          active ? "bg-neutral-800/50" : "bg-neutral-800/0"
        }`}>
        {filteredCards.map((c) => (
          <Card key={c.id} {...c} handleDragStart={handleDragStart} />
        ))}
        <DropIndicator beforeId={null} column={column} />
        {userRole === "admin" && (
          <AddCard column={column} setCards={setCards} userRole={userRole} />
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

interface BurnBarrelProps {
  setCards: React.Dispatch<React.SetStateAction<Card[]>>
  userRole: "admin" | "user" // Add userRole prop
}

const BurnBarrel: React.FC<BurnBarrelProps> = ({ setCards, userRole }) => {
  const [active, setActive] = useState(false)

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (userRole !== "admin") return
    e.preventDefault()
    setActive(true)
  }

  const handleDragLeave = () => {
    setActive(false)
  }

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    if (userRole !== "admin") return
    const cardId = e.dataTransfer.getData("cardId")

    setCards((prev) => prev.filter((c) => c.id !== cardId))
    setActive(false)
  }

  return (
    <div
      onDrop={handleDragEnd}
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

const AddCard: React.FC<AddCardProps & { userRole: "admin" | "user" }> = ({
  column,
  setCards,
  userRole,
}) => {
  const [text, setText] = useState("")
  const [adding, setAdding] = useState(false)

  if (userRole !== "admin") return null // Only admins can add cards

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim().length) return

    const newCard: Card = {
      column,
      title: text.trim(),
      id: Math.random().toString(),
    }

    setCards((prev) => [...prev, newCard])
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
