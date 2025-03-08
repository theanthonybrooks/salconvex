import { LucideIcon } from "lucide-react"

export interface FullPageNavMenuItem {
  title: string
  path: string
  icon?: React.ReactNode | LucideIcon
  category: string
  slug?: string
  public?: boolean
  view?: string
}

interface FullPageNavMenuSection {
  title: string
  items: FullPageNavMenuItem[]
}

export const mainMenuItems: FullPageNavMenuSection[] = [
  {
    title: "The List",
    items: [
      {
        title: "Home",
        path: "/",
        category: "thelist",
        public: true,
      },
      {
        title: "This Week",
        path: "/thelist",
        category: "thelist",
        public: true,
      },
      {
        title: "Archive",
        path: "/archive",
        category: "thelist",
        public: true,
      },
      {
        title: "Calendar",
        path: "/calendar",
        category: "thelist",
        public: true,
      },

      {
        title: "Pricing",
        path: "/pricing",
        category: "thelist",
        public: true,
      },
      {
        title: "Submit",
        path: "/submit",
        category: "thelist",
        public: true,
      },
      {
        title: "Newsletter",
        path: "/newsletter",
        category: "thelist",
        public: true,
      },
    ],
  },
  {
    title: "Artists",
    items: [
      {
        title: "My Dashboard",
        path: "/dashboard",
        category: "artist",
        public: false,
        view: "dashboard",
      },
      {
        title: "Applications",
        path: "/artists/applications",
        category: "artist",
        public: false,
      },
      {
        title: "Bookmarks",
        path: "/artists/bookmarks",
        category: "artist",
        public: false,
      },
      {
        title: "The List",
        path: "/artists/thelist",
        category: "artist",
        public: false,
      },

      {
        title: "Resources",
        path: "/artists/resources",
        category: "artist",
        public: false,
      },
    ],
  },
  {
    title: "Organizers",
    items: [
      {
        title: "My Dashboard",
        path: "/dashboard",
        category: "organizer",
        public: false,
        view: "dashboard",
      },
      {
        title: "My Open Calls",
        path: "/organizers/opencalls",
        category: "organizer",
        public: false,
      },
      {
        title: "Members",
        path: "/organizers/members",
        category: "organizer",
        public: false,
      },
      {
        title: "Calendar",
        path: "/organizers/calendar",
        category: "organizer",
        public: false,
      },
      {
        title: "Resources",
        path: "/organizers/resources",
        category: "organizer",
        public: false,
      },
      {
        title: "Submit",
        path: "/submit",
        category: "organizer",
        public: false,
      },
    ],
  },
  {
    title: "Resources",
    items: [
      {
        title: "For Artists",
        path: "/faq",
        category: "resources",
        public: true,
      },
      {
        title: "For Organizers",
        path: "/terms",
        category: "resources",
        public: true,
      },
      {
        title: "Misc",
        path: "/privacy",
        category: "resources",
        public: true,
      },
    ],
  },
  {
    title: "Admin",
    items: [
      {
        title: "Dashboard",
        path: "/dashboard/admin",
        category: "admin",
        public: false,
        view: "dashboard",
      },
      {
        title: "Submissions",
        path: "/admin/submissions",
        category: "admin",
        public: false,
      },
      {
        title: "Todos",
        path: "/dashboard/admin",
        category: "admin",
        public: false,
      },
      {
        title: "Analytics",
        path: "/admin/analytics",
        category: "admin",
        public: false,
      },
    ],
  },
  {
    title: "About",
    items: [
      {
        title: 'About "The List"',
        path: "/about",
        category: "about",
        public: true,
      },
      {
        title: "Collaborators",
        path: "/collaborators",
        category: "about",
        public: true,
      },
      {
        title: "Contact",
        path: "/contact",
        category: "about",
        public: true,
      },
    ],
  },
]
