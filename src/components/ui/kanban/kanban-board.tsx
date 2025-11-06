"use client";

// TODO:
// [x] Add the ability for users to suggest a task to the board. This will go into the proposed column. The user will be able to add a title, category, and the priority will default to medium (I'll update it to high or low later as I see fit).
// [] I also need to add the ability to vote on the suggestion by other users. Should be pretty simple. Use the purpose prop to determine whether to show the voting buttons or not (as well as the priority toggle/display). Or maybe just disable the changing of priority for non-admins?
import {
  CATEGORY_CONFIG,
  ColumnTypeOptions,
  columnViewLimitMap,
  KanbanPurposeOptions,
  PRIORITY_CONFIG,
  priorityOptions,
} from "@/constants/kanbanConsts";
import {
  getSupportCategoryLabel,
  supportCategoryOptions,
} from "@/constants/supportConsts";

import type {
  AddCardProps,
  CardBase,
  CardProps,
  ColumnProps,
  ColumnType,
  DetailsDialogProps,
  DropIndicatorProps,
  KanbanBoardProps,
  KanbanPurpose,
  Priority,
  TaskDialogProps,
  Voter,
} from "@/constants/kanbanConsts";
import type { SupportCategory } from "@/constants/supportConsts";
import type { KanbanCardType } from "@/schemas/admin";
import type { User } from "@/types/user";

import { useEffect, useRef, useState } from "react";
import { kanbanCardSchema } from "@/schemas/admin";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { capitalize, debounce } from "lodash";
import { useForm } from "react-hook-form";

import { FiPlus } from "react-icons/fi";
import {
  Eye,
  Filter,
  FilterX,
  LucideThumbsDown,
  LucideThumbsUp,
  Pencil,
  Trash2,
} from "lucide-react";

import { MultiSelect } from "@/components/multi-select";
import { StaffUserSelector } from "@/components/ui/admin/userSelector";
import { Button } from "@/components/ui/button";
import { DebouncedControllerInput } from "@/components/ui/debounced-form-input";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  KanbanProvider,
  useKanbanContext,
} from "@/components/ui/kanban/kanban-context-provider";
import { KanbanUserSelector } from "@/components/ui/kanban/kanban-user-selector";
import PublicToggle from "@/components/ui/public-toggle";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { SelectSimple } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { TooltipSimple } from "@/components/ui/tooltip";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { RichTextDisplay } from "@/helpers/richTextFns";
import { cn } from "@/helpers/utilsFns";
import { useDevice } from "@/providers/device-provider";

import { api } from "~/convex/_generated/api";
import { useQuery } from "convex-helpers/react/cache";
import { Id } from "convex/_generated/dataModel";
import { useMutation, usePreloadedQuery } from "convex/react";

export const KanbanBoard = ({ purpose = "todo" }: KanbanBoardProps) => {
  return <Board purpose={purpose} />;
};

export const getColumnColor = (column: ColumnType) => {
  const colors: Record<ColumnType, string> = {
    proposed: "bg-orange-200",
    backlog: "bg-neutral-200/80",
    todo: "bg-salYellow/70",
    doing: "bg-blue-200",
    ongoing: "bg-slate-200",
    done: "bg-emerald-200",
    notPlanned: "bg-red-200",
  };
  return colors[column] || "bg-neutral-500";
};

const Board = ({ purpose: initialPurpose }: KanbanBoardProps) => {
  const { preloadedUserData } = useConvexPreload();
  const { isMobile } = useDevice();
  const userData = usePreloadedQuery(preloadedUserData);
  // const { isSidebarCollapsed } = useDashboard();
  const user = userData?.user ?? null;
  const userRole = userData?.user?.role ?? ["user"];
  const isAdmin = userRole?.includes("admin");
  // const isCreator = userRole?.includes("creator");
  const [showFilters, setShowFilters] = useState(true);
  const [activeColumn, setActiveColumn] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState<SupportCategory[]>([]);
  const [userFilter, setUserFilter] = useState<User | null>(user);

  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [purpose, setPurpose] = useState<KanbanPurpose>(
    initialPurpose ?? "todo",
  );

  // useEffect(() => {
  //   if (!userFilter && user) {
  //     setUserFilter(user);
  //   }
  // }, [userFilter, user]);
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
          assignedId: userFilter?.userId
            ? (userFilter?.userId as Id<"users">)
            : undefined,
        }
      : "skip",
  );

  const rawResults =
    useQuery(
      api.kanban.cards.getCards,
      debouncedSearch === ""
        ? {
            purpose,
            category,
            userId: userFilter?.userId
              ? (userFilter?.userId as Id<"users">)
              : undefined,
            userRole: userFilter?.role ?? [],
          }
        : "skip",
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
      ...rest,
      id: _id,
      isPublic,
      purpose,
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
    ongoing: "Ongoing",
    done: "Complete",
    notPlanned: "Not Planned",
  };

  const baseColumns: ColumnType[] = [
    "backlog",
    "todo",
    "doing",
    "ongoing",
    "done",
  ];
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
    <KanbanProvider user={user} purpose={purpose}>
      <div className="flex h-full max-h-full w-full flex-col gap-3 overflow-hidden overflow-x-auto p-6">
        <div
          className={cn(
            "mb-6 flex flex-col-reverse items-center justify-between gap-3 md:mb-0 lg:flex-row lg:pr-4",
          )}
        >
          {((isMobile && showFilters) || !isMobile) && (
            <div className="flex flex-col items-center gap-3 lg:flex-row">
              <div className="flex items-center gap-3">
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search"
                  className="w-full min-w-60 max-w-md"
                />

                <Button
                  variant="salWithShadowHidden"
                  onClick={() => setSearchTerm("")}
                  className={"h-11 disabled:border-foreground/40"}
                  disabled={debouncedSearch === ""}
                >
                  Reset
                </Button>
              </div>

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
                  "w-full max-w-md border-1.5 border-foreground/20 sm:h-11 md:min-w-64",
                )}
                listClassName="max-h-80"
              />

              {!isMobile && (
                <StaffUserSelector
                  setCurrentUser={setUserFilter}
                  isAdmin={isAdmin}
                  currentUser={userFilter}
                  type="staff"
                  minimal
                />
              )}
            </div>
          )}
          <div className={cn("flex items-center gap-3 sm:flex-row-reverse")}>
            <div
              className={cn(
                "relative inset-y-0 z-10 my-3 flex w-50 items-center justify-between overflow-hidden rounded-full border bg-card p-2 shadow-inner lg:my-0 lg:p-0 xl:w-[23rem]",
                // isSidebarCollapsed && "lg:w-60 xl:",
              )}
            >
              {/* Thumb indicator */}
              <div
                className={cn(
                  "absolute left-0 top-0 z-1 h-full w-1/3 bg-background transition-all duration-200 ease-out",
                  purpose === "todo" && "translate-x-0",
                  purpose === "design" && "translate-x-full bg-orange-200",
                  purpose === "support" && "translate-x-[200%] bg-red-200",
                )}
              />

              {/* Icon buttons */}

              {KanbanPurposeOptions?.map(({ value, Icon, label }) => (
                <button
                  key={value}
                  onClick={() => setPurpose(value)}
                  className={cn(
                    "relative z-10 flex h-8 w-1/3 items-center justify-center rounded-full px-2 py-1 text-muted-foreground transition-colors hover:text-foreground sm:h-11",
                    purpose === value && "text-foreground",
                  )}
                  type="button"
                >
                  <span className="flex items-center gap-1">
                    <Icon className="6 size-5 shrink-0" />
                    <p className="hidden xl:block">{label}</p>
                  </span>
                </button>
              ))}
            </div>

            {isMobile && (
              <Button
                onClick={() => setShowFilters((prev) => !prev)}
                className={cn(showFilters && "text-foreground")}
                variant="icon"
              >
                <span className="flex items-center gap-1">
                  {showFilters ? (
                    <Filter className="6 size-5 shrink-0" />
                  ) : (
                    <FilterX className="6 size-5 shrink-0" />
                  )}
                  <p className="hidden xl:block">Filters</p>
                </span>
              </Button>
            )}
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
              moveCard={moveCard}
              addCard={addCard}
              deleteCard={deleteCard}
              activeColumn={activeColumn}
              setActiveColumn={setActiveColumn}
            />
          ))}
        </div>
      </div>
    </KanbanProvider>
  );
};

const Column = ({
  title,
  headingColor,
  column,
  cards,
  deleteCard,
  moveCard,
  addCard,
}: ColumnProps) => {
  const { user, purpose } = useKanbanContext();
  const userRole = user?.role ?? [];
  const [active, setActive] = useState(false);
  const [viewFull, setViewFull] = useState(false);
  const limit = columnViewLimitMap[column] ?? columnViewLimitMap.default;

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
            <AddCard column={column} addCard={addCard} />
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
        {cards
          // .filter((c) => {
          //   // keep everything except limit "done" and "notPlanned"
          //   if (["done", "notPlanned"].includes(c.column) && !viewFull) {
          //     const sameColumn = cards.filter((x) => x.column === c.column);
          //     const indexInColumn = sameColumn.findIndex((x) => x.id === c.id);
          //     return indexInColumn < 5; // only first 10 for that column
          //   }
          //   return true;
          // })
          .filter((_, i) => viewFull || i < limit)
          .map((c) => (
            <Card
              key={c.id}
              {...c}
              deleteCard={deleteCard}
              handleDragStart={handleDragStart}
              handleDragEnd={handleDragEnd}
            />
          ))}
        {cards.length > limit && (
          <div className="flex items-center justify-between gap-x-2 px-2 py-1 text-xs font-semibold text-foreground/50">
            {viewFull ? (
              <p>...The End...</p>
            ) : (
              <p className="text-balance">
                Showing first {limit} of {cards.length} cards
              </p>
            )}
            <button
              onClick={() => setViewFull((prev) => !prev)}
              className={cn(
                "rounded border border-foreground/20 p-1 px-2 hover:scale-105 active:scale-95",
                viewFull ? "bg-background/50" : "bg-background",
              )}
            >
              {viewFull ? "Show Less" : "Show More"}
            </button>
          </div>
        )}

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

  assignedId,
  secondaryAssignedId,
}: CardProps) => {
  const { purpose, mode, cardId, setActiveDialog } = useKanbanContext();
  // const isAdmin = user?.role?.includes("admin") ?? false;
  const [newPriority, setNewPriority] = useState<Priority>(
    priority || "medium",
  );
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  // const [isEditing, setIsEditing] = useState(false);
  // const [isPreviewing, setIsPreviewing] = useState(false);

  // const [hasChanges, setHasChanges] = useState(false);

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
    assignedId,
    secondaryAssignedId,
  };

  const isPreviewing = mode === "preview" && cardId === id;
  const isEditing = mode === "edit" && cardId === id;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteCard({ id: id as Id<"todoKanban"> });
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
        assignedId,
        secondaryAssignedId,
      });

      return updatedPriority;
    });
  };

  return (
    <motion.div
      layout
      className="relative flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <DropIndicator beforeId={id} column={column} />
      <div
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.div
          layout
          layoutId={id}
          draggable="true"
          onClick={() => {
            setActiveDialog({ mode: "preview", cardId: id });
          }}
          onDragStart={(e) => {
            setIsDragging(true);
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
            });
          }}
          onDragEnd={() => setIsDragging(false)}
          animate={{ scale: isDragging ? 0.95 : 1 }}
          transition={{ type: "spring", stiffness: 250, damping: 20 }}
          className={cn(
            "relative grid grid-cols-[30px_minmax(0,1fr)] rounded-lg border border-foreground/20 p-3 text-primary-foreground hover:cursor-pointer active:scale-95 active:cursor-grabbing",
            getColumnColor(column),
          )}
        >
          <span
            onClick={handleTogglePriority}
            className={cn(
              "mt-1 size-2 rounded-full border border-transparent p-[5px] hover:scale-105 hover:cursor-pointer hover:border-foreground active:scale-95",
              newPriority === "low" || column === "done"
                ? "bg-green-500"
                : newPriority === "high"
                  ? "bg-red-500"
                  : "bg-yellow-500",
            )}
          />

          <RichTextDisplay
            html={title}
            className="text-sm text-foreground dark:text-primary-foreground"
          />
        </motion.div>
        {isHovered && (
          <div className="absolute right-0.5 top-0.5 flex items-center justify-center gap-x-3 rounded-lg border border-primary bg-card/90 p-2.5 dark:bg-foreground sm:gap-x-2">
            <TaskDialog
              id={id}
              mode="edit"
              isOpen={isEditing}
              onClick={() => {
                setActiveDialog({ mode: "edit", cardId: id });
              }}
              onClose={() => {
                setIsHovered(false);
                setActiveDialog({ mode: null, cardId: null });
              }}
              trigger={
                <Pencil className="size-7 cursor-pointer text-gray-500 hover:scale-105 hover:text-gray-700 active:scale-95 sm:size-4" />
              }
              initialValues={detailValues}
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
              onCloseAction={() => {
                setActiveDialog({ mode: null, cardId: null });
                setIsHovered(false);
              }}
              onEditAction={() => setActiveDialog({ mode: "edit", cardId: id })}
              initialValues={detailValues}
              trigger={
                <Eye className="size-7 cursor-pointer text-gray-500 hover:text-gray-700 sm:size-4" />
              }
              id={id as Id<"todoKanban">}
            />

            <Trash2
              onClick={handleDelete}
              className="size-7 cursor-pointer text-red-500 hover:scale-105 hover:text-red-700 active:scale-95 sm:size-4"
            />
          </div>
        )}
      </div>
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

const AddCard = ({ column, addCard }: AddCardProps) => {
  const { user, purpose } = useKanbanContext();
  const userRole = user?.role ?? [];
  if (!userRole.includes("admin")) return null;

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
        description: "",
        isPublic: true,
        voters: [],
        category: purpose === "design" ? "ui/ux" : "general",
        assignedId: user?._id,
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
  // user,
  mode,
  trigger,
  initialValues,
  onSubmit,
  onClick,
  onClose,
  isOpen,
  // id,
}: TaskDialogProps) => {
  const form = useForm<KanbanCardType>({
    resolver: zodResolver(kanbanCardSchema),
    defaultValues: {
      title: initialValues?.title || "",
      description: initialValues?.description || "",
      column: initialValues?.column || "todo",
      priority: initialValues?.priority || "medium",
      category: initialValues?.category || "general",
      order:
        mode === "add" && initialValues?.order ? initialValues.order : "start",
      isPublic: initialValues?.isPublic ?? true,
      assignedId: initialValues?.assignedId,
      secondaryAssignedId: initialValues?.secondaryAssignedId,
    },
    mode: "onChange",
    delayError: 1000,
  });

  const {
    handleSubmit,
    watch,

    formState: { isValid, isSubmitting, isDirty },
  } = form;
  const publicState = watch("isPublic");
  const assignedUsers = watch("assignedId");
  const secondaryAssignedUsers = watch("secondaryAssignedId");
  const voters = initialValues?.voters || [];
  const isSubmittingRef = useRef(false);

  const handleOnSubmit = async (values: KanbanCardType) => {
    isSubmittingRef.current = true;
    try {
      if (mode === "add") {
        onSubmit({
          title: values.title,
          description: values.description,
          column: values.column,
          priority: values.priority,
          order: values.order as "start" | "end",
          isPublic: values.isPublic,
          category: values.category,
          assignedId: values.assignedId as Id<"users">,
          ...(values.secondaryAssignedId && {
            secondaryAssignedId: values.secondaryAssignedId as Id<"users">,
          }),
          voters: [],
        });
      } else {
        onSubmit({
          title: values.title,
          description: values.description,
          column: values.column,
          priority: values.priority,
          isPublic: values.isPublic,
          category: values.category,
          assignedId: values.assignedId as Id<"users">,
          ...(values.secondaryAssignedId && {
            secondaryAssignedId: values.secondaryAssignedId as Id<"users">,
          }),
          voters,
        });
      }

      form.reset();
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
          <div className="flex items-baseline justify-between gap-3 pr-4">
            <DialogTitle>{isEdit ? "Edit Task" : "Add New Task"}</DialogTitle>

            {/* <KanbanUserSelector
              setCurrentUsers={setAssignedUsers}
              currentUserIds={assignedUsers}
              mode={mode}
            /> */}
            <KanbanUserSelector
              mode={mode}
              currentUserIds={
                [assignedUsers, secondaryAssignedUsers].filter(
                  (id): id is Id<"users"> => !!id,
                ) || null
              }
              setCurrentUsers={(users) => {
                const [primary, secondary] = users ?? [];
                form.setValue("assignedId", primary ?? undefined, {
                  shouldDirty: true,
                });
                form.setValue("secondaryAssignedId", secondary ?? undefined, {
                  shouldDirty: true,
                });
              }}
            />
          </div>
          <DialogDescription className="sr-only">
            {isEdit
              ? "Update task details."
              : "Create a new task with priority and location."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={handleSubmit(handleOnSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">Title</FormLabel>
                  <FormControl>
                    <DebouncedControllerInput
                      disabled={isSubmitting}
                      field={field}
                      placeholder="Task title..."
                      className={cn(
                        "kanban w-full rounded border border-violet-400 bg-violet-400/20 p-3 text-base placeholder-violet-300 focus:outline-none lg:text-sm",
                        // isEmpty && "h-10",
                      )}
                      maxLength={60}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">Description</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      placeholder="Task description..."
                      charLimit={5000}
                      requiredChars={10}
                      withTaskList={true}
                      inputPreview={false}
                      inputPreviewContainerClassName="scrollable mini 
                        w-full rounded border border-violet-400 bg-violet-400/20 p-3 text-base placeholder-violet-300 focus:outline-none lg:text-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col items-center gap-3 md:flex-row">
              <div className="flex w-full items-center gap-3 sm:w-auto">
                <FormField
                  control={form.control}
                  name="column"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className="font-bold">Column</FormLabel>
                      <FormControl>
                        <SelectSimple
                          disabled={isSubmitting}
                          options={[...ColumnTypeOptions]}
                          value={field.value}
                          onChangeAction={(value) => field.onChange(value)}
                          placeholder="Select column"
                          className="w-full min-w-30 max-w-sm sm:max-w-40"
                          contentClassName="sm:max-h-80"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className="font-bold">Priority</FormLabel>
                      <FormControl>
                        <SelectSimple
                          disabled={isSubmitting}
                          options={[...priorityOptions]}
                          value={field.value}
                          onChangeAction={(value) => field.onChange(value)}
                          placeholder="Select priority"
                          className="w-full min-w-30 max-w-sm sm:max-w-30"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex w-full items-center gap-3 sm:w-auto">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className="font-bold">Category</FormLabel>
                      <FormControl>
                        <SelectSimple
                          disabled={isSubmitting}
                          options={[...supportCategoryOptions]}
                          value={field.value}
                          onChangeAction={(value) => field.onChange(value)}
                          placeholder="Select category"
                          className="w-full min-w-40 max-w-sm sm:max-w-50"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {!isEdit && (
                  <FormField
                    control={form.control}
                    name="order"
                    render={({ field }) => (
                      <FormItem className="w-auto sm:w-full">
                        <FormLabel className="font-bold">Order</FormLabel>
                        <FormControl>
                          <SelectSimple
                            disabled={isSubmitting}
                            options={[
                              { label: "Start", value: "start" },
                              { label: "End", value: "end" },
                            ]}
                            value={field.value}
                            onChangeAction={(value) => field.onChange(value)}
                            placeholder="Select order"
                            className="w-auto"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </div>

            <DialogFooter className="flex w-full flex-row items-center justify-between sm:justify-between">
              <FormField
                control={form.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem className="flex flex-row-reverse items-center gap-2 space-y-0">
                    <FormLabel className="hidden font-bold sm:block">
                      {publicState ? "Public" : "Private"} Task
                    </FormLabel>
                    <FormControl>
                      <PublicToggle
                        name="public-toggle"
                        checked={field.value}
                        onChange={(value) => field.onChange(value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="salWithShadowHiddenYlw"
                    tabIndex={8}
                    className="focus:scale-95"
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button
                    disabled={!isValid || isSubmitting || !isDirty}
                    type="submit"
                    variant="salWithShadowHidden"
                    tabIndex={7}
                    className="focus:scale-95 focus:bg-salYellow/20"
                  >
                    {isEdit ? "Save Changes" : "Add Task"}
                  </Button>
                </DialogClose>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export const DetailsDialog = ({
  id,

  initialValues,
  isOpen,
  onCloseAction,
  onEditAction,
}: DetailsDialogProps) => {
  const { user } = useKanbanContext();
  const isAdmin = user?.role?.includes("admin") ?? false;
  const assignedId = initialValues?.assignedId || null;
  const secondaryAssignedId = initialValues?.secondaryAssignedId || null;
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
    }, 10);
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
  const assignedUsers = [assignedId, secondaryAssignedId].filter(
    (u) => u !== null,
  );

  return (
    <Dialog onOpenChange={(open) => !open && onCloseDialog()} open={isOpen}>
      {/*      <DialogTrigger asChild onClick={onClickAction}>
        {trigger}
        /~ Click to open dialog ~/
      </DialogTrigger>*/}
      <DialogContent className="flex h-[90dvh] w-full max-w-[max(60rem,60vw)] flex-col bg-card sm:max-h-[max(40rem,70vh)]">
        <DialogHeader>
          <div className="flex h-fit flex-col gap-4">
            <div className="flex items-baseline justify-between gap-3">
              <DialogTitle>{title}</DialogTitle>
              {isAdmin && assignedId && (
                <div className="flex items-center gap-3 pr-8 text-sm">
                  <KanbanUserSelector
                    currentUserIds={assignedUsers}
                    cardId={id}
                    mode="view"
                  />
                </div>
              )}
            </div>
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
