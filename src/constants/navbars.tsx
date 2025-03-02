import { JSX } from "react"
import { FaInstagram } from "react-icons/fa"

export const landingPageNavbarMenuLinks: {
  title: string
  href: string
  description: string
  isIcon?: boolean
  sub: string[]
}[] = [
  {
    title: "The List",
    href: "/thelist",
    description: "View all current open calls & events.",
    sub: ["active", "trialing"],
  },
  {
    title: "Dashboard",
    href: "/dashboard",
    description: "Access your personal dashboard.",
    sub: ["active", "trialing"],
  },
  {
    title: "Changelog",
    href: "/changelog",
    description: "Read my interesting changelog posts.",
    sub: ["all"],
  },
  {
    title: "Pricing",
    href: "/pricing",
    description: "The price of job security.",
    sub: ["all"],
  },
  {
    title: "Smog",
    href: "/smog",
    description: "The dragon that ate my family.",
    sub: ["admin"],
  },
]

export const landingPageNavbarLinks: {
  title: string
  href: string
  description: string
  icon?: JSX.Element
  isIcon?: boolean
  target?: string
  sub: string[]
}[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    description: "Access your personal dashboard.",
    sub: ["active", "trialing"],
  },
  {
    title: "The List",
    href: "/thelist",
    description: "View all current open calls & events.",
    sub: ["active", "trialing"],
  },
  {
    title: "The Archive",
    href: "/archive",
    description: "View all current open calls & events.",
    sub: ["all"],
  },
  // {
  //   title: "Map",
  //   href: "/map",
  //   description: "View all current open calls & events.",
  //   sub: ["all"],
  // },
  {
    title: "Pricing",
    href: "/pricing",
    description: "View them prices.",
    sub: ["all"],
  },
  {
    title: "Billing",
    href: "/dashboard/billing",
    description: "View your subscription details.",
    sub: ["cancelled"],
  },

  {
    title: "Instagram",
    href: "https://instagram.com/thestreetartlist",
    description: "View the IG profile",
    icon: <FaInstagram className='h-5 w-5' />,
    isIcon: true,
    sub: ["all"],
  },
]
