"use node";

import { cleanInput } from "@/lib/utils";
import { ConvexError, v } from "convex/values";
import { capitalize } from "lodash";
import { Resend } from "resend";
import { api } from "~/convex/_generated/api";
import { action } from "../_generated/server";

const resend = new Resend(process.env.AUTH_RESEND_KEY);

export const sendEmail = action({
  args: {
    userId: v.union(v.id("users"), v.null()),
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    category: v.string(),
    message: v.string(),
  },
  async handler(ctx, args) {
    const { userId, name, email, subject, category } = args;
    const message = cleanInput(args.message);
    const convexDBUrl = process.env.CONVEX_DASHBOARD_URL;

    console.log(convexDBUrl);

    if (message.trim().length === 0) {
      throw new ConvexError({
        field: "message",
        message: "Message cannot be empty",
      });
    }

    try {
      const data = await ctx.runMutation(api.admin.createSupportTicket, {
        userId,
        name,
        email,
        category,
        message,
      });

      const ticketNumber = data?.ticketNumber;
      const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify your email</title>
         
      </head>
    
      <body style="margin:0; padding:0; background-color:#f9fafb;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="padding:20px 0;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" 
               style="background:#ffffff; border:4px solid #000000; border-radius:8px; box-shadow:-10px 10px #000000;">
          <tr>
            <td style="padding:40px; font-family:sans-serif;">
              <h1 style="font-size:1.5rem; text-align:center; margin:0 0 20px;">Support Ticket #${ticketNumber}</h1>
              <p style="font-size:1rem; text-align:center;">Hey there, here's a copy of your support form submission.</p>
              <p><strong>Ticket #: </strong>${ticketNumber} </p>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Category:</strong> ${capitalize(category)}</p>
              <p><strong>Message:</strong> ${message}</p>

              <p style="font-size:0.875rem; text-align:center; margin-top:20px;">If you did not request this email, please ignore this message.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
      </html>
    `;

      await resend.emails.send({
        from: "The Street Art List <user@support.thestreetartlist.com>",
        to: "internal@thestreetartlist.com",
        subject: `${subject} from ${name}`,
        html: `
     <p >Ahoy there! Seems ya have some problems on the site. Fix em before they get worse!</p>
     <p ><strong>Ticket #${ticketNumber}:</strong> </p>
       <p><strong>Name:</strong> ${name}</p>
       <p><strong>Category:</strong> ${capitalize(category)}</p>
       ${userId ? `<p><strong>User Id:</strong> <a href="${convexDBUrl}/data?table=users&id=${userId}" target="_blank">${userId}</a></p>` : ""}
       <p><strong>Email:</strong> ${email}</p>
    
       <p><strong>Message:</strong> ${message}</p>
     `,
      });
      await resend.emails.send({
        from: "The Street Art List<user@support.thestreetartlist.com>",
        to: email,
        subject: "Form Submission Copy - Ticket #" + ticketNumber,
        html: htmlContent,
      });

      return { success: true };
    } catch (error) {
      console.error("Failed to send message:", error);
      throw new ConvexError("Could not send message. Please try again.");
    }
  },
});
