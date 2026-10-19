// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { proxy } from "./proxy";

vi.mock("next-auth/jwt", () => ({ getToken: vi.fn() }));

const DEAD = { id: "u1", role: "client", error: "RefreshAccessTokenError" };
const LIVE = { id: "u1", role: "client" };

function request(path: string) {
  return new NextRequest(`http://localhost:3000${path}`, {
    headers: { cookie: "authjs.session-token.0=a; authjs.session-token.1=b; theme=dark" },
  });
}

function clearedCookies(res: Response) {
  return res.headers.getSetCookie().filter((c) => /^[^=]+=;/.test(c));
}

beforeEach(() => {
  vi.mocked(getToken).mockReset();
});

describe("proxy", () => {
  it("lets a dead session open /login and clears its cookies", async () => {
    vi.mocked(getToken).mockResolvedValue(DEAD as never);

    const res = await proxy(request("/login"));

    expect(res.headers.get("location")).toBeNull();
    expect(clearedCookies(res)).toEqual([
      expect.stringMatching(/^authjs\.session-token\.0=;/),
      expect.stringMatching(/^authjs\.session-token\.1=;/),
    ]);
  });

  it("sends a dead session from a protected page to /login and clears its cookies", async () => {
    vi.mocked(getToken).mockResolvedValue(DEAD as never);

    const res = await proxy(request("/dashboard"));
    const location = new URL(res.headers.get("location")!);

    expect(res.status).toBe(307);
    expect(location.pathname).toBe("/login");
    expect(location.searchParams.get("callbackUrl")).toBe("/dashboard");
    expect(clearedCookies(res)).toHaveLength(2);
  });

  it("still sends a live session away from /login", async () => {
    vi.mocked(getToken).mockResolvedValue(LIVE as never);

    const res = await proxy(request("/login"));

    expect(new URL(res.headers.get("location")!).pathname).toBe("/dashboard");
    expect(clearedCookies(res)).toHaveLength(0);
  });

  it("still sends a visitor without a session to /login", async () => {
    vi.mocked(getToken).mockResolvedValue(null);

    const res = await proxy(request("/dashboard"));
    const location = new URL(res.headers.get("location")!);

    expect(location.pathname).toBe("/login");
    expect(location.searchParams.get("callbackUrl")).toBe("/dashboard");
    expect(clearedCookies(res)).toHaveLength(0);
  });
});
