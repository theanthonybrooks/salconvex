import Resend from "@auth/core/providers/resend"
import { alphabet, generateRandomString } from "oslo/crypto"
import { Resend as ResendAPI } from "resend"

export const ResendOTP = Resend({
  id: "resend-otp",
  apiKey: process.env.AUTH_RESEND_KEY,
  async generateVerificationToken() {
    return generateRandomString(6, alphabet("0-9"))
  },
  async sendVerificationRequest({ identifier: email, provider, token }) {
    const resend = new ResendAPI(provider.apiKey)
    const { error } = await resend.emails.send({
      from: "My App <onboarding@resend.dev>",
      to: [email],
      subject: `Verify your email for My App`,
      text: "Your verification code is " + token,
    })

    if (error) {
      throw new Error("Could not send verification email")
    }
  },
})

// import { Email } from "@convex-dev/auth/providers/Email"
// import { alphabet, generateRandomString } from "oslo/crypto"
// import { Resend as ResendAPI } from "resend"
// import { VerificationCodeEmail } from "./verificationCodeEmail"

// export const ResendOTP = Email({
//   id: "resend-otp",
//   apiKey: process.env.AUTH_RESEND_KEY,
//   maxAge: 60 * 20,
//   async generateVerificationToken() {
//     return generateRandomString(8, alphabet("0-9"))
//   },
//   async sendVerificationRequest({
//     identifier: email,
//     provider,
//     token,
//     expires,
//   }) {
//     const resend = new ResendAPI(provider.apiKey)
//     const { error } = await resend.emails.send({
//       from:
//         process.env.AUTH_EMAIL ?? "The Street Art List <onboarding@resend.dev>",
//       to: [email],
//       subject: `Sign in to The Street Art List`,
//       react: VerificationCodeEmail({ code: token, expires }),
//     })

//     if (error) {
//       throw new Error(JSON.stringify(error))
//     }
//   },
// })
