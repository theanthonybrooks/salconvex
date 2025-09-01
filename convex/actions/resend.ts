"use node";

import { generalStyling, newsletterStyling } from "@/constants/emailStyling";
import { NewsletterFrequency } from "@/constants/newsletter";
import { cleanInput } from "@/lib/utils";
import { html } from "common-tags";
import { ConvexError, v } from "convex/values";
import { capitalize } from "lodash";
import { Resend } from "resend";
import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";
import { action } from "../_generated/server";

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
        from: "The Street Art List <user@support.thestreetartlist.com>",
        to: "internal@thestreetartlist.com",
        subject: `${subject} from ${name}`,
        html: adminHtmlContent,
      });
      await resend.emails.send({
        from: "The Street Art List<user@support.thestreetartlist.com>",
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
export const sendNewsletterConfirmation = action({
  args: {
    firstName: v.string(),
    email: v.string(),
  },
  async handler(ctx, args) {
    const { firstName, email } = args;
    let subId: Id<"newsletter"> | null = null;
    let status: string = "unknown_error";

    try {
      const data = await ctx.runMutation(
        api.newsletter.subscriber.subscribeToNewsletter,
        {
          firstName,
          email,
        },
      );
      subId = data.subscriptionId ?? null;
      status = data.status;

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
            <title>Newsletter Signup Confirmation</title>

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
                          src="https://thestreetartlist.com/branding/newsletter/newsletter-logo.png"
                          alt="The Street Art List"
                          width="300"
                          style="display:block; margin:0 auto; padding-bottom:20px;"
                        />
                        <p
                          style="text-transform:uppercase; font-weight:bold; font-size:0.875rem; text-align:start; margin:30px 0"
                        >
                          Monthly Newsletter for The Street Art List
                        </p>
                        <hr />

                        <p
                          style="font-size:0.875rem; line-height:2; margin:0 0 20px; text-align:left;  "
                        >
                          Hey there, ${firstName}. You&apos;ve successfully
                          subscribed to the
                          <b
                            ><a
                              href="https://thestreetartlist.com"
                              target="_blank"
                              style="color:black; text-decoration:none; font-weight:bold;"
                              >The Street Art List</a
                            ></b
                          >
                          newsletter!
                        </p>
                        <h2
                          style="font-weight:bold; text-align:start; margin-top:30px"
                        >
                          What kinds of things can you expect?
                        </h2>
                        <p>
                          If this is your first time signing up for one of my
                          newsletters, welcome! Otherwise, welcome back! I took
                          some time off from the old newsletter to paint and to
                          build an entirely new website to house The Street Art
                          list. I'm still working on the new version of the
                          newsletter, which should be coming out soon!
                        </p>
                        <p>
                          The plan is, every month, I send out an update. What
                          you get depends on your membership. If you don't have
                          one, you'll receive general updates and changes on the
                          site, and upcoming events. No open calls, though. For
                          that, you would need to sign up for (at minimum) the
                          Banana plan (<a
                            href="https://thestreetartlist.com/pricing"
                            target="_blank"
                            >here</a
                          >)
                        </p>
                        <p>
                          The free newsletter will come out monthly, while the
                          paid version will be be up to the user's preference.
                          You will be able to set it to weekly or monthly
                          updates, whichever works best for you. You can
                          unsubscribe at any time or change your preferences at
                          any time. All previous newsletters will be available
                          in an archive on the site for any user with a
                          membership (from $3 upward) starting at the end of the
                          first week of each month.
                        </p>
                        <p style="margin-bottom:30px;">
                          Glad you&apos;re here and hope that you find my work
                          useful! If you have any thoughts, don&apos;t hesitate
                          to reach out to
                          <a href="mailto:heythere@thestreetartlist.com"
                            >heythere@thestreetartlist.com</a
                          >. I&apos;d love to your thoughts and feedback as it
                          helps me make the site better for everyone!
                        </p>
                        <span>
                          <p style="line-height:1;">
                            Thanks for reading and all the best,
                          </p>
                          <p style="line-height:1;">
                            <a
                              style="line-height:1.4; text-align:start;"
                              href="https://instagram.com/anthonybrooksart"
                              >Anthony</a
                            >
                          </p>
                        </span>
                        <hr />
                        <p>
                          Copyright © The Street Art List ${year}. All rights
                          reserved.
                        </p>
                        <p
                          style="font-size:13px; line-height:1.4; margin:0; text-align:center; font-family:'Space Grotesk', Helvetica, Arial, sans-serif; color:#666666;"
                        >
                          You are receiving this email because you or someone
                          with your email opted in via the newsletter signup
                          form. If you didn&apos;t sign up or no longer wish to
                          receive emails, you can unsubscribe
                          <a
                            href="https://thestreetartlist.com/newsletter?subscription=${subId}"
                            target="_blank"
                            style=" text-decoration:underline; font-family:'Space Grotesk', Helvetica, Arial, sans-serif;"
                            >here</a
                          >.
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
          from: "The Street Art List<newsletter@support.thestreetartlist.com>",
          to: email,
          subject: "Newsletter Signup Confirmation",
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

export const sendNewsletterUpdateConfirmation = action({
  args: {
    newsletter: v.boolean(),
    frequency: v.union(v.literal("monthly"), v.literal("weekly")),
    email: v.string(),
    userPlan: v.number(),
  },
  async handler(
    ctx,
    args,
  ): Promise<{
    success: boolean;
    canceled: boolean;
    frequency: NewsletterFrequency;
  }> {
    const { newsletter, frequency, email, userPlan } = args;
    let subId: Id<"newsletter"> | null = null;

    let canceled: boolean = false;
    let resultFrequency: NewsletterFrequency = "monthly";

    try {
      const result = await ctx.runMutation(
        api.newsletter.subscriber.updateNewsletterStatus,
        {
          newsletter,
          frequency,
          email,
          userPlan,
        },
      );

      canceled = result.canceled ?? false;
      resultFrequency = result.frequency ?? "monthly";

      // frequency = result.frequency ?? "monthly";
      // status = result.status

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
              Newsletter ${newsletter ? "Update " : "Cancellation "}
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
                          src="https://thestreetartlist.com/branding/newsletter/newsletter-logo.png"
                          alt="The Street Art List"
                          width="300"
                          style="display:block; margin:0 auto; padding-bottom:20px;"
                        />
                        <p
                          style="text-transform:uppercase; font-weight:bold; font-size:0.875rem; text-align:start; margin:30px 0"
                        >
                          Monthly Newsletter for The Street Art List
                        </p>
                        <hr />

                        <p
                          style="font-size:0.875rem; line-height:2; margin:0 0 20px; text-align:left;  "
                        >
                          You&apos;ve successfully unsubscribed from the
                          <b
                            ><a
                              href="https://thestreetartlist.com"
                              target="_blank"
                              style="color:black; text-decoration:none; font-weight:bold;"
                              >The Street Art List</a
                            ></b
                          >
                          newsletter ${newsletter ? "!" : "."}
                        </p>

                        <hr />
                        <p>
                          Copyright © The Street Art List ${year}. All rights
                          reserved.
                        </p>

                        ${newsletter &&
                        `  <p
                          style="font-size:13px; line-height:1.4; margin:0; text-align:center; font-family:'Space Grotesk', Helvetica, Arial, sans-serif; color:#666666;"
                        >
                          If you didn&apos;t sign up or no longer wish to
                          receive emails, you can unsubscribe
                          <a
                            href="https://thestreetartlist.com/newsletter?subscription=${subId}"
                            target="_blank"
                            style=" text-decoration:underline; font-family:'Space Grotesk', Helvetica, Arial, sans-serif;"
                            >here</a
                          >.
                        </p>`}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `;

      if (canceled) {
        await resend.emails.send({
          from: "The Street Art List<newsletter@support.thestreetartlist.com>",
          to: email,
          subject: "Newsletter Cancellation Confirmation",
          html: htmlContent,
        });
      }

      return { success: true, canceled, frequency: resultFrequency };
    } catch (error) {
      console.error("Failed to send message:", error);
      throw new ConvexError("Could not send message. Please try again.");
    }
  },
});
