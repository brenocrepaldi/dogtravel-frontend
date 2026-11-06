import { useQuery } from "@tanstack/react-query";
import { WalksApi } from "../api/walks.api";
import type { UserRole, WalkEstimateRequest } from "@/types";

export function useWalks(role: UserRole, walkerId?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["walks", role, walkerId],
    queryFn: () => WalksApi.list(role, walkerId),
    enabled: options?.enabled ?? true,
  });
}

export function useWalkById(id: string) {
  return useQuery({
    queryKey: ["walks", id],
    queryFn: () => WalksApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useWalkRequests() {
  return useQuery({
    queryKey: ["walk-requests"],
    queryFn: WalksApi.listRequests,
    refetchInterval: 15_000,
  });
}

export function useWalkRequestById(id: string) {
  return useQuery({
    queryKey: ["walk-requests", id],
    queryFn: () => WalksApi.getRequestById(id),
    enabled: Boolean(id),
  });
}

export function useWalkEstimate(input: WalkEstimateRequest, enabled = true) {
  return useQuery({
    queryKey: ["walks", "estimate", input],
    queryFn: () => WalksApi.estimate(input),
    enabled: enabled && input.durationMinutes > 0 && input.petCount > 0,
    staleTime: 2 * 60 * 1000,
  });
}
