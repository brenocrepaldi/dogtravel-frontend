import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { WalkersApi, type WalkerFilters, type WalkerAvailabilityFilters } from "../api/walkers.api";
import type { EarningsParams, WalkerBankAccount, WalkerProfileUpdate } from "@/types";

export function useWalkers(filters?: WalkerFilters) {
  return useQuery({
    queryKey: ["walkers", filters],
    queryFn: () => WalkersApi.list(filters),
    staleTime: 5 * 60 * 1000,
  });
}

export function useWalkerById(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["walkers", id],
    queryFn: () => WalkersApi.getById(id),
    enabled: (options?.enabled ?? true) && !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useWalkerProfile() {
  return useQuery({
    queryKey: ["walkers", "me"],
    queryFn: () => WalkersApi.getMe(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateWalkerProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: WalkerProfileUpdate) => WalkersApi.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["walkers", "me"] });
    },
  });
}

export function useWalkerEarnings(params?: EarningsParams) {
  return useQuery({
    queryKey: ["walkers", "me", "earnings", params],
    queryFn: () => WalkersApi.getEarnings(params),
    staleTime: 2 * 60 * 1000,
  });
}

export function useWalkerBankAccount() {
  return useQuery({
    queryKey: ["walkers", "me", "bank-account"],
    queryFn: () => WalkersApi.getBankAccount(),
    staleTime: 10 * 60 * 1000,
  });
}

export function useUpdateWalkerBankAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: WalkerBankAccount) => WalkersApi.updateBankAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["walkers", "me", "bank-account"] });
    },
  });
}

export function useWalkerReviews(walkerId: string) {
  return useQuery({
    queryKey: ["walkers", walkerId, "reviews"],
    queryFn: () => WalkersApi.getReviews(walkerId),
    enabled: Boolean(walkerId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useWalkerAvailability(walkerId: string) {
  return useQuery({
    queryKey: ["walkers", walkerId, "availability"],
    queryFn: () => WalkersApi.getAvailability(walkerId),
    enabled: Boolean(walkerId),
    staleTime: 30_000,
  });
}

export function useUpdateWalkerAvailability(walkerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (available: boolean) => WalkersApi.updateAvailability(walkerId, available),
    onMutate: async (available) => {
      await queryClient.cancelQueries({ queryKey: ["walkers", walkerId, "availability"] });
      const prev = queryClient.getQueryData<boolean>(["walkers", walkerId, "availability"]);
      queryClient.setQueryData(["walkers", walkerId, "availability"], available);
      return { prev };
    },
    onError: (_err, _vars, context) => {
      if (context?.prev !== undefined) {
        queryClient.setQueryData(["walkers", walkerId, "availability"], context.prev);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["walkers", walkerId, "availability"] });
    },
  });
}

export function useAvailableWalkers(filters: WalkerAvailabilityFilters, enabled = true) {
  return useQuery({
    queryKey: ["walkers", "available", filters],
    queryFn: () => WalkersApi.getAvailable(filters),
    enabled: enabled && Boolean(filters.date) && Boolean(filters.time),
    staleTime: 2 * 60 * 1000,
  });
}
