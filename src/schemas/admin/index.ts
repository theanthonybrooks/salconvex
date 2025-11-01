import { z } from "zod";

export const extrasSchema = z.object({
  name: z.string().min(3, "Name is required"),
  img: z.string().optional(),
  description: z.string().min(10, "Description is required"),
  location: z.string().min(3, "Location is required"),
  startDate: z.number(),
  endDate: z.number(),
  regDeadline: z.number(),
  price: z.number(),
  capacity: z.object({
    max: z.number(),
    current: z.number().optional(),
  }),
  organizer: z.string().optional(),
  organizerBio: z.string(),
  terms: z
    .array(z.string().trim().min(1, "Term cannot be empty"))
    .min(1, "At least one term is required"),
  requirements: z
    .array(z.string().trim().min(1, "Requirement cannot be empty"))
    .min(1, "At least one requirement is required"),

  //   updatedAt: z.optional(z.number()),
  //   createdAt: z.number(),
});

export type ExtrasType = z.infer<typeof extrasSchema>;
