import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { JWT } from "next-auth/jwt";
import { REFRESH_ERROR, REFRESH_GRACE_MS, refreshTokenIfNeeded } from "./auth-refresh";

const NOW = new Date("2026-10-18T12:00:00Z").getTime();
const nowSeconds = () => Math.floor(Date.now() / 1000);

// The helper caches by refresh token at module level, so each test gets its own token
let seq = 0;
function expiredToken(overrides: Partial<JWT> = {}): JWT {
  seq += 1;
  return {
    id: "u1",
    role: "client",
    accessToken: "old-access",
    refreshToken: `old-refresh-${seq}`,
    expiresAt: nowSeconds() - 120,
    ...overrides,
  };
}

function refreshed(n: number) {
  return {
    ok: true,
    json: async () => ({
      accessToken: `new-access-${n}`,
      refreshToken: `new-refresh-${n}`,
      expiresAt: nowSeconds() + 900,
      user: { role: "client" },
    }),
  } as Response;
}

const rejected = { ok: false, json: async () => ({}) } as Response;

const fetchMock = vi.fn();

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("refreshTokenIfNeeded", () => {
  it("keeps the token while the access token is still valid", async () => {
    const token = expiredToken({ expiresAt: nowSeconds() + 600 });

    await expect(refreshTokenIfNeeded(token, { canRefresh: true })).resolves.toBe(token);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not refresh where the rotated cookie could not be saved", async () => {
    const token = expiredToken();

    await expect(refreshTokenIfNeeded(token, { canRefresh: false })).resolves.toBe(token);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not retry a refresh that already failed", async () => {
    const token = expiredToken({ error: REFRESH_ERROR });

    await expect(refreshTokenIfNeeded(token, { canRefresh: true })).resolves.toBe(token);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("flags the session when there is no refresh token", async () => {
    const result = await refreshTokenIfNeeded(expiredToken({ refreshToken: undefined }), {
      canRefresh: true,
    });

    expect(result.error).toBe(REFRESH_ERROR);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("swaps in the rotated tokens", async () => {
    const token = expiredToken();
    fetchMock.mockResolvedValueOnce(refreshed(1));

    const result = await refreshTokenIfNeeded(token, { canRefresh: true });

    expect(result).toMatchObject({
      accessToken: "new-access-1",
      refreshToken: "new-refresh-1",
      expiresAt: nowSeconds() + 900,
      role: "client",
    });
    expect(result.error).toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/auth\/refresh$/),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ refreshToken: token.refreshToken }),
      }),
    );
  });

  it("flags the session when the backend rejects the refresh", async () => {
    fetchMock.mockResolvedValueOnce(rejected);

    const result = await refreshTokenIfNeeded(expiredToken(), { canRefresh: true });

    expect(result.error).toBe(REFRESH_ERROR);
  });

  it("shares one backend call between concurrent refreshes of the same token", async () => {
    const token = expiredToken();
    fetchMock.mockResolvedValueOnce(refreshed(1));

    const [a, b] = await Promise.all([
      refreshTokenIfNeeded(token, { canRefresh: true }),
      refreshTokenIfNeeded({ ...token }, { canRefresh: true }),
    ]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(a.refreshToken).toBe("new-refresh-1");
    expect(b.refreshToken).toBe("new-refresh-1");
  });

  it("reuses the result for late duplicates only within the grace window", async () => {
    const token = expiredToken();
    fetchMock.mockResolvedValueOnce(refreshed(1)).mockResolvedValueOnce(refreshed(2));

    await refreshTokenIfNeeded(token, { canRefresh: true });
    await vi.advanceTimersByTimeAsync(REFRESH_GRACE_MS / 2);
    const late = await refreshTokenIfNeeded({ ...token }, { canRefresh: true });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(late.refreshToken).toBe("new-refresh-1");

    await vi.advanceTimersByTimeAsync(REFRESH_GRACE_MS);
    const afterGrace = await refreshTokenIfNeeded({ ...token }, { canRefresh: true });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(afterGrace.refreshToken).toBe("new-refresh-2");
  });

  it("keeps a failed refresh within the grace window instead of retrying", async () => {
    const token = expiredToken();
    fetchMock.mockResolvedValueOnce(rejected);

    await refreshTokenIfNeeded(token, { canRefresh: true });
    await vi.advanceTimersByTimeAsync(REFRESH_GRACE_MS / 2);
    const retry = await refreshTokenIfNeeded({ ...token }, { canRefresh: true });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(retry.error).toBe(REFRESH_ERROR);
  });
});
