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
import type * as aiVerification from "../aiVerification.js";
import type * as auth_emailOtp from "../auth/emailOtp.js";
import type * as auth from "../auth.js";
import type * as contracts from "../contracts.js";
import type * as disputes from "../disputes.js";
import type * as emails from "../emails.js";
import type * as escrows from "../escrows.js";
import type * as files from "../files.js";
import type * as http from "../http.js";
import type * as milestones from "../milestones.js";
import type * as settings from "../settings.js";
import type * as transactions from "../transactions.js";
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
  aiVerification: typeof aiVerification;
  "auth/emailOtp": typeof auth_emailOtp;
  auth: typeof auth;
  contracts: typeof contracts;
  disputes: typeof disputes;
  emails: typeof emails;
  escrows: typeof escrows;
  files: typeof files;
  http: typeof http;
  milestones: typeof milestones;
  settings: typeof settings;
  transactions: typeof transactions;
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
