import { LucideIcon } from "lucide-react"

export interface FullPageNavMenuItem {
  title: string
  path: string
  icon?: React.ReactNode | LucideIcon
  category: string
  slug?: string
}

interface FullPageNavMenuSection {
  title: string
  items: FullPageNavMenuItem[]
}

export const mainMenuItems: FullPageNavMenuSection[] = [
  {
    title: "General",
    items: [
      {
        title: "Home",
        path: "/",
        category: "general",
      },
      {
        title: "Archive",
        path: "/archive",
        category: "general",
      },
      {
        title: "Calendar",
        path: "/calendar",
        category: "general",
      },

      {
        title: "Pricing",
        path: "/pricing",
        category: "general",
      },
      {
        title: "Submit",
        path: "/submit",
        category: "general",
      },
    ],
  },
  {
    title: "Artists",
    items: [
      {
        title: "Dashboard",
        path: "/artists/dashboard",
        category: "artists",
      },
      {
        title: "Submissions",
        path: "/artists/submissions",
        category: "artists",
      },
      {
        title: "The List",
        path: "/artists/thelist",
        category: "artists",
      },
      {
        title: "This Week",
        path: "/artists/thelist",
        category: "artists",
      },
      {
        title: "Resources",
        path: "/artists/resources",
        category: "artists",
      },
    ],
  },
  {
    title: "Organizers",
    items: [
      {
        title: "Dashboard",
        path: "/organizers/dashboard",
        category: "organizers",
      },
      {
        title: "Submissions",
        path: "/organizers/submissions",
        category: "organizers",
      },
      {
        title: "Calendar",
        path: "/organizers/calendar",
        category: "organizers",
      },
      {
        title: "Resources",
        path: "/organizers/resources",
        category: "organizers",
      },
    ],
  },
  {
    title: "Admin",
    items: [
      {
        title: "Dashboard",
        path: "/admin/dashboard",
        category: "admin",
      },
      {
        title: "Submissions",
        path: "/admin/submissions",
        category: "admin",
      },
      {
        title: "Todos",
        path: "/admin/tasks",
        category: "admin",
      },
      {
        title: "Analytics",
        path: "/admin/analytics",
        category: "admin",
      },
    ],
  },
]
