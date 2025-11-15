import {
  newsletterFrequencyValues,
  NewsletterType,
  newsletterTypeOptions,
} from "@/constants/newsletterConsts";

import { z } from "zod";

import { domainRegex } from "@/lib/zodFns";

const newsletterTypeValues = newsletterTypeOptions.map(
  (opt) => opt.value,
) as NewsletterType[];

export const contactSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.email("Must be a valid email address"),
  category: z.string().nonempty("Category is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export type ContactFormValues = z.infer<typeof contactSchema>;

export const newsletterSignupSchema = z.object({
  email: z.email("Must be a valid email address"),
  firstName: z.string().min(3, "First name is required"),
});

export type NewsletterFormValues = z.infer<typeof newsletterSignupSchema>;

export const newsletterStatusSchema = z.object({
  email: z.email("Must be a valid email address"),
  // frequency: z.union([z.literal("monthly"), z.literal("weekly")]),
});

export type NewsletterStatusValues = z.infer<typeof newsletterStatusSchema>;

export const newsletterUpdateSchema = z.object({
  frequency: z.enum(newsletterFrequencyValues),
  type: z
    .array(z.enum(newsletterTypeValues))
    .min(1, "You must select at least one newsletter type"),
  updateEmail: z.boolean().optional(),
});

export type NewsletterUpdateValues = z.infer<typeof newsletterUpdateSchema>;

export const getEventRegistrationSchema = (link?: boolean, notes?: boolean) => {
  void notes;
  return z
    .object({
      email: z.email("Must be a valid email address"),
      name: z.string().min(3, "Name is required"),
      link: link ? z.url() : z.string().optional(),
      notes: z.string().optional(),
      termsAgreement: z.boolean(),
    })
    .superRefine((data, ctx) => {
      const link = data.link;

      if (!link) return;

      const parsed = z
        .string()
        .refine((val) => {
          try {
            const url = new URL(val);
            if (!["http:", "https:"].includes(url.protocol)) return false;
            if (url.username || url.password) return false;
            if (!domainRegex.test(url.hostname)) return false;
            return true;
          } catch {
            return false;
          }
        })
        .safeParse(link);

      if (!parsed.success) {
        ctx.addIssue({
          code: "custom",
          message: "Link must be a valid website URL (https://example.com)",
          path: ["link"],
        });
      }
    });
};

export type EventRegistrationValues = z.infer<
  ReturnType<typeof getEventRegistrationSchema>
>;
