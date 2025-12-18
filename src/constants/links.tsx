import type { Infer } from "convex/values";

import { JSX } from "react";
import { IconType } from "react-icons";

import { BsPersonVcard } from "react-icons/bs";
import { FaMobileAlt } from "react-icons/fa";
import { FaFacebookF, FaInstagram, FaThreads } from "react-icons/fa6";
import { LuMegaphone } from "react-icons/lu";
import { PiGraph } from "react-icons/pi";
import {
  BadgeCheck,
  Banana,
  BookHeart,
  Bookmark,
  Calendar,
  Calendar1,
  CalendarCheck,
  CheckSquare2,
  CreditCard,
  EyeOff,
  FileText,
  Heart,
  HelpCircle,
  Home,
  HomeIcon,
  IdCard,
  LucideArchive,
  LucideCalendar,
  LucideCalendarCog,
  LucideCalendarPlus2,
  LucideCircleFadingPlus,
  LucideIcon,
  LucideListPlus,
  LucidePaintRoller,
  LucideUsers,
  Newspaper,
  PaintRoller,
  Pencil,
  Scroll,
  Settings,
  Shield,
  Star,
  Table,
  User,
  UserSearch,
} from "lucide-react";

import type { linktreeLinkTypeValidator } from "~/convex/schema";

export type MenuProps = {
  id: number;
  label: string;
  icon: JSX.Element;
  path: string;
  section?: boolean;
  integration?: boolean;
};
export type SocialProps = {
  label: string;
  icon: IconType;
  path: string;
};

export interface LinkItem {
  name: string;
  href: string;
  sub?: string[];
}

export interface FooterSection {
  section: string;
  items: LinkItem[];
}

export const SOCIAL_MEDIA_LINKS: SocialProps[] = [
  {
    label: "Instagram",
    icon: FaInstagram,
    path: "https://www.instagram.com/thestreetartlist",
  },
  {
    label: "Threads",
    icon: FaThreads,
    path: "https://threads.com/@thestreetartlist",
  },
  {
    label: "Facebook",
    icon: FaFacebookF,
    path: "https://facebook.com/thestreetartlist",
  },
  // {
  //   label: "Patreon",
  //   icon: TbBrandPatreon,
  //   path: "https://www.patreon.com/thestreetartlist",
  // },
];

export const LANDING_PAGE_MENU: MenuProps[] = [
  {
    id: 0,
    label: "Home",
    icon: <HomeIcon />,
    path: "/",
    section: true,
  },
  {
    id: 1,
    label: "Pricing",
    icon: <CreditCard />,
    path: "/pricing",
    section: true,
  },
  {
    id: 2,
    label: "Explore",
    icon: <Banana />,
    path: "#explore",
    section: true,
  },
];

export const FOOTER_LINKS: FooterSection[] = [
  {
    section: "The List",
    items: [
      { name: "The List", href: "/thelist" },
      { name: "Map", href: "https://archive.thestreetartlist.com/map" },
      { name: "This Week", href: "/thisweek" },
      { name: "Calendar", href: "/calendar" },
      { name: "Archive", href: "https://archive.thestreetartlist.com/archive" },
      { name: "Submit", href: "/submit" },

      // { name: "Changelog", href: "/changelog" },
      // { name: "Careers", href: "/careers" },
    ],
  },
  {
    section: "membership",
    items: [
      {
        name: "Manage",
        href: "/dashboard/billing",
        sub: ["active", "trialing"],
      }, //only if you're logged in
      // { name: "Documentation", href: "/docs" },
      // { name: "Examples", href: "/examples" },
      { name: "Pricing", href: "/pricing" },
      { name: "Resources", href: "/resources" },
    ],
  },

  {
    section: "legal",
    items: [
      { name: "Privacy", href: "/privacy" },
      { name: "Terms", href: "/terms" },
      // { name: "License", href: "/license" },
    ],
  },
  {
    section: "social",

    items: SOCIAL_MEDIA_LINKS.filter(({ label }) => label !== "Patreon").map(
      ({ label, path }) => ({
        name: label,
        href: path,
      }),
    ),
  },
  {
    section: "Misc",
    items: [
      { name: "About", href: "/about" },
      { name: "FAQ", href: "/faq" },
      { name: "Changelog", href: "/changelog" },
      // { name: "Collaborations", href: "/collabs" },
      {
        name: "Contact & Support",
        href: "/support",
      },
    ],
  },
];

// note-to-self: Helper function to get the grid column class based on the number of columns in the FOOTER_LINKS object

export const getGridColsClass = (numColumns: number): string => {
  const gridColsClass =
    {
      1: "md:grid-cols-1",
      2: "md:grid-cols-2",
      3: "md:grid-cols-3",
      4: "md:grid-cols-4",
      5: "md:grid-cols-5",
      6: "md:grid-cols-6",
    }[numColumns] || "md:grid-cols-4";

  return gridColsClass;
};

//TODO: Make a specific social media component that has props for the class and icon (and... else?)

interface DashNavItem {
  label: string;
  href: string;
  icon: LucideIcon | IconType;
  sectionIcon?: LucideIcon | IconType;
  sub: string[];
  userRole?: string[];
  userType: string[];
  section?: boolean;
  sectionCat?: string;
  sectionHead?: boolean;
  subsection?: boolean;
  heading?: string;
  desc?: string;
}

export const dashboardNavItems: DashNavItem[] = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: Home,
    desc: "Dashboard home",
    sub: ["active", "trialing"],
    userType: ["public"],
  },
  // {
  //   label: "User Account",
  //   href: "/dashboard/account",
  //   icon: User,
  //   section: true,
  //   sectionCat: "account",
  //   sectionIcon: User,
  //   sectionHead: true,
  //   heading: "Account",
  //   desc: "Manage your profile",
  //   sub: ["active", "trialing"],
  // },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    section: true,
    sectionCat: "account",
    sectionIcon: User,
    sectionHead: true,
    heading: "Account",
    desc: "Manage your profile",
    sub: ["active", "trialing", "all"],
    userType: ["organizer", "artist"],
  },

  {
    label: "Billing",
    href: "/dashboard/billing",
    icon: CreditCard,
    subsection: true,
    sectionCat: "account",
    desc: "Manage your payments",
    sub: ["active", "trialing", "canceled"],
    userType: ["artist"],
  },
  // {
  //   label: "Pending Applications",
  //   href: "/dashboard/admin/pending",
  //   icon: Clock1,
  //   subsection: true,
  //   sectionCat: "admin",
  //   desc: "Submitted Applications",
  //   sub: ["admin"],
  //   userType: ["admin"],
  // },
  {
    label: "Submissions",
    href: "/dashboard/admin/submissions",
    icon: LucideCircleFadingPlus,
    section: true,
    sectionIcon: CalendarCheck,
    sectionCat: "events",
    sectionHead: true,
    heading: "Events",
    desc: "Submitted Events/Open Calls",
    userRole: ["admin"],
    sub: [],
    userType: [],
  },

  {
    label: "Submit ",
    href: "/dashboard/admin/event",
    icon: LucideListPlus,
    subsection: true,
    sectionCat: "events",
    desc: "Submit a new event",
    userRole: ["admin"],
    sub: [],
    userType: [],
  },

  {
    label: "This Week ",
    href: "/admin/thisweek",
    icon: Calendar1,
    subsection: true,
    sectionCat: "events",
    desc: "This Week Recap Post",
    userRole: ["admin"],
    sub: [],
    userType: [],
  },
  {
    label: "Post Schedule",
    href: "/dashboard/admin/socials",
    icon: FaMobileAlt,
    subsection: true,
    sectionCat: "events",
    desc: "Post Schedule",
    userRole: ["admin"],
    sub: [],
    userType: [],
  },
  {
    label: "To-Do List",
    href: "/dashboard/admin/todos",
    icon: CheckSquare2,
    section: true,
    sectionIcon: Shield,
    sectionCat: "admin",
    sectionHead: true,
    heading: "Admin",
    desc: "Admin To-Do List",
    userRole: ["admin"],
    sub: [],
    userType: [],
  },
  // {
  //   label: "UI/UX Kanban",
  //   href: "/dashboard/admin/design",
  //   subsection: true,
  //   icon: LucideBrush,
  //   sectionCat: "admin",
  //   desc: "Design Kanban",
  // userRole: ["admin"],
  //   sub: [],
  //   userType: [],
  // },
  {
    label: "Users",
    href: "/dashboard/admin/users",
    icon: LucideUsers,
    subsection: true,
    sectionCat: "admin",
    desc: "User List",
    userRole: ["admin"],
    sub: [],
    userType: [],
  },
  {
    label: "Artists",
    href: "/dashboard/admin/artists",
    icon: Star,
    subsection: true,
    sectionCat: "admin",
    desc: "Artist List",
    userRole: ["admin"],
    sub: [],
    userType: [],
  },

  {
    label: "Resources",
    href: "/dashboard/admin/resources",
    icon: BookHeart,
    subsection: true,
    sectionCat: "admin",
    desc: "Online Events +",
    userRole: ["admin"],
    sub: [],
    userType: [],
  },
  {
    label: "Support",
    href: "/dashboard/admin/support",
    icon: HelpCircle,
    subsection: true,
    sectionCat: "admin",
    desc: "Support Tickets",
    userRole: ["admin"],
    sub: [],
    userType: [],
  },
  {
    label: "Street Art Calls",
    href: "/dashboard/admin/sac",
    icon: PaintRoller,
    subsection: true,
    sectionCat: "events",
    desc: "Street Art Calls",
    userRole: ["admin"],
    sub: [],
    userType: [],
  },
  {
    label: "Site Analytics",
    href: "/dashboard/admin/analytics",
    icon: PiGraph,
    subsection: true,
    sectionCat: "admin",
    desc: "Posthog Analytics",
    userRole: ["admin"],
    sub: [],
    userType: [],
  },

  {
    label: "My Profile",
    href: "/dashboard/artist",
    icon: IdCard,
    section: true,
    sectionIcon: LucidePaintRoller,
    sectionCat: "artist",
    sectionHead: true,
    heading: "Artist",
    desc: "Your artist profile",
    sub: ["active", "trialing"],
    userType: ["artist"],
  },
  {
    label: "My Applications",
    href: "/dashboard/artist/apps",
    icon: LucideArchive,
    subsection: true,
    sectionCat: "artist",
    desc: "Track your submissions",
    sub: ["active", "trialing"],
    userType: ["artist"],
  },
  {
    label: "Bookmarks",
    href: "/dashboard/artist/bookmarks",
    icon: Bookmark,
    subsection: true,
    sectionCat: "artist",
    desc: "Saved opportunities",
    sub: ["active", "trialing"],
    userType: ["artist"],
  },
  {
    label: "Hidden",
    href: "/dashboard/artist/hidden",
    icon: EyeOff,
    subsection: true,
    sectionCat: "artist",
    desc: "Hidden events/projects",
    sub: ["active", "trialing"],
    userType: ["artist"],
  },
  {
    label: "Audience",
    href: "/dashboard/newsletter",
    icon: UserSearch,
    section: true,
    sectionIcon: Newspaper,
    sectionCat: "newsletter",
    sectionHead: true,
    heading: "Newsletter",
    desc: "Newsletter Dashboard",
    userRole: ["admin"],
    sub: [],
    userType: [],
  },
  {
    label: "Campaigns",
    href: "/dashboard/newsletter/campaigns",
    icon: Table,
    subsection: true,
    sectionCat: "newsletter",
    desc: "View/Edit Campaigns",
    userRole: ["admin"],
    sub: [],
    userType: [],
  },
  // {
  //   label: "Submitted",
  //   href: "/dashboard/artist/apps/submitted",
  //   icon: Upload,
  //   subsection: true,
  //   sectionCat: "artist",
  //   desc: "Your sent applications",
  //   sub: ["active", "trialing"],
  //   userType: ["artist"],
  // },
  // {
  //   label: "Pending",
  //   href: "/dashboard/artist/apps/pending",
  //   icon: Clock,
  //   subsection: true,
  //   sectionCat: "artist",
  //   desc: "Awaiting response",
  //   sub: ["active", "trialing"],
  //   userType: ["artist"],
  // },
  // {
  //   label: "Accepted",
  //   href: "/dashboard/artist/apps/accepted",
  //   icon: CheckCircle,
  //   subsection: true,
  //   sectionCat: "artist",
  //   desc: "Approved applications",
  //   sub: ["active", "trialing"],
  //   userType: ["artist"],
  // },
  // {
  //   label: "Rejected",
  //   href: "/dashboard/artist/apps/rejected",
  //   icon: XCircle,
  //   subsection: true,
  //   sectionCat: "artist",
  //   desc: "Declined applications",
  //   sub: ["active", "trialing"],
  //   userType: ["artist"],
  // },
  // {
  //   label: "CV & Resume",
  //   href: "/dashboard/portfolio",
  //   icon: FileText,
  //   sectionIcon: FileText,
  //   section: true,
  //   sectionHead: true,
  //   sectionCat: "portfolio",
  //   heading: "CV & Portfolio",
  //   desc: "Manage professional documents",
  //   sub: ["active", "trialing", "admin"],
  //   userType: ["artist", "admin"],
  // },
  // {
  //   label: "Portfolio",
  //   href: "/dashboard/portfolio/docs",
  //   icon: Folder,
  //   subsection: true,
  //   sectionCat: "portfolio",
  //   desc: "Your uploaded works",
  //   sub: ["active", "trialing", "admin"],
  //   userType: ["artist", "admin"],
  // },
  // {
  //   label: "Artist Statement",
  //   href: "/dashboard/portfolio/artist-statement",
  //   icon: Brush,
  //   subsection: true,
  //   sectionCat: "portfolio",
  //   desc: "Define your artistic vision",
  //   sub: ["active", "trialing", "admin"],
  //   userType: ["artist", "admin"],
  // },

  {
    label: "My Organizations",
    href: "/dashboard/organizer",
    icon: BadgeCheck,
    section: true,
    sectionIcon: BsPersonVcard,
    sectionCat: "organizer",
    sectionHead: true,
    heading: "Organizer",
    desc: "Manage your organizations",
    sub: ["all"],
    userType: ["organizer"],
  },
  {
    label: "My Submissions",
    href: "/dashboard/organizer/events",
    icon: LucideCalendar,
    subsection: true,
    sectionCat: "organizer",
    desc: "Manage your events/projects/open calls",
    sub: ["all"],
    userType: ["organizer"],
  },
  {
    label: "Edit Submission ",
    href: "/dashboard/organizer/update-event",
    icon: LucideCalendarCog,
    subsection: true,
    sectionCat: "organizer",
    desc: "Edit an event/project/open call",
    sub: ["all"],
    userType: ["organizer"],
  },
  {
    label: "Submit New",
    href: "/submit",
    icon: LucideCalendarPlus2,
    subsection: true,
    sectionCat: "organizer",
    desc: "Submit an event, project, grant, residency, or open call",
    sub: ["all"],
    userType: ["organizer"],
  },
  {
    label: "Changelog",
    href: "/changelog",
    icon: FileText,
    sectionIcon: FileText,
    subsection: true,
    sectionCat: "misc",
    desc: "View the latest updates",
    sub: ["all"],
    userType: ["public"],
  },

  {
    label: "Help & Support",
    href: "/support",
    icon: HelpCircle,
    desc: "Get assistance",
    sub: ["all"],
    userType: ["public"],
  },
  {
    label: "The List",
    href: "/thelist",
    icon: Scroll,
    subsection: true,
    sectionCat: "The List",
    desc: "View the list of events/projects",
    sub: ["all"],
    userType: ["public"],
  },
  {
    label: "Calendar",
    href: "/calendar",
    icon: Calendar,
    subsection: true,
    sectionCat: "The List",
    desc: "View event calendar",
    sub: ["all"],
    userType: ["public"],
  },
];
export type LinktreeProps = SocialProps & {
  group?: string;
  type: Infer<typeof linktreeLinkTypeValidator>;
};

export const linktreeLinks: LinktreeProps[] = [
  {
    label: "Current Events",
    icon: LuMegaphone,
    path: "/resources",
    group: "Resources",
    type: "onlineEvent",
  },
  {
    label: "The List - Events & Open Calls",
    icon: Scroll,
    path: "/thelist",
    group: "The List",
    type: "theList",
  },
  {
    label: "Open calls ending this week",
    icon: Calendar1,
    path: "/thisweek",
    group: "The List",
    type: "thisWeek",
  },
  {
    label: "Submit New Event/Open Call",
    icon: Pencil,
    path: "/submit",
    group: "The List",
    type: "submit",
  },
  {
    label: "Become a member",
    icon: Heart,
    path: "/pricing?type=artist",
    group: "Membership",
    type: "becomeMember",
  },
];
