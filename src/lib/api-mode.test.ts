import { afterEach, describe, expect, it, vi } from "vitest";

async function load(env: Record<string, string | undefined>) {
  vi.resetModules();
  for (const [key, value] of Object.entries(env)) {
    if (value === undefined) vi.stubEnv(key, "");
    else vi.stubEnv(key, value);
  }
  return (await import("./api-mode")).isApiConfigured;
}

describe("isApiConfigured", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("is true whenever the API URL is set", async () => {
    expect(await load({ NODE_ENV: "development", NEXT_PUBLIC_API_URL: "http://api" })).toBe(true);
    expect(await load({ NODE_ENV: "production", NEXT_PUBLIC_API_URL: "http://api" })).toBe(true);
  });

  it("falls back to the mocks in development without a URL", async () => {
    expect(await load({ NODE_ENV: "development", NEXT_PUBLIC_API_URL: undefined })).toBe(false);
  });

  it("never falls back to the mocks in production by accident", async () => {
    expect(await load({ NODE_ENV: "production", NEXT_PUBLIC_API_URL: undefined })).toBe(true);
  });

  it("allows the mocks in production only when explicitly requested", async () => {
    expect(
      await load({
        NODE_ENV: "production",
        NEXT_PUBLIC_API_URL: undefined,
        NEXT_PUBLIC_USE_MOCKS: "true",
      }),
    ).toBe(false);
  });
});
