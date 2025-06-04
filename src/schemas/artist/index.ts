import { z } from "zod";

export const UpdateArtistSchema = z.object({
  artistName: z.string().optional(),
  artistNationality: z.array(z.string()).optional(),
  artistResidency: z
    .object({
      full: z.string(),
      city: z.string().optional(),
      state: z.string().optional(),
      stateAbbr: z.string().optional(),
      country: z.string(),
      countryAbbr: z.string().optional(),
      location: z.array(z.number()).optional(),
      timezone: z.string().optional(),
      timezoneOffset: z.number().optional(),
    })
    .optional(),
});
