import { z } from "zod";

import {
  linksSchemaStrictBase,
  locationSchema,
} from "@/features/organizers/schemas/event-add-schema";

export const contactSchemaStrict = z.object({
  organizer: z.optional(z.string()),
  organizerTitle: z.optional(z.string()),
  primaryContact: z.string(),
});

export const organizationSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Max 50 characters")
    .regex(/^[^";]*$/, "No quotes or semicolons allowed"),
  logo: z
    .union([
      z
        .instanceof(Blob)
        .refine((b) => b.size > 0, { message: "Logo is required" }),
      z.string(),
    ])
    .optional(),
  logoStorageId: z.optional(z.string()),
  location: locationSchema,
  // about: z.optional(z.string()),
  // contact: contactSchema.optional(),
  // links: linksSchemaStrict.optional(),
  blurb: z.optional(z.string()),
  about: z.optional(z.string()),
  contact: contactSchemaStrict,
  links: linksSchemaStrictBase.optional(),
});

export type OrganizationValues = z.infer<typeof organizationSchema>;
