import * as z from "zod"

const passwordValidation = new RegExp(
  /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/
)

export const LoginSchema = z.object({
  email: z.string().email({ message: "Email is required" }),
  password: z.string().min(8, { message: "Password is required" }),
})

export const RegisterSchema = z
  .object({
    firstName: z.string().min(1, { message: "First name is required" }),
    lastName: z.string().min(1, { message: "Last name is required" }),
    email: z.string().email({ message: "Email is required" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." })
      .regex(passwordValidation, {
        message:
          "Password must contain at least one uppercase letter, one number, and one symbol.",
      }),
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

export const UpdateUserSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Email is required" }),
  name: z.string().optional(),
  organizationName: z.string().optional(),
})

export const ResendOtpSchema = z.object({
  email: z.string().email({ message: "Email is required" }),
})

export const VerifyOtpSchema = z.object({
  email: z.string().email({ message: "Email is required" }),
  otp: z.string().min(6, { message: "OTP must be 6 digits" }),
})

export const ForgotPasswordSchema = z.object({
  email: z.string().email({ message: "Email is required" }),
})

export const ResetPasswordSchema = z.object({
  code: z.string().min(6, { message: "OTP must be 6 digits" }),
  newPassword: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." })
    .regex(passwordValidation, {
      message:
        "Password must contain at least one uppercase letter, one number, and one symbol.",
    }),
})
export const UpdatePasswordSchema = z.object({
  oldPassword: z.string().min(8, { message: "Password is required" }),
  newPassword: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." })
    .regex(passwordValidation, {
      message:
        "Password must contain at least one uppercase letter, one number, and one symbol.",
    }),
})

export const UpdateUserPrefsSchema = z.object({
  currency: z.string().optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
  theme: z.string().optional(),
})
