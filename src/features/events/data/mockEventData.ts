import { Artist } from "@/types/artist"
import { EventData } from "@/types/event"
import { OpenCall, OpenCallApplication } from "@/types/openCall"
import { Organizer } from "@/types/organizer"

export const testEventData: EventData[] = [
  {
    adminNote: "Watch out for the banana throwing sharks",
    organizerId: ["11"],

    id: "12",
    name: "Urban Walls Residency",
    logo: "/1.jpg",
    hasActiveOpenCall: false,

    category: "residency",
    dates: {
      eventStart: "2025-09-01T09:00:00Z",
      eventEnd: "2025-09-15T18:00:00Z",
    },

    location: {
      city: "Chicago",
      country: "United States",
      continent: "North America",
      coordinates: {
        latitude: 48.7127837,
        longitude: -7.0059413,
      },
      directions: "Google Maps Link",
    },
    about:
      "The Urban Walls Residency brings together artists from across Germany to engage in mural-making, cultural exchange, and community events.",
    links: [
      {
        type: "website",
        title: "Event Page",
        href: "www.urbanwalls.de/en/residency",
      },

      {
        type: "facebook",
        title: "Facebook",
        handle: "@urbanwalls",
        href: "https://www.facebook.com/urbanwalls",
      },
      {
        type: "email",
        title: "Contact Organizer",
        href: "info@urbanwalls.de",
      },
      {
        type: "instagram",
        title: "Instagram",
        handle: "@urbanwalls",
        href: "https://www.instagram.com/urbanwalls",
      },
    ],
    otherInfo: ["Residency includes optional workshops and artist talks"],
  },
  {
    adminNote: "Watch out for the banana throwing sharks",
    organizerId: ["11"],
    id: "3",
    name: "Urban Walls Residency",
    logo: "/1.jpg",
    hasActiveOpenCall: true,
    openCallId: ["3"],
    category: "residency",
    dates: {
      eventStart: "2025-06-01T09:00:00Z",
      eventEnd: "2025-06-15T18:00:00Z",
    },

    location: {
      locale: "Hyde Park",
      city: "Chicago",
      state: "Illinois",
      stateAbbr: "IL",
      country: "United States",
      continent: "North America",
      coordinates: {
        latitude: 48.7127837,
        longitude: -7.0059413,
      },
      directions: "Google Maps Link",
    },
    about:
      "The Urban Walls Residency brings together artists from across Germany to engage in mural-making, cultural exchange, and community events.",
    links: [
      {
        type: "website",
        title: "Event Page",
        href: "www.urbanwalls.de/en/residency",
      },

      {
        type: "facebook",
        title: "Facebook",
        handle: "@urbanwalls",
        href: "https://www.facebook.com/urbanwalls",
      },
    ],
    otherInfo: ["Residency includes optional workshops and artist talks"],
  },
  {
    adminNote: "Watch out for the banana throwing sharks",
    organizerId: ["24a"],
    id: "8",
    name: "Dastardly Dallas",
    logo: "/1.jpg",
    hasActiveOpenCall: true,
    openCallId: ["14"],

    eventType: ["gjm", "mur"],
    category: "event",
    dates: {
      eventStart: "2024-09-01T09:00:00Z",
      eventEnd: "2024-09-15T18:00:00Z",
    },

    location: {
      locale: "Neukolln",
      city: "Berlin",
      country: "Germany",
      continent: "Europe",
      coordinates: {
        latitude: 48.7127837,
        longitude: -7.0059413,
      },
      directions: "Google Maps Link",
    },
    about:
      "The Urban Walls Residency brings together artists from across Germany to engage in mural-making, cultural exchange, and community events.",
    links: [
      {
        type: "website",
        title: "Event Page",
        href: "www.urbanwalls.de/en/residency",
      },

      {
        type: "facebook",
        title: "Facebook",
        handle: "@urbanwalls",
        href: "https://www.facebook.com/urbanwalls",
      },
    ],
    otherInfo: ["Residency includes optional workshops and artist talks"],
  },
  {
    adminNote: "Watch out for the banana throwing sharks",
    organizerId: ["432"],
    id: "49",
    name: "The Mural Arts Festival",
    logo: "/1.jpg",
    hasActiveOpenCall: true,
    openCallId: ["6"],
    eventType: ["mur"],
    category: "event",
    dates: {
      eventStart: "2025-04-01T09:00:00Z",
      eventEnd: "2025-03-15T18:00:00Z",
    },
    location: {
      locale: "Neukolln",
      city: "Berlin",
      country: "Germany",
      continent: "Europe",
      coordinates: {
        latitude: 48.7127837,
        longitude: -7.0059413,
      },
      directions: "Google Maps Link",
    },
    about:
      "The Urban Walls Residency brings together artists from across Germany to engage in mural-making, cultural exchange, and community events.",
    links: [
      {
        type: "website",
        title: "Event Page",
        href: "www.urbanwalls.de/en/residency",
      },

      {
        type: "facebook",
        title: "Facebook",
        handle: "@urbanwalls",
        href: "https://www.facebook.com/urbanwalls",
      },
    ],
    otherInfo: ["Residency includes optional workshops and artist talks"],
  },
  {
    adminNote: "Watch out for the banana throwing sharks",
    organizerId: ["24a"],
    id: "71",
    name: "The Mural Arts Festival",
    logo: "/1.jpg",
    hasActiveOpenCall: false,
    openCallId: ["7"],
    eventType: ["mur"],
    category: "event",
    dates: {
      eventStart: "2025-09-01T09:00:00Z",
      eventEnd: "2026-09-15T18:00:00Z",
    },

    location: {
      city: "Chicago",
      country: "United States",
      continent: "North America",
      coordinates: {
        latitude: 48.7127837,
        longitude: -7.0059413,
      },
      directions: "Google Maps Link",
    },
    about:
      "The Urban Walls Residency brings together artists from across Germany to engage in mural-making, cultural exchange, and community events.",
    links: [
      {
        type: "website",
        title: "Event Page",
        href: "www.urbanwalls.de/en/residency",
      },

      {
        type: "facebook",
        title: "Facebook",
        handle: "@urbanwalls",
        href: "https://www.facebook.com/urbanwalls",
      },
    ],
    otherInfo: ["Residency includes optional workshops and artist talks"],
  },
  {
    adminNote: "Watch out for the banana throwing sharks",
    organizerId: ["24a"],
    id: "7",
    name: "The Mural Arts Festival",
    logo: "/1.jpg",
    hasActiveOpenCall: false,
    openCallId: ["5"],
    eventType: ["mur"],
    category: "event",
    dates: {
      eventStart: "2025-09-01T09:00:00Z",
      eventEnd: "2026-09-15T18:00:00Z",
    },

    location: {
      city: "Chicago",
      country: "United States",
      continent: "North America",
      coordinates: {
        latitude: 48.7127837,
        longitude: -7.0059413,
      },
      directions: "Google Maps Link",
    },
    about:
      "The Urban Walls Residency brings together artists from across Germany to engage in mural-making, cultural exchange, and community events.",
    links: [
      {
        type: "website",
        title: "Event Page",
        href: "www.urbanwalls.de/en/residency",
      },

      {
        type: "facebook",
        title: "Facebook",
        handle: "@urbanwalls",
        href: "https://www.facebook.com/urbanwalls",
      },
    ],
    otherInfo: ["Residency includes optional workshops and artist talks"],
  },
]

export const testOpenCallData: OpenCall[] = [
  {
    adminNoteOC: "Watch out for the banana throwing sharks id 6",
    id: "6",

    eventId: "49",
    organizerId: ["432"],

    basicInfo: {
      appFee: 10,
      callFormat: "RFP",
      callType: "Rolling",
      dates: {
        ocStart: "2025-03-01T00:00:00Z",
        ocEnd: "2025-09-01T23:59:59Z",
        timezone: "Europe/Berlin",
      },
    },
    eligibility: {
      type: "International",
      whom: "International (all)",
      details: "Must reside in Germany for the duration of the project",
    },
    compensation: {
      budget: {
        min: 10000,
        max: 20000,
        rate: 0,
        unit: "m²",
        currency: "USD",
        allInclusive: false,
      },
      categories: {
        designFee: "1500",
        accommodation: "Studio housing provided",

        travelCosts: "Reimbursed up to €300",
        materials: "Provided",
      },
    },

    requirements: {
      requirements: [
        "Resume",
        "Portfolio with at least 8 works",
        "Project proposal",
        "Reference letter",
      ],
      more: ["Interviews may be conducted for shortlisted applicants"],
      destination: "residency@urbanwalls.de",
      documents: [
        {
          title: "Residency Info Pack",
          href: "https://example.com/residency-info.pdf",
        },
      ],
    },
  },
  {
    adminNoteOC: "Watch out for the banana throwing sharks id 5",
    id: "5",

    eventId: "3",
    organizerId: ["11"],
    basicInfo: {
      appFee: 0,
      callFormat: "RFP",
      callType: "Rolling",
      dates: {
        ocStart: "2025-03-01T00:00:00Z",
        ocEnd: "2025-04-01T23:59:59Z",
        timezone: "Europe/Berlin",
      },
    },
    eligibility: {
      type: "National",
      whom: "German",
      details: "Must reside in Germany for the duration of the project",
    },
    compensation: {
      budget: {
        min: 10000,

        rate: 60,
        unit: "m²",
        currency: "EUR",
        allInclusive: true,
      },
      categories: {},
    },
    requirements: {
      requirements: [
        "Resume",
        "Portfolio with at least 8 works",
        "Project proposal",
        "Reference letter",
      ],
      more: ["Interviews may be conducted for shortlisted applicants"],
      destination: "residency@urbanwalls.de",
      documents: [
        {
          title: "Residency Info Pack",
          href: "https://example.com/residency-info.pdf",
        },
      ],
    },
  },
  {
    adminNoteOC: "Watch out for the banana throwing sharks id 5",
    id: "14",

    eventId: "8",
    organizerId: ["24a"],
    basicInfo: {
      appFee: 0,
      callFormat: "RFQ",
      callType: "Fixed",
      dates: {
        ocStart: "2024-06-01T00:00:00Z",
        ocEnd: "2024-09-01T23:59:59Z",
        timezone: "Europe/Berlin",
      },
    },
    eligibility: {
      type: "National",
      whom: "German",
      details: "Must reside in Germany for the duration of the project",
    },
    compensation: {
      budget: {
        min: 10000,
        max: 30000,

        rate: 60,
        unit: "m²",
        currency: "EUR",
        allInclusive: false,
      },
      categories: {
        designFee: "1500",
        accommodation: "Studio housing provided",
        materials: "Provided",
      },
    },
    requirements: {
      requirements: [
        "Resume",
        "Portfolio with at least 8 works",
        "Project proposal",
        "Reference letter",
      ],
      more: ["Interviews may be conducted for shortlisted applicants"],
      destination: "residency@urbanwalls.de",
      documents: [
        {
          title: "Residency Info Pack",
          href: "https://example.com/residency-info.pdf",
        },
      ],
    },
  },
]

export const testOrganizerData: Organizer[] = [
  {
    id: "11",
    name: "Urban Arts Collective",
    logo: "/sitelogo.svg",
    location: {
      locale: "Neukolln",
      city: "Berlin",

      country: "Germany",

      continent: "Europe",
    },
    about:
      "Urban Arts Collective is a nonprofit organization dedicated to supporting street artists and fostering public art initiatives around the world.",
    contact: {
      organizer: "Lillith Lathardly",
      primaryContact: {
        email: "lilly.the.lizard@urbanartscollective.org",
      },
    },
    links: {
      website: "https://www.urbanartscollective.org",
      email: "info@urbanartscollective.org",
      phone: "+1 (202) 555-0100",
      instagram: "https://www.instagram.com/urbanartscollective",
    },
    events: ["3asdfa", "333da"],
  },
  {
    id: "24a",
    name: "The Mural Arts Festival",
    logo: "/1.jpg",
    location: {
      locale: "Neukolln",
      city: "Berlin",
      country: "Germany",
      continent: "Europe",
    },
    about:
      "The Urban Walls Residency brings together artists from across Germany to engage in mural-making, cultural exchange, and community events.",
    contact: {
      organizer: "Lillith Lathardly",
      primaryContact: {
        email: "lilly.the.lizard@urbanartscollective.org",
      },
    },
    links: {
      website: "https://www.urbanartscollective.org",
      email: "info@urbanartscollective.org",
      phone: "+1 (202) 555-0100",
      instagram: "https://www.instagram.com/urbanartscollective",
    },
    events: ["3asdfa", "333da"],
  },
  {
    id: "432",
    name: "The Mural Arts Festival",
    logo: "/1.jpg",
    location: {
      locale: "Neukolln",
      city: "Berlin",
      country: "Germany",
      continent: "Europe",
    },
    about:
      "The Urban Walls Residency brings together artists from across Germany to engage in mural-making, cultural exchange, and community events.",
    contact: {
      organizer: "Lillith Lathardly",
      primaryContact: {
        email: "lilly.the.lizard@urbanartscollective.org",
      },
    },
    links: {
      website: "https://www.urbanartscollective.org",
      email: "info@urbanartscollective.org",
      phone: "+1 (202) 555-0100",
      instagram: "https://www.instagram.com/urbanartscollective",
    },
    events: ["3asdfa", "333da"],
  },
  {
    id: "5",
    name: "The Mural Arts Festival",
    logo: "/1.jpg",
    location: {
      locale: "Neukolln",
      city: "Berlin",
      country: "Germany",
      continent: "Europe",
    },
    about:
      "The Urban Walls Residency brings together artists from across Germany to engage in mural-making, cultural exchange, and community events.",
    contact: {
      organizer: "Lillith Lathardly",
      primaryContact: {
        email: "lilly.the.lizard@urbanartscollective.org",
      },
    },
    links: {
      website: "https://www.urbanartscollective.org",
      email: "info@urbanartscollective.org",
      phone: "+1 (202) 555-0100",
      instagram: "https://www.instagram.com/urbanartscollective",
    },
    events: ["3asdfa", "333da"],
  },
]

export const testArtistData: Artist = {
  id: "1",
  name: "Lazarus Lickingham XII",
  nationality: ["USA"],
  residency: {
    full: "New York",
    city: "New York",
    state: "New York",
    region: "New York",
    country: "United States",
    location: {
      latitude: 40.7127837,
      longitude: -74.0059413,
    },
  },
  documents: {
    cv: "https://thestreetartlist.com/assets/images/lazarus-cv.pdf",
    resume: "https://thestreetartlist.com/assets/images/lazarus-resume.pdf",
    artistStatement:
      "https://thestreetartlist.com/assets/images/lazarus-artist-statement.pdf",
    images: [
      "https://thestreetartlist.com/assets/images/lazarus-1.jpg",
      "https://thestreetartlist.com/assets/images/lazarus-2.jpg",
      "https://thestreetartlist.com/assets/images/lazarus-3.jpg",
    ],
  },
  applications: [
    {
      eventName: "The Mural Arts Festivals",
      applicationId: "1",
      applicationStatus: "rejected",
    },
    {
      eventName: "The Mural Arts Festivalila",
      applicationId: "2",
      applicationStatus: "accepted",
    },
    {
      eventName: "The Mural Arts Festivalaa",
      applicationId: "3",
      applicationStatus: "considering",
    },
  ],
  listActions: [
    {
      eventId: "1",
      hidden: false,
      bookmarked: true,
    },
    {
      eventId: "2",
      hidden: false,
      bookmarked: false,
    },
    {
      eventId: "3",
      hidden: false,
      bookmarked: true,
    },
  ],
}

export const testApplicationsData: OpenCallApplication[] = [
  {
    openCallId: "6",
    artistId: "1",
    applicationId: "1a",
    applicationStatus: "rejected",
  },
  {
    openCallId: "5",
    artistId: "1",
    applicationId: "1ab",
    applicationStatus: "accepted",
  },
  {
    openCallId: "14",
    artistId: "1",
    applicationId: "1abc",
    applicationStatus: "pending",
  },
  {
    openCallId: "14",
    artistId: "1",
    applicationId: "2",
    applicationStatus: "rejected",
  },
  {
    openCallId: "6",
    artistId: "1",
    applicationId: "3",
    applicationStatus: "accepted",
  },
  {
    openCallId: "5",
    artistId: "3",
    applicationId: "3",
    applicationStatus: "considering",
  },
]
