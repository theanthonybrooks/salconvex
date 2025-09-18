import { SupportCategory } from "@/constants/supportConsts";
import {
  Calendar,
  Circle,
  Construction,
  CreditCard,
  Megaphone,
  PaintRoller,
  Palette,
  Users2,
} from "lucide-react";
import {
  FcHighPriority,
  FcLowPriority,
  FcMediumPriority,
} from "react-icons/fc";
import { Id } from "~/convex/_generated/dataModel";

export const ColumnTypeOptions = [
  { label: "Proposed", value: "proposed" },
  { label: "Backlog", value: "backlog" },
  { label: "Todo", value: "todo" },
  { label: "Doing", value: "doing" },
  { label: "Done", value: "done" },
  { label: "Not Planned", value: "notPlanned" },
] as const;

export type ColumnType = (typeof ColumnTypeOptions)[number]["value"];

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

export const roadmapData: Column = {
  mainTitle: "Roadmap",
  description: "A visual representation of the project's progress.",
  categories: [
    {
      title: "Considering",
      tasks: [
        {
          id: 1,
          title: "Design Landing Page",
          description: "Create the initial design for the landing page.",
        },
        {
          id: 2,
          title: "Setup Analytics",
          description: "Integrate Google Analytics into the website.",
        },
        {
          id: 3,
          title: "Design Landing Page",
          description: "Create the initial design for the landing page.",
        },
      ],
    },
    {
      title: "Planned",
      tasks: [
        {
          id: 4,
          title: "Design Landing Page",
          description: "Create the initial design for the landing page.",
        },
        {
          id: 5,
          title: "Setup Analytics",
          description: "Integrate Google Analytics into the website.",
        },
        {
          id: 6,
          title: "Design Landing Page",
          description: "Create the initial design for the landing page.",
        },
        {
          id: 7,
          title: "Setup Analytics",
          description: "Integrate Google Analytics into the website.",
        },
        {
          id: 8,
          title: "Design Landing Page",
          description: "Create the initial design for the landing page.",
        },
        {
          id: 9,
          title: "Setup Analytics",
          description: "Integrate Google Analytics into the website.",
        },
      ],
    },
    {
      title: "Working On",
      tasks: [
        {
          id: 10,
          title: "Develop Authentication",
          description: "Implement user login and registration flows.",
        },
        {
          id: 11,
          title: "Optimize Performance",
          description: "Improve load times and optimize performance.",
        },
      ],
    },
    {
      title: "Implemented",
      tasks: [
        {
          id: 12,
          title: "Homepage Design",
          description: "Complete homepage design and deploy.",
        },
        {
          id: 13,
          title: "User Login",
          description: "Secure user login implemented.",
        },
        {
          id: 14,
          title: "Homepage Design",
          description: "Complete homepage design and deploy.",
        },
        {
          id: 15,
          title: "User Login",
          description: "Secure user login implemented.",
        },
        {
          id: 16,
          title: "Homepage Design",
          description: "Complete homepage design and deploy.",
        },
        {
          id: 17,
          title: "User Login",
          description: "Secure user login implemented.",
        },
        {
          id: 18,
          title: "Homepage Design",
          description: "Complete homepage design and deploy.",
        },
        {
          id: 19,
          title: "User Login",
          description: "Secure user login implemented.",
        },
      ],
    },
  ],
};

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
