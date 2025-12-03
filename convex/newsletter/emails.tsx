import { vOnEmailEventArgs } from "@convex-dev/resend";
import { internalMutation } from "~/convex/_generated/server";

export const handleEmailEvent = internalMutation({
  args: vOnEmailEventArgs,
  handler: async (ctx, args) => {
    const { id, event } = args;
    console.log(
      `Email event: ${id}, Type: ${event.type}, CreatedAt: ${event.created_at}`,
    );
    //todo: use the event type to handle a field in the newsletter table (existing or new) to show the current status for that user/the current email. I think it should maybe have a campaign table that then opens a secondary table with the recipents of that specific campaign and when they received it (and their actions thereafter). created_at should be used to update a lastUpdatedAt field on the campaign table.
    // Handle however you want
    // args provides { id: EmailId; event: EmailEvent; }
    // see /example/example.ts
  },
});
