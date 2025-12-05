import Resend from "@auth/core/providers/resend";
import { Resend as ResendAPI } from "resend";

import { getEmailVerificationBase } from "@/helpers/emailFns";
import { generateNumericToken } from "@/helpers/otpFns";

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

    const expirationTime = Date.now() + 15 * 60 * 1000;
    const validMin = Math.floor((expirationTime - Date.now()) / (60 * 1000));

    const htmlContent = getEmailVerificationBase({ token, validMin });
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
