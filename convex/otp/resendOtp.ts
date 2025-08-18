import { generateNumericToken } from "@/lib/otpFns";
import Resend from "@auth/core/providers/resend";
import { Resend as ResendAPI } from "resend";

export const ResendOTP = Resend({
  id: "resend-otp",
  apiKey: process.env.AUTH_RESEND_KEY,
  maxAge: 60 * 15, // 15 minutes

  async generateVerificationToken() {
    return generateNumericToken(6);
  },
  async sendVerificationRequest({
    identifier: email,
    provider,
    token,
    // expires,
  }) {
    const resend = new ResendAPI(provider.apiKey);

    // console.log("expires", expires)
    const expirationTime = Date.now() + 15 * 60 * 1000;
    const validMin = Math.floor((expirationTime - Date.now()) / (60 * 1000));

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify your email</title>
          <style>
              body {
                  font-family: sans-serif;
                  padding: 20px;
                  background-color: #f9fafb;
              }
              .container {
                  max-width: 600px;
                  margin: auto;
                  background-color: #ffffff;
                  border-radius: 8px;
                  border: 4px solid #000000;
                 box-shadow: -10px 10px #000000;
                  padding: 40px 0;
              }
              .heading {
                  font-size: 1.5rem;
                  font-weight: bold;
                  margin-bottom: 1rem;
                  margin-block: auto;
                  text-align:center;

              }
              .text-sm {
                  font-size: 0.875rem;
                  margin-bottom: 1rem;
                  text-align:center;
              }
              .section {
                  text-align: center;
                  margin-top: 2rem;
              }
              .verification-code {
                  font-size: 2.5rem;
                  font-weight: bold;
                  margin: 1rem 0;
              }
              .subtext {
                  font-size: 1rem;
              }
          </style>
      </head>
      <body>
          <div class="container">
          
              <img src="https://thestreetartlist.com/saltext.png" alt="The Street Art List" width="300" height="auto" style="display: block; margin: 0 auto; padding-bottom:20px;">
              <div class="text-sm">Please enter the following code to finish signing up.</div>
              <div class="section">
                  <div class="subtext">Verification code</div>
                  <div class="verification-code">${token}</div>
                  <div class="subtext">(This code is valid for ${validMin} minutes)</div>
              </div>
              <div class="section">
                  <div class="subtext">If you did not request this email, please ignore this message.</div>
              </div>
          </div>
      </body>
      </html>
    `;

    const { error } = await resend.emails.send({
      from: "The Street Art List <hello@support.thestreetartlist.com>",
      to: [email],
      subject: `${token} is your verification code`,
      html: htmlContent,
    });

    if (error) {
      throw new Error("Could not send verification email");
    }
  },
});
