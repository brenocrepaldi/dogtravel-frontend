import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useAcceptWalk, useDeclineWalk } from "./use-walk-actions";
import { WalksApi } from "../api/walks.api";
import type { WalkRecord, WalkRequest } from "@/types";

vi.mock("../api/walks.api", () => ({
  WalksApi: {
    accept: vi.fn(),
    decline: vi.fn(),
  },
}));

const acceptMock = vi.mocked(WalksApi.accept);
const declineMock = vi.mocked(WalksApi.decline);

const request: WalkRequest = {
  id: "req-1",
  clientId: "client-1",
  clientName: "Client One",
  clientAvatarUrl: null,
  petNames: ["Rex"],
  petIds: ["dog-1"],
  petPhotos: [],
  durationMinutes: 30,
  price: 19.44,
  scheduledAt: new Date().toISOString(),
  scheduledLabel: "Hoje, 15:00",
  startAddress: "Av. Paulista, 1000",
  receivedMinutes: 2,
};

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("useAcceptWalk", () => {
  beforeEach(() => {
    acceptMock.mockReset();
  });

  it("chama WalksApi.accept com o request/walker e invalida walks + walk-requests ao aceitar", async () => {
    const accepted = { id: "req-1", status: "accepted" } as unknown as WalkRecord;
    acceptMock.mockResolvedValue(accepted);

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useAcceptWalk(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({ request, walkerName: "Walker One", walkerId: "walker-1" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(acceptMock).toHaveBeenCalledWith(request, "Walker One", "walker-1");
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["walks"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["walk-requests"] });
  });

  it("não invalida nenhuma query quando a aceitação falha (ex: já aceito por outro walker)", async () => {
    acceptMock.mockRejectedValue(new Error("REQUEST_ALREADY_CLAIMED"));

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useAcceptWalk(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({ request, walkerName: "Walker One", walkerId: "walker-1" });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(invalidateSpy).not.toHaveBeenCalled();
  });
});

describe("useDeclineWalk", () => {
  beforeEach(() => {
    declineMock.mockReset();
  });

  it("chama WalksApi.decline com o id da solicitação e invalida só walk-requests (não walks)", async () => {
    declineMock.mockResolvedValue(undefined);

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useDeclineWalk(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate("req-1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(declineMock).toHaveBeenCalledWith("req-1");
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["walk-requests"] });
    expect(invalidateSpy).not.toHaveBeenCalledWith({ queryKey: ["walks"] });
  });
});
