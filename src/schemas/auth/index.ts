import * as z from "zod"

export const LoginSchema = z.object({
  email: z.string().email({ message: "Email is required" }),
  password: z.string().min(8, { message: "Password is required" }),
})

export const RegisterSchema = z
  .object({
    firstName: z.string().min(1, { message: "First name is required" }),
    lastName: z.string().min(1, { message: "Last name is required" }),
    email: z.string().email({ message: "Email is required" }),
    password: z.string().min(8, { message: "Minimum 8 characters required" }),
    accountType: z
      .array(z.string())
      .min(1, { message: "At least one account type is required" }),
    name: z.string().optional(),
    organizationName: z.string().optional(), // Conditionally required
    source: z.string().optional(),
  })
  .refine(
    (data) => {
      // When "organizer" is one of the account types, organizationName must be non-empty
      if (data.accountType.includes("organizer")) {
        return (data.organizationName ?? "").trim().length > 0
      }
      return true
    },
    {
      message: "Organization name is required",
      path: ["organizationName"],
    }
  )

export const ResendOtpSchema = z.object({
  email: z.string().email({ message: "Email is required" }),
})

export const VerifyOtpSchema = z.object({
  email: z.string().email({ message: "Email is required" }),
  otp: z.string().min(6, { message: "OTP must be 6 digits" }),
})
