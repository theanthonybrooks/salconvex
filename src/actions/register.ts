"use server"

import { RegisterSchema } from "@/schemas/auth"
import { fetchMutation } from "convex/nextjs"
import { z } from "zod"
import { api } from "../convex/_generated/api"

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Registration failed" }
  }

  try {
    const result = await fetchMutation(
      api.users.registerUser,
      validatedFields.data
    )
    return { success: "Registration successful", userId: result.userId }
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: "Registration failed" }
  }
}
