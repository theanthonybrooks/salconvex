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

export const eventOCSchema = z.object({
  organization: z
    .preprocess(
      (val) => (typeof val === "string" ? { organizationName: val } : val),
      z.object({
        organizationName: z
          .string()
          .min(3, "At least 3 chars")
          .max(35, "Max 35 chars"),
      })
    )
    .nullable(),
  eventName: z.string().min(3, "Event name must be at least 3 characters"),
  //   eventType: z.string().min(1),
  //   budget: z.number().min(0).optional(),
  //   deadline: z.date().optional(),
  //   description: z.string().min(10),
  // add all other fields across all steps
})
