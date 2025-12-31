import { LucideIcon } from "lucide-react";

export type DeviceOptions = "mobile" | "tablet" | "desktop" | "all";
export interface FullPageNavMenuItem {
  title: string;
  path: string;
  icon?: React.ReactNode | LucideIcon;
  userType?: string[];
  category: string;
  slug?: string;
  public?: boolean;
  view?: string;
  sub?: string[];
  excluded?: string[];
  deviceType: DeviceOptions[];
}

interface FullPageNavMenuSection {
  title: string;
  items: FullPageNavMenuItem[];
}

export const mainMenuItems: FullPageNavMenuSection[] = [
  {
    title: "The List",
    items: [
      // {
      //   title: "Home",
      //   path: "/",
      //   category: "thelist",
      //   public: true,
      //   userType: ["public"],
      //   deviceType: ["all"],
      // },
      {
        title: "The List",
        path: "/thelist",
        category: "thelist",
        public: true,
        userType: ["public"],
        deviceType: ["all"],
      },
      {
        title: "This Week",
        path: "/thisweek",
        category: "thelist",
        public: true,
        userType: ["public"],
        deviceType: ["all"],
      },
      {
        title: "Calendar",
        path: "/calendar",
        category: "thelist",
        public: true,
        userType: ["public"],
        deviceType: ["all"],
      },
      // {
      //   title: "Archive",
      //   // path: "/archive",
      //   path: "https://archive.thestreetartlist.com/archive",
      //   category: "thelist",
      //   public: true,
      //   userType: ["public"],
      //   deviceType: ["all"],
      // },
      {
        title: "World Map",
        path: "/map",
        category: "thelist",
        public: true,
        userType: ["public"],
        deviceType: ["all"],
      },
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
  // {
  //   title: "Dashboard",
  //   items: [
  //     {
  //       title: "My Dashboard",
  //       path: "/dashboard",
  //       category: "dashboard",
  //       public: false,
  //       view: "dashboard",
  //       userType: ["artist", "judge"],
  //       sub: ["active", "trialing"],
  //     },

  //     {
  //       title: "My Applications",
  //       path: "/dashboard/artist",
  //       category: "dashboard",
  //       public: false,
  //       view: "dashboard",
  //       userType: ["artist"],
  //       sub: ["active", "trialing"],
  //     },
  //     // {
  //     //   title: "Projects & Events",
  //     //   path: "/dashboard/events",
  //     //   category: "dashboard",
  //     //   public: false,
  //     //   view: "dashboard",
  //     //   userType: ["organizer", "judge"],
  //     // },
  //     {
  //       title: "Bookmarks",
  //       path: "/dashboard/artist/bookmarks",
  //       category: "dashboard",
  //       public: false,
  //       view: "dashboard",
  //       userType: ["artist"],
  //       sub: ["active", "trialing"],
  //     },
  //     {
  //       title: "Hidden",
  //       path: "/dashboard/artist/hidden",
  //       category: "dashboard",
  //       public: false,
  //       view: "dashboard",
  //       userType: ["artist"],
  //       sub: ["active", "trialing"],
  //     },
  //     {
  //       title: "Account",
  //       path: "/dashboard/account/billing",
  //       category: "dashboard",
  //       public: false,
  //       view: "dashboard",
  //       userType: ["artist"],
  //       sub: ["active", "trialing"],
  //     },
  //     {
  //       title: "Settings",
  //       path: "/dashboard/account/settings",
  //       category: "dashboard",
  //       public: false,
  //       view: "dashboard",
  //       userType: ["artist", "judge"],
  //       sub: ["active", "trialing"],
  //     },
  //   ],
  // },

  {
    title: "Artist",
    items: [
      {
        title: "My Dashboard",
        path: "/dashboard",
        category: "dashboard",
        public: false,
        view: "dashboard",
        userType: ["artist", "judge"],
        sub: ["active", "trialing"],
        deviceType: ["all"],
      },

      {
        title: "My Applications",
        path: "/dashboard/artist",
        category: "dashboard",
        public: false,
        view: "dashboard",
        userType: ["artist"],
        sub: ["active", "trialing"],
        deviceType: ["all"],
      },

      {
        title: "Bookmarks",
        path: "/dashboard/artist/bookmarks",
        category: "dashboard",
        public: false,
        view: "dashboard",
        userType: ["artist"],
        sub: ["active", "trialing"],
        deviceType: ["all"],
      },
      {
        title: "Hidden",
        path: "/dashboard/artist/hidden",
        category: "dashboard",
        public: false,
        view: "dashboard",
        userType: ["artist"],
        sub: ["active", "trialing"],
        deviceType: ["all"],
      },
    ],
  },
  {
    title: "Organizer",
    items: [
      {
        title: "My Submissions",
        path: "/dashboard/organizer/events",
        category: "dashboard",
        public: false,
        view: "dashboard",
        userType: ["organizer"],
        deviceType: ["all"],
      },
      {
        title: "My Dashboard",
        path: "/dashboard/organizer",
        category: "dashboard",
        public: false,
        view: "dashboard",
        userType: ["organizer"],
        deviceType: ["all"],
      },
      {
        title: "Settings",
        path: "/dashboard/settings",
        category: "dashboard",
        public: false,
        view: "dashboard",
        userType: ["organizer"],
        excluded: ["artist"],
        deviceType: ["all"],
      },
      // {
      //   title: "Submit",
      //   path: "/submit",
      //   category: "dashboard",
      //   public: false,
      //   view: "dashboard",
      //   userType: ["organizer"],
      //   excluded: ["artist"],
      // },
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
      // {
      //   title: "Dashboard",
      //   path: "/dashboard/admin",
      //   category: "admin",
      //   public: false,
      //   view: "dashboard",
      //   userType: ["admin"],
      // },
      {
        title: "Submissions",
        path: "/dashboard/admin/submissions",
        category: "admin",
        public: false,
        userType: ["admin"],
        deviceType: ["all"],
      },
      {
        title: "Users",
        path: "/dashboard/admin/users",
        category: "admin",
        public: false,
        userType: ["admin"],
        deviceType: ["all"],
      },
      {
        title: "Todos",
        path: "/dashboard/admin/todos",
        category: "admin",
        public: false,
        userType: ["admin"],
        deviceType: ["all"],
      },
      {
        title: "Analytics",
        path: "/dashboard/admin/analytics",
        category: "admin",
        public: false,
        userType: ["admin"],
        deviceType: ["all"],
      },
    ],
  },
  {
    title: "My Account",
    items: [
      {
        title: "Billing",
        path: "/dashboard/billing",
        category: "dashboard",
        public: false,
        view: "dashboard",
        userType: ["artist"],
        sub: ["active", "trialing"],
        deviceType: ["mobile"],
      },
      {
        title: "Settings",
        path: "/dashboard/settings",
        category: "dashboard",
        public: false,
        view: "dashboard",
        userType: ["artist", "judge"],
        sub: ["active", "trialing"],
        deviceType: ["mobile"],
      },
    ],
  },
  {
    title: "Misc",
    items: [
      {
        title: "About ",
        path: "/about",
        category: "about",
        public: true,
        userType: ["public"],
        deviceType: ["all"],
      },
      {
        title: "Contact",
        path: "/support",
        category: "about",
        public: true,
        userType: ["public"],
        deviceType: ["all"],
      },
      {
        title: "Pricing",
        path: "/pricing",
        category: "thelist",
        public: true,
        userType: ["public"],
        deviceType: ["all"],
      },
      {
        title: "FAQ",
        path: "/faq",
        category: "about",
        public: true,
        userType: ["public", "admin"],
        deviceType: ["all"],
      },

      {
        title: "Terms",
        path: "/terms",
        category: "about",
        public: true,
        userType: ["public"],
        deviceType: ["all"],
      },
      {
        title: "Privacy",
        path: "/privacy",
        category: "about",
        public: true,
        userType: ["public"],
        deviceType: ["all"],
      },
      {
        title: "Changelog",
        path: "/changelog",
        category: "about",
        public: true,
        userType: ["public"],
        deviceType: ["all"],
      },
      {
        title: "Resources",
        path: "/resources",
        category: "resources",
        public: true,
        userType: ["public"],
        deviceType: ["all"],
      },

      // {
      //   title: "Collaborators",
      //   path: "/collaborators",
      //   category: "about",
      //   public: true,
      //   userType: ["public"],
      // },

      // {
      //   title: "Contact",
      //   path: "/contact",
      //   category: "about",
      //   public: true,
      //   userType: ["public"],
      // },
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
