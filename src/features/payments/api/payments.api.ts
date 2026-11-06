import type { ManagedPaymentMethod, PaymentHistoryItem, EarningsParams } from "@/types";
import api, { isApiConfigured } from "@/services/api";

// The in-memory mock lives in payments.mock.ts and is loaded dynamically so it
// (and mock-data) never reaches the client bundle when a real API is configured.
export const PaymentsApi = {
  getMethods: async (): Promise<ManagedPaymentMethod[]> => {
    if (!isApiConfigured) {
      const { paymentsMock } = await import("./payments.mock");
      return paymentsMock.getMethods();
    }
    return api.get<ManagedPaymentMethod[]>("/payment-methods").then((r) => r.data);
  },

  getHistory: async (params?: EarningsParams): Promise<PaymentHistoryItem[]> => {
    if (!isApiConfigured) {
      const { paymentsMock } = await import("./payments.mock");
      return paymentsMock.getHistory();
    }
    return api.get<PaymentHistoryItem[]>("/payment-history", { params }).then((r) => r.data);
  },

  addMethod: async (method: Omit<ManagedPaymentMethod, "id">): Promise<ManagedPaymentMethod> => {
    if (!isApiConfigured) {
      const { paymentsMock } = await import("./payments.mock");
      return paymentsMock.addMethod(method);
    }
    return api.post<ManagedPaymentMethod>("/payment-methods", method).then((r) => r.data);
  },

  removeMethod: async (id: string): Promise<void> => {
    if (!isApiConfigured) {
      const { paymentsMock } = await import("./payments.mock");
      return paymentsMock.removeMethod(id);
    }
    await api.delete(`/payment-methods/${id}`);
  },

  setDefault: async (id: string): Promise<void> => {
    if (!isApiConfigured) {
      const { paymentsMock } = await import("./payments.mock");
      return paymentsMock.setDefault(id);
    }
    await api.patch(`/payment-methods/${id}/default`);
  },
};
