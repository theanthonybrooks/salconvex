import z from "zod";

export const newsletterToolbarSchema = z.object({
  title: z.string().min(3, "Title is required"),
  type: z.union([z.literal("general"), z.literal("openCall")]),
  frequency: z.union([z.literal("monthly"), z.literal("weekly"), z.literal("all")]),
  userPlan: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
  test: z.boolean(),
  sendTime: z.number(),
});

export type NewsletterToolbarType = z.infer<typeof newsletterToolbarSchema>;
