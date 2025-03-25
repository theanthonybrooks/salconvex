import Resend from "@auth/core/providers/resend"
import { alphabet, generateRandomString } from "oslo/crypto"
import { Resend as ResendAPI } from "resend"

export const ResendOTP = Resend({
  id: "resend-otp",
  apiKey: process.env.AUTH_RESEND_KEY,
  maxAge: 60 * 15, // 15 minutes

  async generateVerificationToken() {
    return generateRandomString(6, alphabet("0-9"))
  },
  async sendVerificationRequest({
    identifier: email,
    provider,
    token,
    // expires,
  }) {
    const resend = new ResendAPI(provider.apiKey)

    // console.log("expires", expires)
    const expirationTime = Date.now() + 15 * 60 * 1000
    const validHours = Math.floor((expirationTime - Date.now()) / (60 * 1000))

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
                  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                  padding: 20px;
              }
              .heading {
                  font-size: 1.5rem;
                  font-weight: bold;
                  margin-bottom: 1rem;
                  margin-block: auto;

              }
              .text-sm {
                  font-size: 0.875rem;
                  margin-bottom: 1rem;
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
              <div class="heading">The Street Art List</div>
              <div class="text-sm">Please enter the following code to finish signing up.</div>
              <div class="section">
                  <div class="subtext">Verification code</div>
                  <div class="verification-code">${token}</div>
                  <div class="subtext">(This code is valid for ${validHours} minutes)</div>
              </div>
              <div class="section">
                  <div class="subtext">If you did not request this email, please ignore this message.</div>
              </div>
          </div>
      </body>
      </html>
    `

    const { error } = await resend.emails.send({
      from: "The Street Art List <hello@support.streetartlist.com>",
      to: [email],
      subject: `${token} is your verification code`,
      html: htmlContent,
    })

    if (error) {
      throw new Error("Could not send verification email")
    }
  },
})
