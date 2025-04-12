import { z } from "zod";

// export const eventOCSchema = z.object({
//   organization: z
//     .object({
//       _id: z.custom<Id<"organizations">>().optional(),
//       organizationName: z
//         .string()
//         .min(3, "At least 3 chars")
//         .max(35, "Max 25 chars"),
//       logo: z.string().optional(),
//     })
//     .nullable(),
//   eventName: z.string().min(3, "Event name must be at least 3 characters"),
// })

// export const eventOCSchema = z.object({
//   organization: z
//     .object({
//       organizationName: z
//         .string()
//         .min(3, "At least 3 chars")
//         .max(35, "Max 35 chars"),
//       logo: z.string().optional(), // Optional if you need it for the UI
//     })
//     .nullable(), // still allows new users to clear the field
//   eventName: z.string().min(3, "Event name must be at least 3 characters"),
// })

// export const organizationSchema = z.object({
//   organization: z
//     .preprocess(
//       (val) => (typeof val === "string" ? { organizationName: val } : val),
//       z.object({
//         organizationName: z
//           .string()
//           .min(3, "At least 3 chars")
//           .max(35, "Max 35 chars"),
//       })
//     )
//     .nullable(),
// })
const locationSchema = z
  .object({
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
  })
  .superRefine((data, ctx) => {
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
    name: z
      .string()
      .min(3, "Name must be at least 3 characters")
      .max(35, "Max 35 characters")
      .regex(/^[^"';]*$/, "No quotes or semicolons allowed"),
    category: z.string().min(3, "Event category is required"),
    type: z.optional(
      z
        .array(z.string())
        .min(1, "Event type is required")
        .max(2, "You can select up to 2 event types"),
    ),
    location: z.object({
      sameAsOrganizer: z.boolean().optional(),
      locale: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      stateAbbr: z.string().optional(),
      region: z.string().optional(),
      country: z.string().optional(),
      countryAbbr: z.string().optional(),
      continent: z.string().optional(),
      coordinates: z.object({
        latitude: z.number().optional(),
        longitude: z.number().optional(),
      }),
      currency: z.optional(
        z.object({
          code: z.string(),
          name: z.string(),
          symbol: z.string(),
        }),
      ),
      demonym: z.optional(z.string()),
    }),
  })
  .superRefine((data, ctx) => {
    if (data.category === "event" && (!data.type || data.type.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Event type is required when category is 'event'",
        path: ["type"],
      });
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
  event: eventSchema,
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
