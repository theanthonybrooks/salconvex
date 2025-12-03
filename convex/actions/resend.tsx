"use node";

import { generalStyling, newsletterStyling } from "@/constants/emailStyling";

import { html } from "common-tags";
import { capitalize } from "lodash";
import { Resend } from "resend";

import { cleanInput } from "@/helpers/utilsFns";

import { api } from "~/convex/_generated/api";
import { ConvexError, v } from "convex/values";
import { action, internalAction } from "../_generated/server";

const resend = new Resend(process.env.AUTH_RESEND_KEY);

const year = new Date().getFullYear();

export const sendSupportEmail = action({
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
      const userHtmlContent = html`
           <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta http-equiv="Content-Type" content="text/html charset=UTF-8" />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0"
            />
            <title>Support Form Submission</title>
            ${generalStyling}
          </head>

          <body style="margin:0; padding:20px;">
            <table
              role="presentation"
              width="100%"
              cellpadding="0"
              cellspacing="0"
              border="0"
            >
              <tr>
                <td align="center" ">
                  <table
                    role="presentation"
                    width="600"
                    cellpadding="0"
                    cellspacing="0"
                    border="0"
                    style="background:#ffffff; border:4px solid #000000; border-radius:8px; box-shadow:-10px 10px #000000;"
                  >
                    <tr>
                      <td style="padding:40px 40px 10px 40px; font-family:sans-serif;">
                        <h1
                          style="font-size:1.5rem; text-align:center; margin:0 0 20px; font-weight:bold"
                        >
                          Support Ticket #${ticketNumber}
                        </h1>
                        <p style="font-size:1rem; text-align:center;">
                          Hey there, here's a copy of your support form
                          submission.
                        </p>
                        <p style="margin-top:30px;"><b>Ticket #: </b>${ticketNumber}</p>
                        <p><b>Name:</b> ${name}</p>
                        <p><b>Email:</b> ${email}</p>
                        <p>
                          <b>Category:</b> ${capitalize(category)}
                        </p>
                        <p><b>Message:</b> ${message}</p>
                        <p style="margin-top:30px;">Note: You can check the status of this ticket at any time via <a href="https://thestreetartlist.com/support?ticketNumber=${ticketNumber}">this link</a>.</p>

                        <p
                          style="font-size:0.875rem; text-align:center; margin-top:40px; "
                        >
                          Please keep the ticket number for future reference of this issue.
                        </p>
                        <p
                          style="font-size:0.875rem; text-align:center; margin-top:0px; color:#999999;"
                        >
                          If you did not request this email, please ignore this
                          message.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `;
      const adminHtmlContent = html`
         <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta http-equiv="Content-Type" content="text/html charset=UTF-8" />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0"
            />
            <title>Support Form Submission</title>
            ${generalStyling}
          </head>

          <body style="margin:0; padding:20px;">
            <table
              role="presentation"
              width="100%"
              cellpadding="0"
              cellspacing="0"
              border="0"
            >
              <tr>
                <td align="center" ">
                  <table
                    role="presentation"
                    width="600"
                    cellpadding="0"
                    cellspacing="0"
                    border="0"
                    style="background:#ffffff; border:4px solid #000000; border-radius:8px; box-shadow:-10px 10px #000000;"
                  >
                    <tr>
                      <td style="padding:40px 40px 20px ; font-family:sans-serif;">
                        <h1
                          style="font-size:1.5rem; text-align:center; margin:0 0 20px; font-weight:bold"
                        >
                         New  Support Ticket #${ticketNumber}
                        </h1>
                        <p style="font-size:1rem; text-align:center;">
                          Ahoy there! Seems ya have some problems on the site.
                        </p>
                        <p style="font-size:0.7rem; text-align:center;">(Fix em before they get worse!)</p>
                        <p style="margin-top:30px;"><b>Ticket #: </b>${ticketNumber}</p>
                        <p><b>Name:</b> ${name}</p>
                          <b>Category:</b> ${capitalize(category)}
                        </p>
                           ${userId ? `<p><b>User Id:</b> <a href="${convexDBUrl}/data?table=users&id=${userId}" target="_blank">${userId}</a></p>` : ""}
                        <p><b>Email:</b> ${email}</p>
                        <p>
                        <p><b>Message:</b> ${message}</p>

                        
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
        from: "The Street Art List <internal@support.thestreetartlist.com>",
        to: "internal@thestreetartlist.com",
        subject: `${subject} from ${name}`,
        html: adminHtmlContent,
      });
      await resend.emails.send({
        from: "The Street Art List<do-not-reply@support.thestreetartlist.com>",
        to: email,
        subject: "Form Submission Copy - Ticket #" + ticketNumber,
        html: userHtmlContent,
      });

      return { success: true };
    } catch (error) {
      console.error("Failed to send message:", error);
      throw new ConvexError("Could not send message. Please try again.");
    }
  },
});

export const sendEventRegistrationEmail = internalAction({
  args: {
    eventId: v.id("onlineEvents"),
    userId: v.id("users"),
    email: v.string(),
    action: v.union(
      v.literal("register"),
      v.literal("cancel"),
      v.literal("renew"),
    ),
  },
  handler: async (ctx, args) => {
    const { email, eventId, userId, action } = args;
    let status: string = "unknown_error";

    try {
      const userData = await ctx.runQuery(api.users.getUserById, {
        id: userId,
      });

      if (!userData) {
        throw new ConvexError({ message: "User not found", data: userId });
      }

      const firstName = userData.firstName;
      const userPlan = userData.plan ?? 0;
      const bananaCap = userPlan >= 2;

      const result = await ctx.runQuery(
        api.userAddOns.onlineEvents.getOnlineEvent,
        { eventId },
      );

      if (!result.data) {
        throw new ConvexError({ message: "Event not found", data: eventId });
      }
      const eventData = result.data;
      status = "success";
      const eventName = eventData.name;
      const eventStart = eventData.startDate;
      const now = Date.now();
      const seventyTwoHours = 72 * 60 * 60 * 1000;
      const atLeastSeventyTwoHours = now <= eventStart - seventyTwoHours;

      const renewalHtmlContent = html`
        <h3
          style="font-weight:bold; text-align:start; margin-top:30px; margin-bottom:10px;"
        >
          Plans change, and we're glad to have you back!
        </h3>
        ${bananaCap
          ? ` <p>
          Since you&apos;re already subscribed with at least a Banana Cap
          membership, you can follow the link below to cancel your registration in case things come up again. And if you do, you can re-register again at any point if you change your mind and there are available spots!
        </p><p >Please just do so within 72 hours of the event's start to ensure that the spaces can go to someone else.</p>`
          : ` <p>
          You can cancel up to 72 hours before the event starts to have your registration fee refunded in the form of a voucher (can be used for other events). Anything after that 72 hours will forfeit your registration fee. To cancel, ensure that you're logged in to your account and follow the link below.
        </p>`}
      `;
      const registrationHtmlContent = html`
        <h3
          style="font-weight:bold; text-align:start; margin-top:30px; margin-bottom:10px;"
        >
          What if plans change and I can't make it?
        </h3>
        ${bananaCap
          ? ` <p>
          Since you&apos;re already subscribed with at least a Banana Cap
          membership, you can follow the link below to cancel your registration. Please just do so within 72 hours of the event's start to ensure that the spaces can go to someone else. And if you change your mind and there are still available spots, you can re-register again!  
        </p>`
          : ` <p>
          You can cancel up to 72 hours before the event starts to have your registration fee refunded in the form of a voucher (can be used for other events). Anything after that 72 hours will forfeit your registration fee. To cancel, ensure that you're logged in to your account and follow the link below.
        </p>`}
      `;
      const cancellationHtmlContent = html`
        <h3
          style="font-weight:bold; text-align:start; margin-top:30px; margin-bottom:10px;"
        >
          What if plans change? Can I register again?
        </h3>
        ${bananaCap
          ? ` <p>
          Since you&apos;re already subscribed with at least a Banana Cap
          membership, you can follow the link below to re-register for the event free of charge (if there are still available spots). 
        </p>`
          : ` <p>
          ${atLeastSeventyTwoHours ? `Your previous registration fee was added to your account as a voucher that can be used for another event in the future, or for this event if you change your mind (if there are available spots)` : `As you cancelled with less than 72 hours prior to the start of the event, your registration fee will not be returned as per the terms of the event, agreed upon during registration. `} 
        </p>`}
      `;

      const htmlContent = html`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta
              http-equiv="Content-Type"
              content="text/html; charset=UTF-8"
            />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0"
            />
            <title>
              ${eventName}
              ${action === "cancel"
                ? "Cancellation"
                : action === "register"
                  ? "Registration"
                  : "Renewal"}
              Confirmation
            </title>

            <link
              href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&display=swap"
              rel="stylesheet"
            />
            ${newsletterStyling}
          </head>
          <body style="margin:0; padding:20px; background-color:#ffe770; ">
            <table
              role="presentation"
              border="0"
              cellpadding="0"
              cellspacing="0"
              width="100%"
            >
              <tr>
                <td align="center">
                  <table
                    role="presentation"
                    border="0"
                    cellpadding="0"
                    cellspacing="0"
                    width="600"
                    class="container"
                  >
                    <tr>
                      <td
                        class="content"
                        style="padding:40px; text-align:center;"
                      >
                        <img
                          src="https://thestreetartlist.com/branding/resources/extras-heading.png"
                          alt="The Street Art List"
                          width="300"
                          style="display:block; margin:0 auto; padding-bottom:20px;"
                        />
                        <h2
                          style="text-transform:uppercase; font-weight:bold; font-size:1.2rem; text-align:start; margin:30px 0"
                          class="heading"
                        >
                          ${action === "cancel"
                            ? "Cancellation"
                            : action === "register"
                              ? "Registration"
                              : "Renewal"}
                          Confirmation
                        </h2>
                        <hr />

                        <p
                          style="font-size:0.875rem; line-height:2; margin:0 0 20px; text-align:left;  "
                        >
                          Hey there, ${firstName}. You&apos;ve successfully
                          ${action === "cancel"
                            ? "cancelled your registration"
                            : action === "register"
                              ? "registered"
                              : "renewed your registration"}
                          for the upcoming ${eventName} on
                          <b
                            ><a
                              href="https://thestreetartlist.com"
                              target="_blank"
                              style="color:black; text-decoration:none; font-weight:bold;"
                              >The Street Art List</a
                            ></b
                          >!
                        </p>
                        ${action === "cancel"
                          ? cancellationHtmlContent
                          : action === "register"
                            ? registrationHtmlContent
                            : renewalHtmlContent}

                        <p>
                          Registration update link: (<a
                            href="https://thestreetartlist.com/resources/${eventData.slug}"
                            target="_blank"
                            style="color:black; text-decoration:none; font-weight:bold;"
                            >here</a
                          >)
                        </p>
                        <p>
                          You can reply to this email if you have any questions.
                        </p>
                        <hr />
                        <p style="width:100%; text-align:center;">
                          Copyright © The Street Art List ${year}. All rights
                          reserved.
                        </p>
                        <p
                          style="font-size:12px; line-height:1.4; margin:0; text-align:center; font-family:'Space Grotesk', Helvetica, Arial, sans-serif; color:#666666;"
                        >
                          You are receiving this email because you or someone
                          with your email registered for an event on The Street
                          Art List. If you didn&apos;t request this, please
                          contact us so we can avoid sending you this email in
                          the future.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `;

      if (status === "success") {
        await resend.emails.send({
          from: "The Street Art List<events@support.thestreetartlist.com>",
          to: email,
          subject: `${eventName} - ${
            action === "cancel"
              ? "Cancellation"
              : action === "register"
                ? "Registration"
                : "Renewal"
          } Confirmation`,
          html: htmlContent,
        });
      }

      return { success: true, status };
    } catch (error) {
      console.error("Failed to send message:", error);
      throw new ConvexError("Could not send message. Please try again.");
    }
  },
});
