import { generalStyling } from "@/constants/emailStyling";

import { html } from "common-tags";

type EmailVerificationProps = {
  token: string;
  validMin: number;
  purpose?: "signup" | "update";
};
export const getEmailVerificationBase = ({
  token,
  validMin,
  purpose = "signup",
}: EmailVerificationProps) => {
  return html`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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
                      src="https://thestreetartlist.com/saltext.png"
                      alt="The Street Art List"
                      width="300"
                      style="display:block; margin:0 auto; padding-bottom:20px;"
                    />

                    <p
                      style="font-size:0.875rem; margin:0 0 20px; text-align:center; color:#333333;"
                    >
                      Please enter the following code to continue
                      ${purpose === "update"
                        ? "updating your account"
                        : "signing up"}.
                    </p>

                    <p
                      style="font-size:1rem; margin:0 0 10px; text-align:center; color:#333333;"
                    >
                      Verification code:
                    </p>
                    <h1
                      style="font-size:2.5rem; font-weight:bold; margin:10px 0; text-align:center; color:#000000;"
                    >
                      ${token}
                    </h1>
                    <p
                      style="font-size:0.875rem; margin:0 0 20px; text-align:center; color:#666666;"
                    >
                      (This code is valid for ${validMin} minutes)
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
};
