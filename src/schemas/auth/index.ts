import * as z from "zod";

const passwordValidation = new RegExp(
  /(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^\w\s]).{8,}$/,
);

export const LoginSchema = z.object({
  email: z
    .email({ message: "Email is required" })
    .transform((val) => val.toLowerCase()),
  password: z.string().min(8, { message: "Password is required" }),
});

export const RegisterSchema = z
  .object({
    firstName: z.string().min(1, { message: "First name is required" }),
    lastName: z.string().min(1, { message: "Last name is required" }),
    email: z
      .email({ message: "Email is required" })
      .transform((val) => val.toLowerCase()),
    password: z
      .string()
      .min(8, {
        message:
          "Password must contain at least one uppercase letter, one number, and one symbol.",
      })
      .regex(passwordValidation, {
        message:
          "Password must contain at least one uppercase letter, one number, and one symbol.",
      }),
    accountType: z
      .array(z.string())
      .min(1, { message: "At least one account type is required" }),
    name: z.string().optional(),
    organizationName: z.string().optional(),
    source: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.accountType.includes("organizer")) {
      const org = data.organizationName?.trim();
      if (!org || org.length < 3) {
        ctx.addIssue({
          code: "custom",
          path: ["organizationName"],
          message: "Organization name is required for organizers.",
        });
      } else if (org.length > 50) {
        ctx.addIssue({
          code: "custom",
          path: ["organizationName"],
          message: "Max 50 characters allowed",
        });
      } else if (/[";]/.test(org)) {
        ctx.addIssue({
          code: "custom",
          path: ["organizationName"],
          message: "No quotes or semicolons allowed",
        });
      }
    }
  });

export const UpdateUserSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z
    .email({ message: "Email is required" })
    .transform((val) => val.toLowerCase()),
  name: z.string().optional(),
  organizationName: z.string().optional(),
});

export const ResendOtpSchema = z.object({
  email: z
    .email({ message: "Email is required" })
    .transform((val) => val.toLowerCase()),
});

export const VerifyOtpSchema = z.object({
  email: z
    .email({ message: "Email is required" })
    .transform((val) => val.toLowerCase()),
  otp: z.string().min(6, { message: "The code must be 6 digits" }),
});

export const ForgotPasswordSchema = z.object({
  email: z
    .email({ message: "Email is required" })
    .transform((val) => val.toLowerCase()),
});

export const ResetPasswordSchema = z.object({
  code: z.string().min(6, { message: "The code must be 6 digits" }),
  newPassword: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." })
    .regex(passwordValidation, {
      message:
        "Password must contain at least one uppercase letter, one number, and one symbol.",
    }),
});
export const UpdatePasswordSchema = z.object({
  oldPassword: z.string().min(8, { message: "Password is required" }),
  newPassword: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." })
    .regex(passwordValidation, {
      message:
        "Password must contain at least one uppercase letter, one number, and one symbol.",
    }),
});

export const UpdateUserPrefsSchema = z.object({
  autoApply: z.boolean().optional(),
  currency: z.string().optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
  theme: z.string().optional(),
  fontSize: z.string().optional(),
});
