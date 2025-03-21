import { EventData } from "@/types/event"

export const mockEventData: EventData[] = [
  {
    status: "accepted",
    bookmarked: true,
    hidden: false,
    //User values ^

    id: 1,
    logo: "/1.jpg",
    openCall: true,
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
      location: "New York, NY, USA",
      dates: "July 10-20, 2025",
      category: "Festival",
      type: "Public Mural Showcase",
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
          map: "https://example.com/map1.png",
          directions: "See directions on Google Maps",
        },
        about:
          "The Mural Arts Festival is a large-scale public mural event featuring renowned international street artists. The festival spans multiple locations and includes live painting, workshops, and panel discussions.",
        links: ["Official Website", "Instagram Page", "Contact Organizer"],
      },
      organizer: {
        name: "Urban Arts Collective",
        location: "New York, NY, USA",
        about:
          "Urban Arts Collective is a nonprofit organization dedicated to supporting street artists and fostering public art initiatives around the world.",
        contact: {
          organizer: "Jane Doe",
          email: "jane.doe@urbanartscollective.org",
        },
        links: [
          "Website",
          "Email",
          "Phone",
          "Instagram",
          "Facebook",
          "Threads",
        ],
      },
    },
  },
  {
    status: "pending",
    bookmarked: false,
    hidden: false,
    id: 2,
    logo: "/1.jpg",
    openCall: true,
    appFee: 25,
    callFormat: "RFP",
    callType: "Rolling",
    eventType: ["mur", "pup"],
    eventCategory: "residency",
    location: {
      locale: "Arts Center",
      city: "Berlin",
      state: "Berlin",
      stateAbbr: "BE",
      country: "Germany",
      countryAbbr: "DE",
      continent: "Europe",
    },
    dates: {
      eventStart: "2025-09-01T09:00:00Z",
      eventEnd: "2025-10-15T18:00:00Z",
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
      location: "Berlin, BE, DE",
      dates: "Sep 1 - Oct 15, 2025",
      category: "Residency",
      type: "Community Public Art",
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
          map: "https://example.com/map-berlin.png",
          directions: "Google Maps Link",
        },
        about:
          "The Urban Walls Residency brings together artists from across Germany to engage in mural-making, cultural exchange, and community events.",
        links: ["Event Page", "Apply Here"],
      },
      organizer: {
        name: "Berlin Mural Initiative",
        location: "Berlin, Germany",
        about:
          "Supporting street art throughout Germany through residencies and public art funding.",
        contact: {
          organizer: "Max Müller",
          email: "max.mueller@bmi.de",
        },
        links: ["Website", "Instagram", "Contact"],
      },
    },
  },
]
