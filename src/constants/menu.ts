import { LucideIcon } from "lucide-react";

export interface FullPageNavMenuItem {
  title: string;
  path: string;
  icon?: React.ReactNode | LucideIcon;
  userType?: string[];
  category: string;
  slug?: string;
  public?: boolean;
  view?: string;
}

interface FullPageNavMenuSection {
  title: string;
  items: FullPageNavMenuItem[];
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
        userType: ["public"],
      },
      {
        title: "The List",
        path: "/thelist",
        category: "thelist",
        public: true,
        userType: ["public"],
      },
      // {
      //   title: "This Week",
      //   path: "/thisweek",
      //   category: "thelist",
      //   public: true,
      //   userType: ["public"],
      // },
      // {
      //   title: "Archive",
      //   path: "/archive",
      //   category: "thelist",
      //   public: true,
      //   userType: ["public"],
      // },
      // {
      //   title: "Calendar",
      //   path: "/calendar",
      //   category: "thelist",
      //   public: true,
      //   userType: ["public"],
      // },

      // {
      //   title: "Submit",
      //   path: "/submit",
      //   category: "thelist",
      //   public: true,
      //   userType: ["public"],
      // },
    ],
  },
  {
    title: "Dashboard",
    items: [
      {
        title: "My Dashboard",
        path: "/dashboard",
        category: "dashboard",
        public: false,
        view: "dashboard",
        userType: ["admin", "organizer", "artist", "judge"],
      },
      {
        title: "My Applications",
        path: "/dashboard/applications",
        category: "dashboard",
        public: false,
        view: "dashboard",
        userType: ["artist"],
      },
      // {
      //   title: "Projects & Events",
      //   path: "/dashboard/events",
      //   category: "dashboard",
      //   public: false,
      //   view: "dashboard",
      //   userType: ["organizer", "judge"],
      // },
      {
        title: "Bookmarks",
        path: "/dashboard",
        category: "dashboard",
        public: false,
        view: "dashboard",
        userType: ["artist"],
      },
      {
        title: "Account",
        path: "/dashboard/account",
        category: "dashboard",
        public: false,
        view: "dashboard",
        userType: ["admin", "organizer", "artist"],
      },
      {
        title: "Settings",
        path: "/dashboard/account/settings",
        category: "dashboard",
        public: false,
        view: "dashboard",
        userType: ["admin", "organizer", "artist", "judge"],
      },
    ],
  },

  // {
  //   title: "Resources",
  //   items: [
  //     {
  //       title: "For Artists",
  //       path: "/faq",
  //       category: "resources",
  //       public: true,
  //       userType: ["public"],
  //     },
  //     {
  //       title: "For Organizers",
  //       path: "/terms",
  //       category: "resources",
  //       public: true,
  //       userType: ["public"],
  //     },
  //     {
  //       title: "Newsletter",
  //       path: "/newsletter",
  //       category: "resources",
  //       public: true,
  //       userType: ["public"],
  //     },
  //     {
  //       title: "Misc",
  //       path: "/privacy",
  //       category: "resources",
  //       public: true,
  //       userType: ["public"],
  //     },
  //   ],
  // },
  {
    title: "Admin",
    items: [
      {
        title: "Dashboard",
        path: "/dashboard/admin",
        category: "admin",
        public: false,
        view: "dashboard",
        userType: ["admin"],
      },
      {
        title: "Submissions",
        path: "/admin/submissions",
        category: "admin",
        public: false,
        userType: ["admin"],
      },
      {
        title: "Todos",
        path: "/dashboard/admin",
        category: "admin",
        public: false,
        userType: ["admin"],
      },
      {
        title: "Analytics",
        path: "/admin/analytics",
        category: "admin",
        public: false,
        userType: ["admin"],
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
        userType: ["public"],
      },
      // {
      //   title: "Collaborators",
      //   path: "/collaborators",
      //   category: "about",
      //   public: true,
      //   userType: ["public"],
      // },
      {
        title: "Contact",
        path: "/contact",
        category: "about",
        public: true,
        userType: ["public"],
      },
      {
        title: "Pricing",
        path: "/pricing",
        category: "thelist",
        public: true,
        userType: ["public"],
      },
    ],
  },
  // {
  //   title: "Artists",
  //   items: [
  //     {
  //       title: "My Dashboard",
  //       path: "/dashboard",
  //       category: "artist",
  //       public: false,
  //       view: "dashboard",
  //     },
  //     {
  //       title: "Applications",
  //       path: "/artists/applications",
  //       category: "artist",
  //       public: false,
  //     },
  //     {
  //       title: "Bookmarks",
  //       path: "/artists/bookmarks",
  //       category: "artist",
  //       public: false,
  //     },
  //     {
  //       title: "The List",
  //       path: "/artists/thelist",
  //       category: "artist",
  //       public: false,
  //     },

  //     {
  //       title: "Resources",
  //       path: "/artists/resources",
  //       category: "artist",
  //       public: false,
  //     },
  //   ],
  // },
  // {
  //   title: "Organizers",
  //   items: [
  //     {
  //       title: "My Dashboard",
  //       path: "/dashboard",
  //       category: "organizer",
  //       public: false,
  //       view: "dashboard",
  //     },
  //     {
  //       title: "My Open Calls",
  //       path: "/organizers/opencalls",
  //       category: "organizer",
  //       public: false,
  //     },
  //     {
  //       title: "Members",
  //       path: "/organizers/members",
  //       category: "organizer",
  //       public: false,
  //     },
  //     {
  //       title: "Calendar",
  //       path: "/organizers/calendar",
  //       category: "organizer",
  //       public: false,
  //     },
  //     {
  //       title: "Resources",
  //       path: "/organizers/resources",
  //       category: "organizer",
  //       public: false,
  //     },
  //     {
  //       title: "Submit",
  //       path: "/submit",
  //       category: "organizer",
  //       public: false,
  //     },
  //   ],
  // },
];
