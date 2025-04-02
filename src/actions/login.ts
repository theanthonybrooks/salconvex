"use server";

import { LoginSchema } from "@/schemas/auth";
import { z } from "zod";

export const login = async (values: z.infer<typeof LoginSchema>) => {
  const validatedFields = LoginSchema.safeParse(values);

  console.log(values);

  if (!validatedFields.success) {
    return { error: "Login failed" };
  }

  return { success: "Login successful" };
};
