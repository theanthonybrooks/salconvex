"use client";

import { Id } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useRef, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { api } from "~/convex/_generated/api";

import { cn } from "@/lib/utils";
import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import PublicToggle from "@/components/ui/public-toggle";

type ColumnType = "proposed" | "backlog" | "todo" | "doing" | "done";

interface Card {
  title: string;
  id: string;
  column: ColumnType;
  priority?: string;
  isPublic: boolean;
}

interface MoveCardArgs {
  id: Id<"todoKanban">;
  column: ColumnType;
  beforeId?: Id<"todoKanban"> | undefined;
  userId: string;
}

interface AddCardArgs {
  title: string;
  column: ColumnType;
  userId: string;
  order?: "start" | "end";
  priority?: string;
  isPublic: boolean;
}

interface DeleteCardArgs {
  id: Id<"todoKanban">;
  userId: string;
}

// type ConvexCard = Omit<Card, "id"> & { _id: string }

interface ColumnProps {
  title: string;
  headingColor: string;
  column: ColumnType;
  cards: Card[];
  userRole: string;
  moveCard: (args: MoveCardArgs) => void;
  addCard: (args: AddCardArgs) => void;
  deleteCard: (args: DeleteCardArgs) => void;
}

interface CardProps {
  title: string;
  id: string;
  column: ColumnType;
  priority?: string;
  isPublic: boolean;
  handleDragStart: (e: React.DragEvent<HTMLDivElement>, card: Card) => void;
  handleDragEnd: (e: React.DragEvent<HTMLDivElement>, card: Card) => void;
  deleteCard: (args: DeleteCardArgs) => void;
}

interface DropIndicatorProps {
  beforeId: string | undefined;
  column: ColumnType;
}

// interface BurnBarrelProps {
//   userRole: string
// }

interface KanbanBoardProps {
  userRole?: string;
}

const getColumnColor = (column: ColumnType) => {
  const colors: Record<ColumnType, string> = {
    proposed: "bg-purple-300",
    backlog: "bg-neutral-200",
    todo: "bg-yellow-200",
    doing: "bg-blue-200",
    done: "bg-emerald-200",
  };
  return colors[column] || "bg-neutral-500";
};

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  userRole = "user",
}) => {
  return <Board userRole={userRole} />;
};

const Board: React.FC<{ userRole: string }> = ({ userRole }) => {
  const rawCards =
    useQuery(api.kanban.cards.getCards) ||
    ([] as {
      _id: Id<"todoKanban">;
      title: string;
      column: ColumnType;
      order: number;
      priority?: string;
      public: boolean;
      completedAt?: number;
    }[]);
  const priorityLevels: Record<string, number> = { high: 1, medium: 2, low: 3 };

  const cards = rawCards
    .map(({ _id, public: isPublic, ...rest }) => ({
      id: _id,
      isPublic,
      ...rest,
    }))
    .sort((a, b) => {
      if (a.column === "done" && b.column === "done") {
        const aCompleted = a.completedAt || 0;
        const bCompleted = b.completedAt || 0;
        return bCompleted - aCompleted; // Newest done cards at top
      }

      const priorityA = priorityLevels[a.priority || "medium"];
      const priorityB = priorityLevels[b.priority || "medium"];

      return priorityA - priorityB || a.order - b.order;
    });

  const addCard = useMutation(api.kanban.cards.addCard);
  const moveCard = useMutation(api.kanban.cards.moveCard);
  const deleteCard = useMutation(api.kanban.cards.deleteCard);

  const [activeColumn, setActiveColumn] = useState<string | null>(null);

  const columnDisplayNames: Record<ColumnType, string> = {
    proposed: "Proposed",
    backlog: "Considering",
    todo: "To Do",
    doing: "In Progress",
    done: "Complete",
  };

  const baseColumns: ColumnType[] = ["backlog", "todo", "doing", "done"];
  const hasProposed = cards.some((card) => card.column === "proposed");

  const orderedColumns: ColumnType[] = hasProposed
    ? ["proposed", ...baseColumns]
    : baseColumns;

  return (
    <div className="scrollable mini flex h-full max-h-[80vh] w-full gap-3 overflow-hidden overflow-x-auto p-6">
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
  );
};

const Column: React.FC<
  ColumnProps & {
    moveCard: (args: MoveCardArgs) => void;
    addCard: (args: AddCardArgs) => void;
    deleteCard: (args: DeleteCardArgs) => void;
    activeColumn: string | null;
    setActiveColumn: (col: string | null) => void;
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
  const [active, setActive] = useState(false);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, card: Card) => {
    if (userRole !== "admin") return;
    e.dataTransfer.setData("cardId", card.id);
    setActive(true);
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    if (userRole !== "admin") return;

    const cardId = e.dataTransfer.getData("cardId");
    if (!cardId) return;

    setActive(false);
    clearHighlights();

    const indicators = getIndicators();
    const { element } = getNearestIndicator(e, indicators);
    let beforeId =
      element.dataset.before !== "-1"
        ? (element.dataset.before as Id<"todoKanban">)
        : undefined;

    if (cards.length === 0) {
      beforeId = undefined;
    }

    moveCard({
      id: cardId as Id<"todoKanban">,
      column,
      beforeId,
      userId: "admin",
    });
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (userRole !== "admin") return;
    e.preventDefault();
    highlightIndicator(e);
    setActive(true);
  };

  const handleDragLeave = () => {
    clearHighlights();
    setActive(false);
  };

  const clearHighlights = (els?: HTMLElement[]) => {
    const indicators = els || getIndicators();
    indicators.forEach((i) => (i.style.opacity = "0"));
  };

  const highlightIndicator = (e: React.DragEvent<HTMLDivElement>) => {
    const indicators = getIndicators();
    clearHighlights(indicators);
    const el = getNearestIndicator(e, indicators);
    el.element.style.opacity = "1";
  };

  const getNearestIndicator = (
    e: React.DragEvent<HTMLDivElement>,
    indicators: HTMLElement[],
  ) => {
    const DISTANCE_OFFSET = 50;

    return indicators.reduce<{ offset: number; element: HTMLElement }>(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = e.clientY - (box.top + DISTANCE_OFFSET);
        // const offset = Math.round(e.clientY - (box.top + DISTANCE_OFFSET))

        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      },
      {
        offset: Number.NEGATIVE_INFINITY,
        element: indicators[indicators.length - 1],
      },
    );
  };

  const getIndicators = () => {
    return Array.from(
      document.querySelectorAll(`[data-column="${column}"]`),
    ) as HTMLElement[];
  };

  return (
    <div
      className="relative flex h-full w-56 shrink-0 flex-col"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDragEnd}
    >
      <div className="sticky top-0 z-10 mb-3 bg-background">
        <div className="relative flex items-center justify-between">
          <h3 className={cn("z-10 rounded-lg p-4 font-medium", headingColor)}>
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
          <span className="rounded pr-4 text-sm text-foreground dark:text-primary-foreground">
            {cards.length}
          </span>

          {/* Fade at bottom of header */}
          <div className="pointer-events-none absolute -bottom-6 left-0 z-[9] h-4 w-full bg-gradient-to-b from-background to-transparent" />
        </div>
      </div>

      <div
        className={cn(
          "scrollable mini flex flex-1 flex-col gap-[2px] overflow-y-auto px-2 transition-colors",
          "h-[calc(100vh-160px)]",
          active
            ? "bg-[hsl(295,100%,71%)]/30"
            : "bg-[hsl(60, 100%, 99.6078431372549%)]/0",
        )}
      >
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
  );
};

const Card: React.FC<CardProps> = ({
  title,
  id,
  column,
  handleDragStart,
  deleteCard,
  priority,
  isPublic,
}) => {
  const [newPriority, setNewPriority] = useState(priority || "medium");
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const editCard = useMutation(api.kanban.cards.editCard);

  // Delete function
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteCard({ id: id as Id<"todoKanban">, userId: "admin" });
  };

  const handleTogglePriority = async () => {
    setNewPriority((prevPriority) => {
      let updatedPriority;
      if (prevPriority === "high") {
        updatedPriority = "low";
      } else if (prevPriority === "low") {
        updatedPriority = "medium";
      } else {
        updatedPriority = "high";
      }

      editCard({
        id: id as Id<"todoKanban">,
        title,
        priority: updatedPriority,
        userId: "admin",
        isPublic,
      });

      return updatedPriority;
    });
  };

  return (
    <motion.div layout className="relative flex flex-col">
      <DropIndicator beforeId={id} column={column} />
      <motion.div
        layout
        layoutId={id}
        draggable="true"
        onDragStart={(e) =>
          handleDragStart(e as unknown as React.DragEvent<HTMLDivElement>, {
            title,
            id,
            column,
            priority,
            isPublic,
          })
        }
        className={`relative grid cursor-grab grid-cols-[30px_minmax(0,1fr)] rounded-lg border border-foreground/20 p-3 text-primary-foreground active:cursor-grabbing ${getColumnColor(
          column,
        )}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={!isEditing ? () => setIsHovered(false) : () => {}}
      >
        {isHovered && (
          <div className="absolute right-0 top-0 flex items-center justify-center gap-x-2 rounded-lg border border-primary bg-card/90 p-3 dark:bg-foreground">
            <TaskDialog
              mode="edit"
              onClick={() => setIsEditing(true)}
              onClose={() => {
                setIsEditing(false);
                setIsHovered(false);
              }}
              trigger={
                <Pencil
                  size={16}
                  className="cursor-pointer text-gray-500 hover:text-gray-700"
                />
              }
              initialValues={{
                title,
                column,
                priority: (["low", "medium", "high"].includes(priority ?? "")
                  ? priority
                  : "medium") as "low" | "medium" | "high",
                isPublic: isPublic ?? true,
              }}
              onSubmit={(data) => {
                editCard({
                  id: id as Id<"todoKanban">,
                  ...data,
                  userId: "admin",
                });
                setNewPriority(data.priority);
              }}
            />

            <X
              size={16}
              onClick={handleDelete}
              className="cursor-pointer text-red-500 hover:text-red-700"
            />
          </div>
        )}
        <span
          onClick={handleTogglePriority}
          className={cn(
            "mt-1 h-2 w-2 rounded-full p-[5px] hover:cursor-pointer",
            newPriority === "high"
              ? "bg-green-500"
              : newPriority === "low"
                ? "bg-red-500"
                : "bg-yellow-500",
          )}
        />

        <p className="text-sm text-foreground dark:text-primary-foreground">
          {title}
        </p>
      </motion.div>
    </motion.div>
  );
};

const DropIndicator: React.FC<DropIndicatorProps> = ({ beforeId, column }) => {
  return (
    <div
      data-before={beforeId || "-1"}
      data-column={column}
      className="my-0.5 h-0.5 w-full bg-violet-400 opacity-0"
    />
  );
};

const AddCard: React.FC<{
  column: ColumnType;
  addCard: (args: AddCardArgs) => void;

  setActiveColumn: (col: string | null) => void;
  userRole: string;
}> = ({ column, addCard, userRole }) => {
  if (userRole !== "admin") return null;

  return (
    <TaskDialog
      mode="add"
      trigger={
        <motion.button
          layout
          className="flex items-center gap-x-1 text-xs text-neutral-500 hover:text-neutral-600"
        >
          Add <FiPlus />
        </motion.button>
      }
      initialValues={{
        column,
        priority: "medium",
        order: "start",
        title: "",
        isPublic: true,
      }}
      onSubmit={(data) => {
        addCard({
          ...data,
          userId: "admin",
        });
      }}
    />
  );
};

type BaseTaskValues = {
  title: string;
  column: ColumnType;
  priority: "low" | "medium" | "high";
  isPublic: boolean;
};

type BaseTaskDialogSharedProps = {
  trigger: React.ReactNode;
  onClick?: () => void;
  onClose?: () => void;
};

type AddTaskDialogProps = {
  mode: "add";
  initialValues?: BaseTaskValues & { order: "start" | "end" };
  onSubmit: (values: BaseTaskValues & { order: "start" | "end" }) => void;
} & BaseTaskDialogSharedProps;

type EditTaskDialogProps = {
  mode: "edit";
  initialValues?: BaseTaskValues;
  onSubmit: (values: BaseTaskValues) => void;
} & BaseTaskDialogSharedProps;

type TaskDialogProps = AddTaskDialogProps | EditTaskDialogProps;

export const TaskDialog = ({
  mode,
  trigger,
  initialValues,
  onSubmit,
  onClick,
  onClose,
}: TaskDialogProps) => {
  const [title, setTitle] = useState(initialValues?.title || "");
  const [column, setColumn] = useState<ColumnType>(
    initialValues?.column || "todo",
  );
  const [priority, setPriority] = useState<"low" | "medium" | "high">(
    initialValues?.priority || "medium",
  );
  const isSubmittingRef = useRef(false);
  const [order, setOrder] = useState<"start" | "end">(
    mode === "add" && initialValues?.order ? initialValues.order : "start",
  );

  const [isPublic, setIsPublic] = useState<boolean>(
    initialValues?.isPublic ?? true,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    isSubmittingRef.current = true;
    try {
      if (mode === "add") {
        await onSubmit({
          title: title.trim(),
          column,
          priority,
          order,
          isPublic,
        });
      } else {
        await onSubmit({
          title: title.trim(),
          column,
          priority,
          isPublic,
        });
      }

      // Reset form
      setTitle(initialValues?.title || "");
      setColumn(initialValues?.column || "todo");
      setPriority(initialValues?.priority || "medium");
      setOrder(
        mode === "add" && initialValues?.order ? initialValues.order : "end",
      );
      setIsPublic(initialValues?.isPublic ?? true);
    } finally {
      isSubmittingRef.current = false;
      onClose?.();
    }
  };

  const onCloseDialog = () => {
    setTimeout(() => {
      if (!isSubmittingRef.current) {
        onClose?.();
        return;
      }
    }, 500);
  };

  const isEdit = mode === "edit";

  return (
    <Dialog onOpenChange={(open) => !open && onCloseDialog()}>
      <DialogTrigger asChild onClick={onClick}>
        {trigger}
      </DialogTrigger>
      <DialogContent className="bg-card">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Task" : "Add New Task"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update task details."
              : "Create a new task with priority and location."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Label htmlFor="title">Task</Label>
          <textarea
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title..."
            className="w-full rounded border border-violet-400 bg-violet-400/20 p-3 text-sm placeholder-violet-300 focus:outline-none"
          />

          <Label htmlFor="column">Column</Label>
          <select
            name="column"
            value={column}
            onChange={(e) => setColumn(e.target.value as ColumnType)}
            className="rounded border bg-background p-2 text-foreground"
          >
            <option value="proposed">Proposed</option>
            <option value="backlog">Considering</option>
            <option value="todo">To Do</option>
            <option value="doing">In Progress</option>
            <option value="done">Complete</option>
          </select>

          <div className="flex items-center gap-3">
            <Label htmlFor="priority">Priority</Label>
            <select
              name="priority"
              value={priority}
              onChange={(e) =>
                setPriority(e.target.value as "low" | "medium" | "high")
              }
              className="rounded border bg-card p-2 text-foreground"
            >
              <option value="high">🟢 High</option>
              <option value="medium">🟡Medium</option>
              <option value="low">🔴 Low</option>
            </select>

            {!isEdit && (
              <>
                <Label htmlFor="order">Order</Label>
                <select
                  name="order"
                  value={order}
                  onChange={(e) => setOrder(e.target.value as "start" | "end")}
                  className="rounded border bg-card p-2 text-foreground"
                >
                  <option value="start">Start</option>
                  <option value="end">End</option>
                </select>
              </>
            )}
          </div>

          <DialogFooter className="flex w-full items-center justify-between sm:justify-between">
            <div className="flex items-center gap-2">
              {/* <input
                type="checkbox"
                id="public-toggle"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="size-4 border-foreground"
              /> */}
              <PublicToggle
                name="public-toggle"
                checked={isPublic}
                onChange={() => setIsPublic(!isPublic)}
              />
              <Label htmlFor="public-toggle">
                {isPublic ? "Public Task" : "Private Task"}
              </Label>
            </div>
            <div className="flex justify-end gap-2">
              <DialogClose asChild>
                <Button type="button" variant="salWithShadowHiddenYlw">
                  Cancel
                </Button>
              </DialogClose>
              <DialogClose asChild>
                <Button type="submit" variant="salWithShadowHidden">
                  {isEdit ? "Save Changes" : "Add Task"}
                </Button>
              </DialogClose>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
