//List the page titles, descriptions, seo, meta tags, and other social media metadata here. Favicons as well. TBD

import { lastUpdatedPrivacyRaw } from "@/app/(public)/privacy/page";
import { lastUpdatedTermsRaw } from "@/app/(public)/terms/page";
import { formatDatePlain } from "@/lib/dateFns";

export function getPageMeta(pathname: string | null) {
  if (!pathname) return pageTitles[0];
  const cleanPath =
    pathname.endsWith("/") && pathname !== "/"
      ? pathname.slice(0, -1)
      : pathname;
  return pageTitles.find((p) => p.path === cleanPath) || pageTitles[0];
}

export const DEFAULT_IMAGES = [
  "https://thestreetartlist.com/public/saltext.png",
];
export const DEFAULT_ICON = {
  icon: "https://thestreetartlist.com/public/favicon.ico",
  shortcut: "favicon.ico",
  apple: "favicon.ico",
};

export const DEFAULT_DESCRIPTION =
  "List of street art, graffiti, & mural projects. Open calls, event calendar, and global map. Created, maintained, and shared by @anthonybrooksart";

interface PageTitles {
  path: string;
  title: string;
  externalTitle?: string;
  description: string;
  images?: string[];
  icon?: {
    icon: string;
    shortcut: string;
  };
  openGraph?: Partial<{
    title: string;
    description: string;
    url: string;
    type: OGType;
    images: string[];
  }>;
  twitter?: Partial<{
    card: TwitterCard;
    title: string;
    description: string;
    siteId?: string;
    creator?: string;
    creatorId?: string;
    images: string[];
  }>;
}

export const pageTitles: PageTitles[] = [
  {
    path: "/",
    title: "Home",
    externalTitle: "Home | The Street Art List",
    description:
      "List of street art, graffiti, & mural projects. Open calls, event calendar, and global map. Created, maintained, and shared by @anthonybrooksart",
    images: DEFAULT_IMAGES,
    openGraph: {
      url: "https://thestreetartlist.com/",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
    },
  },
  {
    path: "/terms",
    title: "Terms of Service",
    externalTitle: "Terms of Service | The Street Art List",
    description: `Terms of Service | The Street Art List - Last updated: ${formatDatePlain(lastUpdatedTermsRaw)}`,
    images: DEFAULT_IMAGES,
    openGraph: {
      url: "https://thestreetartlist.com/terms",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
    },
  },
  {
    path: "/privacy",
    title: "Privacy Policy",
    externalTitle: "Privacy Policy | The Street Art List",
    description: `Privacy Policy | The Street Art List - Last updated: ${formatDatePlain(lastUpdatedPrivacyRaw)}`,
    images: DEFAULT_IMAGES,
    openGraph: {
      url: "https://thestreetartlist.com/privacy",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
    },
  },
  {
    path: "/calendar",
    title: "Calendar",
    externalTitle: "Calendar | The Street Art List",
    description:
      "List of street art, graffiti, & mural projects. Open calls, event calendar, and global map. Created, maintained, and shared by @anthonybrooksart",
    images: DEFAULT_IMAGES,
    openGraph: {
      url: "https://thestreetartlist.com/calendar",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
    },
  },
  {
    path: "/map",
    title: "Global Map",
    externalTitle: "Global Map | The Street Art List",
    description:
      "List of street art, graffiti, & mural projects. Open calls, event calendar, and global map. Created, maintained, and shared by @anthonybrooksart",
    images: DEFAULT_IMAGES,
    openGraph: {
      url: "https://thestreetartlist.com/map",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
    },
  },
  {
    path: "/changelog",
    title: "Changelog",
    externalTitle: "Changelog | The Street Art List",
    description:
      "List of street art, graffiti, & mural projects. Open calls, event calendar, and global map. Created, maintained, and shared by @anthonybrooksart",
    images: DEFAULT_IMAGES,
    openGraph: {
      url: "https://thestreetartlist.com/changelog",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
    },
  },
  {
    path: "/pricing",
    title: "Pricing",
    externalTitle: "Pricing | The Street Art List",
    description:
      "List of street art, graffiti, & mural projects. Open calls, event calendar, and global map. Created, maintained, and shared by @anthonybrooksart",
    images: DEFAULT_IMAGES,
    openGraph: {
      url: "https://thestreetartlist.com/pricing",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
    },
  },

  {
    path: "/collabs",
    title: "Collaborations",
    externalTitle: "Collaborations | The Street Art List",
    description:
      "List of street art, graffiti, & mural projects. Open calls, event calendar, and global map. Created, maintained, and shared by @anthonybrooksart",
    images: DEFAULT_IMAGES,
    openGraph: {
      url: "https://thestreetartlist.com/collabs",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
    },
  },
  {
    path: "/contact",
    title: "Contact",
    externalTitle: "Contact | The Street Art List",
    description:
      "List of street art, graffiti, & mural projects. Open calls, event calendar, and global map. Created, maintained, and shared by @anthonybrooksart",
    images: DEFAULT_IMAGES,
    openGraph: {
      url: "https://thestreetartlist.com/contact",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
    },
  },
  {
    path: "/faq",
    title: "FAQ",
    externalTitle: "FAQ | The Street Art List",
    description:
      "Frequently asked questions about The Street Art List. Created, maintained, and shared by @anthonybrooksart",
    images: DEFAULT_IMAGES,
    openGraph: {
      url: "https://thestreetartlist.com/faq",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
    },
  },
  {
    path: "/about",
    title: "About",
    externalTitle: "About | The Street Art List",
    description:
      "About The Street Art List. Who makes it, who updates it, and why. A bit more info about the project and my aspirations. Created, maintained, and shared by @anthonybrooksart",
    images: DEFAULT_IMAGES,
    openGraph: {
      url: "https://thestreetartlist.com/about",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
    },
  },
];

export const publicPageTitles = {
  "/": "Home",
  "/terms": "Terms of Service",
  "/privacy": "Privacy Policy",
  "/calendar": "Calendar",
  "/map": "GlobalMap",
  "/changelog": "Changelog",
  "/pricing": "Pricing",
  "/collabs": "Collaborations",
  "/contact": "Contact",
};

export type OGType =
  | "website"
  | "article"
  | "book"
  | "profile"
  | "music.song"
  | "music.album"
  | "music.playlist"
  | "music.radio_station"
  | "video.movie"
  | "video.episode"
  | "video.tv_show"
  | "video.other";

export type TwitterCard = "summary_large_image" | "summary" | "player" | "app";
