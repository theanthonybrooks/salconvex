import Resend from "@auth/core/providers/resend";
import { alphabet, generateRandomString } from "oslo/crypto";
import { Resend as ResendAPI } from "resend";

export const ResetOTP = Resend({
  id: "resend-otp",
  apiKey: process.env.AUTH_RESEND_KEY,
  maxAge: 60 * 15, // 15 minutes

  async generateVerificationToken() {
    return generateRandomString(6, alphabet("0-9"));
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
    const validHours = Math.floor((expirationTime - Date.now()) / (60 * 1000));

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
              <img src="https://thestreetartlist.com/forgot-pw.png" alt="The Street Art List" width="300" height="auto" style="display: block; margin: 0 auto; padding-bottom:20px;">
              <div class="text-sm">Please enter the following code to proceed to password reset.</div>
              <div class="section">
                  <div class="subtext">Password reset code</div>
                  <div class="verification-code">${token}</div>
                  <div class="subtext">(This code is valid for ${validHours} minutes)</div>
              </div>
              <div class="section">
                  <div class="subtext">If you did not request this email, please ignore this message.</div>
              </div>
          </div>
      </body>
      </html>
    `;

    const { error } = await resend.emails.send({
      from: "The Street Art List <help@support.thestreetartlist.com>",
      to: [email],
      subject: `${token} is your pw reset code`,
      html: htmlContent,
    });

    if (error) {
      throw new Error("Could not send verification email");
    }
  },
});

// export const ResendOTP = Resend({
//   id: "resend-otp",
//   apiKey: process.env.AUTH_RESEND_KEY,
//   maxAge: 60 * 15, // 15 minutes

//   async generateVerificationToken() {
//     return generateRandomString(6, alphabet("0-9"))
//   },
//   async sendVerificationRequest({
//     identifier: email,
//     provider,
//     token,
//     expires,
//   }) {
//     const resend = new ResendAPI(provider.apiKey)

//     console.log("expires", expires)
//     const expirationTime = expires
//       ? expires.getTime()
//       : Date.now() + 60 * 60 * 1000
//     const validHours = Math.floor(
//       (expirationTime - Date.now()) / (60 * 60 * 1000)
//     )

//     const host = "The Street Art List"
//     const escapedHost = host.replace(/\./g, "&#8203;.")

//     const brandColor = "#346df1"

//     const buttonText = "#fff"

//     const color = {
//       background: "#f9f9f9",
//       text: "#444",
//       mainBackground: "#fff",
//       buttonBackground: brandColor,
//       buttonBorder: brandColor,
//       buttonText,
//     }

//     const htmlContent = `
//      <body style="background: ${color.background};">
//   <table width="100%" border="0" cellspacing="20" cellpadding="0"
//     style="background: ${color.mainBackground}; max-width: 600px; margin: auto; border-radius: 10px;">
//     <tr>
//       <td align="center"
//         style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
//         Sign in to <strong>${escapedHost}</strong>
//       </td>
//     </tr>
//     <tr>
//       <td align="center" style="padding: 20px 0;">
//         <table border="0" cellspacing="0" cellpadding="0">
//           <tr>
//             <td align="center" style="border-radius: 5px;" bgcolor="${color.buttonBackground}"><a href="/#"
//                 target="_blank"
//                 style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${color.buttonText}; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid ${color.buttonBorder}; display: inline-block; font-weight: bold;">Sign
//                 in</a></td>

//            </div>
//           </tr>
//         </table>
//       </td>
//     </tr>
//     <tr>
//       <td align="center"
//         style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
//         If you did not request this email you can safely ignore it.
//       </td>
//     </tr>
//   </table>
// </body>
//     `

//     const { error } = await resend.emails.send({
//       from: "The Street Art List <onboarding@resend.dev>",
//       to: [email],
//       subject: `Verify your email`,
//       html: htmlContent,
//     })

//     if (error) {
//       throw new Error("Could not send verification email")
//     }
//   },
// })
