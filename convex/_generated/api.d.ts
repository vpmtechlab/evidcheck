/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as analytics from "../analytics.js";
import type * as apiKeys from "../apiKeys.js";
import type * as api_actions from "../api_actions.js";
import type * as audit from "../audit.js";
import type * as auth from "../auth.js";
import type * as balances from "../balances.js";
import type * as billing from "../billing.js";
import type * as companies from "../companies.js";
import type * as debug from "../debug.js";
import type * as emails from "../emails.js";
import type * as http from "../http.js";
import type * as init from "../init.js";
import type * as notifications from "../notifications.js";
import type * as payments from "../payments.js";
import type * as permissions from "../permissions.js";
import type * as pricing from "../pricing.js";
import type * as reports from "../reports.js";
import type * as services from "../services.js";
import type * as session from "../session.js";
import type * as transactions from "../transactions.js";
import type * as users from "../users.js";
import type * as verifications from "../verifications.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  analytics: typeof analytics;
  apiKeys: typeof apiKeys;
  api_actions: typeof api_actions;
  audit: typeof audit;
  auth: typeof auth;
  balances: typeof balances;
  billing: typeof billing;
  companies: typeof companies;
  debug: typeof debug;
  emails: typeof emails;
  http: typeof http;
  init: typeof init;
  notifications: typeof notifications;
  payments: typeof payments;
  permissions: typeof permissions;
  pricing: typeof pricing;
  reports: typeof reports;
  services: typeof services;
  session: typeof session;
  transactions: typeof transactions;
  users: typeof users;
  verifications: typeof verifications;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
