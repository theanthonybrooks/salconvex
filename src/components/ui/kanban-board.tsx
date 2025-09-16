"use client";

// TODO: Add the ability for users to suggest a task to the board. This will go into the proposed column. The user will be able to add a title, category, and the priority will default to medium (I'll update it to high or low later as I see fit). I also need to add the ability to vote on the suggestion by other users. Should be pretty simple. Use the purpose prop to determine whether to show the voting buttons or not (as well as the priority toggle/display). Or maybe just disable the changing of priority for non-admins?
import { Id } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import { Eye, LucideThumbsDown, LucideThumbsUp, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
import { FlairBadge } from "@/components/ui/flair-badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PublicToggle from "@/components/ui/public-toggle";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Textarea } from "@/components/ui/textarea";
import { TooltipSimple } from "@/components/ui/tooltip";
import {
  CATEGORY_CONFIG,
  Priority,
  PRIORITY_CONFIG,
} from "@/constants/kanbanConsts";
import { SupportCategory } from "@/constants/supportConsts";
import { RichTextDisplay } from "@/lib/richTextFns";
import { User } from "@/types/user";
import { debounce } from "lodash";
import { ColumnType, Voter } from "~/convex/kanban/cards";

interface Card {
  title: string;
  description: string;
  id: string;
  column: ColumnType;
  priority?: Priority;
  voters: Voter[];
  category: SupportCategory;
  isPublic: boolean;
  purpose: string;
}

interface MoveCardArgs {
  id: Id<"todoKanban">;
  column: ColumnType;
  beforeId?: Id<"todoKanban"> | undefined;
  purpose: string;
}

interface AddCardProps {
  column: ColumnType;
  userRole: string;
  purpose: string;
  addCard: (args: AddCardArgs) => void;
}

interface AddCardArgs {
  title: string;
  description: string;
  column: ColumnType;
  order?: "start" | "end";
  voters?: Voter[];
  priority?: Priority;
  category: SupportCategory;
  isPublic: boolean;
  purpose: string;
}

interface DeleteCardArgs {
  id: Id<"todoKanban">;
}

// type ConvexCard = Omit<Card, "id"> & { _id: string }

interface ColumnProps {
  title: string;
  headingColor: string;
  column: ColumnType;
  cards: Card[];
  userRole: string;
  purpose: string;
  activeColumn: string | null;
  setActiveColumn: (col: string | null) => void;
  moveCard: (args: MoveCardArgs) => void;
  addCard: (args: AddCardArgs) => void;
  deleteCard: (args: DeleteCardArgs) => void;
}

interface CardProps {
  title: string;
  description: string;
  id: string;
  column: ColumnType;
  priority?: Priority;
  voters: Voter[];
  category: SupportCategory;
  isPublic: boolean;
  purpose: string;
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
  userRole: string;
  purpose: string;
}

const getColumnColor = (column: ColumnType) => {
  const colors: Record<ColumnType, string> = {
    proposed: "bg-purple-300",
    backlog: "bg-neutral-200",
    todo: "bg-yellow-200",
    doing: "bg-blue-200",
    done: "bg-emerald-200",
    notPlanned: "bg-red-200",
  };
  return colors[column] || "bg-neutral-500";
};

export const KanbanBoard = ({
  userRole = "user",
  purpose = "todo",
}: KanbanBoardProps) => {
  return <Board userRole={userRole} purpose={purpose} />;
};

const Board = ({ userRole, purpose }: KanbanBoardProps) => {
  const [activeColumn, setActiveColumn] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = debounce((value: string) => {
      setDebouncedSearch(value);
    }, 200);

    handler(searchTerm.trim());

    return () => {
      handler.cancel();
    };
  }, [searchTerm]);
  //TODO: use useQueryWithStatus instead to enable a loading/pending state. Or maybe just make a handler that's run via a button. Something. The form currently feels like it's just laggy.
  const searchResults = useQuery(
    api.kanban.cards.searchCards,
    debouncedSearch !== ""
      ? {
          purpose,
          searchTerm: debouncedSearch,
        }
      : "skip",
  );

  const rawResults =
    useQuery(
      api.kanban.cards.getCards,
      debouncedSearch === "" ? { purpose } : "skip",
    ) ||
    ([] as {
      _id: Id<"todoKanban">;
      title: string;
      description: string;
      column: ColumnType;
      order: number;
      voters: Voter[];
      category: SupportCategory;
      priority?: Priority;
      public: boolean;
      purpose: string;
      completedAt?: number;
    }[]);
  const rawCards = searchResults ?? rawResults;

  const priorityLevels: Record<string, number> = { high: 1, medium: 2, low: 3 };

  const cards = rawCards
    .map(({ _id, public: isPublic, ...rest }) => ({
      id: _id,
      isPublic,
      purpose,

      ...rest,
    }))
    .sort((a, b) => {
      const aIsDone = a.column === "done";
      const bIsDone = b.column === "done";

      if (aIsDone && bIsDone) {
        const aCompleted = a.completedAt ?? 0;
        const bCompleted = b.completedAt ?? 0;
        return bCompleted - aCompleted;
      }

      if (aIsDone) return 1;
      if (bIsDone) return -1;

      const priorityA = priorityLevels[a.priority || "medium"];
      const priorityB = priorityLevels[b.priority || "medium"];
      return priorityA - priorityB || a.order - b.order;
    });

  const addCard = useMutation(api.kanban.cards.addCard);
  const moveCard = useMutation(api.kanban.cards.moveCard);
  const deleteCard = useMutation(api.kanban.cards.deleteCard);

  const columnDisplayNames: Record<ColumnType, string> = {
    proposed: "Proposed",
    backlog: "Considering",
    todo: "To Do",
    doing: "In Progress",
    done: "Complete",
    notPlanned: "Not Planned",
  };

  const baseColumns: ColumnType[] = ["backlog", "todo", "doing", "done"];
  const hasProposed =
    cards.some((card) => card.column === "proposed") || purpose === "design";
  const hasNotPlanned =
    cards.some((card) => card.column === "notPlanned") || purpose === "design";

  // const orderedColumns: ColumnType[] = hasProposed
  //   ? ["proposed", ...baseColumns]
  //   : baseColumns;

  let orderedColumns: ColumnType[] = [...baseColumns];

  if (hasProposed) {
    orderedColumns = ["proposed", ...orderedColumns];
  }
  if (hasNotPlanned) {
    orderedColumns = [...orderedColumns, "notPlanned"];
  }
  return (
    <div className="flex h-full max-h-full w-full flex-col gap-3 overflow-hidden overflow-x-auto p-6">
      <div className="flex items-center gap-3">
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search"
          className="w-full max-w-md"
        />
        {debouncedSearch !== "" && (
          // <p
          //   className="text-red-600 hover:scale-105 hover:cursor-pointer active:scale-95"
          //   onClick={() => setSearchTerm("")}
          // >
          //   Clear Search
          // </p>
          <Button
            variant="salWithShadowHidden"
            onClick={() => setSearchTerm("")}
          >
            Reset
          </Button>
        )}
      </div>
      <div className="scrollable mini flex h-full max-h-full w-full gap-3 overflow-hidden overflow-x-auto">
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
            purpose={purpose}
            deleteCard={deleteCard}
            activeColumn={activeColumn}
            setActiveColumn={setActiveColumn}
          />
        ))}
      </div>
    </div>
  );
};

const Column = ({
  purpose,
  title,
  headingColor,
  column,
  cards,
  userRole,
  deleteCard,
  moveCard,
  addCard,
}: ColumnProps) => {
  const [active, setActive] = useState(false);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, card: Card) => {
    if (userRole !== "admin") return;
    e.dataTransfer.setData("cardId", card.id);
    // setActive(true);
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
      purpose,
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
      <div className="sticky top-0 z-10 mb-3">
        <div className="relative flex items-center justify-between">
          <h3 className={cn("z-10 rounded-lg p-4 font-medium", headingColor)}>
            {title}
          </h3>
          {userRole === "admin" && (
            <AddCard
              purpose={purpose}
              column={column}
              addCard={addCard}
              userRole={userRole}
            />
          )}
          <span className="rounded pr-4 text-sm text-foreground dark:text-primary-foreground">
            {cards.length}
          </span>

          {/* Fade at bottom of header */}
          {/* <div className="pointer-events-none absolute -bottom-6 left-0 z-[9] h-4 w-full bg-gradient-to-b from-background to-transparent" /> */}
          {/* Mask fade at bottom of header */}
        </div>
      </div>

      <div
        className={cn(
          "scrollable mini flex flex-1 flex-col gap-[2px] overflow-y-auto px-2 transition-colors",
          "h-[calc(100vh-160px)]",
          active
            ? "bg-[hsl(295,100%,71%)]/20"
            : "bg-[hsl(60, 100%, 99.6078431372549%)]/0",
          "mask-fade-top-bottom",
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

const Card = ({
  title,
  description,
  id,
  column,
  handleDragStart,
  deleteCard,
  priority,
  voters,
  category,
  isPublic,
  purpose,
}: CardProps) => {
  const [newPriority, setNewPriority] = useState<Priority>(
    priority || "medium",
  );
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const userData = useQuery(api.users.getCurrentUser, {});
  const user = userData?.user ?? null;
  const isAdmin = user?.role?.includes("admin");

  const editCard = useMutation(api.kanban.cards.editCard);

  const detailValues = {
    title,
    description,
    category,
    voters,
    priority: (["low", "medium", "high"].includes(priority ?? "")
      ? priority
      : "medium") as Priority,
    column,
    isPublic,
  };

  // Delete function
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteCard({ id: id as Id<"todoKanban"> });
  };

  const handleTogglePriority = async () => {
    setNewPriority((prevPriority) => {
      let updatedPriority: Priority;
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
        description,
        category,
        voters,
        priority: updatedPriority,
        isPublic,
        purpose,
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
            description,
            id,
            column,
            voters,
            category,
            priority,
            isPublic,
            purpose,
          })
        }
        className={`relative grid cursor-grab grid-cols-[30px_minmax(0,1fr)] rounded-lg border border-foreground/20 p-3 text-primary-foreground active:cursor-grabbing ${getColumnColor(
          column,
        )}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={
          !isEditing && !isPreviewing ? () => setIsHovered(false) : () => {}
        }
      >
        {isHovered && (
          <div className="absolute right-0 top-0 flex items-center justify-center gap-x-3 rounded-lg border border-primary bg-card/90 p-3 dark:bg-foreground sm:gap-x-2">
            <TaskDialog
              purpose={purpose}
              mode="edit"
              isOpen={isEditing}
              onClick={() => setIsEditing(true)}
              onClose={() => {
                setIsEditing(false);
                setIsHovered(false);
              }}
              trigger={
                <Pencil className="size-7 cursor-pointer text-gray-500 hover:text-gray-700 sm:size-4" />
              }
              initialValues={{
                title,
                description,
                column,
                priority: (["low", "medium", "high"].includes(priority ?? "")
                  ? priority
                  : "medium") as Priority,
                voters,
                category: category ?? "general",
                isPublic: isPublic ?? true,
              }}
              onSubmit={(data) => {
                editCard({
                  id: id as Id<"todoKanban">,
                  ...data,
                  purpose,
                });
                setNewPriority(data.priority);
              }}
            />
            <DetailsDialog
              user={user}
              isAdmin={isAdmin ?? false}
              onClickAction={() => setIsPreviewing(true)}
              onCloseAction={() => {
                setIsPreviewing(false);
                setIsHovered(false);
              }}
              onEditAction={() => {
                if (!isAdmin) return;
                setIsEditing(true);
              }}
              trigger={
                <Eye className="size-7 cursor-pointer text-gray-500 hover:text-gray-700 sm:size-4" />
              }
              initialValues={detailValues}
              id={id as Id<"todoKanban">}
            />

            <X
              onClick={handleDelete}
              className="size-7 cursor-pointer text-red-500 hover:text-red-700 sm:size-4"
            />
          </div>
        )}
        <span
          onClick={handleTogglePriority}
          className={cn(
            "mt-1 size-2 rounded-full p-[5px] hover:cursor-pointer",
            newPriority === "high"
              ? "bg-green-500"
              : newPriority === "low"
                ? "bg-red-500"
                : "bg-yellow-500",
          )}
        />

        {/* <p className="text-sm text-foreground dark:text-primary-foreground">
          {title}
        </p> */}
        <RichTextDisplay
          html={title}
          className="text-sm text-foreground dark:text-primary-foreground"
        />
      </motion.div>
    </motion.div>
  );
};

const DropIndicator = ({ beforeId, column }: DropIndicatorProps) => {
  return (
    <div
      data-before={beforeId || "-1"}
      data-column={column}
      className="my-0.5 h-0.5 w-full bg-violet-400 opacity-0"
    />
  );
};

const AddCard = ({ column, addCard, userRole, purpose }: AddCardProps) => {
  if (userRole !== "admin") return null;

  return (
    <TaskDialog
      mode="add"
      purpose={purpose}
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
        description: "",
        isPublic: true,
        voters: [],
        category: "general",
      }}
      onSubmit={(data) => {
        addCard({
          ...data,
          purpose,
        });
      }}
    />
  );
};

type BaseTaskValues = {
  title: string;
  description: string;
  column: ColumnType;
  priority: Priority;
  voters: Voter[];
  category: SupportCategory;
  isPublic: boolean;
};

type BaseTaskDialogSharedProps = {
  trigger: React.ReactNode;
  onClick?: () => void;
  onClose?: () => void;
};

type AddTaskDialogProps = {
  purpose: string;
  mode: "add";
  initialValues?: BaseTaskValues & { order: "start" | "end" };
  onSubmit: (values: BaseTaskValues & { order: "start" | "end" }) => void;
  isOpen?: boolean;
} & BaseTaskDialogSharedProps;

type EditTaskDialogProps = {
  purpose: string;
  mode: "edit";
  isOpen: boolean;
  initialValues?: BaseTaskValues;
  onSubmit: (values: BaseTaskValues) => void;
} & BaseTaskDialogSharedProps;

type TaskDialogProps = AddTaskDialogProps | EditTaskDialogProps;

type DetailsDialogProps = {
  id: Id<"todoKanban">;
  trigger: React.ReactNode;
  initialValues: BaseTaskValues;
  onClickAction?: () => void;
  onCloseAction?: () => void;
  onEditAction?: () => void;
  isAdmin: boolean;
  user: User | null;
};
export const TaskDialog = ({
  mode,
  trigger,
  initialValues,
  onSubmit,
  onClick,
  onClose,
  isOpen,
}: TaskDialogProps) => {
  const voters = initialValues?.voters || [];
  const [title, setTitle] = useState(initialValues?.title || "");
  const [description, setDescription] = useState(
    initialValues?.description || "",
  );
  const [column, setColumn] = useState<ColumnType>(
    initialValues?.column || "todo",
  );
  const [priority, setPriority] = useState<Priority>(
    initialValues?.priority || "medium",
  );
  const isSubmittingRef = useRef(false);
  const [order, setOrder] = useState<"start" | "end">(
    mode === "add" && initialValues?.order ? initialValues.order : "start",
  );
  const [category, setCategory] = useState<SupportCategory>(
    initialValues?.category || "general",
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
          description: description.trim(),
          column,
          priority,
          order,
          voters: [],
          isPublic,
          category,
        });
      } else {
        await onSubmit({
          title: title.trim(),
          description: description.trim(),
          column,
          priority,
          isPublic,
          voters,
          category,
        });
      }

      // Reset form
      setTitle(initialValues?.title || "");
      setDescription(initialValues?.description || "");
      setColumn(initialValues?.column || "todo");
      setPriority(initialValues?.priority || "high");
      setCategory(initialValues?.category || "general");
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
    <Dialog onOpenChange={(open) => !open && onCloseDialog()} open={isOpen}>
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
          <Label htmlFor="title" className="sr-only">
            Title
          </Label>
          <Textarea
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={60}
            className="scrollable mini w-full resize-none rounded border border-violet-400 bg-violet-400/20 p-3 text-base placeholder-violet-300 focus:outline-none lg:text-sm"
          />
          <Label htmlFor="description" className="sr-only">
            Description
          </Label>
          <RichTextEditor
            value={description}
            onChange={(e) => setDescription(e)}
            placeholder="Task description..."
            charLimit={5000}
            asModal={true}
            // bgClassName="bg-violet-400/10"
            withTaskList={true}
            inputPreview={false}
            inputPreviewContainerClassName="scrollable mini h-[clamp(10rem,18rem,30dvh)]  w-full rounded border border-violet-400 bg-violet-400/20 p-3 text-base placeholder-violet-300 focus:outline-none lg:text-sm"
          />
          {/* <input autoFocus className="sr-only" /> */}

          {/* <textarea
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              const isMac = navigator.userAgent.includes("Mac");
              const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;
              if (ctrlOrCmd && e.key === "Enter") {
                e.preventDefault();
                handleSubmit(e);
                onClose?.();
              }
            }}
            placeholder="Task title..."
            className="scrollable mini max-h-[60dvh] min-h-72 w-full rounded border border-violet-400 bg-violet-400/20 p-3 text-base placeholder-violet-300 focus:outline-none lg:text-sm"
          /> */}

          <div className="flex items-center gap-3">
            <div className="flex flex-1 flex-col gap-3">
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
                <option value="notPlanned">Not Planned</option>
              </select>
            </div>

            <div className="flex flex-1 flex-col gap-3">
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
            </div>

            {!isEdit && (
              <div className="flex flex-1 flex-col gap-3">
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
              </div>
            )}
          </div>

          <DialogFooter className="flex w-full flex-row items-center justify-between sm:justify-between">
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
              <Label htmlFor="public-toggle" className="hidden sm:block">
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

export const DetailsDialog = ({
  id,
  user,
  isAdmin,
  trigger,
  initialValues,

  onClickAction,
  onCloseAction,
  onEditAction,
}: DetailsDialogProps) => {
  const title = initialValues?.title || "";
  const description = initialValues?.description || "";
  const category = initialValues?.category || "general";
  const priority = initialValues?.priority || "medium";
  const upVotes = initialValues?.voters?.filter((v) => v.direction === "up");
  const downVotes = initialValues?.voters?.filter(
    (v) => v.direction === "down",
  );
  const upVoteCount = upVotes?.length ?? 0;
  const downVoteCount = downVotes?.length ?? 0;

  const guestUser = user === null;

  const priorityConfig = PRIORITY_CONFIG[priority];
  const categoryConfig = CATEGORY_CONFIG[category];

  const voteCard = useMutation(api.kanban.cards.voteCard);

  const onCloseDialog = () => {
    setTimeout(() => {
      onCloseAction?.();
      return;
    }, 500);
  };

  const handleVote = async (direction: "up" | "down") => {
    await voteCard({
      id,
      direction,
    });

    // setVote({ upVote, downVote });

    // console.log("userVoted", userVoted, userVotedFlag);
  };

  const userVotedUp = !!initialValues.voters.find(
    (v) => v.userId === user?.userId && v.direction === "up",
  );
  const userVotedDown = !!initialValues.voters.find(
    (v) => v.userId === user?.userId && v.direction === "down",
  );

  return (
    <Dialog onOpenChange={(open) => !open && onCloseDialog()}>
      <DialogTrigger asChild onClick={onClickAction}>
        {trigger}
      </DialogTrigger>
      <DialogContent className="bg-card">
        <DialogHeader>
          <div className="flex flex-col gap-4">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription className="sr-only">
              {"View task/suggestion details"}
            </DialogDescription>
            <div className="flex items-center gap-2">
              {/* {priority === "high" ? (
                <FlairBadge
                  icon={<FcHighPriority className="size-5" />}
                  className={cn("bg-red-100")}
                >
                  {priority}
                </FlairBadge>
              ) : priority === "medium" ? (
                <FlairBadge
                  icon={<FcMediumPriority className="size-5" />}
                  className={cn("bg-yellow-100")}
                >
                  {priority}
                </FlairBadge>
              ) : (
                <FlairBadge
                  icon={<FcLowPriority className="size-5" />}
                  className={cn("bg-green-100")}
                >
                  {priority}
                </FlairBadge>
              )}
              {category === "general" ? (
                <FlairBadge
                  icon={<Construction className="size-5" />}
                  className={cn("bg-stone-100")}
                >
                  {category}
                </FlairBadge>
              ) : category === "ui/ux" ? (
                <FlairBadge
                  icon={<Palette className="size-5" />}
                  className={cn("bg-purple-100")}
                >
                  {category}
                </FlairBadge>
              ) : (
                <FlairBadge
                  icon={<FcLowPriority className="size-5" />}
                  className={cn("bg-green-100")}
                >
                  {category}
                </FlairBadge>
              )} */}
              <FlairBadge
                icon={priorityConfig.icon}
                className={priorityConfig.className}
              >
                {priority}
              </FlairBadge>
              <FlairBadge
                icon={categoryConfig.icon}
                className={categoryConfig.className}
              >
                {category}
              </FlairBadge>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-2">
                  <LucideThumbsUp
                    className={cn(
                      "size-7 cursor-pointer text-gray-500 hover:text-gray-700 sm:size-4",
                      guestUser && "pointer-events-none",
                      userVotedUp && "text-green-600",
                    )}
                    onClick={() => handleVote("up")}
                  />{" "}
                  {upVoteCount}
                </span>
                {/* {" | "} */}
                <span className="flex items-center gap-2">
                  {" "}
                  <LucideThumbsDown
                    className={cn(
                      "size-7 cursor-pointer text-gray-500 hover:text-gray-700 sm:size-4",
                      userVotedDown && "text-red-600",

                      guestUser && "pointer-events-none",
                    )}
                    onClick={() => handleVote("down")}
                  />{" "}
                  {downVoteCount}
                </span>
              </div>
              {isAdmin && (
                <div className="relative min-w-50 rounded-lg border-1.5 border-dashed border-foreground/30 p-2">
                  <TooltipSimple content="Edit task">
                    <Pencil
                      className="size-7 cursor-pointer text-gray-500 hover:text-gray-700 sm:size-4"
                      onClick={onEditAction}
                    />
                  </TooltipSimple>
                  <p className="absolute -top-3 left-0.5 bg-card text-xs text-foreground/50">
                    Admin only
                  </p>
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <RichTextDisplay html={description} className="scrollable mini" />
        </div>
      </DialogContent>
    </Dialog>
  );
};
