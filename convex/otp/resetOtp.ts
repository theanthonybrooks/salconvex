import { generalStyling } from "@/constants/emailStyling";
import { generateNumericToken } from "@/helpers/otpFns";
import Resend from "@auth/core/providers/resend";
import { html } from "common-tags";
import { Resend as ResendAPI } from "resend";

export const ResetOTP = Resend({
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
    const validMins = Math.floor((expirationTime - Date.now()) / (60 * 1000));

    const htmlContent = html`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>Password Reset</title>
          ${generalStyling}
        </head>
        <body style="margin:0; padding:20px; ; font-family:sans-serif;">
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
                  style="background-color:#ffffff; border-radius:8px; border:4px solid #000000; box-shadow:-10px 10px #000000;"
                >
                  <tr>
                    <td
                      style="padding:40px 20px; text-align:center; font-family:sans-serif;"
                    >
                      <img
                        src="https://thestreetartlist.com/forgot-pw.png"
                        alt="The Street Art List"
                        width="300"
                        style="display:block; margin:0 auto; padding-bottom:20px;"
                      />

                      <p
                        style="font-size:14px; margin:0 0 20px; text-align:center; color:#333333;"
                      >
                        Please enter the following code to continue resetting
                        your password.
                      </p>

                      <p
                        style="font-size:16px; margin:0 0 10px; text-align:center; color:#333333;"
                      >
                        Password reset code
                      </p>
                      <p
                        style="font-size:2.5rem; font-weight:bold; margin:10px 0; text-align:center; color:#000000;"
                      >
                        ${token}
                      </p>
                      <p
                        style="font-size:14px; margin:0 0 20px; text-align:center; color:#666666;"
                      >
                        (This code is valid for ${validMins} minutes)
                      </p>
                      <p
                        style="font-size:12px; margin-top:20px; text-align:center; color:#999999;"
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

    const { error } = await resend.emails.send({
      from: "The Street Art List <help@support.thestreetartlist.com>",
      to: [email],
      subject: `${token} is your reset code`,
      html: htmlContent,
    });

    if (error) {
      throw new Error("Could not send verification email");
    }
  },
});
