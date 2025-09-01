import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.email("Invalid email"),
  category: z.string().nonempty("Category is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export type ContactFormValues = z.infer<typeof contactSchema>;

export const newsletterSignupSchema = z.object({
  email: z.email("Invalid email"),
  firstName: z.string().min(3, "First name is required"),
});

export type NewsletterFormValues = z.infer<typeof newsletterSignupSchema>;

export const newsletterStatusSchema = z.object({
  email: z.email("Invalid email"),
  // frequency: z.union([z.literal("monthly"), z.literal("weekly")]),
});
// .superRefine((data, ctx) => {
//   if (data.email) {
//     ctx.addIssue({
//       code: "custom",
//       message: "A frequency is required for a newsletter subscription",
//       path: ["frequency"],
//     });
//   }
// });
// export const newsletterStatusSchema = z
//   .object({
//     email: z.email("Invalid email"),
//     frequency: z.union([
//       z.literal("monthly"),
//       z.literal("weekly"),
//       z.literal(""),
//     ]),
//   })
//   .superRefine((data, ctx) => {
//     if (data.email) {
//       ctx.addIssue({
//         code: "custom",
//         message: "A frequency is required for a newsletter subscription",
//         path: ["frequency"],
//       });
//     }
//   });

export type NewsletterStatusValues = z.infer<typeof newsletterStatusSchema>;

export const newsletterUpdateSchema = z.object({
  frequency: z.union([z.literal("monthly"), z.literal("weekly")]),
})