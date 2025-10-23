import { SupportCategory } from "@/constants/supportConsts";
import { User } from "@/types/user";
import {
  Calendar,
  Circle,
  Construction,
  CreditCard,
  HelpCircle,
  Megaphone,
  PaintRoller,
  Palette,
  Scroll,
  Users2,
} from "lucide-react";
import {
  FcHighPriority,
  FcLowPriority,
  FcMediumPriority,
} from "react-icons/fc";
import { MdOutlineDesignServices } from "react-icons/md";
import { Id } from "~/convex/_generated/dataModel";

export const PRIORITY_CONFIG: Record<
  "high" | "medium" | "low",
  { icon: React.ReactNode; className: string }
> = {
  high: {
    icon: <FcHighPriority className="size-5" />,
    className: "bg-red-100",
  },
  medium: {
    icon: <FcMediumPriority className="size-5" />,
    className: "bg-yellow-100",
  },
  low: {
    icon: <FcLowPriority className="size-5" />,
    className: "bg-green-100",
  },
};

export const CATEGORY_CONFIG: Record<
  SupportCategory,
  { icon: React.ReactNode; className: string }
> = {
  general: {
    icon: <Construction className="size-5" />,
    className: "bg-stone-100",
  },
  "ui/ux": {
    icon: <Palette className="size-5" />,
    className: "bg-purple-100",
  },
  account: {
    icon: <CreditCard className="size-5" />,
    className: "bg-blue-100",
  },
  artist: {
    icon: <PaintRoller className="size-5" />,
    className: "bg-amber-100",
  },
  organization: {
    icon: <Users2 className="size-5" />,
    className: "bg-emerald-100",
  },
  theList: {
    icon: <Scroll className="size-5" />,
    className: "bg-emerald-100",
  },
  event: {
    icon: <Calendar className="size-5" />,
    className: "bg-rose-100",
  },
  openCall: {
    icon: <Megaphone className="size-5" />,
    className: "bg-pink-100",
  },
  other: {
    icon: <Circle className="size-5" />,
    className: "bg-green-100",
  },
};

export const columnViewLimitMap: Record<string, number> = {
  proposed: 20,
  backlog: 15,
  todo: 20,
  doing: 15,
  done: 5,
  notPlanned: 5,
  default: 30,
};

export const ColumnTypeOptions = [
  { label: "Proposed", value: "proposed" },
  { label: "Considering", value: "backlog" },
  { label: "To Do", value: "todo" },
  { label: "In Progress", value: "doing" },
  { label: "Completed", value: "done" },
  { label: "Not Planned", value: "notPlanned" },
] as const;

export type ColumnType = (typeof ColumnTypeOptions)[number]["value"];

export const KanbanPurposeOptions = [
  { label: "All", value: "todo", Icon: Circle },
  { label: "UI/UX", value: "design", Icon: MdOutlineDesignServices },
  { label: "Support", value: "support", Icon: HelpCircle },
] as const;

export type KanbanPurpose = (typeof KanbanPurposeOptions)[number]["value"];

export type VoteType = {
  upVote: number;
  downVote: number;
};

export type Voter = {
  userId: Id<"users">;
  direction: "up" | "down";
};

export const priorityOptions = [
  { label: "High", value: "high", icon: FcHighPriority },
  { label: "Medium", value: "medium", icon: FcMediumPriority },
  { label: "Low", value: "low", icon: FcLowPriority },
] as const;

export type Priority = (typeof priorityOptions)[number]["value"];

interface Task {
  id: number;
  title: string;
  description?: string;
}

interface Category {
  title: string;
  tasks: Task[];
}

export interface Column {
  categories: Category[];
  mainTitle?: string;
  description?: string;
}

export interface CardBase {
  title: string;
  description: string;
  id: Id<"todoKanban">;
  column: ColumnType;
  priority?: Priority;
  voters: Voter[];
  category: SupportCategory;
  isPublic: boolean;
  purpose: KanbanPurpose;
  assignedId?: Id<"users">;
}

export interface MoveCardArgs {
  id: Id<"todoKanban">;
  column: ColumnType;
  beforeId?: Id<"todoKanban">;
  purpose: KanbanPurpose;
}

export interface AddCardProps {
  user: User | null;
  column: ColumnType;
  purpose: KanbanPurpose;
  addCard: (args: AddCardArgs) => void;
}

export interface AddCardArgs {
  title: string;
  description: string;
  column: ColumnType;
  order?: "start" | "end";
  voters?: Voter[];
  priority?: Priority;
  category: SupportCategory;
  isPublic: boolean;
  purpose: KanbanPurpose;
}

export interface DeleteCardArgs {
  id: Id<"todoKanban">;
}

// type ConvexCard = Omit<Card, "id"> & { _id: string }

export interface ColumnProps {
  user: User | null;
  title: string;
  headingColor: string;
  column: ColumnType;
  cards: CardBase[];
  purpose: KanbanPurpose;
  activeColumn: string | null;
  setActiveColumn: (col: string | null) => void;
  moveCard: (args: MoveCardArgs) => void;
  addCard: (args: AddCardArgs) => void;
  deleteCard: (args: DeleteCardArgs) => void;
}

export interface CardProps extends CardBase {
  handleDragStart: (e: React.DragEvent<HTMLDivElement>, card: CardBase) => void;
  handleDragEnd: (e: React.DragEvent<HTMLDivElement>, card: CardBase) => void;
  deleteCard: (args: DeleteCardArgs) => void;
}

export interface DropIndicatorProps {
  beforeId: string | undefined;
  column: ColumnType;
}

// interface BurnBarrelProps {
//   userRole: string
// }

export interface KanbanBoardProps {
  purpose: KanbanPurpose;
}

export type BaseTaskValues = {
  title: string;
  description: string;
  column: ColumnType;
  priority: Priority;
  voters: Voter[];
  category: SupportCategory;
  isPublic: boolean;
  assignedId?: Id<"users">;
};

export type BaseTaskDialogSharedProps = {
  trigger: React.ReactNode;
  onClick?: () => void;
  onClose?: () => void;
};

export type AddTaskDialogProps = {
  purpose: KanbanPurpose;
  mode: "add";
  initialValues?: BaseTaskValues & { order: "start" | "end" };
  onSubmit: (values: BaseTaskValues & { order: "start" | "end" }) => void;
  isOpen?: boolean;
} & BaseTaskDialogSharedProps;

export type EditTaskDialogProps = {
  purpose: KanbanPurpose;
  mode: "edit";
  isOpen: boolean;
  initialValues?: BaseTaskValues;
  onSubmit: (values: BaseTaskValues) => void;
} & BaseTaskDialogSharedProps;

export type TaskDialogProps = (AddTaskDialogProps | EditTaskDialogProps) & {
  id?: Id<"todoKanban">;
  user: User | null;
};

export type DetailsDialogProps = {
  id: Id<"todoKanban">;
  trigger: React.ReactNode;
  isOpen: boolean;
  initialValues: BaseTaskValues;
  onClickAction?: () => void;
  onCloseAction?: () => void;
  onEditAction?: () => void;
  isAdmin: boolean;
  user: User | null;
};
