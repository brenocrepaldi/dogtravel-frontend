import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useWalkEstimate } from "./use-walks";
import { WalksApi } from "../api/walks.api";
import type { WalkEstimateResult } from "@/types";

vi.mock("../api/walks.api", () => ({
  WalksApi: {
    estimate: vi.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

const estimateMock = vi.mocked(WalksApi.estimate);

describe("useWalkEstimate", () => {
  beforeEach(() => {
    estimateMock.mockReset();
  });

  it("busca a estimativa de preço em tempo real quando duração e pets são válidos", async () => {
    const result: WalkEstimateResult = {
      durationBase: 18,
      extraPetFee: 0,
      platformAndSafetyFee: 1.44,
      firstRideDiscount: 0,
      total: 19.44,
    };
    estimateMock.mockResolvedValue(result);

    const { result: hookResult } = renderHook(
      () => useWalkEstimate({ durationMinutes: 30, petCount: 1, isFirstRide: false }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(hookResult.current.data).toEqual(result));
    expect(estimateMock).toHaveBeenCalledWith({
      durationMinutes: 30,
      petCount: 1,
      isFirstRide: false,
    });
  });

  it("não dispara a query quando a duração ainda não foi escolhida (durationMinutes = 0)", () => {
    renderHook(() => useWalkEstimate({ durationMinutes: 0, petCount: 1, isFirstRide: false }), {
      wrapper: createWrapper(),
    });

    expect(estimateMock).not.toHaveBeenCalled();
  });

  it("não dispara a query quando nenhum pet foi selecionado (petCount = 0)", () => {
    renderHook(() => useWalkEstimate({ durationMinutes: 30, petCount: 0, isFirstRide: false }), {
      wrapper: createWrapper(),
    });

    expect(estimateMock).not.toHaveBeenCalled();
  });

  it("refaz a estimativa quando o número de pets muda (recalcula em tempo real)", async () => {
    estimateMock.mockResolvedValueOnce({
      durationBase: 18,
      extraPetFee: 0,
      platformAndSafetyFee: 1.44,
      firstRideDiscount: 0,
      total: 19.44,
    });

    const wrapper = createWrapper();
    const { result: hookResult, rerender } = renderHook(
      ({ petCount }: { petCount: number }) =>
        useWalkEstimate({ durationMinutes: 30, petCount, isFirstRide: false }),
      { wrapper, initialProps: { petCount: 1 } },
    );

    await waitFor(() => expect(hookResult.current.data?.total).toBe(19.44));

    estimateMock.mockResolvedValueOnce({
      durationBase: 18,
      extraPetFee: 4,
      platformAndSafetyFee: 1.76,
      firstRideDiscount: 0,
      total: 23.76,
    });

    rerender({ petCount: 2 });

    await waitFor(() => expect(hookResult.current.data?.total).toBe(23.76));
    expect(estimateMock).toHaveBeenCalledTimes(2);
  });
});
