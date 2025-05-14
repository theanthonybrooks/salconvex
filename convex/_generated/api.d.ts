/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as actions_getTimezone from "../actions/getTimezone.js";
import type * as actions_sendOtpEmail from "../actions/sendOtpEmail.js";
import type * as artists_applications from "../artists/applications.js";
import type * as artists_artistActions from "../artists/artistActions.js";
import type * as artists_getArtistEventMetadata from "../artists/getArtistEventMetadata.js";
import type * as auth from "../auth.js";
import type * as crons from "../crons.js";
import type * as events_event from "../events/event.js";
import type * as functions_customGoogle from "../functions/customGoogle.js";
import type * as functions_customPassword from "../functions/customPassword.js";
import type * as http from "../http.js";
import type * as kanban_cards from "../kanban/cards.js";
import type * as kanban_display from "../kanban/display.js";
import type * as migrations from "../migrations.js";
import type * as newsletter_subscriber from "../newsletter/subscriber.js";
import type * as openCalls_openCall from "../openCalls/openCall.js";
import type * as organizer_organizations from "../organizer/organizations.js";
import type * as otp_resendOtp from "../otp/resendOtp.js";
import type * as otp_resetOtp from "../otp/resetOtp.js";
import type * as otp_verificationCodeEmail from "../otp/verificationCodeEmail.js";
import type * as plans from "../plans.js";
import type * as stripeSubscriptions from "../stripeSubscriptions.js";
import type * as subscriptions from "../subscriptions.js";
import type * as thelist_getFilteredEvents from "../thelist/getFilteredEvents.js";
import type * as thelist_getFilteredEventsPublic from "../thelist/getFilteredEventsPublic.js";
import type * as uploads_user from "../uploads/user.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

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
  "artists/applications": typeof artists_applications;
  "artists/artistActions": typeof artists_artistActions;
  "artists/getArtistEventMetadata": typeof artists_getArtistEventMetadata;
  auth: typeof auth;
  crons: typeof crons;
  "events/event": typeof events_event;
  "functions/customGoogle": typeof functions_customGoogle;
  "functions/customPassword": typeof functions_customPassword;
  http: typeof http;
  "kanban/cards": typeof kanban_cards;
  "kanban/display": typeof kanban_display;
  migrations: typeof migrations;
  "newsletter/subscriber": typeof newsletter_subscriber;
  "openCalls/openCall": typeof openCalls_openCall;
  "organizer/organizations": typeof organizer_organizations;
  "otp/resendOtp": typeof otp_resendOtp;
  "otp/resetOtp": typeof otp_resetOtp;
  "otp/verificationCodeEmail": typeof otp_verificationCodeEmail;
  plans: typeof plans;
  stripeSubscriptions: typeof stripeSubscriptions;
  subscriptions: typeof subscriptions;
  "thelist/getFilteredEvents": typeof thelist_getFilteredEvents;
  "thelist/getFilteredEventsPublic": typeof thelist_getFilteredEventsPublic;
  "uploads/user": typeof uploads_user;
  users: typeof users;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {
  migrations: {
    lib: {
      cancel: FunctionReference<
        "mutation",
        "internal",
        { name: string },
        {
          batchSize?: number;
          cursor?: string | null;
          error?: string;
          isDone: boolean;
          latestEnd?: number;
          latestStart: number;
          name: string;
          next?: Array<string>;
          processed: number;
          state: "inProgress" | "success" | "failed" | "canceled" | "unknown";
        }
      >;
      cancelAll: FunctionReference<
        "mutation",
        "internal",
        { sinceTs?: number },
        Array<{
          batchSize?: number;
          cursor?: string | null;
          error?: string;
          isDone: boolean;
          latestEnd?: number;
          latestStart: number;
          name: string;
          next?: Array<string>;
          processed: number;
          state: "inProgress" | "success" | "failed" | "canceled" | "unknown";
        }>
      >;
      clearAll: FunctionReference<
        "mutation",
        "internal",
        { before?: number },
        null
      >;
      getStatus: FunctionReference<
        "query",
        "internal",
        { limit?: number; names?: Array<string> },
        Array<{
          batchSize?: number;
          cursor?: string | null;
          error?: string;
          isDone: boolean;
          latestEnd?: number;
          latestStart: number;
          name: string;
          next?: Array<string>;
          processed: number;
          state: "inProgress" | "success" | "failed" | "canceled" | "unknown";
        }>
      >;
      migrate: FunctionReference<
        "mutation",
        "internal",
        {
          batchSize?: number;
          cursor?: string | null;
          dryRun: boolean;
          fnHandle: string;
          name: string;
          next?: Array<{ fnHandle: string; name: string }>;
        },
        {
          batchSize?: number;
          cursor?: string | null;
          error?: string;
          isDone: boolean;
          latestEnd?: number;
          latestStart: number;
          name: string;
          next?: Array<string>;
          processed: number;
          state: "inProgress" | "success" | "failed" | "canceled" | "unknown";
        }
      >;
    };
    public: {
      cancel: FunctionReference<
        "mutation",
        "internal",
        { name: string },
        {
          batchSize?: number;
          cursor?: string | null;
          error?: string;
          isDone: boolean;
          latestEnd?: number;
          latestStart: number;
          name: string;
          next?: Array<string>;
          processed: number;
          state: "inProgress" | "success" | "failed" | "canceled" | "unknown";
        }
      >;
      cancelAll: FunctionReference<
        "mutation",
        "internal",
        { sinceTs?: number },
        Array<{
          batchSize?: number;
          cursor?: string | null;
          error?: string;
          isDone: boolean;
          latestEnd?: number;
          latestStart: number;
          name: string;
          next?: Array<string>;
          processed: number;
          state: "inProgress" | "success" | "failed" | "canceled" | "unknown";
        }>
      >;
      getStatus: FunctionReference<
        "query",
        "internal",
        { limit?: number; migrationNames?: Array<string> },
        Array<{
          batchSize?: number;
          cursor?: string | null;
          error?: string;
          isDone: boolean;
          latestEnd?: number;
          latestStart: number;
          name: string;
          next?: Array<string>;
          processed: number;
          state: "inProgress" | "success" | "failed" | "canceled" | "unknown";
        }>
      >;
      runMigration: FunctionReference<
        "mutation",
        "internal",
        {
          batchSize?: number;
          cursor?: string | null;
          dryRun: boolean;
          fnHandle: string;
          name: string;
          next?: Array<{ fnHandle: string; name: string }>;
        },
        {
          batchSize?: number;
          cursor?: string | null;
          error?: string;
          isDone: boolean;
          latestEnd?: number;
          latestStart: number;
          name: string;
          next?: Array<string>;
          processed: number;
          state: "inProgress" | "success" | "failed" | "canceled" | "unknown";
        }
      >;
    };
  };
};
