import type { JWT } from "next-auth/jwt";
import type { LoginResponseDto } from "@/types";

/** Refresh this long before the access token actually expires. */
export const REFRESH_BUFFER_MS = 60_000;

/**
 * How long a settled refresh stays cached. Requests that left the browser
 * before the rotated cookie arrived still carry the old refresh token, which
 * the backend already invalidated — they get the same result instead of a 401.
 */
export const REFRESH_GRACE_MS = 10_000;

export const REFRESH_ERROR = "RefreshAccessTokenError";

const REFRESH_TIMEOUT_MS = 8_000;

// Keyed by refresh token: concurrent and late duplicate calls share one rotation
const refreshes = new Map<string, Promise<LoginResponseDto>>();

// Raw fetch, not the axios instance: its interceptor calls getSession(), which
// would re-enter the jwt callback while this refresh is still in flight.
function refreshWithGrace(refreshToken: string): Promise<LoginResponseDto> {
  const inFlight = refreshes.get(refreshToken);
  if (inFlight) return inFlight;

  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REFRESH_TIMEOUT_MS);

  const promise = fetch(`${apiBase}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
    signal: controller.signal,
  })
    .then(async (res) => {
      if (!res.ok) throw new Error("REFRESH_FAILED");
      return (await res.json()) as LoginResponseDto;
    })
    .finally(() => {
      clearTimeout(timeoutId);
      setTimeout(() => refreshes.delete(refreshToken), REFRESH_GRACE_MS);
    });

  refreshes.set(refreshToken, promise);
  return promise;
}

/**
 * Returns the JWT with a fresh access token when it is about to expire.
 *
 * `canRefresh` must be false where NextAuth can't write the session cookie
 * (auth() in Server Components): the backend would rotate the refresh token
 * and the new one would be thrown away, killing the session.
 */
export async function refreshTokenIfNeeded(
  token: JWT,
  { canRefresh }: { canRefresh: boolean },
): Promise<JWT> {
  if (Date.now() < (token.expiresAt ?? 0) * 1000 - REFRESH_BUFFER_MS) return token;
  if (!canRefresh) return token;
  // A failed refresh means the refresh token is no longer valid — retrying only adds 401s
  if (token.error) return token;
  if (!token.refreshToken) return { ...token, error: REFRESH_ERROR };

  try {
    const refreshed = await refreshWithGrace(token.refreshToken);
    return {
      ...token,
      accessToken: refreshed.accessToken,
      refreshToken: refreshed.refreshToken,
      expiresAt: refreshed.expiresAt,
      // Propagate role in case it changed on the backend
      role: refreshed.user?.role ?? token.role,
      error: undefined,
    };
  } catch {
    return { ...token, error: REFRESH_ERROR };
  }
}
