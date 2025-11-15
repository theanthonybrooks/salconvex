import z from "zod";

export const optionalUrl = z
  .union([
    z.literal(""),
    z.url({
      protocol: /^https?$/,
      hostname: z.regexes.domain,
      error: "Must be a valid URL (https://example.com)",
    }),
  ])
  .optional();

export const optionalEmail = z
  .union([z.literal(""), z.email("Must be a valid email address")])
  .optional();
