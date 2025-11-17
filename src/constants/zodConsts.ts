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

// - Allows any Unicode letters/numbers plus common email symbols in the local part
// - Allows Unicode domains and subdomains
// const unicodeEmailRegex =
//   /^[\p{L}\p{N}+._-]+(\.[\p{L}\p{N}+._-]+)*@[\p{L}\p{N}-]+(?:\.[\p{L}\p{N}-]+)*\.[\p{L}]{2,}$/u;
//note-to-self: Can't use this. I can make it valid for international emails, but then resend doesn't respect them and won't work. For now, just using zod's email validator.

// export const unicodeEmail = z
//   .string()
//   .refine((value) => unicodeEmailRegex.test(value), {
//     message: "Must be a valid email address",
//   });
export const unicodeEmail = z.email("Must be a valid email address");

export const optionalEmail = z.union([z.literal(""), unicodeEmail]).optional();
