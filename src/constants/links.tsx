import {
  Banana,
  Bookmark,
  // Brush,
  CheckCircle,
  CheckSquare2,
  Clock,
  Clock1,
  CreditCard,
  Ellipsis,
  FileText,
  Folder,
  HelpCircle,
  Home,
  HomeIcon,
  LucideIcon,
  Settings,
  Shield,
  Upload,
  User,
  XCircle,
} from "lucide-react";

import { TbBrandPatreon } from "react-icons/tb";

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
  icon: JSX.Element;
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
      { name: "About", href: "/about" },
      { name: "Changelog", href: "/changelog" },
      { name: "Collaborations", href: "/collabs" },
      // { name: "Careers", href: "/careers" },
      {
        name: "Contact",
        href: "mailto:info@thestreetartlist.com&subject=Site%20Contact",
      },
    ],
  },
  {
    section: "subscription",
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
    items: [
      { name: "Instagram", href: "https://www.instagram.com/thestreetartlist" },
      { name: "Threads", href: "https://threads.net/thestreetartlist" },
      { name: "Facebook", href: "https://facebook.com/thestreetartlist" },
      // { name: "LinkedIn", href: "https://www.linkedin.com/in/thestreetartlist" },
      // { name: "GitHub", href: "https://github.com/thestreetartlist" },
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

export const SOCIAL_MEDIA_LINKS: SocialProps[] = [
  {
    label: "Threads",
    icon: <FaThreads className="h-5 w-5" />,
    path: "https://threads.net/thestreetartlist",
  },
  {
    label: "Instagram",
    icon: <FaInstagram className="h-5 w-5" />,
    path: "https://www.instagram.com/thestreetartlist",
  },
  {
    label: "Facebook",
    icon: <FaFacebookF className="h-5 w-5" />,
    path: "https://facebook.com/thestreetartlist",
  },
  {
    label: "Patreon",
    icon: <TbBrandPatreon className="h-5 w-5" />,
    path: "https://www.patreon.com/thestreetartlist",
  },
];
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
    sub: ["active", "trialing", "cancelled"],
    userType: ["public"],
  },
  {
    label: "Pending Applications",
    href: "/dashboard/admin/pending",
    icon: Clock1,
    subsection: true,
    sectionCat: "admin",
    desc: "Submitted Applications",
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
    desc: "Admin Panel",
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
    href: "/dashboard/apps",
    icon: Folder,
    section: true,
    sectionIcon: Folder,
    sectionCat: "apps",
    sectionHead: true,
    heading: "Applications",
    desc: "Track your submissions",
    sub: ["active", "trialing"],
    userType: ["artist"],
  },
  {
    label: "Bookmarks",
    href: "/dashboard/apps/bookmarked",
    icon: Bookmark,
    subsection: true,
    sectionCat: "apps",
    desc: "Saved opportunities",
    sub: ["active", "trialing"],
    userType: ["artist", "admin"],
  },
  {
    label: "Submitted",
    href: "/dashboard/apps/submitted",
    icon: Upload,
    subsection: true,
    sectionCat: "apps",
    desc: "Your sent applications",
    sub: ["active", "trialing"],
    userType: ["artist"],
  },
  {
    label: "Pending",
    href: "/dashboard/apps/pending",
    icon: Clock,
    subsection: true,
    sectionCat: "apps",
    desc: "Awaiting response",
    sub: ["active", "trialing"],
    userType: ["artist"],
  },
  {
    label: "Accepted",
    href: "/dashboard/apps/accepted",
    icon: CheckCircle,
    subsection: true,
    sectionCat: "apps",
    desc: "Approved applications",
    sub: ["active", "trialing"],
    userType: ["artist"],
  },
  {
    label: "Rejected",
    href: "/dashboard/apps/rejected",
    icon: XCircle,
    subsection: true,
    sectionCat: "apps",
    desc: "Declined applications",
    sub: ["active", "trialing"],
    userType: ["artist"],
  },
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
    label: "Other Stuff",
    href: "/dashboard/misc",
    icon: Ellipsis,
    sectionIcon: Ellipsis,
    section: true,
    sectionHead: true,
    sectionCat: "misc",
    heading: "Miscellaneous",
    desc: "Extras & other tools",
    sub: ["active", "trialing"],
    userType: ["public"],
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
    href: "/dashboard/help",
    icon: HelpCircle,
    desc: "Get assistance",
    sub: ["all"],
    userType: ["public"],
  },
];
