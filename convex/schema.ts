import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Define a price object structure that matches your data
const stripePriceValidator = v.object({
  amount: v.number(),
  stripeId: v.string(),
});

// Define a prices object structure for a specific interval
const stripeIntervalPricesValidator = v.object({
  usd: stripePriceValidator,
});

const customUserSchema = {
  // Include Convex Auth fields you want to use
  name: v.optional(v.string()),
  email: v.string(),
  emailVerificationTime: v.optional(v.number()),

  // Your custom fields
  createdAt: v.number(),
  updatedAt: v.optional(v.number()),
  password: v.string(),
  passwordChangedBy: v.optional(v.string()),
  firstName: v.string(),
  lastName: v.string(),
  accountType: v.array(v.string()),
  source: v.optional(v.string()),
  userId: v.string(),
  role: v.array(v.string()),
  subscription: v.optional(v.string()),
  tokenIdentifier: v.string(),
  image: v.optional(v.string()),
  emailVerified: v.optional(v.boolean()),
};

const userLogSchema = {
  userId: v.string(),
  firstName: v.string(),
  lastName: v.string(),
  active: v.boolean(),
  hadTrial: v.union(v.boolean(), v.null()),
  banned: v.boolean(),

  bannedReason: v.optional(v.string()),
  bannedTimestamp: v.optional(v.number()),
  banningAuthority: v.optional(v.string()),
  deleted: v.boolean(),
  deletedReason: v.optional(v.string()),
  deletedTimestamp: v.optional(v.number()),
  deletedBy: v.optional(v.string()),
  accountTypes: v.array(v.string()),
  userEmail: v.string(),
};

const artistSchema = {
  artistId: v.id("users"),
  artistName: v.optional(v.string()),
  artistNationality: v.optional(v.array(v.string())),
  artistResidency: v.object({
    full: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    stateAbbr: v.optional(v.string()),
    country: v.optional(v.string()),
    countryAbbr: v.optional(v.string()),
    location: v.optional(v.array(v.number())),
    timezone: v.optional(v.string()),
    timezoneOffset: v.optional(v.number()),
  }),

  documents: v.optional(
    v.object({
      cv: v.optional(v.string()),
      resume: v.optional(v.string()),
      artistStatement: v.optional(v.string()),
      images: v.optional(v.array(v.string())),
    }),
  ),

  updatedAt: v.optional(v.number()),
  lastUpdatedBy: v.optional(v.string()),
  completedProfile: v.boolean(),
};

const listActionsSchema = {
  eventId: v.id("events"),
  artistId: v.id("users"),
  hidden: v.optional(v.boolean()),
  bookmarked: v.optional(v.boolean()),
};

const organizationSchema = {
  isPlaceholderName: v.optional(v.boolean()),
  ownerId: v.id("users"),
  // organizationName: v.optional(v.string()),
  name: v.string(),
  slug: v.string(), //todo: use slugs
  // events: v.optional(v.array(v.id("events"))),
  events: v.array(v.id("events")),
  logo: v.string(), //will default to /1.jpg as always
  location: v.optional(
    v.object({
      full: v.optional(v.string()),
      locale: v.optional(v.string()),
      city: v.optional(v.string()),
      state: v.optional(v.string()),
      stateAbbr: v.optional(v.string()),
      region: v.optional(v.string()),
      country: v.string(),
      countryAbbr: v.string(),
      continent: v.string(),
      coordinates: v.optional(
        v.object({
          latitude: v.number(),
          longitude: v.number(),
        }),
      ),
      currency: v.optional(
        v.object({
          code: v.string(),
          name: v.string(),
          symbol: v.string(),
        }),
      ),
      demonym: v.optional(v.string()),
      timezone: v.optional(v.string()),
      timezoneOffset: v.optional(v.number()),
    }),
  ),
  about: v.optional(v.string()),
  contact: v.optional(
    v.object({
      organizer: v.optional(v.string()),
      primaryContact: v.object({
        email: v.optional(v.string()),
        phone: v.optional(v.string()),
        href: v.optional(v.string()),
        social: v.optional(v.string()),
      }),
    }),
  ),
  links: v.optional(
    v.object({
      website: v.optional(v.string()),
      instagram: v.optional(v.string()),
      facebook: v.optional(v.string()),
      threads: v.optional(v.string()),
      email: v.optional(v.string()),
      vk: v.optional(v.string()),
      phone: v.optional(v.string()),
      address: v.optional(v.string()),
      linkAggregate: v.optional(v.string()),
      other: v.optional(v.string()),
    }),
  ),
  hadFreeCall: v.boolean(),
  updatedAt: v.optional(v.number()),

  lastUpdatedBy: v.optional(v.string()),
  // events: v.array(v.id("events")),
  // TODO: Link organization to events and from events to open calls
};

//TODO: Make another table that joins the events and open calls. Will act as a quick lookup for totals.

const eventSchema = {
  adminNote: v.optional(v.string()),
  organizerId: v.array(v.id("organizations")),
  mainOrgId: v.id("organizations"),
  slug: v.string(),
  // mainOrgName: v.optional(v.string()),
  // mainOrgName: v.string(),
  // eventId: v.optional(v.string()),
  // openCallId: v.optional(
  //   v.union(v.array(v.id("openCalls")), v.id("openCalls")),
  // ),
  name: v.string(),
  logo: v.string(),
  type: v.array(v.string()),
  category: v.string(),

  dates: v.object({
    edition: v.number(),
    eventDates: v.array(
      v.object({
        start: v.string(),
        end: v.string(),
      }),
    ),
    eventStart: v.optional(v.string()),
    eventEnd: v.optional(v.string()),
    prodDates: v.optional(
      v.array(
        v.object({
          start: v.string(),
          end: v.string(),
        }),
      ),
    ),
    ongoing: v.boolean(), //TODO: remove this as eventFormat already handles this
    eventFormat: v.optional(v.string()),
    prodFormat: v.optional(v.string()),
  }),
  location: v.object({
    sameAsOrganizer: v.optional(v.boolean()),
    full: v.optional(v.string()),
    locale: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    stateAbbr: v.optional(v.string()),
    region: v.optional(v.string()),
    country: v.string(),
    countryAbbr: v.string(),
    continent: v.optional(v.string()),
    coordinates: v.optional(
      v.object({
        latitude: v.number(),
        longitude: v.number(),
      }),
    ),
    currency: v.optional(
      v.object({
        code: v.string(),
        name: v.string(),
        symbol: v.string(),
      }),
    ),
    demonym: v.optional(v.string()),
    timezone: v.optional(v.string()),
    timezoneOffset: v.optional(v.number()),
  }),
  about: v.optional(v.string()),
  links: v.optional(
    v.object({
      sameAsOrganizer: v.optional(v.boolean()),
      website: v.optional(v.string()),
      instagram: v.optional(v.string()),
      facebook: v.optional(v.string()),
      threads: v.optional(v.string()),
      email: v.optional(v.string()),
      vk: v.optional(v.string()),
      phone: v.optional(v.string()),
      address: v.optional(v.string()),
      linkAggregate: v.optional(v.string()),
      other: v.optional(v.string()),
    }),
  ),
  otherInfo: v.array(v.string()),
  // state: v.string(), //draft, submitted, published, archived
  state: v.union(
    v.literal("draft"),
    v.literal("submitted"),
    v.literal("published"),
    v.literal("archived"),
  ),
  active: v.optional(v.boolean()),
  lastEditedAt: v.optional(v.number()),
};

const eventOrganizerSchema = {
  eventId: v.id("events"),
  organizerId: v.id("organizations"),
  isPrimary: v.boolean(),
};

//note: not sure if this is necessary as the same info is already in the openCalls table. Keeping for now. Have not actually "added" it to the db, though.
const eventOpenCallSchema = {
  eventId: v.id("events"),
  openCallId: v.id("openCalls"),
  edition: v.number(),
};
//NOTE: Make sure that once open calls end, they're READONLY and can't be edited. To ensure that any open calls are properly archived with all details.
const openCallSchema = {
  adminNoteOC: v.optional(v.string()),
  eventId: v.id("events"),
  organizerId: v.array(v.id("organizations")),
  mainOrgId: v.id("organizations"),
  basicInfo: v.object({
    appFee: v.number(),
    callFormat: v.string(),
    callType: v.string(),
    dates: v.object({
      ocStart: v.optional(v.union(v.string(), v.null())), //todo: make not optional later
      ocEnd: v.optional(v.union(v.string(), v.null())), //todo: make not optional later
      timezone: v.string(),
      edition: v.number(),
    }),
  }),
  eligibility: v.object({
    type: v.string(),
    //todo: later, add some method/additional fields that will enter in codes for country, region, etc. Maybe start small. Could be tables in the db, so they're easy to query and filter from convex. Then, use that to show user calls that they are or aren't eligible for. Could be put in as a systemic check to ensure that organizers aren't getting ineligible applicants.
    whom: v.array(v.string()),
    details: v.optional(v.string()),
  }),
  compensation: v.object({
    budget: v.object({
      min: v.number(),
      max: v.optional(v.number()),
      rate: v.number(),
      unit: v.string(),
      currency: v.string(),
      allInclusive: v.boolean(),
      moreInfo: v.optional(v.string()), //ensure that this has a 500 char limit to avoid the crazies. Also, no rich text formatting. Just plain text. or? very limited to allow line breaks, but that's it?
    }),
    categories: v.object({
      designFee: v.optional(v.string()),
      accommodation: v.optional(v.string()),
      food: v.optional(v.string()),
      travelCosts: v.optional(v.string()),
      materials: v.optional(v.string()),
      equipment: v.optional(v.string()),
      other: v.optional(v.string()),
    }),
  }),

  requirements: v.object({
    requirements: v.array(v.string()),
    more: v.array(v.string()),
    destination: v.string(),
    documents: v.optional(
      v.array(
        v.object({
          title: v.string(), //do I ask for the title or just use the path? Not sure.
          href: v.string(),
        }),
      ),
    ),
    links: v.array(
      v.object({
        title: v.string(), //same here. I feel like it's valid to ask for what exactly the link is rather than relying on the title. Not sure, though.
        href: v.string(),
      }),
    ),
    applicationLink: v.string(),
    otherInfo: v.optional(v.array(v.string())), //todo: make not optional later
  }),
  // state: v.string(), //draft, submitted, published, archived
  state: v.optional(v.string()), //draft, submitted, published, archived
  lastUpdatedBy: v.optional(v.id("users")),
  lastUpdatedAt: v.optional(v.number()),
};

const openCallOrganizerSchema = {
  openCallId: v.id("openCalls"),
  organizerId: v.id("organizations"),
  isPrimary: v.boolean(),
};

const openCallJudgesSchema = {
  openCallId: v.id("openCalls"),
  judgeId: v.id("users"),
};

const applicationsSchema = {
  openCallId: v.id("openCalls"),
  artistId: v.id("users"),
  applicationTime: v.optional(v.number()),
  // applicationId: v.string(), //would just be the ._id of the application. No reason to make a separate field for this.
  applicationStatus: v.optional(
    v.union(
      v.literal("accepted"),
      v.literal("rejected"),
      v.literal("roster"),
      v.literal("shortlisted"),
      v.literal("to next step"),
      v.literal("external apply"),
      v.literal("considering"),
      v.literal("applied"),
      v.literal("pending"),
      v.null(),
    ),
  ),
  manualApplied: v.optional(v.boolean()),
};

export default defineSchema({
  ...authTables, // This includes other auth tables
  users: defineTable(customUserSchema)
    .index("email", ["email"])
    .index("by_userId", ["userId"])
    .index("by_token", ["tokenIdentifier"])
    .index("by_createdAt", ["createdAt"]),

  userLog: defineTable(userLogSchema)
    .index("by_userId", ["userId"])
    .index("by_email", ["userEmail"]),

  passwordResetLog: defineTable({
    email: v.string(),
    userId: v.string(),
    timestamp: v.number(),
    ipAddress: v.optional(v.string()),
    userAgent: v.string(),
    actionType: v.string(),
  })
    .index("email", ["email"])
    .index("userId", ["userId"]),

  deleteAccountLog: defineTable({
    email: v.string(),
    userId: v.string(),
    timestamp: v.number(),
    userAgent: v.string(),
    actionType: v.string(),
    accountCreatedAt: v.number(),
  })
    .index("email", ["email"])
    .index("userId", ["userId"]),

  // Artist Tables
  artists: defineTable(artistSchema)
    .index("by_artistId", ["artistId"])
    .index("by_artistNationality", ["artistNationality"]),

  // List Actions Tables
  listActions: defineTable(listActionsSchema)
    .index("by_eventId", ["eventId"])
    .index("by_artistId", ["artistId"]),

  // Application Tables
  applications: defineTable(applicationsSchema)
    .index("by_openCallId", ["openCallId"])
    .index("by_artistId", ["artistId"]),

  // Organization Tables
  organizations: defineTable(organizationSchema)
    .index("by_name", ["name"])
    .index("by_slug", ["slug"])
    .index("by_ownerId", ["ownerId"]),

  events: defineTable(eventSchema)
    .index("by_name", ["name"])
    .index("by_slug", ["slug"])
    .index("by_organizerId", ["organizerId"])
    .index("by_mainOrgId", ["mainOrgId"])
    // .index("by_mainOrgName", ["mainOrgName"])
    .index("by_lastEditedAt", ["lastEditedAt"])
    .index("by_mainOrgId_lastEditedAt", ["mainOrgId", "lastEditedAt"])

    // .index("by_eventId", ["event"])
    .index("by_eventType", ["type"])
    .index("by_category", ["category"])
    .index("by_state", ["state"])
    .index("by_country", ["location.countryAbbr"]),
  // .index("by_continent", ["location.continent"]), //TODO: add this back once I have the continents mapped properly

  eventOrganizers: defineTable(eventOrganizerSchema)
    .index("by_eventId", ["eventId"])
    .index("by_organizerId", ["organizerId"]),

  openCalls: defineTable(openCallSchema)
    .index("by_eventId", ["eventId"])
    .index("by_organizerId", ["organizerId"])
    .index("by_mainOrgId", ["mainOrgId"])
    .index("by_budget", ["compensation.budget.min"])
    .index("by_endDate", ["basicInfo.dates.ocEnd"])
    .index("by_state", ["state"])
    .index("by_eligibility", ["eligibility.type"]),

  openCallOrganizers: defineTable(openCallOrganizerSchema)
    .index("by_openCallId", ["openCallId"])
    .index("by_organizerId", ["organizerId"]),

  openCallJudges: defineTable(openCallJudgesSchema)
    .index("by_openCallId", ["openCallId"])
    .index("by_judgeId", ["judgeId"]),

  organizationSubscriptions: defineTable({
    organizationId: v.id("organizations"),
    userId: v.id("users"),
    stripeId: v.string(),
    currency: v.string(),
    status: v.string(),
    amountSubtotal: v.number(),
    amountTotal: v.number(),
    amountDiscount: v.number(),
    metadata: v.any(),
    customerId: v.string(),
    paidStatus: v.string(),
  })
    .index("organizationId", ["organizationId"])
    .index("userId", ["userId"])
    .index("stripeId", ["stripeId"])
    .index("customerId", ["customerId"]),

  todoKanban: defineTable({
    title: v.string(),
    column: v.union(
      v.literal("proposed"),
      v.literal("backlog"),
      v.literal("todo"),
      v.literal("doing"),
      v.literal("done"),
    ),
    order: v.number(),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    public: v.boolean(),
    lastUpdatedBy: v.string(),
    priority: v.optional(v.string()),
  })
    .index("by_column_completedAt", ["column", "completedAt"])
    .index("by_column_order", ["column", "order"]),

  userPlans: defineTable({
    key: v.string(),
    title: v.string(),
    description: v.string(),
    stripeProductId: v.optional(v.string()),
    img: v.optional(v.string()),
    prices: v.object({
      month: stripeIntervalPricesValidator,
      year: stripeIntervalPricesValidator,
    }),
    features: v.array(v.string()),
    popular: v.boolean(), // added popular column
  })
    .index("key", ["key"])
    .index("stripeProductId", ["stripeProductId"]),

  orgPlans: defineTable({
    key: v.string(),
    title: v.string(),
    description: v.string(),
    stripeProductId: v.optional(v.string()),
    prices: v.optional(
      v.object({
        rate: v.number(),
      }),
    ),
    features: v.array(v.string()),
    popular: v.optional(v.boolean()),
  })
    .index("key", ["key"])
    .index("stripeProductId", ["stripeProductId"]),

  userSubscriptions: defineTable({
    userId: v.optional(v.string()),
    stripeId: v.optional(v.string()),
    stripePriceId: v.optional(v.string()),
    currency: v.optional(v.string()),
    interval: v.optional(v.string()),
    intervalNext: v.optional(v.string()),
    status: v.optional(v.string()),
    currentPeriodStart: v.optional(v.number()),
    currentPeriodEnd: v.optional(v.number()),
    cancelAtPeriodEnd: v.optional(v.boolean()),
    hadTrial: v.optional(v.boolean()),
    amount: v.optional(v.number()),
    amountNext: v.optional(v.number()),
    startedAt: v.optional(v.number()),
    trialEndsAt: v.optional(v.number()),
    endedAt: v.optional(v.number()),
    canceledAt: v.optional(v.number()),
    customerCancellationReason: v.optional(v.string()),
    customerCancellationComment: v.optional(v.string()),
    metadata: v.optional(v.any()),
    customFieldData: v.optional(v.any()),
    customerId: v.optional(v.string()),
    lastEditedAt: v.optional(v.number()),
    paidStatus: v.optional(v.boolean()),
  })
    .index("userId", ["userId"])
    .index("stripeId", ["stripeId"])
    .index("customerId", ["customerId"]),

  stripeWebhookEvents: defineTable({
    type: v.string(),
    stripeEventId: v.string(),
    createdAt: v.string(),
    modifiedAt: v.string(),
    data: v.any(),
  })
    .index("type", ["type"])
    .index("stripeEventId", ["stripeEventId"]),

  userPreferences: defineTable({
    userId: v.id("users"),
    currency: v.optional(v.string()),
    timezone: v.optional(v.string()),
    language: v.optional(v.string()),
    theme: v.optional(v.string()),
  }).index("by_userId", ["userId"]),
});
