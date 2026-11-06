import { useMutation, useQueryClient } from "@tanstack/react-query";
import { WalksApi } from "../api/walks.api";
import type { CreateWalkDto, WalkRequest } from "@/types";

export function useCreateWalk() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateWalkDto) => WalksApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["walks"] });
    },
  });
}

export function useCancelWalk() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => WalksApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["walks"] });
    },
  });
}

export function useAcceptWalk() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ request, walkerName, walkerId }: { request: WalkRequest; walkerName: string; walkerId: string }) =>
      WalksApi.accept(request, walkerName, walkerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["walks"] });
      queryClient.invalidateQueries({ queryKey: ["walk-requests"] });
    },
    onError: () => {},
  });
}

export function useDeclineWalk() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) => WalksApi.decline(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["walk-requests"] });
    },
  });
}

export function useStartWalk() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ walkId, code }: { walkId: string; code: string }) =>
      WalksApi.start(walkId, code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["walks"] });
    },
  });
}

export function useCompleteWalk() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ walkId, coords }: { walkId: string; coords?: { lat: number; lng: number } }) =>
      WalksApi.complete(walkId, coords),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["walks"] });
    },
  });
}

export function useReportWalk() {
  return useMutation({
    mutationFn: ({ walkId, reason, description }: { walkId: string; reason: string; description?: string }) =>
      WalksApi.report(walkId, { reason, description }),
  });
}
