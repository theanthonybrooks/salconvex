import { JSX } from "react";
import { FaInstagram } from "react-icons/fa";

export const landingPageNavbarMenuLinksResources: {
  title: string;
  href: string;
  description: string;
  isIcon?: boolean;
  sub: string[];
}[] = [
  {
    title: "For Artists",
    href: "/resources/artists",
    description: "Resources compiled for artists.",
    sub: ["all"],
  },
  {
    title: "For Organizers",
    href: "/resources/organizers",
    description: "Resources compiled for organizers.",
    sub: ["all"],
  },
  // {
  //   title: "Pricing",
  //   href: "/pricing",
  //   description: "The price of job security.",
  //   sub: ["all"],
  // },
  {
    title: "Smog",
    href: "/smog",
    description: "The dragon that ate my family.",
    sub: ["admin"],
  },
];
export const landingPageNavbarMenuLinksTheList: {
  title: string;
  href: string;
  description: string;
  isIcon?: boolean;
  sub: string[];
}[] = [
  {
    title: "The List",
    href: "/thelist",
    description: "View all current open calls & events.",
    sub: ["all"],
  },
  {
    title: "This Week",
    href: "/thisweek",
    description: "Open calls ending this week.",
    sub: ["all"],
  },
  {
    title: "World Map",
    href: "/map",
    description: "Map of all street art fests, mural projects, etc.",
    sub: ["all"],
  },
  {
    title: "Calendar",
    href: "/calendar",
    description: "View upcoming events.",
    sub: ["all"],
  },
  // {
  //   title: "The Archive",
  //   href: "/archive",
  //   description: "View all current open calls & events.",
  //   sub: ["all"],
  // },
  // {
  //   title: "Pricing",
  //   href: "/pricing",
  //   description: "The price of job security.",
  //   sub: ["all"],
  // },
  {
    title: "Smog",
    href: "/smog",
    description: "The dragon that ate my family.",
    sub: ["admin"],
  },
];

export const landingPageNavbarLinks: {
  title: string;
  href: string;
  description: string;
  icon?: JSX.Element;
  isIcon?: boolean;
  target?: string;
  sub: string[];
}[] = [
  // {
  //   title: "The List",
  //   href: "/thelist",
  //   description: "View all current open calls & events.",
  //   sub: ["active", "trialing"],
  // },
  // {
  //   title: "The Archive",
  //   href: "/archive",
  //   description: "View all current open calls & events.",
  //   sub: ["all"],
  // },
  // {
  //   title: "Map",
  //   href: "/map",
  //   description: "View all current open calls & events.",
  //   sub: ["all"],
  // },
  {
    title: "Pricing",
    href: "/pricing",
    description: "View pricing options",
    sub: ["public"],
  },
  {
    title: "Submit",
    href: "/pricing?submit",
    description: "Submit an event/open call",
    sub: ["all"],
  },
  {
    title: "Dashboard",
    href: "/dashboard",
    description: "Access your personal dashboard.",
    sub: ["active", "trialing"],
  },
  // {
  //   title: "Billing",
  //   href: "/dashboard/billing",
  //   description: "View your subscription details.",
  //   sub: ["cancelled"],
  // },

  {
    title: "Instagram",
    href: "https://instagram.com/thestreetartlist",
    description: "View the IG profile",
    icon: <FaInstagram className="h-5 w-5" />,
    isIcon: true,
    sub: ["all"],
  },
];

export const theListNavbarMenuLinks: {
  title: string;
  href: string;
  description: string;
  isIcon?: boolean;
  sub: string[];
}[] = [
  {
    title: "The List",
    href: "/thelist",
    description: "View all current open calls & events",
    sub: ["all"],
  },
  {
    title: "This Week",
    href: "/thisweek",
    description: "Open calls ending this week",
    sub: ["all"],
  },
  {
    title: "Archive",
    href: "/thelist/archive",
    description: "Archive of all events - past and current",
    sub: ["all"],
  },
  {
    title: "World Map",
    href: "/map",
    description: "Map of all street art fests, mural projects, etc",
    sub: ["all"],
  },
  {
    title: "Calendar",
    href: "/calendar",
    description: "View upcoming events",
    sub: ["all"],
  },
  {
    title: "Newsletter Archive",
    href: "/newsletter",
    description: "Archive of past newsletters",
    sub: ["all"],
  },
];
