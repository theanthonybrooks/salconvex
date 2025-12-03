import { unicodeEmail } from "@/constants/zodConsts";

import { z } from "zod";

export const passwordValidation = new RegExp(
  /(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^\w\s]).{8,}$/,
);

export const passwordRules = [
  { label: "At least 8 characters", test: (pw: string) => pw.length >= 8 },
  {
    label: "At least one uppercase letter",
    test: (pw: string) => /[A-Z]/.test(pw),
  },
  {
    label: "At least one lowercase letter",
    test: (pw: string) => /[a-z]/.test(pw),
  },
  { label: "At least one number", test: (pw: string) => /[0-9]/.test(pw) },
  {
    label: "At least one symbol",
    test: (pw: string) => /[^A-Za-z0-9]/.test(pw),
  },
];

export const LoginSchema = z.object({
  email: unicodeEmail
    // z.email({ message: "Email is required" })
    .transform((val) => val.toLowerCase()),
  password: z
    .string()
    .regex(passwordValidation, {
      message:
        "Password must contain at least 8 characters, one uppercase letter, one number, and one symbol.",
    })
    .min(8, { message: "Password must be at least 8 characters." }),
});

export type LoginFormValues = z.infer<typeof LoginSchema>;

export const RegisterSchema = z
  .object({
    firstName: z.string().min(1, { message: "First name is required" }),
    lastName: z.string().min(1, { message: "Last name is required" }),
    email:
      // .email({ message: "Email is required" })
      unicodeEmail.transform((val) => val.toLowerCase()),
    password: z
      .string()
      .regex(passwordValidation, {
        message:
          "Password must contain at least 8 characters, one uppercase letter, one number, and one symbol.",
      })
      .min(8, { message: "Password must be at least 8 characters." }),
    accountType: z
      .array(z.union([z.literal("artist"), z.literal("organizer")]))
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
  email: unicodeEmail
    // z.email({ message: "Email is required" })
    .transform((val) => val.toLowerCase()),
  name: z.string().optional(),
  organizationName: z.string().optional(),
});

export type UpdateUserSchemaValues = z.infer<typeof UpdateUserSchema>;

export const ResendOtpSchema = z.object({
  email:
    // z.email({ message: "Email is required" })
    unicodeEmail.transform((val) => val.toLowerCase()),
});

export const VerifyOtpSchema = z.object({
  email: unicodeEmail
    // z.email({ message: "Email is required" })
    .transform((val) => val.toLowerCase()),
  otp: z.string().min(6, { message: "The code must be 6 digits" }),
});

export const ForgotPasswordSchema = z.object({
  email: unicodeEmail
    // z.email({ message: "Email is required" })
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
export const UpdatePasswordSchema = z
  .object({
    oldPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." })
      .regex(passwordValidation, {
        message:
          "Password must contain at least one uppercase letter, one number, and one symbol.",
      }),
    newPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." })
      .regex(passwordValidation, {
        message:
          "Password must contain at least one uppercase letter, one number, and one symbol.",
      }),
    repeatNewPassword: z
      .string()
      .regex(passwordValidation, {
        message:
          "Password must contain at least one uppercase letter, one number, and one symbol.",
      })
      .min(8, { message: "Password must be at least 8 characters." }),
  })
  .superRefine((data, ctx) => {
    if (data.newPassword !== data.repeatNewPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match",
        path: ["repeatNewPassword"],
      });
    }
    if (data.oldPassword === data.newPassword) {
      ctx.addIssue({
        code: "custom",
        message: "New password cannot be the same as the old one.",
        path: ["newPassword"],
      });
    }
  });

export type UpdatePasswordSchemaValues = z.infer<typeof UpdatePasswordSchema>;

export const ChangeEmailSchema = z.object({
  email: unicodeEmail.transform((val) => val.toLowerCase()),
  code: z.string().optional(),
});

export const VerifyEmailSchema = ChangeEmailSchema.extend({
  code: z.string().min(6, { message: "The code must be 6 digits" })
})

export const getChangeEmailSchema = (step: 1 | 2) => {
  if (step === 1) {
    return ChangeEmailSchema;
  }
  return VerifyEmailSchema;
};

export type EmailChangeValues = z.infer<
  ReturnType<typeof getChangeEmailSchema>
>;

