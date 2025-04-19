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
  currency: z.optional(
    z.object({
      code: z.string(),
      name: z.string(),
      symbol: z.string(),
    }),
  ),
  demonym: z.optional(z.string()),
});

const locationSchema = locationBase.superRefine((data, ctx) => {
  if ((data.city || data.state) && !data.country) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Country is required - please select from the dropdown",
      path: ["country"],
    });
  } else if (!data.country || data.country.trim().length < 3) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please select from the dropdown",
      path: ["country"],
    });
  }
});

const organizationSchema = z.object({
  _id: z.optional(z.string()),
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(35, "Max 35 characters")
    .regex(/^[^"';]*$/, "No quotes or semicolons allowed"),
  logo: z.union([
    z
      .instanceof(Blob)
      .refine((b) => b.size > 0, { message: "Logo is required" }),
    z.string().min(1, "Logo is required"),
  ]),
  location: locationSchema,
});

const eventSchema = z
  .object({
    _id: z.optional(z.string()),
    name: z
      .string()
      .min(3, "Name must be at least 3 characters")
      .max(35, "Max 35 characters")
      .regex(/^[^"';]*$/, "No quotes or semicolons allowed"),
    category: z.string().min(3, "Event category is required"),
    type: z.array(z.string()).optional(),
    logo: z.union([
      z
        .instanceof(Blob)
        .refine((b) => b.size > 0, { message: "Logo is required" }),
      z.string().min(1, "Logo is required"),
    ]),
    location: locationBase.extend({
      sameAsOrganizer: z.boolean(),
    }),

    dates: z.object({
      eventFormat: z.string().min(1, "Date format is required"),
      prodFormat: z.string().min(1, "Date format is required"),
      edition: z.number(),
      eventDates: z.array(
        z.object({
          start: z.string({ required_error: "Start date is required" }),
          end: z.string({ required_error: "End date is required" }),
        }),
      ),
      artistStart: z.string().optional(),
      artistEnd: z.string().optional(),
      ongoing: z.boolean(),
    }),
    links: z.object({
      sameAsOrganizer: z.boolean(),
      website: z.string().optional(),
      instagram: z.string().optional(),
      facebook: z.string().optional(),
      threads: z.string().optional(),
      email: z.string().optional(),
      vk: z.string().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
      linkAggregate: z.string().optional(),
    }),
    otherInfo: z.array(z.string()).optional(),
    about: z.string().optional(),
    active: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.category === "event") {
      if (!data.type || data.type.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Event type is required when category is 'event'",
          path: ["type"],
        });
      } else if (data.type.length > 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "You can select up to 2 event types",
          path: ["type"],
        });
      }
    }
  });

const openCallSchema = z.object({
  deadline: z.date().min(new Date(), "Deadline must be after today"),
  eligibility: z
    .string()
    .min(3, "Eligibility criteria must be at least 3 characters"),
  description: z.string().min(3, "Description must be at least 3 characters"),
  budget: z.number().min(0, "Budget must be at least 0"),
});

export const step1Schema = z.object({
  organization: organizationSchema,
});

export const eventOnlySchema = z.object({
  organization: organizationSchema,
  event: eventSchema,
});

export const eventWithOCSchema = z.object({
  organization: organizationSchema,
  event: eventSchema,
  openCall: openCallSchema,
});
