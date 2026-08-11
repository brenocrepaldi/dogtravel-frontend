import type { ManagedPaymentMethod, PaymentHistoryItem, EarningsParams } from "@/types";
import api, { isApiConfigured } from "@/services/api";

// Module-level mutable store — lazily populated via dynamic import so
// mock-data.ts never reaches the client bundle when a real API is configured.
let methodsStore: ManagedPaymentMethod[] | null = null;

async function getMethodsStore(): Promise<ManagedPaymentMethod[]> {
  if (!methodsStore) {
    const { managedPaymentMethods } = await import("@/lib/mock-data");
    methodsStore = [...managedPaymentMethods];
  }
  return methodsStore;
}

export const PaymentsApi = {
  getMethods: async (): Promise<ManagedPaymentMethod[]> => {
    if (!isApiConfigured) {
      return [...(await getMethodsStore())];
    }
    return api.get<ManagedPaymentMethod[]>("/payment-methods").then((r) => r.data);
  },

  getHistory: async (params?: EarningsParams): Promise<PaymentHistoryItem[]> => {
    if (!isApiConfigured) {
      const { paymentHistory } = await import("@/lib/mock-data");
      return [...paymentHistory];
    }
    return api.get<PaymentHistoryItem[]>("/payment-history", { params }).then((r) => r.data);
  },

  addMethod: async (method: Omit<ManagedPaymentMethod, "id">): Promise<ManagedPaymentMethod> => {
    if (!isApiConfigured) {
      const store = await getMethodsStore();
      const newMethod: ManagedPaymentMethod = {
        ...method,
        id: `pm_${Date.now()}`,
      };
      methodsStore = [...store, newMethod];
      return newMethod;
    }
    return api.post<ManagedPaymentMethod>("/payment-methods", method).then((r) => r.data);
  },

  removeMethod: async (id: string): Promise<void> => {
    if (!isApiConfigured) {
      const store = await getMethodsStore();
      methodsStore = store.filter((m) => m.id !== id);
      return;
    }
    await api.delete(`/payment-methods/${id}`);
  },

  setDefault: async (id: string): Promise<void> => {
    if (!isApiConfigured) {
      const store = await getMethodsStore();
      methodsStore = store.map((m) => ({ ...m, isDefault: m.id === id }));
      return;
    }
    await api.patch(`/payment-methods/${id}/default`);
  },
};
