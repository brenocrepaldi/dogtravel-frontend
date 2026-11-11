import { managedPaymentMethods, paymentHistory } from "@/lib/mock/mock-data";
import type { ManagedPaymentMethod, PaymentHistoryItem } from "@/types";

// In-memory mock backend, loaded only when no real API is configured.
let methodsStore: ManagedPaymentMethod[] | null = null;

function getMethodsStore(): ManagedPaymentMethod[] {
  if (!methodsStore) {
    methodsStore = [...managedPaymentMethods];
  }
  return methodsStore;
}

export const paymentsMock = {
  getMethods: async (): Promise<ManagedPaymentMethod[]> => [...getMethodsStore()],

  getHistory: async (): Promise<PaymentHistoryItem[]> => [...paymentHistory],

  addMethod: async (method: Omit<ManagedPaymentMethod, "id">): Promise<ManagedPaymentMethod> => {
    const store = getMethodsStore();
    const newMethod: ManagedPaymentMethod = {
      ...method,
      id: `pm_${Date.now()}`,
    };
    methodsStore = [...store, newMethod];
    return newMethod;
  },

  removeMethod: async (id: string): Promise<void> => {
    const store = getMethodsStore();
    methodsStore = store.filter((m) => m.id !== id);
  },

  setDefault: async (id: string): Promise<void> => {
    const store = getMethodsStore();
    methodsStore = store.map((m) => ({ ...m, isDefault: m.id === id }));
  },
};
