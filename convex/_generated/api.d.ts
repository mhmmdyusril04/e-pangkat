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
import type * as clerk from "../clerk.js";
import type * as crons from "../crons.js";
import type * as dokumen from "../dokumen.js";
import type * as http from "../http.js";
import type * as notifications from "../notifications.js";
import type * as persyaratan from "../persyaratan.js";
import type * as push from "../push.js";
import type * as reminder from "../reminder.js";
import type * as riwayat from "../riwayat.js";
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
  clerk: typeof clerk;
  crons: typeof crons;
  dokumen: typeof dokumen;
  http: typeof http;
  notifications: typeof notifications;
  persyaratan: typeof persyaratan;
  push: typeof push;
  reminder: typeof reminder;
  riwayat: typeof riwayat;
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
