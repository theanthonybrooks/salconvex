"use node";

import { newsletterStyling } from "@/constants/emailStyling";
import {
  NewsletterFrequency,
  NewsletterType,
} from "@/constants/newsletterConsts";

import { pretty, render } from "@react-email/render";
import { html } from "common-tags";
import { Resend } from "resend";

import type { Id } from "~/convex/_generated/dataModel";
import RecentLoginEmail, {
  TestNewsletterEmail,
} from "@/components/email/newsletter/templates/test-email-template";

import { Resend as ResendComponent } from "@convex-dev/resend";
import { api, components, internal } from "~/convex/_generated/api";
import {
  newsletterFrequencyValidator,
  newsletterTypeValidator,
} from "~/convex/schema";
import { ConvexError, v } from "convex/values";
import { action } from "../_generated/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export const resendComponent: ResendComponent = new ResendComponent(
  components.resend,
  {
    testMode: false,
    onEmailEvent: internal.newsletter.emails.handleEmailEvent,
  },
);

const year = new Date().getFullYear();

export const sendTestEmail = action({
  args: {
    userFirstName: v.string(),
    loginDate: v.number(),
    loginDevice: v.optional(v.string()),
    loginLocation: v.optional(v.string()),
    loginIp: v.optional(v.string()),
  },
  async handler(ctx, args) {
    const { userFirstName, loginDate, loginDevice, loginLocation, loginIp } =
      args;

    const html = await pretty(
      await render(
        <RecentLoginEmail
          userFirstName={userFirstName}
          loginDate={loginDate}
          loginDevice={loginDevice}
          loginLocation={loginLocation}
          loginIp={loginIp}
        />,
      ),
    );

    await resendComponent.sendEmail(ctx, {
      from: "The Street Art List <hello@support.thestreetartlist.com>",
      to: "testing@thestreetartlist.com",
      subject: "test subject blahblahblah",
      html,
    });
  },
});

export const sendNewsletter = action({
  args: {
    type: newsletterTypeValidator,
    frequency: newsletterFrequencyValidator,
    plan: v.union(v.literal(0), v.literal(1), v.literal(2), v.literal(3)),
    sender: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const senderName = args.sender ?? "do-not-reply";
    const audienceDocs = await ctx.runQuery(
      api.newsletter.subscriber.getAudience,
      args,
    );
    for (const subscriber of audienceDocs) {
      console.log("subscriber", subscriber);
      const html = await pretty(
        await render(
          <TestNewsletterEmail
            userFirstName={subscriber.firstName}
            email={subscriber.email}
            plan={subscriber.userPlan ?? 0}
          />,
        ),
      );

      await resendComponent.sendEmail(ctx, {
        from: `The Street Art List <${senderName}@newsletter.thestreetartlist.com>`,
        to: subscriber.email,
        subject: "test newsletter",
        html,
      });
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
                          unsubscribe or change your preferences at any time.
                          All previous newsletters will be available in an
                          archive on the site for any user with a membership
                          (from $3 upward) starting at the end of the first week
                          of each month.
                        </p>
                        <p style="margin-bottom:30px;">
                          Glad you&apos;re here and hope that you find my work
                          useful! If you have any thoughts, don&apos;t hesitate
                          to reach out to
                          <a href="mailto:feedback@thestreetartlist.com"
                            >feedback@thestreetartlist.com</a
                          >. I&apos;d love to hear your thoughts and feedback as
                          it helps me make the site better for everyone!
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
                        <p style="width:100%; text-align:center;">
                          Copyright © The Street Art List ${year}. All rights
                          reserved.
                        </p>
                        <p
                          style="font-size:12px; line-height:1.4; margin:0; text-align:center; font-family:'Space Grotesk', Helvetica, Arial, sans-serif; color:#666666;"
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
          from: "The Street Art List<do-not-reply@newsletter.thestreetartlist.com>",
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
    frequency: v.optional(v.union(v.literal("monthly"), v.literal("weekly"))),
    type: v.optional(
      v.array(v.union(v.literal("openCall"), v.literal("general"))),
    ),
    email: v.string(),
  },
  async handler(
    ctx,
    args,
  ): Promise<{
    success: boolean;
    canceled: boolean;
    frequency: NewsletterFrequency;
    type: NewsletterType[];
  }> {
    const { newsletter, frequency, email, type } = args;
    let subId: Id<"newsletter"> | null = null;

    let canceled: boolean = false;
    let resultFrequency: NewsletterFrequency = "monthly";
    let resultType: NewsletterType[] = [];

    try {
      const result = await ctx.runMutation(
        api.newsletter.subscriber.updateNewsletterStatus,
        {
          newsletter,
          frequency,
          type,
          email,
        },
      );

      canceled = result.canceled ?? false;
      resultFrequency = result.frequency ?? "monthly";
      resultType = result.type ?? [];

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
                        <p style="width:100%; text-align:center;">
                          Copyright © The Street Art List ${year}. All rights
                          reserved.
                        </p>

                        ${newsletter &&
                        `  <p
                          style="font-size:12px; line-height:1.4; margin:0; text-align:center; font-family:'Space Grotesk', Helvetica, Arial, sans-serif; color:#666666;"
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
          from: "The Street Art List<do-not-reply@newsletter.thestreetartlist.com>",
          to: email,
          subject: "Newsletter Cancellation Confirmation",
          html: htmlContent,
        });
      }

      return {
        success: true,
        canceled,
        frequency: resultFrequency,
        type: resultType,
      };
    } catch (error) {
      console.error("Failed to send message:", error);
      throw new ConvexError("Could not send message. Please try again.");
    }
  },
});
//   userFirstName,
//   loginDate,
//   loginDevice,
//   loginLocation,
//   loginIp,
