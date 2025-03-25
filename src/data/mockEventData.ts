import { EventData } from "@/types/event"

export const mockEventData: EventData[] = [
  {
    status: null,
    bookmarked: true,
    hidden: false,
    //User values ^

    id: 1,
    logo: "/1.jpg",
    openCall: "active",
    appFee: 0,
    callFormat: "RFQ",
    callType: "Fixed",
    eventType: "gjm",
    eventCategory: "event",
    location: {
      locale: null,
      city: "New York",
      state: "New York",
      stateAbbr: "NY",
      region: null,
      country: "United States",
      countryAbbr: "USA",
      continent: "North America",
    },
    dates: {
      eventStart: "2025-07-10T10:00:00Z",
      eventEnd: "2025-08-10T23:59:59Z",
      //   eventStart: "Spring 2025",
      //   eventStart: null,
      //   eventEnd: "Summer 2025",
      ocStart: "2025-05-15T23:59:59Z",
      ocEnd: "2025-05-15T23:59:59Z",
      timezone: "America/Chicago",
    },

    eligibilityType: "International",
    eligibility: "International (all)",
    eligibilityDetails: null,
    budgetMin: 15000,
    budgetMax: 20000,
    currency: "USD",
    budgetRate: 50,
    budgetRateUnit: "ft²",
    allInclusive: false,

    event: {
      name: "Mural Arts Festival",
    },
    tabs: {
      opencall: {
        compensation: {
          designFee: null,
          accommodation: "Covered at select hotels",
          food: "$40/day stipend",
          travelCosts: "Up to $800",
          materials: null,
          equipment: "Lift/scaffolding included",
          other:
            "Artist networking events and panel discussions. Yada yada. Things that will be offered and things that will be desired.",
        },
        requirements: [
          "Must submit portfolio with 5-10 works",
          "Minimum 3 years of mural experience",
          "Artist statement",
          "Proposal for the mural concept",
          "Signed liability waiver",
          "Minimum 3 years of mural experience",
          "Artist statement",
          "Proposal for the mural concept",
          "Signed liability waiver",
        ],
        requirementsMore: [
          "Applications must be submitted by March 31st at 11:59pm CET.",
          "Any late applications will not be considered.",
        ],
        requirementDestination: "info@thestreetartlist.com",
        documents: [
          {
            title: "Mural Project RFQ PDF",
            href: "https://thestreetartlist.com/assets/images/mural-application-form.pdf",
          },
          {
            title: "Mural Application Form",
            href: "https://thestreetartlist.com/assets/images/mural-application-form.pdf",
          },
        ],
        otherInfo: [
          "Only one application per artist",
          "Artist teams should only submit one application",
          "Painting may be moved to a later date if the artist is unable to paint on the day of the event or if the weather is not suitable for painting",
        ],
      },
      event: {
        location: {
          latitude: 80.7127837,
          longitude: -24.0059413,

          directions: "See directions on Google Maps",
        },
        about:
          "The Mural Arts Festival is a large-scale public mural event featuring renowned international street artists. The festival spans multiple locations and includes live painting, workshops, and panel discussions.",
        links: [
          {
            type: "website",
            title: "Official Website",
            href: "www.muralartsfestival.com",
          },
          {
            type: "instagram",
            title: "Instagram Page",
            handle: "@muralartsfestival",
            href: "https://www.instagram.com/muralartsfestival",
          },
          {
            type: "email",
            title: "Event Email",
            href: "info@muralartsfestival.com",
          },
        ],
      },
      organizer: {
        id: 3,
        name: "Urban Arts Collective",
        logo: "/sitelogo.svg",
        location: {
          locale: null,
          city: "New York",
          state: "New York",
          stateAbbr: "NY",
          region: null,
          country: "United States",
          countryAbbr: "USA",
          continent: "North America",
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
        },
      },
    },
  },
  {
    status: "accepted",
    bookmarked: true,
    hidden: true,
    //User values ^

    id: 1,
    logo: "/1.jpg",
    openCall: "coming-soon",
    appFee: 0,
    callFormat: "RFQ",
    callType: "Fixed",
    eventType: "gjm",
    eventCategory: "event",
    location: {
      locale: null,
      city: "New York",
      state: "New York",
      stateAbbr: "NY",
      region: null,
      country: "United States",
      countryAbbr: "USA",
      continent: "North America",
    },
    dates: {
      eventStart: "2025-03-10T10:00:00Z",
      eventEnd: "2025-03-10T23:59:59Z",
      //   eventStart: "Spring 2025",
      //   eventStart: null,
      //   eventEnd: "Summer 2025",
      ocStart: "2025-05-15T23:59:59Z",
      ocEnd: "2025-05-15T23:59:59Z",
      timezone: "America/Chicago",
    },

    eligibilityType: "International",
    eligibility: "International (all)",
    eligibilityDetails: null,
    budgetMin: 15000,
    budgetMax: 20000,
    currency: "USD",
    budgetRate: 50,
    budgetRateUnit: "ft²",
    allInclusive: false,

    event: {
      name: "Nural Arts Festival",
    },
    tabs: {
      opencall: {
        compensation: {
          designFee: null,
          accommodation: "Covered at select hotels",
          food: "$40/day stipend",
          travelCosts: "Up to $800",
          materials: null,
          equipment: "Lift/scaffolding included",
          other:
            "Artist networking events and panel discussions. Yada yada. Things that will be offered and things that will be desired.",
        },
        requirements: [
          "Must submit portfolio with 5-10 works",
          "Minimum 3 years of mural experience",
          "Artist statement",
          "Proposal for the mural concept",
          "Signed liability waiver",
          "Minimum 3 years of mural experience",
          "Artist statement",
          "Proposal for the mural concept",
          "Signed liability waiver",
        ],
        requirementsMore: [
          "Applications must be submitted by March 31st at 11:59pm CET.",
          "Any late applications will not be considered.",
        ],
        requirementDestination: "info@thestreetartlist.com",
        documents: [
          {
            title: "Mural Project RFQ PDF",
            href: "https://thestreetartlist.com/assets/images/mural-application-form.pdf",
          },
          {
            title: "Mural Application Form",
            href: "https://thestreetartlist.com/assets/images/mural-application-form.pdf",
          },
        ],
      },
      event: {
        location: {
          latitude: 40.7127837,
          longitude: -74.0059413,
          directions: "See directions on Google Maps",
        },
        about:
          "The Mural Arts Festival is a large-scale public mural event featuring renowned international street artists. The festival spans multiple locations and includes live painting, workshops, and panel discussions.",
        links: [
          {
            type: "website",
            title: "Official Website",
            href: "https://www.muralartsfestival.com",
          },
          {
            type: "instagram",
            title: "Instagram Page",
            handle: "@muralartsfestival",
            href: "https://www.instagram.com/muralartsfestival",
          },
          {
            type: "email",
            title: "Contact Organizer",
            href: "info@muralartsfestival.com",
          },
        ],
      },
      organizer: {
        id: 2,
        name: "Urban Arts Collective",
        logo: "/sitelogo.svg",
        location: {
          locale: null,
          city: "New York",
          state: "New York",
          stateAbbr: "NY",
          region: null,
          country: "United States",
          countryAbbr: "USA",
          continent: "North America",
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
      },
    },
  },
  {
    status: "pending",
    bookmarked: false,
    hidden: false,
    id: 2,
    logo: "/1.jpg",
    openCall: "active",
    appFee: 25,
    callFormat: "RFP",
    callType: "Rolling",
    eventType: null,
    eventCategory: "residency",
    adminNote: "Watch out for the banana throwing sharks",
    location: {
      locale: "Neukolln",
      city: "Berlin",
      state: null,
      stateAbbr: null,
      region: null,
      country: "Germany",
      countryAbbr: "DE",
      continent: "Europe",
    },
    dates: {
      eventStart: "2025-09-01T09:00:00Z",
      eventEnd: "2026-09-15T18:00:00Z",
      ocStart: "2025-06-01T00:00:00Z",
      ocEnd: "2025-09-01T23:59:59Z",
      timezone: "Europe/Berlin",
    },
    eligibilityType: "National",
    eligibility: "German",
    eligibilityDetails:
      "Must reside in Germany for the duration of the project",
    budgetMin: 10000,
    budgetMax: null,
    currency: "EUR",
    budgetRate: 60,
    budgetRateUnit: "m²",
    allInclusive: true,
    event: {
      name: "Urban Walls Residency",
    },
    tabs: {
      opencall: {
        compensation: {
          designFee: 1500,
          accommodation: "Studio housing provided",
          food: null,
          travelCosts: "Reimbursed up to €300",
          materials: "Provided",
          equipment: null,
          other: null,
        },
        requirements: [
          "Resume",
          "Portfolio with at least 8 works",
          "Project proposal",
          "Reference letter",
        ],
        requirementsMore: [
          "Interviews may be conducted for shortlisted applicants",
        ],
        requirementDestination: "residency@urbanwalls.de",
        documents: [
          {
            title: "Residency Info Pack",
            href: "https://example.com/residency-info.pdf",
          },
        ],
        otherInfo: ["Residency includes optional workshops and artist talks"],
      },
      event: {
        location: {
          latitude: 48.7127837,
          longitude: -7.0059413,
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
      organizer: {
        id: 1,
        name: "Berlin Mural Initiative",
        logo: "/sitelogo.svg",
        location: {
          locale: "Neukolln",
          city: "Berlin",
          state: null,
          stateAbbr: null,
          region: null,
          country: "Germany",
          countryAbbr: "DE",
          continent: "Europe",
        },
        about:
          "Supporting street art throughout Germany through residencies and public art funding.",
        contact: {
          organizer: "Max Müller",
          primaryContact: {
            email: "max.mueller@bmi.de",
          },
        },
        links: {
          website: "https://www.bmi.de",
          instagram: "https://www.instagram.com/bmi.de",
          facebook: "https://www.facebook.com/bmi.de",
          threads: "https://www.threads.net/group/bmi.de",
          email: "info@bmi.de",
          vk: "https://vk.com/bmi.de",
          phone: "+49 30 200 50 00",
          address: "Neukollnstraße 1, 10117 Berlin",
        },
      },
    },
  },
]
