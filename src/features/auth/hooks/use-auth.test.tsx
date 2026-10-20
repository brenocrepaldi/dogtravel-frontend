import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { getSession, signOut } from "next-auth/react";
import { useLogout } from "./use-auth";
import { AuthApi } from "../api/auth.api";

vi.mock("next-auth/react", () => ({ getSession: vi.fn(), signOut: vi.fn() }));
vi.mock("../api/auth.api", () => ({ AuthApi: { logout: vi.fn() } }));

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(signOut).mockResolvedValue(undefined as never);
  vi.mocked(AuthApi.logout).mockResolvedValue();
});

describe("useLogout", () => {
  it("revokes the session on the backend before signing out", async () => {
    vi.mocked(getSession).mockResolvedValue({ accessToken: "abc", expires: "" } as never);
    const { result } = renderHook(() => useLogout(), { wrapper });

    result.current.mutate();

    await waitFor(() => expect(signOut).toHaveBeenCalledWith({ callbackUrl: "/login" }));
    expect(AuthApi.logout).toHaveBeenCalledTimes(1);
  });

  it("skips the backend call when the session already expired", async () => {
    vi.mocked(getSession).mockResolvedValue({ error: "RefreshAccessTokenError", expires: "" } as never);
    const { result } = renderHook(() => useLogout(), { wrapper });

    result.current.mutate();

    await waitFor(() => expect(signOut).toHaveBeenCalledWith({ callbackUrl: "/login" }));
    expect(AuthApi.logout).not.toHaveBeenCalled();
  });
});
