import {
  columnTypeValidator,
  priorityValidator,
} from "@/constants/kanbanConsts";
import { supportCategoryValidator } from "@/constants/supportConsts";

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
  organizer: z.string(),
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

export const kanbanCardSchema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().min(10, "Description is required"),
  column: columnTypeValidator,
  priority: priorityValidator,
  category: supportCategoryValidator,
  order: z.string(),
  isPublic: z.boolean(),
  assignedId: z.optional(z.string()),
  secondaryAssignedId: z.optional(z.string()),
});

export type KanbanCardType = z.infer<typeof kanbanCardSchema>;
