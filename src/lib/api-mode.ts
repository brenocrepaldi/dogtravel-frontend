/**
 * Whether the app talks to the real API (true) or falls back to the in-memory
 * mock data in `lib/mock-data` (false).
 *
 * - With NEXT_PUBLIC_API_URL set, the real API is always used.
 * - Without it, development falls back to the mocks (handy without a backend).
 * - Without it in production, the mocks are opt-in through
 *   NEXT_PUBLIC_USE_MOCKS=true, so a missing URL can never silently serve fake
 *   data: requests go to the default base URL and fail visibly instead.
 */
export const isApiConfigured =
  !!process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_USE_MOCKS !== "true");
