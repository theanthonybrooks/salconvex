import { httpAction } from "~/convex/_generated/server";
import { resendComponent as resend } from "~/convex/actions/newsletter";
import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { paymentWebhook } from "./stripe/stripeBase";

const http = httpRouter();

auth.addHttpRoutes(http);

http.route({
  path: "/payments/webhook",
  method: "POST",
  handler: paymentWebhook,
});

http.route({
  path: "/resend-webhook",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    return await resend.handleResendEventWebhook(ctx, req);
  }),
});

// Log that routes are configured
// console.log("HTTP routes configured")

export default http;
