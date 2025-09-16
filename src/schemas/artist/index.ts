import {
  isValidFacebook,
  isValidInstagram,
  isValidLinkedIn,
  isValidPhone,
  isValidThreads,
  isValidVK,
} from "@/lib/zodFns";
import { z } from "zod";

export const UpdateArtistSchema = z.object({
  artistName: z.string().optional(),
  logo: z.union([z.instanceof(Blob), z.string()]).optional(),
  artistNationality: z // just using cca2 codes for now
    .array(z.string())
    .min(1, "Please select at least one nationality")
    .max(3, "You can select up to 3 nationalities"),
  artistResidency: z
    .object({
      full: z.string(),
      locale: z.string().optional(),
      city: z.string().optional(),
      region: z.string().optional(),
      state: z.string().optional(),
      stateAbbr: z.string().optional(),
      country: z.string(),
      countryAbbr: z.string().optional(),
      continent: z.string().optional(),
      location: z.array(z.number()).optional(),
      timezone: z.string().optional(),
      timezoneOffset: z.number().optional(),
      currency: z
        .object({
          code: z.string(),
          name: z.string(),
          symbol: z.string(),
          format: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
  artistContact: z
    .object({
      website: z
        .url({
          protocol: /^https?$/,
          hostname: z.regexes.domain,
          error: "Must be a valid website URL (https://example.com)",
        })
        .optional(),
      instagram: z
        .string()
        .optional()
        .refine((val) => !val || isValidInstagram(val), {
          message:
            "Must be a valid Instagram handle (letters, numbers, . or _)",
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
      linkedIn: z
        .url({
          protocol: /^https?$/,
          hostname: z.regexes.domain,
          error: "Must be a valid website URL (https://example.com)",
        })
        .optional()
        .refine((val) => !val || isValidLinkedIn(val), {
          message:
            "Must be a valid LinkedIn URL (https://www.linkedin.com/...)",
        }),
      youTube: z.string().optional(),
    })
    .optional(),
  documents: z
    .object({
      cv: z.string().optional(),
      resume: z.string().optional(),
      artistStatement: z.string().optional(),
      images: z.array(z.string()).optional(),
    })
    .optional(),
  canFeature: z.boolean().optional(),
});

export type UpdateArtistSchemaValues = z.infer<typeof UpdateArtistSchema>;
