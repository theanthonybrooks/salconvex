import {
  Banana,
  Bookmark,
  Brush,
  CheckCircle,
  Clock,
  CreditCard,
  Ellipsis,
  FileText,
  Folder,
  Github,
  HelpCircle,
  Home,
  HomeIcon,
  Instagram,
  LucideIcon,
  Settings,
  Twitter,
  Upload,
  User,
  XCircle,
} from "lucide-react"

import { TbBrandPatreon } from "react-icons/tb"

import { JSX } from "react"

export type MenuProps = {
  id: number
  label: string
  icon: JSX.Element
  path: string
  section?: boolean
  integration?: boolean
}
export type SocialProps = {
  label: string
  icon: JSX.Element
  path: string
}

interface LinkItem {
  name: string
  href: string
}

type Links = Record<string, LinkItem[]>

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
]

export const FOOTER_LINKS: Links = {
  product: [
    { name: "Features", href: "/features" },
    { name: "Documentation", href: "/docs" },
    { name: "Examples", href: "/examples" },
    { name: "Pricing", href: "/pricing" },
  ],
  company: [
    { name: "About", href: "/about" },
    { name: "Changelog", href: "/changelog" },
    { name: "Careers", href: "/careers" },
    { name: "Contact", href: "/contact" },
  ],
  legal: [
    { name: "Privacy", href: "/privacy" },
    { name: "Terms", href: "/terms" },
    { name: "License", href: "/license" },
  ],
  social: [
    { name: "Twitter", href: "https://twitter.com/theanthonybrooks" },
    { name: "Instagram", href: "https://www.instagram.com/theanthonybrooks" },
    { name: "LinkedIn", href: "https://www.linkedin.com/in/theanthonybrooks" },
    { name: "GitHub", href: "https://github.com/theanthonybrooks" },
  ],
}

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
    }[numColumns] || "md:grid-cols-4"

  return gridColsClass
}

//TODO: Make a specific social media component that has props for the class and icon (and... else?)

export const SOCIAL_MEDIA_LINKS: SocialProps[] = [
  {
    label: "Twitter",
    icon: <Twitter className='h-5 w-5' />,
    path: "https://twitter.com/theanthonybrooks",
  },
  {
    label: "Instagram",
    icon: <Instagram className='h-5 w-5' />,
    path: "https://www.instagram.com/theanthonybrooks",
  },
  {
    label: "GitHub",
    icon: <Github className='h-5 w-5' />,
    path: "https://github.com/theanthonybrooks",
  },
  {
    label: "Patreon",
    icon: <TbBrandPatreon className='h-5 w-5' />,
    path: "https://www.patreon.com/thestreetartlist",
  },
]
interface DashNavItem {
  label: string
  href: string
  icon: LucideIcon
  sectionIcon?: LucideIcon
  sub: string[] // Change sub to an array of strings
  section?: boolean
  sectionCat?: string
  sectionHead?: boolean
  subsection?: boolean
  heading?: string
  desc?: string
}

export const dashboardNavItems: DashNavItem[] = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: Home,
    desc: "Dashboard home",
    sub: ["active", "trialing"],
  },
  {
    label: "User Account",
    href: "/dashboard/account",
    icon: User,
    section: true,
    sectionCat: "account",
    sectionIcon: User,
    sectionHead: true,
    heading: "Account",
    desc: "Manage your profile",
    sub: ["active", "trialing"],
  },
  {
    label: "Settings",
    href: "/dashboard/account/settings",
    icon: Settings,
    subsection: true,
    sectionCat: "account",
    desc: "Customize preferences",
    sub: ["active", "trialing"],
  },
  {
    label: "Billing",
    href: "/dashboard/account/billing",
    icon: CreditCard,
    subsection: true,
    sectionCat: "account",
    desc: "Manage your payments",
    sub: ["active", "trialing", "cancelled"],
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
  },
  {
    label: "Bookmarks",
    href: "/dashboard/apps/bookmarked",
    icon: Bookmark,
    subsection: true,
    sectionCat: "apps",
    desc: "Saved opportunities",
    sub: ["active", "trialing"],
  },
  {
    label: "Submitted",
    href: "/dashboard/apps/submitted",
    icon: Upload,
    subsection: true,
    sectionCat: "apps",
    desc: "Your sent applications",
    sub: ["active", "trialing"],
  },
  {
    label: "Pending",
    href: "/dashboard/apps/pending",
    icon: Clock,
    subsection: true,
    sectionCat: "apps",
    desc: "Awaiting response",
    sub: ["active", "trialing"],
  },
  {
    label: "Accepted",
    href: "/dashboard/apps/accepted",
    icon: CheckCircle,
    subsection: true,
    sectionCat: "apps",
    desc: "Approved applications",
    sub: ["active", "trialing"],
  },
  {
    label: "Rejected",
    href: "/dashboard/apps/rejected",
    icon: XCircle,
    subsection: true,
    sectionCat: "apps",
    desc: "Declined applications",
    sub: ["active", "trialing"],
  },
  {
    label: "CV & Resume",
    href: "/dashboard/portfolio",
    icon: FileText,
    sectionIcon: FileText,
    section: true,
    sectionHead: true,
    sectionCat: "portfolio",
    heading: "CV & Portfolio",
    desc: "Manage professional documents",
    sub: ["active", "trialing"],
  },
  {
    label: "Portfolio",
    href: "/dashboard/portfolio/docs",
    icon: Folder,
    subsection: true,
    sectionCat: "portfolio",
    desc: "Your uploaded works",
    sub: ["active", "trialing"],
  },
  {
    label: "Artist Statement",
    href: "/dashboard/portfolio/artist-statement",
    icon: Brush,
    subsection: true,
    sectionCat: "portfolio",
    desc: "Define your artistic vision",
    sub: ["active", "trialing"],
  },
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
  },
  {
    label: "Help & Support",
    href: "/dashboard/help",
    icon: HelpCircle,
    desc: "Get assistance",
    sub: ["all"],
  },
]
