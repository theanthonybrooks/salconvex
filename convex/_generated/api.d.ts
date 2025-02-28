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
import type * as actions_sendOtpEmail from "../actions/sendOtpEmail.js";
import type * as auth from "../auth.js";
import type * as functions_customPassword from "../functions/customPassword.js";
import type * as http from "../http.js";
import type * as otp_resendOtp from "../otp/resendOtp.js";
import type * as otp_resetOtp from "../otp/resetOtp.js";
import type * as otp_verificationCodeEmail from "../otp/verificationCodeEmail.js";
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
  "actions/sendOtpEmail": typeof actions_sendOtpEmail;
  auth: typeof auth;
  "functions/customPassword": typeof functions_customPassword;
  http: typeof http;
  "otp/resendOtp": typeof otp_resendOtp;
  "otp/resetOtp": typeof otp_resetOtp;
  "otp/verificationCodeEmail": typeof otp_verificationCodeEmail;
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
