import z from "zod";

export const CancelSubDialogSchema = z.object({
  reason: z
    .string()
    .min(1, { message: "Users must select a reason for cancellation." }),

  comment: z.string(),
});
//   .superRefine((data, ctx) => {
//     if (data.newPassword !== data.repeatNewPassword) {
//       ctx.addIssue({
//         code: "custom",
//         message: "Passwords do not match",
//         path: ["repeatNewPassword"],
//       });
//     }
//     if (data.oldPassword === data.newPassword) {
//       ctx.addIssue({
//         code: "custom",
//         message: "New password cannot be the same as the old one.",
//         path: ["newPassword"],
//       });
//     }
//   });

export type CancelSubDialogSchemaValues = z.infer<typeof CancelSubDialogSchema>;
