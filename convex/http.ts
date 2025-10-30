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

// Log that routes are configured
// console.log("HTTP routes configured")

export default http;
