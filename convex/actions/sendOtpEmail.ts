"use node"

import { v } from "convex/values"
import { Resend } from "resend"
import { action } from "../_generated/server"

const resend = new Resend(process.env.AUTH_RESEND_KEY)

export const sendOtpEmail = action({
  args: { email: v.string(), otp: v.string() },
  async handler(ctx, { email, otp }) {
    console.log(`Sending OTP to ${email}`)

    try {
      await resend.emails.send({
        from: "My App <hello@support.streetartlist.com>",
        to: email,
        subject: "Your OTP Code",
        text: `Your one-time password (OTP) is: ${otp}. It expires in 5 minutes.`,
      })

      console.log(`OTP sent to ${email}`)
      return { success: true }
    } catch (error) {
      console.error("Failed to send OTP:", error)
      throw new Error("Could not send OTP. Please try again.")
    }
  },
})
