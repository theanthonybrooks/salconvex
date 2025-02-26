import { Email } from "@convex-dev/auth/providers/Email"
import { alphabet, generateRandomString } from "oslo/crypto"
import { Resend as ResendAPI } from "resend"

export const ResendOTP = Email({
  id: "resend-otp",
  apiKey: process.env.AUTH_RESEND_KEY,
  maxAge: 60 * 15, // 15 minutes
  async generateVerificationToken() {
    return generateRandomString(6, alphabet("0-9"))
  },
  async sendVerificationRequest({ identifier: email, provider, token }) {
    const resend = new ResendAPI(provider.apiKey)
    const { error } = await resend.emails.send({
      from: "My App <onboarding@resend.dev>",
      to: [email],
      subject: `Sign in to My App`,
      text: "Your code is " + token,
    })

    if (error) {
      throw new Error(JSON.stringify(error))
    }
  },
})
