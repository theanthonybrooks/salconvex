/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as actions_getTimezone from "../actions/getTimezone.js";
import type * as actions_sendOtpEmail from "../actions/sendOtpEmail.js";
import type * as artists_artistActions from "../artists/artistActions.js";
import type * as auth from "../auth.js";
import type * as crons from "../crons.js";
import type * as events_event from "../events/event.js";
import type * as functions_customGoogle from "../functions/customGoogle.js";
import type * as functions_customPassword from "../functions/customPassword.js";
import type * as http from "../http.js";
import type * as kanban_cards from "../kanban/cards.js";
import type * as organizer_organizations from "../organizer/organizations.js";
import type * as otp_resendOtp from "../otp/resendOtp.js";
import type * as otp_resetOtp from "../otp/resetOtp.js";
import type * as otp_verificationCodeEmail from "../otp/verificationCodeEmail.js";
import type * as plans from "../plans.js";
import type * as stripeSubscriptions from "../stripeSubscriptions.js";
import type * as subscriptions from "../subscriptions.js";
import type * as uploads_user from "../uploads/user.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "actions/getTimezone": typeof actions_getTimezone;
  "actions/sendOtpEmail": typeof actions_sendOtpEmail;
  "artists/artistActions": typeof artists_artistActions;
  auth: typeof auth;
  crons: typeof crons;
  "events/event": typeof events_event;
  "functions/customGoogle": typeof functions_customGoogle;
  "functions/customPassword": typeof functions_customPassword;
  http: typeof http;
  "kanban/cards": typeof kanban_cards;
  "organizer/organizations": typeof organizer_organizations;
  "otp/resendOtp": typeof otp_resendOtp;
  "otp/resetOtp": typeof otp_resetOtp;
  "otp/verificationCodeEmail": typeof otp_verificationCodeEmail;
  plans: typeof plans;
  stripeSubscriptions: typeof stripeSubscriptions;
  subscriptions: typeof subscriptions;
  "uploads/user": typeof uploads_user;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
