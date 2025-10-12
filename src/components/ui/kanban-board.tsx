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

import { MultiSelect } from "@/components/multi-select";
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
import { SelectSimple } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { TooltipSimple } from "@/components/ui/tooltip";
import {
  AddCardProps,
  CardBase,
  CardProps,
  CATEGORY_CONFIG,
  ColumnProps,
  ColumnType,
  ColumnTypeOptions,
  DetailsDialogProps,
  DropIndicatorProps,
  KanbanBoardProps,
  Priority,
  PRIORITY_CONFIG,
  priorityOptions,
  purposeOptions,
  TaskDialogProps,
  Voter,
} from "@/constants/kanbanConsts";
import {
  getSupportCategoryLabel,
  SupportCategory,
  supportCategoryOptions,
} from "@/constants/supportConsts";
import { RichTextDisplay } from "@/lib/richTextFns";
import { capitalize, debounce } from "lodash";

export const KanbanBoard = ({
  userRole = ["user"],
  purpose = "todo",
}: KanbanBoardProps) => {
  return <Board userRole={userRole} purpose={purpose} />;
};

export const getColumnColor = (column: ColumnType) => {
  const colors: Record<ColumnType, string> = {
    proposed: "bg-orange-200",
    backlog: "bg-neutral-200/80",
    todo: "bg-salYellow/70",
    doing: "bg-blue-200",
    done: "bg-emerald-200",
    notPlanned: "bg-red-200",
  };
  return colors[column] || "bg-neutral-500";
};

const Board = ({ userRole, purpose: initialPurpose }: KanbanBoardProps) => {
  const [activeColumn, setActiveColumn] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState<SupportCategory[]>([]);

  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [purpose, setPurpose] = useState<string>(initialPurpose ?? "todo");
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
          category,
        }
      : "skip",
  );

  const rawResults =
    useQuery(
      api.kanban.cards.getCards,
      debouncedSearch === "" ? { purpose, category } : "skip",
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
  const hasProposed = cards.some((card) => card.column === "proposed");
  const hasNotPlanned = cards.some((card) => card.column === "notPlanned");

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
      <div
        className={cn(
          "mb-6 flex flex-col-reverse items-center justify-between gap-3 md:mb-0 md:flex-row lg:pr-4",
        )}
      >
        <div className="flex items-center gap-3">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search"
            className="w-full max-w-md"
          />

          <Button
            variant="salWithShadowHidden"
            onClick={() => setSearchTerm("")}
            className={"h-11 disabled:border-foreground/40"}
            disabled={debouncedSearch === ""}
          >
            Reset
          </Button>
          {purpose === "todo" && (
            <MultiSelect
              options={[...supportCategoryOptions]}
              onValueChange={(value) => {
                setCategory(value as SupportCategory[]);
              }}
              value={category}
              placeholder="Select category"
              variant="basic"
              maxCount={1}
              condensed
              height={11}
              hasSearch={false}
              selectAll={false}
              className={cn(
                "w-full min-w-80 max-w-lg border-1.5 border-foreground/20 sm:h-11",
              )}
              listClassName="max-h-80"
            />
          )}
        </div>
        <div className="relative inset-y-0 z-10 my-3 flex w-50 items-center justify-between overflow-hidden rounded-full border bg-card p-2 shadow-inner lg:my-0 lg:p-0">
          {/* Thumb indicator */}
          <div
            className={cn(
              "absolute left-0 top-0 z-1 h-full w-1/2 bg-background transition-all duration-200 ease-out",
              purpose === "todo" && "translate-x-0",
              purpose === "design" && "translate-x-full bg-orange-200",
            )}
          />

          {/* Icon buttons */}
          {purposeOptions?.map(({ value, Icon, label }) => (
            <button
              key={value}
              onClick={() => setPurpose(value)}
              className={cn(
                "relative z-10 flex w-1/2 items-center justify-center rounded-full px-2 py-1 text-muted-foreground transition-colors hover:text-foreground",
                purpose === value && "text-foreground",
              )}
              type="button"
            >
              <span className="flex items-center gap-1">
                <Icon className="size-6 shrink-0 lg:size-4" />
                {label}
              </span>
            </button>
          ))}
        </div>
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

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    card: CardBase,
  ) => {
    if (!userRole.includes("admin")) return;
    e.dataTransfer.setData("cardId", card.id);
    // setActive(true);
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    if (!userRole.includes("admin")) return;

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
    if (!userRole.includes("admin")) return;
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
          {userRole.includes("admin") && (
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
        className={cn(
          "relative grid cursor-grab grid-cols-[30px_minmax(0,1fr)] rounded-lg border border-foreground/20 p-3 text-primary-foreground active:cursor-grabbing",
          getColumnColor(column),
        )}
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
                category:
                  category ?? (purpose === "design" ? "ui/ux" : "general"),
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
              isOpen={isPreviewing}
              user={user}
              isAdmin={isAdmin ?? false}
              onClickAction={() => setIsPreviewing(true)}
              onCloseAction={() => {
                setIsPreviewing(false);
                setIsHovered(false);
              }}
              onEditAction={() => {
                if (!isAdmin) return;
                setIsPreviewing(false);
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
  if (!userRole.includes("admin")) return null;

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
        category: purpose === "design" ? "ui/ux" : "general",
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
      <DialogContent className="w-full max-w-[max(50rem,100vw)] bg-card sm:max-w-[max(40rem,50vw)]">
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

          <div className="flex flex-col items-center gap-3 md:flex-row">
            <div className="flex w-full items-center gap-3 sm:w-auto">
              <div className="flex w-full flex-col gap-3 sm:w-auto">
                <Label htmlFor="column">Column</Label>

                <SelectSimple
                  options={[...ColumnTypeOptions]}
                  value={column}
                  onChangeAction={(value) => setColumn(value as ColumnType)}
                  placeholder="Select column"
                  className="w-full min-w-30 max-w-sm sm:max-w-40"
                />
              </div>

              <div className="flex flex-col gap-3">
                <Label htmlFor="priority">Priority</Label>

                <SelectSimple
                  options={[...priorityOptions]}
                  value={priority}
                  onChangeAction={(value) => setPriority(value as Priority)}
                  placeholder="Select priority"
                  className="w-full min-w-30 max-w-sm sm:max-w-30"
                />
              </div>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto">
              <Label htmlFor="priority">Category</Label>

              <SelectSimple
                options={[...supportCategoryOptions]}
                value={category}
                onChangeAction={(value) =>
                  setCategory(value as SupportCategory)
                }
                placeholder="Select category"
                className="w-full min-w-40 max-w-sm sm:max-w-50"
                contentClassName="sm:max-h-80"
              />
            </div>

            {!isEdit && (
              <div className="flex flex-1 flex-col gap-3">
                <Label htmlFor="order">Order</Label>
                {/* <select
                  name="order"
                  value={order}
                  onChange={(e) => setOrder(e.target.value as "start" | "end")}
                  className="rounded border bg-card p-2 text-foreground"
                >
                  <option value="start">Start</option>
                  <option value="end">End</option>
                </select> */}
                <SelectSimple
                  options={[
                    { value: "start", label: "Start" },
                    { value: "end", label: "End" },
                  ]}
                  value={order}
                  onChangeAction={(value) => setOrder(value as "start" | "end")}
                  placeholder="Order"
                  className="w-full max-w-md"
                />
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
  isOpen,
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
    <Dialog onOpenChange={(open) => !open && onCloseDialog()} open={isOpen}>
      <DialogTrigger asChild onClick={onClickAction}>
        {trigger}
      </DialogTrigger>
      <DialogContent className="flex h-[90dvh] w-full max-w-[max(60rem,60vw)] flex-col bg-card sm:max-h-[max(40rem,70vh)]">
        <DialogHeader>
          <div className="flex h-fit flex-col gap-4">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription className="sr-only">
              {"View task/suggestion details"}
            </DialogDescription>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex w-full flex-col items-center gap-2 gap-y-6 sm:flex-row sm:justify-between">
                <div className="flex items-center gap-2">
                  <FlairBadge
                    icon={priorityConfig.icon}
                    className={cn("px-4 text-base", priorityConfig.className)}
                  >
                    {capitalize(priority)}
                  </FlairBadge>
                  <FlairBadge
                    icon={categoryConfig.icon}
                    className={cn("px-4 text-base", categoryConfig.className)}
                  >
                    {getSupportCategoryLabel(category)}
                  </FlairBadge>
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
                  <TooltipSimple content="Edit task">
                    <Button
                      className={cn(
                        "inline-flex w-full items-center gap-x-3 sm:w-auto",
                      )}
                      onClick={onEditAction}
                      size="sm"
                    >
                      Edit
                      <Pencil className="size-7 cursor-pointer text-gray-500 hover:text-gray-700 sm:size-4" />
                    </Button>
                  </TooltipSimple>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>
        <Separator thickness={1.5} className="mb-4 mt-2" />

        {/* <div className="mt-5 flex max-h-[70dvh] flex-col gap-4 pb-6 sm:max-h-[60vh]"> */}
        <RichTextDisplay html={description} className="scrollable mini" />
        {/* </div> */}
      </DialogContent>
    </Dialog>
  );
};
