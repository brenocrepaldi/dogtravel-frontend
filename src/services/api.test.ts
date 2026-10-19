import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";

vi.mock("next-auth/react", () => ({ getSession: vi.fn(), signOut: vi.fn() }));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

// api.ts keeps a module-level "already handled" flag, so each test loads a fresh copy
async function setup() {
  vi.resetModules();
  const { default: api } = await import("./api");
  const { getSession, signOut } = await import("next-auth/react");
  const { toast } = await import("sonner");
  return {
    api,
    getSession: vi.mocked(getSession),
    signOut: vi.mocked(signOut),
    toastError: vi.mocked(toast.error),
  };
}

function unauthorized(config: InternalAxiosRequestConfig): Promise<AxiosResponse> {
  return Promise.reject(
    new AxiosError("Unauthorized", "ERR_BAD_REQUEST", config, null, {
      status: 401,
      statusText: "Unauthorized",
      data: {},
      headers: {},
      config,
    } as AxiosResponse),
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  // Keeps the delayed redirect to /login from firing (jsdom can't navigate)
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("api session handling", () => {
  it("sends the access token while the session is valid", async () => {
    const { api, getSession, toastError } = await setup();
    getSession.mockResolvedValue({ accessToken: "abc", expires: "" } as never);

    const res = await api.get("/a", {
      adapter: async (config) =>
        ({ data: config.headers.Authorization, status: 200, statusText: "OK", headers: {}, config }) as AxiosResponse,
    });

    expect(res.data).toBe("Bearer abc");
    expect(toastError).not.toHaveBeenCalled();
  });

  it("warns and signs out once when several requests find a dead session", async () => {
    const { api, getSession, signOut, toastError } = await setup();
    getSession.mockResolvedValue({ error: "RefreshAccessTokenError", expires: "" } as never);
    signOut.mockResolvedValue(undefined as never);

    const results = await Promise.allSettled([api.get("/a"), api.get("/b"), api.get("/c")]);

    expect(results.every((r) => r.status === "rejected")).toBe(true);
    expect(toastError).toHaveBeenCalledTimes(1);
    expect(toastError).toHaveBeenCalledWith("Sua sessão expirou. Faça login novamente.");
    expect(signOut).toHaveBeenCalledTimes(1);
    expect(signOut).toHaveBeenCalledWith({ redirect: false });
  });

  it("warns and signs out once when several requests come back 401", async () => {
    const { api, getSession, signOut, toastError } = await setup();
    getSession.mockResolvedValue({ accessToken: "abc", expires: "" } as never);
    signOut.mockResolvedValue(undefined as never);

    await Promise.allSettled([
      api.get("/a", { adapter: unauthorized }),
      api.get("/b", { adapter: unauthorized }),
    ]);

    expect(toastError).toHaveBeenCalledTimes(1);
    expect(signOut).toHaveBeenCalledTimes(1);
  });
});
