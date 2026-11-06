import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PaymentsApi } from "../api/payments.api";
import type { EarningsParams, ManagedPaymentMethod } from "@/types";

export function usePaymentMethods() {
  return useQuery({
    queryKey: ["payment-methods"],
    queryFn: PaymentsApi.getMethods,
    staleTime: 10 * 60 * 1000,
  });
}

export function usePaymentHistory(params?: EarningsParams) {
  return useQuery({
    queryKey: ["payment-history", params],
    queryFn: () => PaymentsApi.getHistory(params),
  });
}

export function useAddPaymentMethod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (method: Omit<ManagedPaymentMethod, "id">) =>
      PaymentsApi.addMethod(method),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
    },
  });
}

export function useRemovePaymentMethod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => PaymentsApi.removeMethod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
    },
  });
}

export function useSetDefaultMethod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => PaymentsApi.setDefault(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
    },
  });
}
