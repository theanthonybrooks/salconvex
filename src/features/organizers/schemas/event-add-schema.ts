import { cleanHtml } from "@/lib/richTextFns";
import {
  domainRegex,
  isValidFacebook,
  isValidInstagram,
  isValidPhone,
  isValidThreads,
  isValidVK,
  toMutableEnum,
} from "@/lib/zodFns";
import {
  eventCategoryValues,
  eventFormatValues,
  eventStates,
  eventTypeValues,
  prodFormatValues,
} from "@/types/event";
import { callTypeValues, validOCVals } from "@/types/openCall";
import { z } from "zod";

const locationBase = z.object({
  full: z.string().min(3, "Location is required"),
  locale: z.optional(z.string()),
  city: z.optional(z.string()),
  state: z.optional(z.string()),
  stateAbbr: z.optional(z.string()),
  region: z.optional(z.string()),
  country: z.string(), // base check moved to superRefine
  countryAbbr: z.string(),
  continent: z.optional(z.string()),
  coordinates: z.optional(
    z.object({
      latitude: z.number(),
      longitude: z.number(),
    }),
  ),
  timezone: z.optional(z.string()),
  timezoneOffset: z.optional(z.number()),
  currency: z.optional(
    z.object({
      code: z.string(),
      name: z.string(),
      symbol: z.string(),
      format: z.optional(z.string()),
    }),
  ),
  demonym: z.optional(z.string()),
});

const locationSchema = locationBase.superRefine((data, ctx) => {
  if ((data.city || data.state) && !data.country) {
    ctx.addIssue({
      code: "custom",
      message: "Country is required - please select from the dropdown",
      path: ["country"],
    });
  } else if (!data.country || data.country.trim().length < 3) {
    ctx.addIssue({
      code: "custom",
      message: "Please select from the dropdown",
      path: ["country"],
    });
  }
});

export const strictUrl = z
  .string()
  .min(8, "URL is too short")
  .refine(
    (val) =>
      /^https?:\/\/[a-zA-Z0-9.-]+\.[a-z]{2,}([\/\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/i.test(
        val,
      ),
    {
      message: "Must be a valid website URL (e.g. https://example.com)",
    },
  );

// const isValidUrl = (value: string) =>
//   /^https?:\/\/(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/i.test(value);
// const isValidUrl = (value: string) =>
//   /^(https?:\/\/)(?!.*\.\.)(?!.*--)(?!.*\.$)(?!.*-$)(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(\/[a-zA-Z0-9._~!$&'()*+,;=:@%-]*)?$/i.test(
//     value,
//   );

// const isValidUrl = (value: string) => {
//   try {
//     const url = new URL(value);
//     return ["http:", "https:"].includes(url.protocol);
//   } catch {
//     return false;
//   }
// };

// const isValidUrlWithMailto = (value: string) => {
//   try {
//     const url = new URL(value);
//     return ["http:", "https:", "mailto:"].includes(url.protocol);
//   } catch {
//     return false;
//   }
// };

const linksSchemaLoose = z.object({
  sameAsOrganizer: z.boolean().optional(),
  website: z
    .url({
      protocol: /^https?$/,
      hostname: z.regexes.domain,
      error: "Must be a valid URL (https://example.com)",
    })
    .optional(),
  email: z.email().optional(),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  threads: z.string().optional(),
  vk: z.string().optional(),
  phone: z.string().optional(),
  phoneExt: z.string().optional(),
  linkAggregate: z.string().optional(),
  linkedIn: z.string().optional(),
  other: z
    .url({
      protocol: /^https?$/,
      hostname: z.regexes.domain,
      error: "Must be a valid URL (https://example.com)",
    })
    .optional(),
});

const linksSchemaStrict = z.object({
  sameAsOrganizer: z.boolean().optional(),

  website: z
    .url({
      protocol: /^https?$/,
      hostname: z.regexes.domain,
      error: "Must be a valid URL (https://example.com)",
    })
    .optional(),
  email: z.email("Must be a valid email address").optional(),

  instagram: z
    .string()
    .optional()
    .refine((val) => !val || isValidInstagram(val), {
      message: "Must be a valid Instagram handle (letters, numbers, . or _)",
    }),

  facebook: z
    .string()
    .optional()
    .refine((val) => !val || isValidFacebook(val), {
      message:
        "Must be a valid Facebook handle or page name (min 5 characters)",
    }),

  threads: z
    .string()
    .optional()
    .refine((val) => !val || isValidThreads(val), {
      message: "Must be a valid Threads handle",
    }),

  vk: z
    .string()
    .optional()
    .refine((val) => !val || isValidVK(val), {
      message: "Must be a valid VK profile URL (https://vk.com/...)",
    }),

  phone: z
    .string()
    .optional()
    .refine((val) => !val || isValidPhone(val), {
      message: "Must be a valid phone number",
    }),

  phoneExt: z.string().optional(),

  linkAggregate: z
    .url({
      protocol: /^https?$/,
      hostname: z.regexes.domain,
      error: "Must be a valid URL (https://example.com)",
    })
    .optional(),
  linkedIn: z
    .url({
      protocol: /^https?$/,
      hostname: z.regexes.domain,
      error: "Must be a valid URL (https://example.com)",
    })
    .optional(),

  other: z
    .url({
      protocol: /^https?$/,
      hostname: z.regexes.domain,
      error: "Must be a valid URL (https://example.com)",
    })
    .optional(),
});

const contactSchema = z.object({
  organizer: z.optional(z.string()),
  organizerTitle: z.optional(z.string()),
  primaryContact: z.string().min(3, "Primary Contact is required"),
});

const organizationSchema = z.object({
  _id: z.optional(z.string()),
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Max 50 characters")
    .regex(/^[^";]*$/, "No quotes or semicolons allowed"),
  slug: z.optional(z.string()),
  logo: z.union([
    z
      .instanceof(Blob)
      .refine((b) => b.size > 0, { message: "Logo is required" }),
    z.string().min(1, "Required"),
  ]),
  logoStorageId: z.optional(z.string()),
  location: locationSchema,
  about: z.optional(z.string()),
  contact: contactSchema.optional(),
  links: linksSchemaStrict.optional(),
  hadFreeCall: z.optional(z.boolean()),
});

export const eventBase = z.object({
  formType: z.optional(z.number()),
  _id: z.optional(z.string()),
  // name: z.optional(z.string()),
  name: z.string(),
  slug: z.optional(z.string()),
  hasOpenCall: z.union([z.enum(callTypeValues), z.literal("False")]),

  //TODO: Add message for "Event category is required"
  category: z.enum(toMutableEnum(eventCategoryValues)),
  type: z.array(z.enum(toMutableEnum(eventTypeValues))).optional(),
  logo: z.union([
    z
      .instanceof(Blob)
      .refine((b) => b.size > 0, { message: "Logo is required" }),
    z.string().min(1, "Logo is required"),
  ]),
  logoStorageId: z.optional(z.string()),
  location: locationBase.extend({
    sameAsOrganizer: z.boolean(),
  }),

  dates: z.object({
    eventFormat: z.optional(
      z.union([z.enum(eventFormatValues), z.literal("")]),
    ),
    prodFormat: z.optional(z.union([z.enum(prodFormatValues), z.literal("")])),
    edition: z.number(),
    eventDates: z.array(
      z.object({
        start: z.string(),
        end: z.string(),
      }),
    ),

    prodDates: z.optional(
      z.array(
        z.object({
          start: z.string(),
          end: z.string(),
        }),
      ),
    ),
    noProdStart: z.boolean(),
  }),
  links: linksSchemaLoose,
  otherInfo: z.string().optional(),
  timeLine: z.string().optional(),
  blurb: z.string().optional(),
  about: z.string().optional(),
  active: z.boolean().optional(),
  adminNote: z.string().optional(),
  approvedBy: z.optional(z.string()),
});

// export const eventDetails = eventBase.superRefine((data, ctx) => {
//   //TODO: Change this to require just one of the inputs if not sameAsOrganizer
//   if (!data.links.sameAsOrganizer) {
//     ctx.addIssue({
//       code: "custom",
//       message: "Link to the organizer must be provided",
//       path: ["links", "website"],
//     });
//   }
//   if (!data.hasOpenCall) {
//     ctx.addIssue({
//       code: "custom",
//       message: "Must answer if there's an open call",
//       path: ["hasOpenCall"],
//     });
//   }
// });

export const eventSchema = eventBase.superRefine((data, ctx) => {
  const prodDates = data.dates?.prodDates;
  const prodRequired =
    data.dates?.eventFormat &&
    (data.category === "event" || data.category === "project");

  const noProdDates =
    (!prodDates?.[0]?.start || prodDates[0].start === "") &&
    (!prodDates?.[0]?.end || prodDates[0].end === "");
  if (data.name?.trim()) {
    const trimmed = data.name.trim();

    if (trimmed.length > 0 && trimmed.length < 3) {
      ctx.addIssue({
        code: "custom",
        message:
          "Name must be at least 3 characters with no quotes or semicolons",
        path: ["name"],
      });
    }
    if (trimmed.length > 90) {
      ctx.addIssue({
        code: "custom",
        message: "Max 90 characters",
        path: ["name"],
      });
    }
    if (trimmed.includes('"') || trimmed.includes(";")) {
      ctx.addIssue({
        code: "custom",
        message: "No quotes or semicolons allowed in name",
        path: ["name"],
      });
    }
  }
  if (data.category === "event") {
    if (!data.type || data.type.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Event type is required when category is 'event'",
        path: ["type"],
      });
    } else if (data.type.length > 2) {
      ctx.addIssue({
        code: "custom",
        message: "You can select up to 2 event types",
        path: ["type"],
      });
    }
    if (!data.location.city || data.location.city.trim() === "") {
      ctx.addIssue({
        code: "custom",
        message: "City is required for events",
        path: ["location", "city"],
      });
    }
    // if (data.name.trim().length > 3 && !data.dates?.eventFormat) {
    //   ctx.addIssue({
    //     code: "custom",
    //     message: "An event format is required",
    //     path: ["dates", "eventFormat"],
    //   });
    // }
  }

  const datesRequired =
    data.dates?.eventFormat !== "noEvent" &&
    data.dates?.eventFormat !== "ongoing" &&
    data.dates?.eventFormat !== "" &&
    data.dates?.eventFormat;
  if (
    datesRequired &&
    (data.dates?.eventDates?.[0]?.start === "" ||
      data.dates?.eventDates?.[0]?.end === "")
  ) {
    ctx.addIssue({
      code: "custom",
      message: "Please provide at least one set of event dates",
      path: ["dates", "eventDates"],
    });
  }
  if (
    data.name?.trim().length > 3 &&
    data.dates?.eventFormat &&
    // data.dates?.eventFormat !== "" &&
    data.dates?.eventFormat !== "ongoing" &&
    data.dates?.prodFormat === undefined
  ) {
    ctx.addIssue({
      code: "custom",
      message: "All projects/events must have a production date format",
      path: ["dates", "prodFormat"],
    });
  }

  if (
    prodRequired &&
    data.dates?.eventFormat !== "ongoing" &&
    data.dates?.prodFormat
  ) {
    // console.log(prodDates, prodDates?.length);
    // console.log(noProdDates, !data.dates?.noProdStart);
    if (
      !data.dates?.noProdStart &&
      (!Array.isArray(prodDates) || prodDates.length === 0 || noProdDates)
    ) {
      // console.log("true 1");
      ctx.addIssue({
        code: "custom",
        message: "All projects/events must have production dates",
        path: ["dates", "prodDates"],
      });
    } else if (!prodDates?.[0]?.start && !data.dates?.noProdStart) {
      // console.log("true 2", prodDates?.[0]?.start);
      ctx.addIssue({
        code: "custom",
        message: "All projects/events must have a production start date",
        path: ["dates", "prodDates"],
      });
    } else if (!prodDates?.[0]?.end) {
      // console.log("true 3");
      ctx.addIssue({
        code: "custom",
        message: "All projects/events must have a production end date",
        path: ["dates", "prodDates"],
      });
    }
  }

  // if (
  //   data.dates?.noProdStart &&
  //   (!Array.isArray(prodDates) || prodDates.length === 0 || !prodDates[0].end)
  // ) {
  //   ctx.addIssue({
  //     code: "custom",
  //     message: "All projects/events must have a production end date",
  //     path: ["dates", "prodDates"],
  //   });
  // }
});

// const openCallCheckSchema = z.object({
//   callType: z.union([z.enum(callTypeValues), z.literal("False")]),
// });

export const step1Schema = z
  .object({
    organization: organizationSchema,
  })
  .superRefine((data, ctx) => {
    if (
      typeof data.organization.logo === "string" &&
      data.organization.logo?.trim()
    ) {
      const trimmedLogo = data.organization.logo.trim();
      if (trimmedLogo.length > 0 && trimmedLogo.length < 5) {
        ctx.addIssue({
          code: "custom",
          message: "Logo is required",
          path: ["logo"],
        });
      }
    }
  });

export const orgDetailsSchema = z.object({
  organization: organizationSchema.extend({
    contact: contactSchema,
    links: linksSchemaStrict,
    about: z.optional(z.string()),
  }),
});
// .superRefine((data, ctx) => {
//   const email = data.organization.links?.email;

//   if (!email || email.trim() === "") {
//     ctx.addIssue({
//       code: "custom",
//       message: "Email is required",
//       path: ["organization", "links", "email"],
//     });
//   }
// });

export const eventOnlySchema = z.object({
  organization: organizationSchema,
  event: eventSchema,
});

export const eventDetailsSchema = z.object({
  organization: organizationSchema,
  // event: eventDetails,
  event: eventBase.extend({
    links: linksSchemaStrict,
  }),
  // openCall: z.object({
  //   basicInfo: openCallCheckSchema,
  // }),
});

export const openCallBaseSchema = z.object({
  _id: z.optional(z.string()),
  adminNoteOC: z.optional(z.string()),

  // mainOrgId: z.string(), //todo: add this later when multiple orgs are supported
  basicInfo: z.object({
    appFee: z.number(),
    callFormat: z.union([z.literal("RFQ"), z.literal("RFP"), z.literal("RFA")]),
    // callType: z.union([
    //   z.literal("Fixed"),
    //   z.literal("Rolling"),
    //   z.literal("Email"),
    //   z.literal("Invite"),
    //   z.literal("Unknown"),
    //   z.literal("False"),
    // ]),

    dates: z.optional(
      z.object({
        ocStart: z.optional(z.union([z.string(), z.null()])),
        ocEnd: z.optional(z.union([z.string(), z.null()])),
        timezone: z.optional(z.string()), //todo: make not optional later
        edition: z.optional(z.number()),
      }),
    ),
  }),
  eligibility: z.object({
    type: z.union([
      z.literal("International"),
      z.literal("National"),
      z.literal("Regional/Local"),
      z.literal("Other"),
      z.literal("Unknown"),
    ]),
    whom: z.optional(z.array(z.string())),
    details: z.optional(z.string()),
  }),

  requirements: z.object({
    requirements: z.string(),
    //   more: z.string(),
    //   destination: z.string(),
    otherInfo: z.optional(z.string()),
    links: z
      .array(
        z.object({
          title: z.string().min(1, "Link title is required"), //same here. I feel like it's valid to ask for what exactly the link is rather than relying on the title. Not sure, though.
          href: z.url({
            protocol: /^https?$/,
            hostname: z.regexes.domain,
            error: "Must be a valid URL (https://example.com)",
          }),
        }),
      )
      .optional(),
    applicationLink: z.string().min(1, "Application link is required"),
    applicationLinkFormat: z.union([
      z.literal("https://"),
      z.literal("mailto:"),
    ]),
    applicationLinkSubject: z.optional(z.string()),

    // .refine((val) => !val || isValidUrl(val), {
    //   message: "Must be a valid URL (https://...)",
    // }),
    //   otherInfo: z.optional(z.array(z.string())), //todo: make not optional later
  }),
  documents: z.optional(
    z.array(
      z.object({
        id: z.optional(z.string()),
        title: z.string(),
        href: z.string(),
        archived: z.optional(z.boolean()),
      }),
    ),
  ),
  paid: z.optional(z.boolean()),
  paidAt: z.optional(z.number()),
  publicPreview: z.optional(z.boolean()),
  tempFiles: z.array(z.instanceof(File)).optional(),
  approvedBy: z.optional(z.string()),
  approvedAt: z.optional(z.number()),
});

export const openCallCompensationSchema = z.object({
  budget: z.object({
    hasBudget: z.optional(z.boolean()),
    unknownBudget: z.optional(z.boolean()),
    min: z.number(),
    max: z.optional(z.number()),
    rate: z.number(),
    unit: z.union([z.literal("ft²"), z.literal("m²"), z.literal("")]),
    currency: z.string(),
    allInclusive: z.boolean(),
    moreInfo: z.optional(z.string()), //ensure that this has a 500 char limit to avoid the crazies. Also, no rich text formatting. Just plain text. or? very limited to allow line breaks, but that's it?
  }),
  categories: z.object({
    artistStipend: z.union([z.number(), z.boolean()]).optional(),
    designFee: z.union([z.number(), z.boolean()]).optional(),
    accommodation: z.union([z.number(), z.boolean()]).optional(),
    food: z.union([z.number(), z.boolean()]).optional(),
    travelCosts: z.union([z.number(), z.boolean()]).optional(),
    materials: z.union([z.number(), z.boolean()]).optional(),
    equipment: z.union([z.number(), z.boolean()]).optional(),
  }),
});

//TODO: Update the organization schema here to use the full thing since it's not at the
export const openCallStep1Schema = z.object({
  organization: z.object({
    location: z.object({
      currency: z.optional(
        z.object({
          code: z.string(),
          name: z.string(),
          symbol: z.string(),
          format: z.optional(z.string()),
        }),
      ),
    }),
  }),
  event: eventBase.extend({
    hasOpenCall: z.union([z.enum(callTypeValues), z.literal("False")]),
  }),
  openCall: openCallBaseSchema,
});

export const openCallFullSchema = openCallBaseSchema.extend({
  compensation: openCallCompensationSchema,
});

export const openCallSchema = openCallFullSchema.extend({
  state: z.optional(z.string()),
});

export const openCallStep2Schema = z
  .object({
    openCall: openCallFullSchema,
    event: eventBase,
  })
  .superRefine((data, ctx) => {
    // const allInclusive = data.openCall.compensation.budget.allInclusive;
    const unknownBudget = data.openCall.compensation.budget.unknownBudget;
    const hasBudget = data.openCall.compensation.budget.hasBudget;
    const budgetRate = data.openCall.compensation.budget.rate;
    const budgetUnit = data.openCall.compensation.budget.unit;
    const budgetMin = data.openCall.compensation.budget.min;
    const budgetMax = data.openCall.compensation.budget.max;
    const budgetLg = typeof budgetMax === "number" && budgetMax > 1000;
    const missingBudget =
      hasBudget &&
      typeof budgetMin === "number" &&
      budgetMin <= 1 &&
      budgetRate === 0;

    const missingUnit =
      hasBudget &&
      typeof budgetRate === "number" &&
      budgetRate > 0 &&
      budgetUnit === "";

    if (missingUnit) {
      ctx.addIssue({
        code: "custom",
        message: "Rate unit is required",
        path: ["openCall", "compensation", "budget", "unit"],
      });
    }
    const paidCall = data.event.formType === 3;
    if (missingBudget && !unknownBudget && (paidCall || hasBudget === true)) {
      ctx.addIssue({
        code: "custom",
        message: "Minimum budget or rate is required",
        path: ["openCall", "compensation", "budget"],
      });
    }

    if (budgetLg && data.event.formType === 2) {
      ctx.addIssue({
        code: "custom",
        message: "Budget max must be 1,000 or less for free calls",
        path: ["openCall", "compensation", "budget", "max"],
      });
    }
    if (budgetMin && budgetMax && budgetMin > budgetMax) {
      ctx.addIssue({
        code: "custom",
        message: "Budget max must be greater than or equal to min",
        path: ["openCall", "compensation", "budget", "max"],
      });
    }
  });

export const eventWithOCSchema = z
  .object({
    organization: organizationSchema,
    event: eventBase.extend({
      state: z.enum(eventStates),
      hasOpenCall: z.union([z.enum(callTypeValues), z.literal("False")]),
    }),
    openCall: openCallSchema.optional(),
  })
  .superRefine((data, ctx) => {
    const callType = data.event.hasOpenCall;
    const shouldBePresent = validOCVals.includes(callType ?? "");

    if (shouldBePresent) {
      const hasMinimalStructure =
        !!data.openCall?.eligibility &&
        !!data.openCall?.requirements &&
        !!data.openCall?.requirements.applicationLink;

      if (!hasMinimalStructure) {
        ctx.addIssue({
          code: "custom",
          message:
            "Open Call details are required when callType is Fixed, Rolling, or Email.",
          path: ["openCall"],
        });
      }
    }
  });

export const eventSubmitSchema = z.object({
  organization: organizationSchema,
  event: eventBase.extend({
    links: linksSchemaStrict,
    state: z.enum(eventStates),
  }),
});

type LinkField = keyof z.infer<typeof linksSchemaStrict>;
type OrgLinkPath = `organization.links.${LinkField}`;
type EventLinkPath = `event.links.${Exclude<LinkField, "sameAsOrganizer">}`;
// Only org has primaryContact radio behavior, and "sameAsOrganizer" doesn't apply to individual inputs

export type ValidLinkPath = OrgLinkPath | EventLinkPath;

export const getEventSchema = (isAdmin: boolean = false) => {
  if (isAdmin) {
    // return eventBase; // Skip all refinements for admins
    // console.log("is Admin");
  }
  return eventSchema;
};

export const getEventOnlySchema = (isAdmin: boolean = false) => {
  // console.log("isAdmin", isAdmin);
  void isAdmin;
  return z.object({
    organization: organizationSchema,
    event: getEventSchema(isAdmin),
  });
};

export const getEventDetailsSchema = (isAdmin: boolean = false) => {
  void isAdmin; // use me later :)
  return z
    .object({
      organization: organizationSchema,
      event: eventBase.extend({
        links: linksSchemaStrict,
      }),
    })
    .superRefine((data, ctx) => {
      if (data.event.hasOpenCall === "False" && data.event.formType !== 1) {
        ctx.addIssue({
          code: "custom",
          message: "Open call type is required",
          path: ["event", "hasOpenCall"],
        });
      }
    });
};

export const getOpenCallStep1Schema = (isAdmin: boolean = false) => {
  return openCallStep1Schema.superRefine((data, ctx) => {
    const appLinkFormat = data.openCall?.requirements?.applicationLinkFormat;
    const appRequirements = cleanHtml(
      data.openCall?.requirements?.requirements,
      true,
    ).trim();

    const appLink = data.openCall?.requirements?.applicationLink;
    const eligDetails = cleanHtml(
      data.openCall?.eligibility?.details,
      true,
    ).trim();
    if (data.openCall?.eligibility?.type.trim()) {
      const trimmed = data.openCall?.eligibility?.type.trim();
      if (
        trimmed === "National" &&
        data.openCall?.eligibility?.whom?.length === 0
      ) {
        ctx.addIssue({
          code: "custom",
          message: "Select at least one eligible nationality",
          path: ["openCall", "eligibility", "details"],
        });
      }
      if (trimmed === "Other" || trimmed === "Regional/Local") {
        if (!isAdmin && eligDetails.length < 25) {
          ctx.addIssue({
            code: "custom",
            message: "More eligibility info is required (min 25 characters)",
            path: ["openCall", "eligibility", "details"],
          });
        } else if (isAdmin && eligDetails.length < 5) {
          ctx.addIssue({
            code: "custom",
            message: "More eligibility info is needed (min 5 characters)",
            path: ["openCall", "eligibility", "details"],
          });
        }
      }
    }
    if (
      data.event?.hasOpenCall === "Fixed" &&
      (!data.openCall?.basicInfo?.dates?.ocStart ||
        !data.openCall?.basicInfo?.dates?.ocEnd)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Fixed calls must have a start and end date",
        path: ["openCall", "basicInfo", "dates"],
      });
    }
    // if (appLinkFormat === "mailto:") {
    //   if (!appLink || !isValidEmail(appLink)) {
    //     ctx.addIssue({
    //       code: "custom",
    //       message: "Must be a valid email address",
    //       path: ["openCall", "requirements", "applicationLink"],
    //     });
    //   }
    // }

    // if (appLinkFormat === "https://") {
    //   if (!appLink || !isValidUrl(appLink)) {
    //     ctx.addIssue({
    //       code: "custom",
    //       message: "Must be a valid website URL (https://...)",
    //       path: ["openCall", "requirements", "applicationLink"],
    //     });
    //   }
    // }

    if (appLinkFormat === "https://") {
      // const parsed = z
      //   .url({
      //     protocol: /^https?$/,
      //     hostname: domainRegex,
      //   })
      //   .safeParse(appLink);
      const parsed = z
        .string()
        .refine(
          (val) => {
            try {
              const url = new URL(val);

              // protocol must be http/https
              if (!["http:", "https:"].includes(url.protocol)) return false;

              // reject credentials in the authority section
              if (url.username || url.password) return false;

              // enforce strict domain pattern
              if (!domainRegex.test(url.hostname)) return false;

              return true;
            } catch {
              return false;
            }
          },
          {
            message: "Must be a valid website URL (https://example.com)",
          },
        )
        .safeParse(appLink);

      if (!parsed.success) {
        ctx.addIssue({
          code: "custom",
          message: "Link must be a valid website URL (https://example.com)",
          path: ["openCall", "requirements", "applicationLink"],
        });
      }
    }

    if (appLinkFormat === "mailto:") {
      const parsed = z.email().safeParse(appLink);

      if (!parsed.success) {
        ctx.addIssue({
          code: "custom",
          message: "Link must be a valid email address",
          path: ["openCall", "requirements", "applicationLink"],
        });
      }
    }
    if (!isAdmin && appRequirements.length < 50 && appRequirements) {
      ctx.addIssue({
        code: "custom",
        message: "More requirement info is needed (min 50 characters)",
        path: ["openCall", "requirements", "requirements"],
      });
    }
  });
};

export type OpenCallStep1 = z.infer<ReturnType<typeof getOpenCallStep1Schema>>;

export const getEventWithOCSchema = (isAdmin: boolean = false) => {
  void isAdmin; // use me later :)
  return eventWithOCSchema;
};
