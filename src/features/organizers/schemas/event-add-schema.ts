import { z } from "zod"

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
const organizationSchema = z.object({
  name: z.string().min(3, "At least 3 chars").max(35, "Max 35 chars"),
})

const eventSchema = z.object({
  name: z.string().min(3, "Event name must be at least 3 characters"),
})

const openCallSchema = z.object({
  deadline: z.date().min(new Date(), "Deadline must be after today"),
  eligibility: z
    .string()
    .min(3, "Eligibility criteria must be at least 3 characters"),
  description: z.string().min(3, "Description must be at least 3 characters"),
  budget: z.number().min(0, "Budget must be at least 0"),
})

export const step1Schema = z.object({
  organization: organizationSchema,
  event: eventSchema,
})

export const eventOnlySchema = z.object({
  organization: organizationSchema,
  event: eventSchema,
})

export const eventWithOCSchema = z.object({
  organization: organizationSchema,
  event: eventSchema,
  openCall: openCallSchema,
})
