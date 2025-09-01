import {
  Banana,
  Bookmark,
  Calendar,
  Calendar1,
  CalendarCheck,
  CheckSquare2,
  CreditCard,
  EyeOff,
  FileText,
  HelpCircle,
  Home,
  HomeIcon,
  LucideArchive,
  LucideBrush,
  LucideCalendar,
  LucideCalendarCog,
  LucideCalendarPlus2,
  LucideCircleFadingPlus,
  LucideIcon,
  LucideListPlus,
  LucidePaintRoller,
  LucideUsers,
  Newspaper,
  Scroll,
  Settings,
  Shield,
  User,
} from "lucide-react";
import { BsPersonVcard } from "react-icons/bs";

import { JSX } from "react";
import { IconType } from "react-icons";
import { FaFacebookF, FaInstagram, FaThreads } from "react-icons/fa6";
import { PiGraph } from "react-icons/pi";

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
      { name: "Map", href: "https://thestreetartlist.helioho.st/map" },
      { name: "This Week", href: "/thisweek" },
      { name: "Calendar", href: "/calendar" },
      { name: "Archive", href: "https://thestreetartlist.helioho.st/archive" },
      { name: "Submit", href: "/submit" },

      // { name: "Changelog", href: "/changelog" },
      // { name: "Careers", href: "/careers" },
    ],
  },
  {
    section: "membership",
    items: [
      { name: "Manage", href: "/manage", sub: ["active", "trialing"] }, //only if you're logged in
      // { name: "Documentation", href: "/docs" },
      // { name: "Examples", href: "/examples" },
      { name: "Pricing", href: "/pricing" },
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
    href: "/dashboard/account/settings",
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
    href: "/dashboard/account/billing",
    icon: CreditCard,
    subsection: true,
    sectionCat: "account",
    desc: "Manage your payments",
    sub: ["active", "trialing", "canceled"],
    userType: ["artist", "admin"],
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
    sub: ["admin"],
    userType: ["admin"],
  },

  {
    label: "Submit ",
    href: "/dashboard/admin/event",
    icon: LucideListPlus,
    subsection: true,
    sectionCat: "events",
    desc: "Submit a new event",
    sub: ["admin"],
    userType: ["admin"],
  },
  {
    label: "This Week ",
    href: "/admin/thisweek",
    icon: Calendar1,
    subsection: true,
    sectionCat: "events",
    desc: "This Week Recap Post",
    sub: ["admin"],
    userType: ["admin"],
  },
  {
    label: "Website To-Dos",
    href: "/dashboard/admin/todos",
    icon: CheckSquare2,
    section: true,
    sectionIcon: Shield,
    sectionCat: "admin",
    sectionHead: true,
    heading: "Admin",
    desc: "Admin To-Do List",
    sub: ["admin"],
    userType: ["admin"],
  },
  {
    label: "UI/UX Kanban",
    href: "/dashboard/admin/design",
    subsection: true,
    icon: LucideBrush,
    sectionCat: "admin",
    desc: "Design Kanban",
    sub: ["admin"],
    userType: ["admin"],
  },
  {
    label: "Users",
    href: "/dashboard/admin/users",
    icon: LucideUsers,
    subsection: true,
    sectionCat: "admin",
    desc: "User List",
    sub: ["admin"],
    userType: ["admin"],
  },
  {
    label: "Newsletter",
    href: "/dashboard/admin/newsletter",
    icon: Newspaper,
    subsection: true,
    sectionCat: "admin",
    desc: "Newsletter Subscribers",
    sub: ["admin"],
    userType: ["admin"],
  },
  {
    label: "Site Analytics",
    href: "/dashboard/admin/analytics",
    icon: PiGraph,
    subsection: true,
    sectionCat: "admin",
    desc: "Posthog Analytics",
    sub: ["admin"],
    userType: ["admin"],
  },

  {
    label: "My Applications",
    href: "/dashboard/artist",
    icon: LucideArchive,
    section: true,
    sectionIcon: LucidePaintRoller,
    sectionCat: "artist",
    sectionHead: true,
    heading: "Artist",
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
    userType: ["artist", "admin"],
  },
  {
    label: "Hidden",
    href: "/dashboard/artist/hidden",
    icon: EyeOff,
    subsection: true,
    sectionCat: "artist",
    desc: "Hidden events/projects",
    sub: ["active", "trialing"],
    userType: ["artist", "admin"],
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
  // {
  //   label: "Other Stuff",
  //   href: "/dashboard/misc",
  //   icon: Ellipsis,
  //   sectionIcon: Ellipsis,
  //   section: true,
  //   sectionHead: true,
  //   sectionCat: "misc",
  //   heading: "Miscellaneous",
  //   desc: "Extras & other tools",
  //   sub: ["active", "trialing"],
  //   userType: ["public"],
  // },
  {
    label: "My Submissions",
    href: "/dashboard/organizer/events",
    icon: LucideCalendar,
    section: true,
    sectionIcon: BsPersonVcard,
    sectionCat: "organizer",
    sectionHead: true,
    heading: "Organizer",
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
